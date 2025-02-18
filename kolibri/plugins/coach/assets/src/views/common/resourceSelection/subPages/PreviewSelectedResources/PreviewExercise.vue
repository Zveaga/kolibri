<template>

  <div>
    <QuestionsAccordion
      :questions="questions"
      :getQuestionContent="() => contentNode"
      :isSelectable="!!settings?.isChoosingManually"
      :selectedQuestions="selectedQuestions"
      :selectAllIsChecked="selectAllIsChecked"
      :selectAllIsIndeterminate="selectAllIsIndeterminate"
      @select="(questionItem, value) => $emit('select', questionItem, value)"
      @selectAll="$emit('selectAll', $event)"
    />
  </div>

</template>


<script>

  import QuestionsAccordion from '../../../QuestionsAccordion.vue';

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
      settings: {
        type: Object,
        required: false,
        default: null,
      },
      selectedQuestions: {
        type: Array,
        required: false,
        default: () => [],
      },
    },
    computed: {
      selectAllIsChecked() {
        return this.questions.every(question => this.selectedQuestions.includes(question.item));
      },
      selectAllIsIndeterminate() {
        return (
          this.questions.some(question => this.selectedQuestions.includes(question.item)) &&
          !this.selectAllIsChecked
        );
      },
    },
  };

</script>
