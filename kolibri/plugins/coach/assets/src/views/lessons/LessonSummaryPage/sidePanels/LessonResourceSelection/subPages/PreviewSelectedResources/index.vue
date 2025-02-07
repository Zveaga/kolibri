<template>

  <div>
    <KCircularLoader v-if="loading && !contentNode" />
    <div v-else>
      <div class="channel-header">
        <p>
          {{ coreString('selectFromChannels') }}
        </p>

        <div>
          <template v-if="isSelected">
            <KIcon icon="onDevice" />
            {{ addedIndicator$() }}
          </template>

          <KButton
            v-if="isSelected"
            :text="coreString('removeAction')"
            :primary="true"
            @click="handleRemoveResource()"
          />
          <KButton
            v-else
            :text="addText$()"
            :primary="false"
            @click="handleAddResource()"
          />
        </div>
      </div>

      <ResourceSelectionBreadcrumbs
        v-if="ancestors.length"
        :ancestors="[...ancestors, contentNode]"
        :channelsLink="channelsLink"
        :topicsLink="topicsLink"
      />

      <h2>
        <KLabeledIcon :label="contentNode.kind">
          <template #icon>
            <LearningActivityIcon :kind="learningActivities" />
          </template>
          <template>
            {{ contentNode.title }}
          </template>
        </KLabeledIcon>
      </h2>

      <PreviewSelectedExercise
        v-if="isExercise"
        :contentNode="contentNode"
      />

      <PreviewContent
        v-else
        :currentContentNode="contentNode"
        :questions="questions"
      />
    </div>
  </div>

</template>


<script>

  import { getCurrentInstance, ref } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { ContentNodeKinds } from 'kolibri/constants';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import LearningActivityIcon from 'kolibri-common/components/ResourceDisplayAndSearch/LearningActivityIcon.vue';
  import useFetchContentNode from '../../../../../../../composables/useFetchContentNode';
  import { coachStrings } from '../../../../../../common/commonCoachStrings';
  import { PageNames } from '../../../../../../../constants/index';
  import ResourceSelectionBreadcrumbs from '../../../../../LessonResourceSelectionPage/SearchTools/ResourceSelectionBreadcrumbs.vue';
  import PreviewContent from './PreviewContent';
  import PreviewSelectedExercise from './PreviewSelectedExercise.vue';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
      PreviewSelectedExercise,
      ResourceSelectionBreadcrumbs,
      LearningActivityIcon,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const previousRoute = ref(null);
      const instance = getCurrentInstance();
      const { addText$, addedIndicator$ } = searchAndFilterStrings;

      const { contentNode, ancestors, questions, loading } = useFetchContentNode(props.contentId);
      const { manageLessonResourcesTitle$ } = coachStrings;

      props.setTitle(manageLessonResourcesTitle$());
      props.setGoBack(null);

      const routeBack = () => {
        const backRoute = previousRoute.value?.name
          ? previousRoute.value
          : {
            name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          };
        instance.proxy.$router.push(backRoute);
      };

      return {
        contentNode,
        ancestors,
        questions,
        loading,
        routeBack,
        // eslint-disable-next-line vue/no-unused-properties
        previousRoute,
        addText$,
        addedIndicator$,
      };
    },
    props: {
      contentId: {
        type: String,
        required: true,
      },
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      selectedResources: {
        type: Array,
        required: true,
      },
    },
    computed: {
      isSelected() {
        if (this.selectedResources && this.contentNode) {
          return this.selectedResources.some(resource => resource.id === this.contentNode.id);
        }
        return false;
      },
      isExercise() {
        return this.contentNode.kind === ContentNodeKinds.EXERCISE;
      },
      learningActivities() {
        if (this.contentNode.learning_activities) {
          return this.contentNode.learning_activities;
        }
        return [];
      },
      channelsLink() {
        return {
          name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
        };
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.previousRoute = from;
      });
    },
    methods: {
      topicsLink(topicId) {
        const { params, query } = this.$route;

        return {
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
          params: params,
          query: {
            ...query,
            topicId,
          },
        };
      },
      handleAddResource() {
        this.routeBack();
        this.$emit('selectResources', [this.contentNode]);
      },
      handleRemoveResource() {
        this.routeBack();
        this.$emit('deselectResources', [this.contentNode]);
      },
    },
  };

</script>


<style lang="scss" scoped>

  .channel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .channel-header p {
    font-weight: 600;
  }

</style>
