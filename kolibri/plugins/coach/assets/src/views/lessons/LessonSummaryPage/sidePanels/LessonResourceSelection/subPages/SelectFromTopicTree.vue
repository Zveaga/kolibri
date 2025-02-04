<template>

  <div>
    <div
      v-if="!isTopicFromSearchResult"
      class="channels-header"
    >
      <span class="side-panel-subtitle">
        {{ selectFromChannels$() }}
      </span>
      <KButton
        icon="filter"
        :text="searchLabel$()"
        @click="onSearchClick"
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
      :disabled="disabled"
      :topic="computedTopic"
      :contentList="contentList"
      :hasMore="hasMore"
      :fetchMore="fetchMore"
      :loadingMore="loadingMore"
      :selectionRules="selectionRules"
      :selectedResources="selectedResources"
      :channelsLink="breadcrumbChannelsLink"
      :hideBreadcrumbs="hideBreadcrumbs"
      :unselectableResourceIds="unselectableResourceIds"
      @selectResources="$emit('selectResources', $event)"
      @deselectResources="$emit('deselectResources', $event)"
    />
  </div>

</template>


<script>

  import { computed, getCurrentInstance } from 'vue';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import UpdatedResourceSelection from '../../../UpdatedResourceSelection.vue';
  import { coachStrings } from '../../../../../common/commonCoachStrings';
  import { PageNames } from '../../../../../../constants';

  /**
   * @typedef {import('../../../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectFromTopicTree',
    components: {
      UpdatedResourceSelection,
    },
    setup(props) {
      const { selectFromChannels$, searchLabel$ } = coreStrings;
      const { manageLessonResourcesTitle$ } = coachStrings;
      const { backToSearchResultsLabel$ } = searchAndFilterStrings;
      const instance = getCurrentInstance();
      const routeQuery = instance.proxy.$route.query;
      const isTopicFromSearchResult = computed(() => !!routeQuery.searchResultTopicId);

      props.setTitle(
        isTopicFromSearchResult.value ? backToSearchResultsLabel$() : manageLessonResourcesTitle$(),
      );

      props.setGoBack(() => {
        const { searchTopicId } = routeQuery;
        if (!isTopicFromSearchResult.value) {
          return instance.proxy.$router.push({
            name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          });
        }
        const query = { ...instance.proxy.$route.query };
        query.topicId = searchTopicId;
        delete query.searchTopicId;
        delete query.searchResultTopicId;

        instance.proxy.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_SEARCH_RESULTS,
          query,
        });
      });

      const computedTopic = computed(() => {
        if (!isTopicFromSearchResult.value) {
          return props.topic;
        }
        // When we are showing the topic tree of a folder that was found in search results,
        // we want to show just the ancestors starting from the search result topic. So lets
        // slice the ancestors array to start from the search result topic.
        const { searchResultTopicId } = routeQuery;
        const topicAncestors = props.topic.ancestors;
        const searchResultTopicIndex = topicAncestors.findIndex(
          ({ id }) => id === searchResultTopicId,
        );
        const newAncestors =
          searchResultTopicIndex === -1 ? [] : topicAncestors.slice(searchResultTopicIndex);

        return {
          ...props.topic,
          ancestors: newAncestors,
        };
      });

      const { data, hasMore, fetchMore, loadingMore } = props.treeFetch;
      return {
        contentList: data,
        hasMore,
        fetchMore,
        loadingMore,
        computedTopic,
        isTopicFromSearchResult,
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
    },
    computed: {
      breadcrumbChannelsLink() {
        if (this.isTopicFromSearchResult) {
          // Dont show chanell breadcrumb if topic is from search result
          return null;
        }
        return {
          name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
        };
      },
      hideBreadcrumbs() {
        return this.isTopicFromSearchResult && this.computedTopic.ancestors.length === 0;
      },
    },
    beforeRouteEnter(to, _, next) {
      const { topicId } = to.query;
      if (!topicId) {
        return next({
          name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          params: {
            ...to.params,
          },
        });
      }
      return next();
    },
    methods: {
      onSearchClick() {
        this.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_SEARCH,
          query: this.$route.query,
        });
      },
    },
  };

</script>


<style scoped>

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

  .topic-info h2 {
    margin: 0;
  }

  .mr-8 {
    margin-right: 8px;
  }

</style>
