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
 * @param {computed<string|null|undefined>} config.topicId - The id of the root node
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
   * Annotates the child TOPIC nodes with the number of assessments
   * @param {ContentNode[]} results - The array of results from content API
   * @returns {Promise<ContentNode[]>} - Promise resolving to annotated results
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

  const api = {
    setResources,
    resources: computed(() => get(_resources)),
    loading: computed(() => get(_loading) || get(treeLoading)),
    loadingMore: computed(() => get(_loadingMore)),
    hasMore,
    topic,
    annotateTopicsWithDescendantCounts,
    fetchQuizResources: undefined,
    fetchMoreQuizResources: undefined,
  };

  api.fetchQuizResources = async function fetchQuizResources() {
    set(_loading, true);
    return fetchTree().then(async results => {
      return api.annotateTopicsWithDescendantCounts(results).then(annotatedResults => {
        setResources(annotatedResults);
        set(_loading, false);
      });
    });
  };

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
