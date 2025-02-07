import { computed } from 'vue';
import { exerciseToQuestionArray } from '../utils/selectQuestions';

export default function useFetchExercise(exercise) {
  const questions = computed(() => exerciseToQuestionArray(exercise));

  const activeResourceMap = computed(() => {
    return exercise;
  });

  return {
    questions,
    activeResourceMap,
  };
}
