import { ref } from 'vue';
import { get } from '@vueuse/core';
import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';
import { ContentNodeKinds } from 'kolibri/constants';
import useQuizResources from '../src/composables/useQuizResources.js';
import useFetchTree from '../src/composables/useFetchTree.js';

// Mock the useFetchTree module
jest.mock('../src/composables/useFetchTree.js');
jest.mock('kolibri-common/apiResources/ContentNodeResource');

describe('useQuizResources', () => {
  // Sample test data
  const sampleResults = [
    {
      id: 'topic1',
      kind: ContentNodeKinds.TOPIC,
      title: 'Topic 1',
      children: ['exercise1', 'exercise2']
    },
    {
      id: 'topic2',
      kind: ContentNodeKinds.TOPIC,
      title: 'Topic 2',
      children: ['exercise3']
    },
    {
      id: 'exercise1',
      kind: ContentNodeKinds.EXERCISE,
      title: 'Exercise 1'
    }
  ];

  const annotatedResults = [
    {
      ...sampleResults[0],
      num_assessments: 2
    },
    {
      ...sampleResults[1],
      num_assessments: 1
    },
    sampleResults[2]
  ];

  const descendantsResponse = {
    data: [
      { id: 'topic1', num_assessments: 2 },
      { id: 'topic2', num_assessments: 1 }
    ]
  };

  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useFetchTree implementation
    useFetchTree.mockImplementation(() => ({
      topic: ref(null),
      fetchTree: jest.fn().mockResolvedValue(sampleResults),
      fetchMore: jest.fn().mockResolvedValue(sampleResults),
      hasMore: ref(true),
      loading: ref(false)
    }));

    // Mock ContentNodeResource.fetchDescendantsAssessments
    ContentNodeResource.fetchDescendantsAssessments.mockResolvedValue(descendantsResponse);
  });

  describe('initialization', () => {
    it('should initialize with correct parameters for practice quiz', () => {
      useQuizResources({ topicId: 'test-topic', practiceQuiz: true });
      
      expect(useFetchTree).toHaveBeenCalledWith({
        topicId: 'test-topic',
        params: {
          kind_in: [ContentNodeKinds.EXERCISE, ContentNodeKinds.TOPIC],
          include_coach_content: true,
          contains_quiz: true
        }
      });
    });

    it('should initialize with correct parameters for regular quiz', () => {
      useQuizResources({ topicId: 'test-topic' });
      
      expect(useFetchTree).toHaveBeenCalledWith({
        topicId: 'test-topic',
        params: {
          kind_in: [ContentNodeKinds.EXERCISE, ContentNodeKinds.TOPIC],
          include_coach_content: true
        }
      });
    });
  });

  describe('annotateTopicsWithDescendantCounts', () => {
    it('should annotate topics with correct assessment counts', async () => {
      const { annotateTopicsWithDescendantCounts } = useQuizResources();
      
      const result = await annotateTopicsWithDescendantCounts(sampleResults);
      
      expect(result).toEqual(annotatedResults);
      expect(ContentNodeResource.fetchDescendantsAssessments).toHaveBeenCalledWith([
        'topic1',
        'topic2'
      ]);
    });

    it('should filter out topics with no assessments', async () => {
      ContentNodeResource.fetchDescendantsAssessments.mockResolvedValue({
        data: [
          { id: 'topic1', num_assessments: 0 },
          { id: 'topic2', num_assessments: 1 }
        ]
      });

      const { annotateTopicsWithDescendantCounts } = useQuizResources();
      const result = await annotateTopicsWithDescendantCounts(sampleResults);
      
      expect(result).toEqual([
        {
          ...sampleResults[1],
          num_assessments: 1
        },
        sampleResults[2]
      ]);
    });

    it('should handle API errors gracefully', async () => {
      const error = new Error('API Error');
      ContentNodeResource.fetchDescendantsAssessments.mockRejectedValue(error);

      const { annotateTopicsWithDescendantCounts } = useQuizResources();
      const result = await annotateTopicsWithDescendantCounts(sampleResults);
      
      expect(result).toBeUndefined();
    });
  });

  describe('integration with fetch methods', () => {
    let quizResources, annotateTopicsSpy;
    beforeEach(() => {
      quizResources = useQuizResources({ topicId: 'test-topic' });
      // Spy on the public API property now that our fetch functions call it via "api.annotateTopicsWithDescendantCounts"
      annotateTopicsSpy = jest.spyOn(quizResources, 'annotateTopicsWithDescendantCounts');
    });
    afterEach(() => {
      annotateTopicsSpy.mockRestore();
    });

    it('should call annotateTopicsWithDescendantCounts during fetchQuizResources', async () => {
      await quizResources.fetchQuizResources();
      
      expect(annotateTopicsSpy).toHaveBeenCalledTimes(1);
      expect(annotateTopicsSpy).toHaveBeenCalledWith(sampleResults);
    });

    it('should call annotateTopicsWithDescendantCounts during fetchMoreQuizResources', async () => {
      await quizResources.fetchMoreQuizResources();
      
      expect(annotateTopicsSpy).toHaveBeenCalledTimes(1);
      expect(annotateTopicsSpy).toHaveBeenCalledWith(sampleResults);
    });
  });

  describe('fetchQuizResources', () => {
    it('should fetch and annotate resources', async () => {
      const { fetchQuizResources, resources } = useQuizResources();
      
      await fetchQuizResources();
      
      expect(get(resources)).toEqual(annotatedResults);
    });

    it('should handle loading state correctly', async () => {
      const { fetchQuizResources, loading } = useQuizResources();
      
      const loadingStates = [];
      // Use .value to get booleans from computed refs
      loadingStates.push(loading.value);
      
      const fetchPromise = fetchQuizResources();
      loadingStates.push(loading.value);
      
      await fetchPromise;
      loadingStates.push(loading.value);
      
      expect(loadingStates).toEqual([false, true, false]);
    });
  });

  describe('fetchMoreQuizResources', () => {
    it('should fetch and append more resources', async () => {
      const { fetchQuizResources, fetchMoreQuizResources, resources } = useQuizResources();
      
      await fetchQuizResources();
      const initialResources = get(resources);
      
      await fetchMoreQuizResources();
      
      expect(get(resources)).toEqual([...initialResources, ...annotatedResults]);
    });

    it('should handle loading states correctly', async () => {
      const { fetchMoreQuizResources, loading, loadingMore } = useQuizResources();
      
      const states = [];
      states.push({ loading: loading.value, loadingMore: loadingMore.value });
      
      const fetchPromise = fetchMoreQuizResources();
      states.push({ loading: loading.value, loadingMore: loadingMore.value });
      
      await fetchPromise;
      states.push({ loading: loading.value, loadingMore: loadingMore.value });
      
      expect(states).toEqual([
        { loading: false, loadingMore: false },
        { loading: true, loadingMore: true },
        { loading: false, loadingMore: false }
      ]);
    });
  });
});
