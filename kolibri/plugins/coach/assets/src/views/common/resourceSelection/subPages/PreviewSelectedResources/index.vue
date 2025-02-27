<template>

  <div>
    <KCircularLoader v-if="loading && !contentNode" />
    <div v-else>
      <div
        v-if="target === SelectionTarget.LESSON"
        class="channel-header"
      >
        <p>
          {{ selectFromChannels$() }}
        </p>
        <ResourceActionButton
          :isSelected="isSelected"
          :isActionDisabled="isActionDisabled"
          @addResource="handleAddResource"
          @removeResource="handleRemoveResource"
        />
      </div>
      <QuizResourceSelectionHeader
        v-if="target === SelectionTarget.QUIZ"
        hideSearch
        :settings="settings"
      >
        <template
          v-if="!settings.isChoosingManually"
          #actions
        >
          <ResourceActionButton
            :isSelected="isSelected"
            :isActionDisabled="isActionDisabled"
            @addResource="handleAddResource"
            @removeResource="handleRemoveResource"
          />
        </template>
      </QuizResourceSelectionHeader>
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

      <div
        v-if="target === SelectionTarget.QUIZ"
        class="update-settings-container"
        :style="{
          backgroundColor: $themePalette.grey.v_100,
        }"
      >
        <KCheckbox
          :checked="workingIsChoosingManually"
          :label="chooseQuestionsManuallyLabel$()"
          :description="clearSelectionNotice"
          @change="$event => (workingIsChoosingManually = $event)"
        />
        <KButton
          class="no-shink"
          appearance="flat-button"
          :text="saveSettingsAction$()"
          :disabled="isSaveSettingsDisabled"
          @click="saveSettings"
        />
      </div>

      <QuestionsAccordion
        v-if="isExercise"
        :questions="exerciseQuestions"
        :getQuestionContent="() => contentNode"
        :isSelectable="!!settings?.isChoosingManually"
        :maxSelectableQuestions="settings?.questionCount"
        :selectedQuestions="selectedQuestionItems"
        :unselectableQuestionItems="unselectableQuestionItems"
        @selectQuestions="handleSelectQuestions"
        @deselectQuestions="handleDeselectQuestionss"
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

  import { getCurrentInstance, onMounted, ref, computed } from 'vue';
  import { ContentNodeKinds } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings.js';
  import LearningActivityIcon from 'kolibri-common/components/ResourceDisplayAndSearch/LearningActivityIcon.vue';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings.js';
  import { SelectionTarget } from '../../contants.js';
  import { coachStrings } from '../../../commonCoachStrings.js';
  import { PageNames } from '../../../../../constants/index.js';
  import QuizResourceSelectionHeader from '../../QuizResourceSelectionHeader.vue';
  import ResourceSelectionBreadcrumbs from '../../../../lessons/LessonResourceSelectionPage/SearchTools/ResourceSelectionBreadcrumbs.vue';
  import useFetchContentNode from '../../../../../composables/useFetchContentNode';
  import QuestionsAccordion from '../../../QuestionsAccordion.vue';
  import PreviewContent from './PreviewContent';
  import ResourceActionButton from './ResourceActionButton.vue';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
      QuestionsAccordion,
      LearningActivityIcon,
      ResourceActionButton,
      QuizResourceSelectionHeader,
      ResourceSelectionBreadcrumbs,
    },
    setup(props) {
      const prevRoute = ref(null);
      const instance = getCurrentInstance();
      const router = instance.proxy.$router;

      const { contentNode, ancestors, questions, loading, exerciseQuestions } = useFetchContentNode(
        props.contentId,
      );
      const { manageLessonResourcesTitle$ } = coachStrings;
      const { selectFromChannels$ } = coreStrings;
      const {
        selectResourcesDescription$,
        selectPracticeQuizLabel$,
        chooseQuestionsManuallyLabel$,
        clearSelectionNotice$,
      } = enhancedQuizManagementStrings;

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

      const workingIsChoosingManually = ref(props.settings?.isChoosingManually);
      const saveSettings = () => {
        instance.proxy.$emit('update:settings', {
          ...props.settings,
          isChoosingManually: workingIsChoosingManually.value,
        });
      };
      const isSaveSettingsDisabled = computed(() => {
        return workingIsChoosingManually.value === props.settings?.isChoosingManually;
      });
      const clearSelectionNotice = computed(() => {
        if (!props.selectedResources.length && !props.selectedQuestions.length) {
          return null;
        }
        return clearSelectionNotice$();
      });

      onMounted(() => {
        if (!props.contentId) {
          redirectBack();
        }
      });

      const { saveSettingsAction$ } = searchAndFilterStrings;

      return {
        contentNode,
        ancestors,
        questions,
        loading,
        SelectionTarget,
        redirectBack,
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        exerciseQuestions,
        workingIsChoosingManually,
        isSaveSettingsDisabled,
        clearSelectionNotice,
        saveSettings,
        saveSettingsAction$,
        selectFromChannels$,
        chooseQuestionsManuallyLabel$,
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
      /**
       * Array of resource ids that already belongs to the quiz,
       * and should not be selectable.
       */
      unselectableResourceIds: {
        type: Array,
        required: false,
        default: null,
      },
      /**
       * Array of question ids that already belongs to the quiz,
       * and should not be selectable.
       */
      unselectableQuestionItems: {
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
        return !!this.unselectableResourceIds?.includes(this.contentId);
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
      handleSelectQuestions(questionsItem) {
        //Map the string of questionids to actual question object
        const questions = questionsItem.map(q => this.exerciseQuestions.find(eq => eq.item === q));
        this.$emit('selectQuestions', questions, this.contentNode);
      },
      handleDeselectQuestionss(questionsItem) {
        const questions = questionsItem.map(q => this.exerciseQuestions.find(eq => eq.item === q));
        this.$emit('deselectQuestions', questions);
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

  .update-settings-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    margin-bottom: 24px;
  }

  .no-shink {
    flex-shrink: 0;
  }

</style>
