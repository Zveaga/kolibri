<template>

  <QuestionsAccordion
    :questions="questions"
    :getQuestionContent="getQuestionContentStub"
    :selectedQuestions="selectedQuestions"
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
        :disabled="selectedQuestions.length === 0"
        @click="deleteQuestions"
      />
    </template>
    <template #questionExtraContent="{ question }">
      <div class="question-content-container">
        <div class="question-content-container-left-items">
          <KIcon icon="practiceSolid" />
          <span>{{ getQuestionContentStub(question).channel_name }}</span>
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
    data() {
      const stubQuestions = [
        {
          exercise_id: '03be2208f89c4c1fb9fc775a26ef1a60',
          question_id: '2291da8de2bb5335aa2181a84e7e2b4f',
          title: '',
          counter_in_exercise: 18,
          item: '03be2208f89c4c1fb9fc775a26ef1a60:2291da8de2bb5335aa2181a84e7e2b4f',
          channel: 'Chemical Bonding and Property influence',
        },
        {
          exercise_id: '3b7833d038b24634be8e1377600fc3bc',
          question_id: 'a62b02180ae35d118c6263d50d8b1f2e',
          title: '',
          counter_in_exercise: 10,
          item: '3b7833d038b24634be8e1377600fc3bc:a62b02180ae35d118c6263d50d8b1f2e',
          channel: 'Yet Another channel',
        },
      ];

      return {
        questions: stubQuestions,
        selectedQuestions: [],
      };
    },
    computed: {
      selectAllIsChecked() {
        return this.questions.length > 0 && this.selectedQuestions.length === this.questions.length;
      },
      selectAllIsIndeterminate() {
        return (
          this.selectedQuestions.length > 0 && this.selectedQuestions.length < this.questions.length
        );
      },
    },
    methods: {
      getQuestionContentStub(question) {
        return {
          kind: 'exercise',
          title: question.title || `Question ${question.counter_in_exercise}`,
          lang: {
            id: 'en',
            lang_code: 'en',
            lang_subcode: null,
            lang_name: 'English',
            lang_direction: 'ltr',
          },
          files: [
            {
              id: '8c4d0a3a555142be99584bb995a4a255',
              priority: 1,
              preset: 'exercise',
              supplementary: false,
              thumbnail: false,
              lang: null,
              checksum: 'c4c395e8042a88374a4d18d0506ef185',
              available: true,
              file_size: 71213,
              extension: 'perseus',
              storage_url: '/content/storage/c/4/c4c395e8042a88374a4d18d0506ef185.perseus',
            },
          ],
          channel_name: 'Chemical Bonding and Property Influence',
          available: true,
        };
      },
      handleSelect(questionItem, isSelected) {
        if (isSelected) {
          if (!this.selectedQuestions.includes(questionItem)) {
            this.selectedQuestions.push(questionItem);
          }
        } else {
          const index = this.selectedQuestions.indexOf(questionItem);
          if (index > -1) {
            this.selectedQuestions.splice(index, 1);
          }
        }
      },
      handleSelectAll(isSelected) {
        if (isSelected) {
          this.selectedQuestions = this.questions.map(q => q.item);
        } else {
          this.selectedQuestions = [];
        }
      },
      deleteQuestions() {
        //TODOO
        return;
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
  }

  .question-content-container-left-items {
    display: flex;
    gap: 5px;

    span {
      margin-top: 2px;
    }
  }

</style>
