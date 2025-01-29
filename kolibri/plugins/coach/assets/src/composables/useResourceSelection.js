import uniqBy from 'lodash/uniqBy';
import { ref, computed, getCurrentInstance, watch } from 'vue';
import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
import ChannelResource from 'kolibri-common/apiResources/ChannelResource';
import useFetch from './useFetch';

/**
 * @typedef {import('../../../../../../composables/useFetch').FetchObject} FetchObject
 */

/**
 * Composable for managing the selection of resources within a topic tree.
 * This utility handles selection rules, manages fetch states for channels, bookmarks,
 * and topic trees, and offers methods to add, remove, or override selected resources.
 *
 * @typedef {Object} UseResourceSelectionResponse
 * @property {Object} topic Topic tree object, contains the information of the topic,
 *   its ascendants and children.
 *   Defined only if the `topicId` query in the route is set.
 * @property {boolean} loading Indicates whether the main topic tree, channels, and bookmarks
 *   data are currently loading. This does not account for loading more data. For such cases,
 *   use the fetch objects of each entity.
 * @property {FetchObject} channelsFetch Channels fetch object to manage the process of
 *   fetching channels. We currently don't support fetching more channels.
 * @property {FetchObject} bookmarksFetch Bookmarks fetch object to manage the process of
 *   fetching bookmarks. Fetching more bookmarks is supported.
 * @property {FetchObject} treeFetch Topic tree fetch object to manage the process of
 *   fetching topic trees and their resources. Fetching more resources is supported.
 * @property {Array<(node: Object) => boolean>} selectionRules An array of functions that determine
 *   whether a node can be selected.
 * @property {Array<Object>} selectedResources An array of currently selected resources.
 * @property {(resources: Array<Object>) => void} selectResources Adds the specified resources
 *   to the `selectedResources` array.
 * @property {(resources: Array<Object>) => void} deselectResources Removes the specified resources
 *   from the `selectedResources` array.
 * @property {(resources: Array<Object>) => void} setSelectedResources Replaces the current
 *   `selectedResources` array with the provided resources array.
 *
 * @returns {UseResourceSelectionResponse}
 */
export default function useResourceSelection({ bookmarks, channels, topicTree } = {}) {
  const store = getCurrentInstance().proxy.$store;
  const route = computed(() => store.state.route);
  const topicId = computed(() => route.value.query.topicId);

  const selectionRules = ref([]);
  const selectedResources = ref([]);
  const topic = ref(null);

  const fetchBookmarks = async params => {
    const response = await ContentNodeResource.fetchBookmarks(params);
    if (bookmarks?.annotator) {
      const annotatedResults = await bookmarks.annotator(response.results);
      return {
        ...response,
        results: annotatedResults,
      };
    }
    return response;
  };
  const bookmarksFetch = useFetch({
    fetchMethod: () =>
      fetchBookmarks({
        params: { limit: 25, available: true, ...bookmarks?.filters },
      }),
    fetchMoreMethod: more =>
      ContentNodeResource.fetchBookmarks({
        params: more,
      }),
  });

  const fetchChannels = async () => {
    const result = await ChannelResource.fetchCollection({
      getParams: {
        available: true,
        ...channels?.filters,
      },
    });
    if (channels?.annotator) {
      return channels.annotator(result);
    }
    return result;
  };
  const channelsFetch = useFetch({
    fetchMethod: fetchChannels,
  });

  const fetchTree = async (params = {}) => {
    topic.value = await ContentNodeResource.fetchTree(params);
    if (topicTree?.annotator) {
      const annotatedResults = await topicTree.annotator(topic.value.children.results);
      return {
        ...topic.value.children,
        results: annotatedResults,
      };
    }
    return topic.value.children;
  };

  const treeFetch = useFetch({
    fetchMethod: () =>
      fetchTree({
        id: topicId.value,
        params: { include_coach_content: true, ...topicTree?.filters },
      }),
    fetchMoreMethod: more => fetchTree(more),
  });

  watch(topicId, () => {
    if (topicId.value) {
      treeFetch.fetchData();
    }
  });

  const loading = computed(() => {
    const sources = [bookmarksFetch, channelsFetch, treeFetch];

    return sources.some(sourceFetch => sourceFetch.loading.value);
  });

  const fetchInitialData = async () => {
    bookmarksFetch.fetchData();
    channelsFetch.fetchData();
    if (topicId.value) {
      treeFetch.fetchData();
    }
  };

  fetchInitialData();

  const selectResources = (resources = []) => {
    if (!resources || !resources.length) {
      return;
    }
    if (resources.length === 1) {
      const [newResource] = resources;
      if (!selectedResources.value.find(res => res.id === newResource.id)) {
        selectedResources.value = [...selectedResources.value, newResource];
      }
    } else {
      selectedResources.value = uniqBy([...selectedResources.value, ...resources], 'id');
    }
  };

  const deselectResources = (resources = []) => {
    if (!resources || !resources.length) {
      return;
    }
    selectedResources.value = selectedResources.value.filter(res => {
      return !resources.find(unselectedResource => unselectedResource.id === res.id);
    });
  };

  const setSelectedResources = (resources = []) => {
    selectedResources.value = resources;
  };

  return {
    topic,
    loading,
    channelsFetch,
    bookmarksFetch,
    treeFetch,
    selectionRules,
    selectedResources,
    selectResources,
    deselectResources,
    setSelectedResources,
  };
}
