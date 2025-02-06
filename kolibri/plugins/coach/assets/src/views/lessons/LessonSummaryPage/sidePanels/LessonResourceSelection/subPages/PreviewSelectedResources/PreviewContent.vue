<template>

  <div>
    <div class="channel-header">
      <div>
        <h6>
          {{ coreString('selectFromChannels') }}
        </h6>
      </div>

      <div>
        <template v-if="isSelected">
          <KIcon icon="onDevice" />
          {{ addedIndicator$() }}
        </template>

        <KButton
          v-if="isSelected"
          :text="coreString('removeAction')"
          :primary="true"
          @click="removeResource()"
        />
        <KButton
          v-else
          :text="addText$()"
          :primary="false"
          @click="addResource()"
        />
      </div>
    </div>

    <ResourceSelectionBreadcrumbs
      v-if="ancestors.length"
      :ancestors="[...ancestors, currentContentNode]"
      :channelsLink="channelsLink"
      :topicsLink="topicsLink"
      class="align-breadcrumbs"
    />

    <div class="title-class">
      <h5>
        <KLabeledIcon :label="currentContentNode.kind">
          <template #icon>
            <LearningActivityIcon :kind="learningActivities" />
          </template>
          <template>
            {{ currentContentNode.title }}
          </template>
        </KLabeledIcon>
      </h5>
    </div>

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
  import ContentArea from '../../../../../LessonSelectionContentPreviewPage/LessonContentPreview/ContentArea.vue';
  import commonCoach from '../../../../../../common';
  import { PageNames } from '../../../../../../../constants/index';
  import ResourceSelectionBreadcrumbs from '../../../../../LessonResourceSelectionPage/SearchTools/ResourceSelectionBreadcrumbs.vue';

  export default {
    name: 'PreviewContent',
    components: {
      ContentArea,
      SlotTruncator,
      LearningActivityIcon,
      ResourceSelectionBreadcrumbs,
    },
    mixins: [commonCoreStrings, commonCoach],
    setup() {
      const {
        addText$,
        copyrightHolderDataHeader$,
        licenseDataHeader$,
        addedIndicator$,
        notAvailableLabel$,
      } = searchAndFilterStrings;

      return {
        addText$,
        licenseDataHeader$,
        copyrightHolderDataHeader$,
        addedIndicator$,
        notAvailableLabel$,
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
    },
    data() {
      return {
        selectedQuestionIndex: 0,
      };
    },
    computed: {
      channelsLink() {
        return {
          name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
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
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
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
        return this.$tr('minutes', { value: Math.floor(seconds / 60) });
      },
    },
    $trs: {
      minutes: {
        message: '{value, number, integer} {value, plural, one {minute} other {minutes}}',
        context:
          'Indicates time spent by learner on a specific activity. Only translate minute/minutes.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .license-detail-style {
    margin: 30px 0 32px;
  }

  /deep/ .content-renderer {
    position: relative;
    top: -40px;
    max-height: 500px;
  }

  .channel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .title-class {
    position: relative;
    top: -30px;
  }

  .align-breadcrumbs {
    position: relative;
    top: -35px;
  }

</style>
