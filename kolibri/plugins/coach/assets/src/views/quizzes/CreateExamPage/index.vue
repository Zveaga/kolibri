<template>

  <CoachImmersivePage
    :appBarTitle="title"
    icon="close"
    :pageTitle="title"
    :route="backRoute"
  >
    <UiAlert
      v-if="showError && !inSearchMode"
      type="error"
      :dismissible="false"
    >
      {{ selectionIsInvalidText }}
    </UiAlert>

    <KPageContainer :style="{ maxWidth: '1000px', margin: '0 auto 2em', paddingTop: '2rem' }">
      <div
        v-if="hasNoChannels"
        class="alert banner-spacing"
        :style="{ backgroundColor: $themePalette.yellow.v_200 }"
      >
        <div>
          <KIcon
            icon="warning"
            class="warning-icon"
            :color="$themePalette.yellow.v_600"
          />
        </div>

        <div
          v-if="hasNoChannels"
          class="error-message"
        >
          <p>{{ noResourcesAvailable$() }}</p>
          <KExternalLink
            v-if="deviceContentUrl"
            :text="$tr('adminLink')"
            :href="deviceContentUrl"
          />
        </div>
      </div>
      <AssignmentDetailsModal
        v-if="quizInitialized"
        ref="detailsModal"
        assignmentType="quiz"
        :selectRecipientsWithSidePanel="true"
        :assignment="quiz"
        :classId="classId"
        :groups="groups"
        @update="updateQuiz"
      />

      <div v-if="quizInitialized">
        <h5 class="section-order-header">
          {{ sectionOrderLabel$() }}
        </h5>
        <KGrid>
          <KRadioButtonGroup>
            <KGridItem
              :layout12="{ span: 6 }"
              :layout8="{ span: 4 }"
              :layout4="{ span: 2 }"
            >
              <KRadioButton
                :currentValue="quiz.learners_see_fixed_order"
                :label="randomizedLabel$()"
                :buttonValue="false"
                :description="randomizedSectionOptionDescription$()"
                @input="value => updateQuiz({ learners_see_fixed_order: value })"
              />
            </KGridItem>
            <KGridItem
              :layout12="{ span: 6 }"
              :layout8="{ span: 4 }"
              :layout4="{ span: 2 }"
            >
              <KRadioButton
                :currentValue="quiz.learners_see_fixed_order"
                :label="fixedLabel$()"
                :buttonValue="true"
                :description="fixedSectionOptionDescription$()"
                @input="value => updateQuiz({ learners_see_fixed_order: value })"
              />
              <KButton
                v-if="quiz.learners_see_fixed_order"
                :text="coreString('editAction') + ' - ' + sectionOrderLabel$()"
                class="edit-section-order-btn"
                appearance="basic-link"
                @click="editSectionOrder"
              />
            </KGridItem>
          </KRadioButtonGroup>
        </KGrid>
      </div>

      <CreateQuizSection v-if="quizInitialized && quiz.draft && channels.length > 0" />

      <BottomAppBar>
        <span
          v-if="allSectionsEmpty"
          class="message"
        >
          {{ allSectionsEmptyWarning$() }}
        </span>
        <KButtonGroup>
          <KButton
            :text="coreString('saveAction')"
            :disabled="allSectionsEmpty"
            @click="() => saveQuizAndRedirect(false)"
          />
          <KButton
            :text="saveAndClose$()"
            primary
            :disabled="allSectionsEmpty"
            @click="() => saveQuizAndRedirect()"
          />
        </KButtonGroup>
      </BottomAppBar>
    </KPageContainer>

    <KModal
      v-if="closeConfirmationToRoute"
      :submitText="coreString('continueAction')"
      :cancelText="coreString('cancelAction')"
      :title="closeConfirmationTitle$()"
      @cancel="closeConfirmationToRoute = null"
      @submit="$router.push(closeConfirmationToRoute)"
    >
      {{ closeConfirmationMessage$() }}
    </KModal>

    <router-view v-if="quizInitialized" />
  </CoachImmersivePage>

</template>


<script>

  import get from 'lodash/get';
  import { ERROR_CONSTANTS } from 'kolibri/constants';
  import CatchErrors from 'kolibri/utils/CatchErrors';
  import { ref, getCurrentInstance } from 'vue';
  import pickBy from 'lodash/pickBy';
  import urls from 'kolibri/urls';
  import useUser from 'kolibri/composables/useUser';
  import BottomAppBar from 'kolibri/components/BottomAppBar';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
  import { PageNames } from '../../../constants';
  import CoachImmersivePage from '../../CoachImmersivePage';
  import { coachStrings } from '../../common/commonCoachStrings';
  import useQuizCreation from '../../../composables/useQuizCreation';
  import AssignmentDetailsModal from '../../common/assignments/AssignmentDetailsModal';
  import useCoreCoach from '../../../composables/useCoreCoach';
  import CreateQuizSection from './CreateQuizSection';

  export default {
    name: 'CreateExamPage',
    components: {
      CoachImmersivePage,
      BottomAppBar,
      CreateQuizSection,
      AssignmentDetailsModal,
    },
    mixins: [commonCoreStrings],
    setup() {
      const channels = ref([]);
      const store = getCurrentInstance().proxy.$store;
      const closeConfirmationToRoute = ref(null);
      const { createSnackbar } = useSnackbar();
      const { classId, initClassInfo, groups } = useCoreCoach();
      const { canManageContent } = useUser();

      function _loadChannels() {
        return ContentNodeResource.fetchCollection({}).then(res => {
          channels.value = res;
        });
      }
      _loadChannels();

      const {
        quizHasChanged,
        quiz,
        updateQuiz,
        saveQuiz,
        initializeQuiz,
        allSectionsEmpty,
        allSections,
      } = useQuizCreation();
      const showError = ref(false);
      const quizInitialized = ref(false);

      initClassInfo().then(() => store.dispatch('notLoading'));

      const {
        saveAndClose$,
        allSectionsEmptyWarning$,
        changesSavedSuccessfully$,
        sectionOrderLabel$,
        randomizedLabel$,
        fixedLabel$,
        randomizedSectionOptionDescription$,
        fixedSectionOptionDescription$,
        noResourcesAvailable$,
      } = enhancedQuizManagementStrings;

      const { closeConfirmationTitle$, closeConfirmationMessage$ } = coachStrings;

      return {
        closeConfirmationTitle$,
        closeConfirmationMessage$,
        classId,
        groups,
        closeConfirmationToRoute,
        showError,
        quiz,
        quizHasChanged,
        saveQuiz,
        updateQuiz,
        initializeQuiz,
        quizInitialized,
        allSections,
        allSectionsEmpty,
        allSectionsEmptyWarning$,
        saveAndClose$,
        changesSavedSuccessfully$,
        sectionOrderLabel$,
        randomizedLabel$,
        fixedLabel$,
        randomizedSectionOptionDescription$,
        fixedSectionOptionDescription$,
        createSnackbar,
        channels,
        noResourcesAvailable$,
        canManageContent,
      };
    },
    provide() {
      return {
        showError: this.showError,
        moreResultsState: null,
        // null corresponds to 'All' filter value
        filters: {
          channel: this.$route.query.channel || null,
          kind: this.$route.query.kind || null,
          role: this.$route.query.role || null,
        },
        // numQuestionsBlurred: false,
        bookmarksCount: 0,
        bookmarks: [],
        more: null,
        // showSectionSettingsMenu:false
      };
    },
    computed: {
      backRoute() {
        const lastRoute = get(this.$route, ['query', 'last']);
        if (lastRoute) {
          const params = { ...this.$route.query };
          delete params.last;
          return {
            name: lastRoute,
            params,
          };
        }
        return { name: PageNames.EXAMS_ROOT, params: { classId: this.classId } };
      },
      title() {
        if (!this.quizInitialized) {
          return '';
        }
        if (this.$route.params.quizId === 'new') {
          return this.$tr('createNewExamLabel');
        }
        return this.quiz.title;
      },
      deviceContentUrl() {
        const deviceContentUrl = urls['kolibri:kolibri.plugins.device:device_management'];
        if (deviceContentUrl && this.canManageContent) {
          return `${deviceContentUrl()}#/content`;
        }

        return '';
      },
      hasNoChannels() {
        return this.channels.length === 0;
      },
    },
    watch: {
      filters(newVal) {
        this.$router.push({
          query: { ...this.$route.query, ...pickBy(newVal) },
        });
      },
    },
    beforeRouteUpdate(to, from, next) {
      if (
        to.name === PageNames.QUIZ_SELECT_PRACTICE_QUIZ &&
        from.name === PageNames.EXAM_CREATION_ROOT
      ) {
        this.closeConfirmationToRoute = {
          name: PageNames.EXAMS_ROOT,
          params: {
            classId: to.params.classId,
          },
        };
        next(false);
        return;
      }
      if (to.params.sectionIndex >= this.allSections.length) {
        next({
          name: PageNames.EXAM_CREATION_ROOT,
          params: {
            classId: to.params.classId,
            quizId: to.params.quizId,
            sectionIndex: '0',
          },
        });
      } else {
        next();
      }
    },
    beforeRouteLeave(to, from, next) {
      if (this.quizHasChanged && !this.closeConfirmationToRoute) {
        this.closeConfirmationToRoute = to;
        next(false);
      } else {
        next();
      }
    },
    mounted() {
      this.$store.dispatch('notLoading');
    },
    async created() {
      window.addEventListener('beforeunload', this.beforeUnload);
      await this.initializeQuiz(this.$route.params.classId, this.$route.params.quizId);
      // If the section index doesn't exist, redirect to the first section; we also do this in
      // beforeRouteUpdate. We do this here to avoid fully initializing the quiz if we're going to
      // redirect anyway.
      if (this.$route.params.sectionIndex >= this.allSections.length) {
        this.$router.replace({
          name: PageNames.EXAM_CREATION_ROOT,
          params: {
            classId: this.$route.params.classId,
            quizId: this.$route.params.quizId,
            sectionIndex: '0',
          },
        });
      }
      this.quizInitialized = true;
    },
    destroyed() {
      window.removeEventListener('beforeunload', this.beforeUnload);
    },
    methods: {
      editSectionOrder() {
        this.$router.push({
          name: PageNames.QUIZ_SECTION_ORDER,
          params: {
            classId: this.$route.params.classId,
            quizId: this.$route.params.quizId,
            sectionIndex: this.$route.params.sectionIndex,
          },
        });
      },
      beforeUnload(e) {
        if (this.quizHasChanged) {
          if (!window.confirm(this.closeConfirmationTitle$())) {
            e.preventDefault();
          }
        }
      },
      saveQuizAndRedirect(close = true) {
        const errorText = this.$refs.detailsModal.validate();
        if (errorText) {
          return;
        }
        this.saveQuiz()
          .then(exam => {
            this.$refs.detailsModal.handleSubmitSuccess();
            this.createSnackbar(this.changesSavedSuccessfully$());
            if (close) {
              this.$router.replace({
                name: PageNames.EXAMS_ROOT,
                params: {
                  classId: this.$route.params.classId,
                },
                query: {
                  snackbar: this.changesSavedSuccessfully$(),
                },
              });
            } else {
              if (String(this.$route.params.quizId) === String(exam.id)) {
                return;
              }
              this.$router.replace({
                name: PageNames.EXAM_CREATION_ROOT,
                params: {
                  classId: this.$route.params.classId,
                  quizId: exam.id,
                  sectionIndex: this.$route.params.sectionIndex,
                },
              });
            }
          })
          .catch(error => {
            const errors = CatchErrors(error, [ERROR_CONSTANTS.UNIQUE, 'BLANK']);
            this.$refs.detailsModal.handleSubmitFailure();
            if (errors.length) {
              this.$refs.detailsModal.handleSubmitTitleFailure();
            }
          });
      },
    },
    $trs: {
      createNewExamLabel: {
        message: 'Create new quiz',
        context: "Title of the screen launched from the 'New quiz' button on the 'Plan' tab.",
      },
      adminLink: {
        message: 'Import channels to your device',
        context: 'Message for admin indicating the possibility of importing channels into Kolibri.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .message {
    margin-right: 8px;
  }

  .section-order-header {
    margin-top: 0;
    margin-bottom: 0.5em;
  }

  .edit-section-order-btn {
    margin-left: 2em;
  }

  .alert {
    position: relative;
    width: 100%;
    max-width: 1000px;
    padding: 0.5em;
    padding-left: 2em;
    margin: 1em auto 0;
  }

  .warning-icon {
    position: absolute;
    top: 1em;
    left: 1em;
    width: 24px;
    height: 24px;
  }

  .error-message {
    margin-left: 3em;
    font-size: 14px;
  }

  .banner-spacing {
    margin: 0 0 1em;
  }

</style>
