<template>

  <div>
    <div class="channel-header">
      <p>
        {{ coreString('selectFromChannels') }}
      </p>

      <div class="d-flex-center">
        <span
          v-if="isSelected"
          class="mr-16"
        >
          <KIcon icon="onDevice" />
          {{ addedIndicator$() }}
        </span>

        <KButton
          v-if="isSelected"
          :text="coreString('removeAction')"
          :primary="true"
          :disabled="isActionDisabled"
          @click="removeResource()"
        />
        <KButton
          v-else
          :text="addText$()"
          :primary="false"
          :disabled="isActionDisabled"
          @click="addResource()"
        />
      </div>
    </div>

    <ResourceSelectionBreadcrumbs
      v-if="ancestors.length"
      :ancestors="[...ancestors, currentContentNode]"
      :channelsLink="channelsLink"
      :topicsLink="topicsLink"
    />

    <h2>
      <KLabeledIcon :label="currentContentNode.kind">
        <template #icon>
          <LearningActivityIcon :kind="learningActivities" />
        </template>
        <template>
          {{ currentContentNode.title }}
        </template>
      </KLabeledIcon>
    </h2>

    <ContentArea
      :header="questionLabel(selectedQuestionIndex)"
      :selectedQuestion="selectedQuestion"
      :content="currentContentNode"
      :isExercise="isExercise"
    />

    <SlotTruncator
      v-if="description"
      :maxHeight="75"
      :showViewMore="true"
    >
      <!-- eslint-disable vue/no-v-html -->
      <p
        dir="auto"
        v-html="description"
      ></p>
      <!-- eslint-enable -->
    </SlotTruncator>

    <HeaderTable class="license-detail-style">
      <HeaderTableRow :keyText="coreString('suggestedTime')">
        <template #value>
          {{
            currentContentNode.duration
              ? getTime(currentContentNode.duration)
              : notAvailableLabel$()
          }}
        </template>
      </HeaderTableRow>

      <HeaderTableRow :keyText="licenseDataHeader$()">
        <template #value>
          {{ licenseName }}
        </template>
      </HeaderTableRow>

      <HeaderTableRow :keyText="copyrightHolderDataHeader$()">
        <template #value>
          {{ currentContentNode.license_owner }}
        </template>
      </HeaderTableRow>
    </HeaderTable>
  </div>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { licenseLongName } from 'kolibri/uiText/licenses';
  import markdownIt from 'markdown-it';
  import { ContentNodeKinds } from 'kolibri/constants';
  import LearningActivityIcon from 'kolibri-common/components/ResourceDisplayAndSearch/LearningActivityIcon.vue';
  import SlotTruncator from 'kolibri-common/components/SlotTruncator';
  import { SelectionTarget } from '../../contants.js';
  import { PageNames } from '../../../../../constants/index.js';
  import ContentArea from '../../../../lessons/LessonSelectionContentPreviewPage/LessonContentPreview/ContentArea.vue';
  import ResourceSelectionBreadcrumbs from '../../../../lessons/LessonResourceSelectionPage/SearchTools/ResourceSelectionBreadcrumbs.vue';
  import HeaderTable from '../../../HeaderTable/index.vue';
  import HeaderTableRow from '../../../HeaderTable/HeaderTableRow.vue';

  export default {
    name: 'PreviewContent',
    components: {
      ContentArea,
      HeaderTable,
      HeaderTableRow,
      SlotTruncator,
      LearningActivityIcon,
      ResourceSelectionBreadcrumbs,
    },
    mixins: [commonCoreStrings],
    setup() {
      const {
        addText$,
        copyrightHolderDataHeader$,
        licenseDataHeader$,
        addedIndicator$,
        notAvailableLabel$,
        minutes$,
      } = searchAndFilterStrings;

      return {
        addText$,
        licenseDataHeader$,
        copyrightHolderDataHeader$,
        addedIndicator$,
        notAvailableLabel$,
        minutes$,
      };
    },
    props: {
      currentContentNode: {
        type: Object,
        required: true,
      },
      ancestors: {
        type: Array,
        required: false,
        default: () => [],
      },
      isSelected: {
        type: Boolean,
        required: true,
      },
      questions: {
        type: Array,
        required: false,
        default: () => [],
      },
      isActionDisabled: {
        type: Boolean,
        required: false,
        default: false,
      },
      /**
       * The target entity for the selection.
       * It can be either 'quiz' or 'lesson'.
       */
      target: {
        type: String,
        required: true,
      },
    },
    data() {
      return {
        selectedQuestionIndex: 0,
      };
    },
    computed: {
      channelsLink() {
        return {
          name:
            this.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        };
      },
      isExercise() {
        return this.currentContentNode.kind === ContentNodeKinds.EXERCISE;
      },
      selectedQuestion() {
        if (this.isExercise) {
          return this.questions[this.selectedQuestionIndex];
        }
        return '';
      },
      licenseName() {
        return licenseLongName(this.currentContentNode.license_name);
      },
      description() {
        if (this.currentContentNode && this.currentContentNode.description) {
          const md = new markdownIt('zero', { breaks: true });
          return md.render(this.currentContentNode.description);
        }

        return undefined;
      },
      learningActivities() {
        if (this.currentContentNode.learning_activities) {
          return this.currentContentNode.learning_activities;
        }
        return [];
      },
    },
    methods: {
      topicsLink(topicId) {
        const { params, query } = this.$route;

        return {
          name:
            this.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE
              : PageNames.QUIZ_SELECT_RESOURCES_TOPIC_TREE,
          params: params,
          query: {
            ...query,
            topicId,
          },
        };
      },
      questionLabel(questionIndex) {
        if (!this.isExercise) {
          return '';
        }
        const questionNumber = questionIndex + 1;
        return this.coreString('questionNumberLabel', { questionNumber });
      },
      addResource() {
        this.$emit('addResource', this.currentContentNode);
      },
      removeResource() {
        this.$emit('removeResource', this.currentContentNode);
      },
      getTime(seconds) {
        return this.minutes$({ value: Math.floor(seconds / 60) });
      },
    },
  };

</script>


<style lang="scss" scoped>

  .mr-16 {
    margin-right: 16px;
  }

  .d-flex-center {
    display: flex;
    align-items: center;
  }

  .license-detail-style {
    margin-top: 10px;
  }

  /deep/ .content-renderer {
    position: relative;
    max-height: 500px;
  }

  .channel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .channel-header p {
    font-weight: 600;
  }

</style>
