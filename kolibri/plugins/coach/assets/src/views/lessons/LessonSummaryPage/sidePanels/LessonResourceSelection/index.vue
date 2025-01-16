<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    closeButtonIconType="close"
    @closePanel="closeSidePanel"
    @shouldFocusFirstEl="() => null"
  >
    <template #header>
      <div style="display: flex; gap: 8px; align-items: center">
        <KIconButton
          v-if="goBack"
          icon="back"
          @click="goBack()"
        />
        <h1 class="side-panel-title">{{ title }}</h1>
      </div>
    </template>
    <div v-if="loading">
      <KCircularLoader />
    </div>

    <router-view
      v-else
      :setTitle="setTitle"
      :setGoBack="setGoBack"
      :topic="topic"
      :disabled="isSaving"
      :channelsFetch="channelsFetch"
      :bookmarksFetch="bookmarksFetch"
      :treeFetch="treeFetch"
      :selectionRules="selectionRules"
      :selectedResources="selectedResources"
      :selectedResourcesSize="selectedResourcesSize"
      @selectResources="selectResources"
      @deselectResources="deselectResources"
      @setSelectedResources="setSelectedResources"
    />

    <template #bottomNavigation>
      <div class="bottom-nav-container">
        <KButtonGroup>
          <KRouterLink
            v-if="
              selectedResources.length > 0 &&
                $route.name !== PageNames.LESSON_PREVIEW_SELECTED_RESOURCES
            "
            :to="{ name: PageNames.LESSON_PREVIEW_SELECTED_RESOURCES }"
          >
            {{ selectedResourcesMessage }}
          </KRouterLink>
          <KButton
            primary
            :disabled="isSaving"
            :text="saveAndFinishAction$()"
            @click="save"
          />
        </KButtonGroup>
      </div>
    </template>

    <KModal
      v-if="isCloseConfirmationModalOpen"
      appendToOverlay
      :submitText="continueAction$()"
      :cancelText="cancelAction$()"
      :title="closeConfirmationTitle$()"
      @cancel="isCloseConfirmationModalOpen = false"
      @submit="closeSidePanel(false)"
    >
      {{ closeConfirmationMessage$() }}
    </KModal>
  </SidePanelModal>

</template>


<script>

  import uniqBy from 'lodash/uniqBy';
  import { mapState, mapActions, mapMutations } from 'vuex';

  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import notificationStrings from 'kolibri/uiText/notificationStrings';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import bytesForHumans from 'kolibri/uiText/bytesForHumans';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { PageNames } from '../../../../../constants';
  import { coachStrings } from '../../../../common/commonCoachStrings';
  import useResourceSelection from '../../../../../composables/useResourceSelection';

  export default {
    name: 'LessonResourceSelection',
    components: {
      SidePanelModal,
    },
    setup() {
      const {
        loading,
        topic,
        channelsFetch,
        bookmarksFetch,
        treeFetch,
        selectionRules,
        selectedResources,
        selectResources,
        deselectResources,
        setSelectedResources,
      } = useResourceSelection();

      const { createSnackbar } = useSnackbar();

      const { resourcesAddedWithCount$ } = notificationStrings;
      function notifyResourcesAdded(count) {
        createSnackbar(resourcesAddedWithCount$({ count }));
      }
      const { saveLessonError$, closeConfirmationTitle$, closeConfirmationMessage$ } = coachStrings;
      function notifySaveLessonError() {
        createSnackbar(saveLessonError$());
      }

      const { saveAndFinishAction$, continueAction$, cancelAction$ } = coreStrings;

      return {
        loading,
        selectedResources,
        topic,
        channelsFetch,
        bookmarksFetch,
        treeFetch,
        selectionRules,
        selectResources,
        deselectResources,
        setSelectedResources,
        notifyResourcesAdded,
        notifySaveLessonError,
        cancelAction$,
        continueAction$,
        saveAndFinishAction$,
        closeConfirmationTitle$,
        closeConfirmationMessage$,
      };
    },
    data() {
      return {
        title: '',
        goBack: null,
        isSaving: false,
        isCloseConfirmationModalOpen: false,
        PageNames,
      };
    },
    computed: {
      ...mapState('lessonSummary', ['currentLesson', 'workingResources']),
      selectedResourcesSize() {
        let size = 0;
        this.selectedResources.forEach(resource => {
          const { files = [] } = resource;
          files.forEach(file => {
            size += file.file_size || 0;
          });
        });
        return size;
      },
      selectedResourcesMessage() {
        const { someResourcesSelected$ } = coachStrings;
        return someResourcesSelected$({
          count: this.selectedResources.length,
          bytesText: bytesForHumans(this.selectedResourcesSize),
        });
      },
    },
    methods: {
      ...mapActions('lessonSummary', ['saveLessonResources', 'addToResourceCache']),
      ...mapMutations('lessonSummary', {
        setWorkingResources: 'SET_WORKING_RESOURCES',
      }),
      getNewResources() {
        return uniqBy(
          [
            ...this.workingResources,
            ...this.selectedResources.map(resource => ({
              contentnode_id: resource.id,
              content_id: resource.content_id,
              channel_id: resource.channel_id,
            })),
          ],
          'contentnode_id',
        );
      },
      async save() {
        if (!this.selectedResources.length) {
          this.closeSidePanel(false);
          return;
        }
        this.isSaving = true;
        const newResources = this.getNewResources();

        // As we are just adding resources, we can rely on the difference in length
        // to determine if there are new resources to save.
        const countNewResources = newResources.length - this.workingResources.length;
        if (countNewResources > 0) {
          try {
            await this.saveLessonResources({
              lessonId: this.currentLesson.id,
              resources: newResources,
            });
          } catch (error) {
            this.notifySaveLessonError();
            this.isSaving = false;
            throw error;
          }
          for (const resource of this.selectedResources) {
            this.addToResourceCache({ node: resource });
          }
          this.setWorkingResources(newResources);
          // Notify the lesson summary page that the working resources have been updated
          // so that it can update the backup resources.
          this.$emit('workingResourcesUpdated');
          this.notifyResourcesAdded(countNewResources);
        }
        this.closeSidePanel(false);
      },
      closeSidePanel(verifyHasNewResources = true) {
        const newResources = this.getNewResources();
        const hasNewResources = newResources.length > this.workingResources.length;
        if (hasNewResources && verifyHasNewResources) {
          this.isCloseConfirmationModalOpen = true;
        } else {
          this.$router.push({
            name: PageNames.LESSON_SUMMARY_BETTER,
          });
        }
      },
      setTitle(title) {
        this.title = title;
      },
      setGoBack(goBack) {
        this.goBack = goBack;
      },
    },
  };

</script>


<style scoped>

  .side-panel-title {
    margin-top: 20px;
    font-size: 18px;
  }

  .bottom-nav-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

</style>
