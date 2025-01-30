<template>

  <div class="quiz-header">
    <span>
      {{ quizTitle }}
    </span>
    <KButtonGroup>
      <KButton
        icon="settings"
        appearance="flat-button"
        :text="settingsLabel$()"
        @click="onSettingsClick"
      />
      <KButton
        v-if="!hideSearch"
        icon="filter"
        :text="searchLabel$()"
      />
    </KButtonGroup>
  </div>

</template>


<script>

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import { PageNames } from '../../../constants';

  export default {
    name: 'QuizResourceSelectionHeader',
    setup() {
      const { searchLabel$, settingsLabel$ } = coreStrings;

      return {
        searchLabel$,
        settingsLabel$,
      };
    },
    props: {
      settings: {
        type: Object,
        required: true,
      },
      hideSearch: {
        type: Boolean,
        default: false,
      },
    },
    computed: {
      quizTitle() {
        const { selectUpToNResources$, selectUpToNQuestions$ } = enhancedQuizManagementStrings;

        if (this.settings.isChoosingManually) {
          return selectUpToNQuestions$({ count: this.settings.questionCount });
        }
        return selectUpToNResources$({ count: this.settings.questionCount });
      },
    },
    methods: {
      onSettingsClick() {
        this.$router.push({ name: PageNames.QUIZ_SELECT_RESOURCES_SETTINGS });
      },
    },
  };

</script>


<style lang="scss" scoped>

  .quiz-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

</style>
