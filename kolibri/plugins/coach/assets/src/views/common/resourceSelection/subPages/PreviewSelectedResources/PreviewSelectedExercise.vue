<template>

  <div>
    <QuestionsAccordion
      :questions="questions"
      :selectedQuestions="[]"
      :getQuestionContent="() => activeResourceMap"
      :isCheckBoxVisible="false"
    />
  </div>

</template>


<script>

  import QuestionsAccordion from '../../../../../../common/QuestionsAccordion.vue';
  import useFetchExercise from '../../../../../../../composables/useFetchExercise';

  export default {
    name: 'PreviewSelectedExercise',
    components: {
      QuestionsAccordion,
    },
    setup(props) {
      const { questions, activeResourceMap } = useFetchExercise(props.contentNode);
      return {
        questions,
        activeResourceMap,
      };
    },
    props: {
      contentNode: {
        type: Object,
        required: true,
      },
    },
  };

</script>
