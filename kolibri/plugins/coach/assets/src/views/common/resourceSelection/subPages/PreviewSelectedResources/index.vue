<template>

  <div>
    <KCircularLoader v-if="loading && !contentNode" />
    <div v-else>
      <div class="channel-header">
        <p>
          {{ coreString('selectFromChannels') }}
        </p>

        <div class="d-flex-center">
          <span
            v-if="isSelected"
            class="mr-16"
          >
            <KIcon icon="onDevice" />
            {{ addedIndicator$() }}
          </span>

          <KButton
            v-if="isSelected"
            :text="coreString('removeAction')"
            :primary="true"
            :disabled="isActionDisabled"
            @click="handleRemoveResource()"
          />
          <KButton
            v-else
            :text="addText$()"
            :primary="false"
            :disabled="isActionDisabled"
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

      <PreviewExercise
        v-if="isExercise"
        :contentNode="contentNode"
        :questions="exerciseQuestions"
        :settings="settings"
        :selectedQuestions="selectedQuestionItems"
        @select="handleSelectQuestion"
        @selectAll="handleSelectAllQuestions"
      />

      <PreviewContent
        v-else
        :currentContentNode="contentNode"
        :ancestors="ancestors"
        :questions="questions"
        :isExercise="false"
      />
    </div>
  </div>

</template>


<script>

  import { getCurrentInstance, onMounted, ref } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings.js';
  import LearningActivityIcon from 'kolibri-common/components/ResourceDisplayAndSearch/LearningActivityIcon.vue';
  import { ContentNodeKinds } from 'kolibri/constants';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { SelectionTarget } from '../../contants.js';
  import { coachStrings } from '../../../commonCoachStrings.js';
  import { PageNames } from '../../../../../constants/index.js';
  import ResourceSelectionBreadcrumbs from '../../../../lessons/LessonResourceSelectionPage/SearchTools/ResourceSelectionBreadcrumbs.vue';
  import useFetchContentNode from '../../../../../composables/useFetchContentNode';
  import PreviewContent from './PreviewContent';
  import PreviewExercise from './PreviewExercise.vue';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
      PreviewExercise,
      LearningActivityIcon,
      ResourceSelectionBreadcrumbs,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const prevRoute = ref(null);
      const instance = getCurrentInstance();
      const router = instance.proxy.$router;

      const { contentNode, ancestors, questions, loading, exerciseQuestions } = useFetchContentNode(
        props.contentId,
      );
      const { manageLessonResourcesTitle$ } = coachStrings;
      const { selectResourcesDescription$, selectPracticeQuizLabel$ } =
        enhancedQuizManagementStrings;

      const { addText$, addedIndicator$ } = searchAndFilterStrings;

      const getTitle = () => {
        if (props.target === SelectionTarget.LESSON) {
          return manageLessonResourcesTitle$();
        }
        if (props.settings.selectPracticeQuiz) {
          return selectPracticeQuizLabel$();
        }
        return selectResourcesDescription$({ sectionTitle: props.sectionTitle });
      };
      props.setTitle(getTitle());
      props.setGoBack(null);

      const redirectBack = () => {
        if (prevRoute.value?.name) {
          return router.push(prevRoute.value);
        }
        router.push({
          name:
            props.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        });
      };

      onMounted(() => {
        if (!props.contentId) {
          redirectBack();
        }
      });

      return {
        contentNode,
        ancestors,
        questions,
        loading,
        redirectBack,
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        addText$,
        addedIndicator$,
        exerciseQuestions,
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
      unselectableResourceIds: {
        type: Array,
        required: false,
        default: null,
      },
      disabled: {
        type: Boolean,
        default: false,
      },
      /**
       * The target entity for the selection.
       * It can be either 'quiz' or 'lesson'.
       */
      target: {
        type: String,
        required: true,
      },
      /**
       * Selection settings used for quizzes.
       */
      settings: {
        type: Object,
        required: false,
        default: null,
      },
      /**
       * The title of the section (valid just for quizzes).
       * @type {string}
       */
      sectionTitle: {
        type: String,
        required: false,
        default: null,
      },
      /**
       * Array of selected questions from the manual workflow.
       */
      selectedQuestions: {
        type: Array,
        required: false,
        default: () => [],
      },
    },
    computed: {
      isSelected() {
        if (this.selectedResources.some(resource => resource.id === this.contentId)) {
          return true;
        }
        if (this.unselectableResourceIds?.includes(this.contentId)) {
          return true;
        }
        return false;
      },
      isActionDisabled() {
        if (this.disabled) {
          return true;
        }
        return this.unselectableResourceIds?.includes(this.contentId);
      },
      channelsLink() {
        return {
          name:
            this.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        };
      },
      learningActivities() {
        if (this.contentNode.learning_activities) {
          return this.contentNode.learning_activities;
        }
        return [];
      },
      isExercise() {
        return this.contentNode.kind === ContentNodeKinds.EXERCISE;
      },
      selectedQuestionItems() {
        return this.selectedQuestions.map(q => q.item);
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
    methods: {
      handleAddResource() {
        this.redirectBack();
        this.$emit('selectResources', [this.contentNode]);
      },
      handleRemoveResource() {
        this.redirectBack();
        this.$emit('deselectResources', [this.contentNode]);
      },
      topicsLink(topicId) {
        const { params, query } = this.$route;
        return {
          name:
            this.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE
              : PageNames.QUIZ_SELECT_RESOURCES_TOPIC_TREE,
          params: params,
          query: {
            ...query,
            topicId,
          },
        };
      },
      handleSelectQuestion(questionItem, value) {
        //Map the string of questionids to actual question object
        const question = this.exerciseQuestions.find(q => q.item === questionItem);
        if (value) {
          this.$emit('selectQuestions', [question]);
        } else {
          this.$emit('deselectQuestions', [question]);
        }
      },
      handleSelectAllQuestions(value) {
        if (value) {
          this.$emit('selectQuestions', this.exerciseQuestions);
        } else {
          this.$emit('deselectQuestions', this.exerciseQuestions);
        }
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

  .mr-16 {
    margin-right: 16px;
  }

  .d-flex-center {
    display: flex;
    align-items: center;
  }

</style>
