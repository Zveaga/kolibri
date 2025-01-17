<template>

  <div>
    <KGrid>
      <KGridItem
        :layout12="{ span: 9 }"
        :layout8="{ span: 4 }"
        :layout4="{ span: 2 }"
      >
        {{ coreString('selectFromChannels') }}
      </KGridItem>
      <KGridItem
        :layout12="{ span: 3 }"
        :layout8="{ span: 4 }"
        :layout4="{ span: 2 }"
      >
        <template>
          <div class="add-remove-button-style">
            <template v-if="isSelected">
              <KIcon icon="onDevice" />
              {{ addedIndicator$() }}
            </template>

            <KButton
              v-if="isSelected"
              :text="coreString('removeAction')"
              :primary="true"
              :disabled="disableSelectButton"
              @click="removeResource"
            />
            <KButton
              v-else
              :text="addText$()"
              :primary="false"
              :disabled="disableSelectButton"
              @click="addResource"
            />
          </div>
        </template>
      </KGridItem>
    </KGrid>

    <KBreadcrumbs
      :items="breadcrumbs"
      :showSingleItem="true"
    />

    <h5>
      <KLabeledIcon :icon="content.kind">
        <template>
          {{ content.title }}
        </template>
      </KLabeledIcon>
    </h5>

    <ContentArea
      :header="questionLabel(selectedQuestionIndex)"
      :selectedQuestion="selectedQuestion"
      :content="content"
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

    <template>
      <HeaderTable class="license-detail-style">
        <HeaderTableRow :keyText="coreString('suggestedTime')">
          <template #value>
            {{ content.duration ? getTime(content.duration) : 'Not available' }}
          </template>
        </HeaderTableRow>

        <HeaderTableRow :keyText="licenseDataHeader$()">
          <template #value>
            {{ licenseName }}
          </template>
        </HeaderTableRow>

        <HeaderTableRow :keyText="copyrightHolderDataHeader$()">
          <template #value>
            {{ content.license_owner }}
          </template>
        </HeaderTableRow>
      </HeaderTable>
    </template>
  </div>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { licenseLongName } from 'kolibri/uiText/licenses';
  import markdownIt from 'markdown-it';
  import SlotTruncator from 'kolibri-common/components/SlotTruncator';
  import ContentArea from '../../LessonSelectionContentPreviewPage/LessonContentPreview/ContentArea.vue';
  import commonCoach from '../../../common';
  import { PageNames } from '../../../../constants/index';

  export default {
    name: 'PreviewContent',
    components: {
      ContentArea,
      SlotTruncator,
    },
    mixins: [commonCoreStrings, commonCoach],
    setup() {
      const { addText$, copyrightHolderDataHeader$, licenseDataHeader$, addedIndicator$ } =
        searchAndFilterStrings;

      return {
        addText$,
        licenseDataHeader$,
        copyrightHolderDataHeader$,
        addedIndicator$,
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
    },
    data() {
      return {
        selectedQuestionIndex: 0,
        disableSelectButton: false,
      };
    },
    computed: {
      breadcrumbs() {
        return [
          { text: this.coreString('channelsLabel'), link: this.channelsLink },
          ...this.ancestors.map(a => ({
            text: a.title,
            link: this.topicsLink(a.id),
          })),
        ];
      },
      isExercise() {
        return this.content.kind === 'exercise';
      },
      selectedQuestion() {
        if (this.isExercise) {
          return this.questions[this.selectedQuestionIndex];
        }
        return '';
      },
      licenseName() {
        return licenseLongName(this.content.license_name);
      },
      content() {
        return this.currentContentNode;
      },
      channelsLink() {
        return this.selectionRootLink();
      },
      description() {
        if (this.content && this.content.description) {
          const md = new markdownIt('zero', { breaks: true });
          return md.render(this.content.description);
        }

        return undefined;
      },
    },
    methods: {
      topicsLink(topicId) {
        return this.topicListingLink({ ...this.$route.params, topicId });
      },
      topicListingLink({ topicId }) {
        return this.$router.getRoute(
          PageNames.LESSON_RESOURCE_SELECTION,
          { topicId },
          this.$route.query,
        );
      },
      selectionRootLink() {
        return this.$router.getRoute(
          PageNames.LESSON_RESOURCE_SELECTION_ROOT,
          {},
          this.$route.query,
        );
      },
      questionLabel(questionIndex) {
        if (!this.isExercise) {
          return '';
        }
        const questionNumber = questionIndex + 1;
        return this.coreString('questionNumberLabel', { questionNumber });
      },
      addResource() {
        this.disableSelectButton = true;
        this.$emit('addResource', this.content);
      },
      removeResource() {
        this.disableSelectButton = true;
        this.$emit('removeResource', this.content);
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

  .add-remove-button-style {
    float: right;
  }

  .license-detail-style {
    margin: 30px 0 32px;
  }

  /deep/ .content-renderer {
    max-height: 500px;
  }

</style>
