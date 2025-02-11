<template>

  <div>
    <QuestionsAccordion
      :questions="questions"
      :getQuestionContent="() => contentNode"
      :isSelectable="false"
    />
  </div>

</template>


<script>

  import QuestionsAccordion from '../../../../../../common/QuestionsAccordion.vue';

  export default {
    name: 'PreviewExercise',
    components: {
      QuestionsAccordion,
    },

    props: {
      contentNode: {
        type: Object,
        required: true,
      },
      questions: {
        type: Array,
        required: true,
      },
    },
  };

</script>
