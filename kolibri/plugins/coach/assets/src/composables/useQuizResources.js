import { get, set } from '@vueuse/core';
import { computed, ref } from 'vue';
import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
import { ContentNodeKinds } from 'kolibri/constants';
import logging from 'kolibri-logging';
import useFetchTree from './useFetchTree';

const logger = logging.getLogger(__filename);
const _loadingMore = ref(false);

/**
 * @module useQuizResources
 * @param {Object} config
 * @param {computed<string|null|undefined>} config.topicId - The id of the root node to fetch the children for
 * @param {boolean} [config.practiceQuiz=false]
 */
export default function useQuizResources({ topicId, practiceQuiz = false } = {}) {
  const params = {
    kind_in: [ContentNodeKinds.EXERCISE, ContentNodeKinds.TOPIC],
    include_coach_content: true,
  };

  if (practiceQuiz) {
    params.contains_quiz = true;
  }

  // Initialize useFetchTree methods with the given topicId and params
  const {
    topic,
    fetchTree,
    fetchMore,
    hasMore,
    loading: treeLoading,
  } = useFetchTree({
    topicId,
    params,
  });

  const _resources = ref([]);
  const _loading = ref(false);

  /**
   * Annotates the child TOPIC nodes with the number of assessments that are contained within them
   * @param {ContentNode[]} results - The array of results from a content API call
   * @returns {Promise<ContentNode[]>} - A promise that resolves when the annotations have been made and returns the annotated results
   */
  async function annotateTopicsWithDescendantCounts(results) {
    const topicIds = results
      .filter(({ kind }) => kind === ContentNodeKinds.TOPIC || kind === ContentNodeKinds.CHANNEL)
      .map(topic => topic.id);
    return ContentNodeResource.fetchDescendantsAssessments(topicIds)
      .then(({ data: topicsWithAssessmentCounts }) => {
        const topicsWithAssessmentCountsMap = topicsWithAssessmentCounts.reduce((acc, topic) => {
          acc[topic.id] = topic.num_assessments;
          return acc;
        }, {});
        return results
          .map(node => {
            if ([ContentNodeKinds.TOPIC, ContentNodeKinds.CHANNEL].includes(node.kind)) {
              if (!topicsWithAssessmentCountsMap[node.id]) {
                return null;
              }
              if (node.kind === ContentNodeKinds.TOPIC && !node.children) {
                return null;
              }
              node.num_assessments = topicsWithAssessmentCountsMap[node.id];
            }
            return node;
          })
          .filter(Boolean);
      })
      .catch(e => {
        logger.error(e);
      });
  }

  function setResources(r) {
    set(_resources, r);
  }

  // --- Create a public API object to hold and expose functions ---
  const api = {
    setResources,
    resources: computed(() => get(_resources)),
    loading: computed(() => get(_loading) || get(treeLoading)),
    loadingMore: computed(() => get(_loadingMore)),
    hasMore,
    topic,
    annotateTopicsWithDescendantCounts, // expose this function for testing
    // We'll assign these next:
    fetchQuizResources: undefined,
    fetchMoreQuizResources: undefined,
  };

  // --- Define fetchQuizResources using the public API to call annotateTopicsWithDescendantCounts ---
  api.fetchQuizResources = async function fetchQuizResources() {
    set(_loading, true);
    return fetchTree().then(async results => {
      return api.annotateTopicsWithDescendantCounts(results).then(annotatedResults => {
        setResources(annotatedResults);
        set(_loading, false);
      });
    });
  };

  // --- Define fetchMoreQuizResources similarly ---
  api.fetchMoreQuizResources = async function fetchMoreQuizResources() {
    set(_loading, true);
    set(_loadingMore, true);
    return fetchMore().then(async results => {
      return api.annotateTopicsWithDescendantCounts(results).then(annotatedResults => {
        set(_resources, [...get(_resources), ...annotatedResults]);
        set(_loading, false);
        set(_loadingMore, false);
      });
    });
  };

  return api;
}

