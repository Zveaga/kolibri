<template>

  <div>
    <QuizResourceSelectionHeader
      v-if="target === SelectionTarget.QUIZ && !settings.selectPracticeQuiz"
      class="mb-16"
      hideSearch
      :settings="settings"
    />
    <UpdatedResourceSelection
      canSelectAll
      :contentList="contentList"
      :hasMore="hasMore"
      :disabled="disabled"
      :channelsLink="channelsLink"
      :fetchMore="fetchMore"
      :loadingMore="loadingMore"
      :multi="!settings?.selectPracticeQuiz"
      :selectionRules="selectionRules"
      :selectAllRules="selectAllRules"
      :selectedResources="selectedResources"
      :contentCardMessage="contentCardMessage"
      :noSelectableResourcesIds="noSelectableResourcesIds"
      @selectResources="$emit('selectResources', $event)"
      @deselectResources="$emit('deselectResources', $event)"
      @setSelectedResources="$emit('setSelectedResources', $event)"
    />
  </div>

</template>


<script>

  import { getCurrentInstance } from 'vue';
  import { now } from 'kolibri/utils/serverClock';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import UpdatedResourceSelection from '../UpdatedResourceSelection.vue';
  import { PageNames } from '../../../../constants';
  import { SelectionTarget } from '../contants';
  import QuizResourceSelectionHeader from '../QuizResourceSelectionHeader.vue';

  /**
   * @typedef {import('../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectFromBookmarks',
    components: {
      UpdatedResourceSelection,
      QuizResourceSelectionHeader,
    },
    setup(props) {
      const { selectFromBookmarks$, bookmarkedTimeAgoLabel$ } = coreStrings;
      const instance = getCurrentInstance();

      props.setTitle(selectFromBookmarks$());

      const redirectBack = () => {
        instance.proxy.$router.push({
          name:
            props.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        });
      };
      props.setGoBack(redirectBack);

      const channelsLink = {
        name:
          props.target === SelectionTarget.LESSON
            ? PageNames.LESSON_SELECT_RESOURCES_INDEX
            : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
      };

      const { data, hasMore, fetchMore, loadingMore } = props.bookmarksFetch;

      const contentCardMessage = content => {
        if (!content.bookmark?.created) {
          return null;
        }
        const createdDate = new Date(content.bookmark.created);
        const time = instance.proxy.$formatRelative(createdDate, { now: now() });

        return bookmarkedTimeAgoLabel$({ time });
      };

      return {
        channelsLink,
        contentList: data,
        hasMore,
        fetchMore,
        loadingMore,
        contentCardMessage,
        SelectionTarget,
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
      /**
       * Fetch object for fetching bookmarks.
       * @type {FetchObject}
       */
      bookmarksFetch: {
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
      noSelectableResourcesIds: {
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
    },
  };

</script>


<style lang="scss" scoped>

  .mb-16 {
    margin-bottom: 16px;
  }

</style>
