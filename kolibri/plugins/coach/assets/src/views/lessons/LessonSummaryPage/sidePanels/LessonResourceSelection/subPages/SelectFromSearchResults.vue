<template>

  <div v-if="displayingSearchResults">
    <div class="channels-header">
      <span class="side-panel-subtitle">
        {{ selectFromChannels$() }}
      </span>
      <KButton
        icon="filter"
        :text="searchLabel$()"
        @click="onSearchClick"
      />
    </div>

    <div class="mb-16 side-panel-subtitle">
      {{ resultsCountMessage }}
    </div>

    <SearchChips
      class="mb-16"
      :searchTerms="searchTerms"
      @removeItem="onRemoveSearchFilterTag"
      @clearSearch="onClearSearch"
    />

    <UpdatedResourceSelection
      :contentList="contentList"
      :hasMore="hasMore"
      :cardsHeadingLevel="2"
      :fetchMore="fetchMore"
      :loadingMore="loadingMore"
      :selectionRules="selectionRules"
      :selectedResources="selectedResources"
      :getTopicLink="getTopicLink"
      @selectResources="$emit('selectResources', $event)"
      @deselectResources="$emit('deselectResources', $event)"
    />
  </div>

</template>


<script>

  import { getCurrentInstance } from 'vue';

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import SearchChips from 'kolibri-common/components/SearchChips';
  import UpdatedResourceSelection from '../../../UpdatedResourceSelection.vue';
  import { coachStrings } from '../../../../../common/commonCoachStrings';
  import { PageNames } from '../../../../../../constants';

  /**
   * @typedef {import('../../../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectFromSearchResults',
    components: {
      SearchChips,
      UpdatedResourceSelection,
    },
    setup(props) {
      const instance = getCurrentInstance();
      function redirectBack() {
        const { topicId } = instance.proxy.$route.query;
        if (topicId) {
          instance.proxy.$router.push({
            name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
            query: {
              topicId,
            },
          });
          return;
        }
        instance.proxy.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
        });
      }
      if (!props.displayingSearchResults) {
        redirectBack();
      }

      const { selectFromChannels$, searchLabel$ } = coreStrings;
      const { manageLessonResourcesTitle$ } = coachStrings;

      props.setTitle(manageLessonResourcesTitle$());
      props.setGoBack(null);

      const { data, hasMore, fetchMore, loadingMore } = props.searchFetch;
      return {
        contentList: data,
        hasMore,
        fetchMore,
        loadingMore,
        searchLabel$,
        selectFromChannels$,
        redirectBack,
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
       * Fetch object for fetching search results.
       * @type {FetchObject}
       */
      searchFetch: {
        type: Object,
        required: true,
      },
      selectionRules: {
        type: Array,
        required: false,
        default: () => [],
      },
      selectedResources: {
        type: Array,
        required: true,
      },
      searchTerms: {
        type: Object,
        required: true,
      },
      displayingSearchResults: {
        type: Boolean,
        required: true,
      },
      topic: {
        type: Object,
        required: false,
        default: null,
      },
    },
    computed: {
      resultsCountMessage() {
        const count = this.contentList.length;
        if (this.topic) {
          const params = {
            count,
            folder: this.topic.title,
          };
          return this.hasMore
            ? this.$tr('overResultsCountInFolder', params)
            : this.$tr('resultsCountInFolder', params);
        }
        return this.hasMore
          ? this.$tr('overResultsCount', { count })
          : this.$tr('resultsCount', { count });
      },
    },
    methods: {
      onSearchClick() {
        this.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_SEARCH,
          query: this.$route.query,
        });
      },
      onClearSearch() {
        this.$emit('clearSearch');
        this.redirectBack();
      },
      onRemoveSearchFilterTag(item, { isLast }) {
        this.$emit('removeSearchFilterTag', item);
        if (isLast) {
          this.redirectBack();
        }
      },
      getTopicLink(topicId) {
        return {
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
          query: {
            ...this.$route.query,
            topicId,
            searchResultTopicId: topicId,
            searchTopicId: this.$route.query.topicId,
          },
        };
      },
    },
    $trs: {
      resultsCount: {
        message: '{count, number} {count, plural, one {result} other {results}}',
        context: 'Number of search results when we have an exact count',
      },
      resultsCountInFolder: {
        message: "{count, number} {count, plural, one {result} other {results}} in '{folder}'",
        context: 'Number of search results when we have an exact count in a specific folder',
      },
      overResultsCount: {
        message: 'Over {count, number} results',
        context: 'Number of search results when we know there are more than the count',
      },
      overResultsCountInFolder: {
        message: "Over {count, number} results in '{folder}'",
        context:
          'Number of search results when we know there are more than the count in a specific folder',
      },
    },
  };

</script>


<style scoped lang="scss">

  .side-panel-subtitle {
    font-size: 16px;
    font-weight: 600;
  }

  .channels-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .mr-8 {
    margin-right: 8px;
  }

  .mb-16 {
    margin-bottom: 16px;
  }

  // UpdatedResourceSelection has an ul that adds unnecessary margin
  /deep/ ul {
    margin-top: 0;
  }

</style>
