<template>

  <div>
    <div class="mb-20">
      {{ maxNumberOfQuestionsInfo$({ count: maxQuestions }) }}
    </div>
    <div class="number-question">
      <div>
        <KTextbox
          v-model.number="questionCount"
          type="number"
          :label="numberOfQuestionsLabel$()"
          :max="maxQuestions"
          :min="1"
          :invalid="questionCount > maxQuestions"
          :invalidText="maxNumberOfQuestions$({ count: maxQuestions })"
          :showInvalidText="true"
          class="question-textbox"
        />
      </div>
      <div>
        <div
          :style="{
            border: `1px solid ${$themeTokens.fineLine}`,
          }"
          class="group-button-border"
        >
          <KIconButton
            icon="minus"
            aria-hidden="true"
            :disabled="questionCount === 1"
            @click="questionCount -= 1"
          />
          <span :style="{ color: $themeTokens.fineLine }"> | </span>
          <KIconButton
            icon="plus"
            aria-hidden="true"
            :disabled="questionCount >= maxQuestions"
            @click="questionCount += 1"
          />
        </div>
      </div>
    </div>
    <KCheckbox
      :checked="settings.isChoosingManually"
      :label="chooseQuestionsManuallyLabel$()"
      @change="$emit('update:settings', { ...settings, isChoosingManually: $event })"
    />
  </div>

</template>


<script>

  import { ref, computed, getCurrentInstance, onMounted, onUnmounted, watch } from 'vue';
  import {
    displaySectionTitle,
    enhancedQuizManagementStrings,
  } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import { PageNames } from '../../../../../../constants';
  import { injectQuizCreation } from '../../../../../../composables/useQuizCreation';

  /**
   * @typedef {import('../../../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectFromBookmarks',
    components: {},
    setup(props) {
      const prevRoute = ref(null);
      const instance = getCurrentInstance();

      const {
        questionsSettingsLabel$,
        numberOfQuestionsLabel$,
        maxNumberOfQuestionsInfo$,
        maxNumberOfQuestions$,
        chooseQuestionsManuallyLabel$,
      } = enhancedQuizManagementStrings;
      const { activeSection, activeSectionIndex } = injectQuizCreation();

      const invalidSettings = computed(
        () =>
          props.settings.questionCount > props.settings.maxQuestions ||
          props.settings.questionCount < 1,
      );

      const questionCount = computed({
        get: () => props.settings.questionCount,
        set: value => {
          instance.proxy.$emit('update:settings', {
            ...props.settings,
            questionCount: value,
          });
        },
      });

      props.setTitle(
        questionsSettingsLabel$({
          sectionTitle: displaySectionTitle(activeSection.value, activeSectionIndex.value),
        }),
      );
      props.setGoBack(null);

      const continueHandler = () => {
        if (!props.isLanding && prevRoute.value) {
          instance.proxy.$router.push(prevRoute.value);
          return;
        }
        instance.proxy.$router.push({
          name: PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        });
      };
      onMounted(() => {
        props.setContinueAction({
          handler: continueHandler,
        });
      });
      watch(
        () => props.settings,
        () => {
          props.setContinueAction({
            handler: continueHandler,
            disabled: invalidSettings.value,
          });
        },
      );
      onUnmounted(() => {
        props.setContinueAction(null);
      });

      return {
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        questionCount,
        maxQuestions: computed(() => props.settings.maxQuestions),
        maxNumberOfQuestions$,
        numberOfQuestionsLabel$,
        maxNumberOfQuestionsInfo$,
        chooseQuestionsManuallyLabel$,
      };
    },
    props: {
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      setContinueAction: {
        type: Function,
        default: () => {},
      },
      settings: {
        type: Object,
        required: true,
      },
      isLanding: {
        type: Boolean,
        default: false,
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
  };

</script>


<style lang="scss" scoped>

  .number-question {
    display: inline-flex;
  }

  .group-button-border {
    display: inline-flex;
    align-items: center;
    height: 3.5em;
    border: 1px solid;
  }

  .mb-20 {
    margin-bottom: 20px;
  }

  .question-textbox /deep/ div {
    margin-bottom: 0;
  }

</style>
