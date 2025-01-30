<template>

  <div>
    <div
      v-if="target === SelectionTarget.LESSON"
      class="subheader"
    >
      <span class="side-panel-subtitle">
        {{ selectFromChannels$() }}
      </span>
      <KButton
        icon="filter"
        :text="searchLabel$()"
      />
    </div>

    <QuizResourceSelectionHeader
      v-if="target === SelectionTarget.QUIZ && !settings.selectPracticeQuiz"
      class="mb-16"
      :settings="settings"
    />

    <div
      v-if="target === SelectionTarget.QUIZ && settings.selectPracticeQuiz"
      class="d-flex-end mb-16"
    >
      <KButton
        icon="filter"
        :text="searchLabel$()"
      />
    </div>

    <div class="topic-info">
      <h2>
        <KIcon
          icon="topic"
          class="mr-8"
        />
        <span>
          {{ topic.title }}
        </span>
      </h2>
      <p :style="{ color: $themeTokens.annotation }">
        {{ topic.description }}
      </p>
    </div>

    <UpdatedResourceSelection
      canSelectAll
      :topic="topic"
      :disabled="disabled"
      :channelsLink="channelsLink"
      :contentList="contentList"
      :hasMore="hasMore"
      :fetchMore="fetchMore"
      :loadingMore="loadingMore"
      :multi="!settings?.selectPracticeQuiz"
      :selectionRules="selectionRules"
      :selectAllRules="selectAllRules"
      :selectedResources="selectedResources"
      :contentCardMessage="contentCardMessage"
      :unselectableResourceIds="unselectableResourceIds"
      @selectResources="$emit('selectResources', $event)"
      @deselectResources="$emit('deselectResources', $event)"
      @setSelectedResources="$emit('setSelectedResources', $event)"
    />
  </div>

</template>


<script>

  import { getCurrentInstance } from 'vue';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import { coachStrings } from '../../commonCoachStrings';
  import { PageNames } from '../../../../constants';
  import UpdatedResourceSelection from '../UpdatedResourceSelection.vue';
  import QuizResourceSelectionHeader from '../QuizResourceSelectionHeader.vue';
  import { SelectionTarget } from '../contants';

  /**
   * @typedef {import('../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectFromChannels',
    components: {
      UpdatedResourceSelection,
      QuizResourceSelectionHeader,
    },
    setup(props) {
      const { selectFromChannels$, searchLabel$ } = coreStrings;
      const { manageLessonResourcesTitle$ } = coachStrings;
      const instance = getCurrentInstance();

      const { selectResourcesDescription$, selectPracticeQuizLabel$ } =
        enhancedQuizManagementStrings;

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

      const redirectBack = () => {
        instance.proxy.$router.push({
          name:
            props.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        });
      };
      const { topicId } = instance.proxy.$route.query;
      if (!topicId) {
        redirectBack();
      }
      props.setGoBack(redirectBack);

      const channelsLink = {
        name:
          props.target === SelectionTarget.LESSON
            ? PageNames.LESSON_SELECT_RESOURCES_INDEX
            : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
      };

      const { data, hasMore, fetchMore, loadingMore } = props.treeFetch;
      return {
        channelsLink,
        contentList: data,
        hasMore,
        fetchMore,
        loadingMore,
        SelectionTarget,
        searchLabel$,
        selectFromChannels$,
      };
    },
    props: {
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      topic: {
        type: Object,
        required: true,
      },
      /**
       * Fetch object for fetching resource tree.
       * @type {FetchObject}
       */
      treeFetch: {
        type: Object,
        required: true,
      },
      selectionRules: {
        type: Array,
        required: false,
        default: () => [],
      },
      selectAllRules: {
        type: Array,
        required: false,
        default: () => [],
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
       * The title of the section (valid just for quizzes).
       * @type {string}
       */
      sectionTitle: {
        type: String,
        required: false,
        default: null,
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
       * Function that returns a message to be displayed based in the content
       * passed as argument.
       */
      contentCardMessage: {
        type: Function,
        required: false,
        default: () => '',
      },
    },
  };

</script>


<style scoped>

  .d-flex-end {
    display: flex;
    justify-content: flex-end;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  .side-panel-subtitle {
    font-size: 16px;
    font-weight: 600;
  }

  .subheader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .mr-8 {
    margin-right: 8px;
  }

</style>
