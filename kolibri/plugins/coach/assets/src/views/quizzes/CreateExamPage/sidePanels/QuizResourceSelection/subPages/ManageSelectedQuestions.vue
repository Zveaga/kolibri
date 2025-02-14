<template>

  <QuestionsAccordion
    :questions="workingQuestions"
    :getQuestionContent="getQuestionContent"
    :selectedQuestions="selectedQuestionsInPreview"
    :selectAllIsChecked="selectAllIsChecked"
    :selectAllIsIndeterminate="selectAllIsIndeterminate"
    @select="handleSelect"
    @selectAll="handleSelectAll"
  >
    <template #header-trailing-actions>
      <KIconButton
        icon="trash"
        :tooltip="coreString('deleteAction')"
        :aria-label="coreString('deleteAction')"
        :disabled="selectedQuestionsInPreview.length === 0"
        @click="deleteQuestions"
      />
    </template>
    <template #questionExtraContent="{ question }">
      <div class="question-content-container">
        <div class="question-content-container-left-items">
          <KIcon icon="practiceSolid" />
          <span>{{ getQuestionContent(question).title }}</span>
        </div>
        <KIconButton icon="emptyTopic" />
      </div>
    </template>
  </QuestionsAccordion>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import QuestionsAccordion from '../../../../../common/QuestionsAccordion.vue';

  export default {
    name: 'ManageSelectedQuestions',
    components: {
      QuestionsAccordion,
    },
    mixins: [commonCoreStrings],
    props: {
      selectedQuestions: {
        type: Array,
        required: true,
      },
      selectedResources: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        // questions: stubQuestions,
        selectedQuestionsInPreview: [],
      };
    },
    computed: {
      workingQuestions() {
        return this.selectedQuestions;
      },
      selectAllIsChecked() {
        return (
          this.selectedQuestionsInPreview.length > 0 &&
          this.selectedQuestionsInPreview.length === this.workingQuestions.length
        );
      },
      selectAllIsIndeterminate() {
        return (
          this.selectedQuestionsInPreview.length > 0 &&
          this.selectedQuestionsInPreview.length < this.workingQuestions.length
        );
      },
    },
    methods: {
      handleSelect(questionItem, isSelected) {
        if (isSelected) {
          if (!this.selectedQuestionsInPreview.includes(questionItem)) {
            this.selectedQuestionsInPreview.push(questionItem);
          }
        } else {
          const index = this.selectedQuestionsInPreview.indexOf(questionItem);
          if (index > -1) {
            this.selectedQuestionsInPreview.splice(index, 1);
          }
        }
      },
      handleSelectAll(isSelected) {
        if (isSelected) {
          this.selectedQuestionsInPreview = this.workingQuestions.map(q => q.item);
        } else {
          this.selectedQuestionsInPreview = [];
        }
      },
      getQuestionContent(question) {
        return this.selectedResources.find(resource => resource.id === question.exercise_id);
      },
      deleteQuestions() {
        const questionsToDelete = this.selectedQuestionsInPreview.map(q =>
          this.workingQuestions.find(wq => wq.item === q),
        );
        this.selectedQuestionsInPreview = [];
        this.$emit('deselectQuestions', questionsToDelete);
      },
    },
  };

</script>


<style lang="scss" scoped>

  .question-content-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0 8px;
  }

  .question-content-container-left-items {
    display: flex;
    gap: 5px;

    span {
      margin-top: 2px;
    }
  }

</style>
