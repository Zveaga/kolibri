<template>

  <div>
    <div
      v-if="bookmarksCount > 0"
      class="mb-24"
    >
      <div
        v-if="target === SelectionTarget.LESSON"
        class="subheader"
      >
        <div class="side-panel-subtitle">
          {{ selectFromBookmarks$() }}
        </div>
        <KButton
          icon="filter"
          :text="searchLabel$()"
        />
      </div>

      <QuizResourceSelectionHeader
        v-if="target === SelectionTarget.QUIZ"
        class="mb-24"
        :settings="settings"
      />

      <KCardGrid layout="1-1-1">
        <KCard
          :title="bookmarksLabel$()"
          :headingLevel="3"
          orientation="horizontal"
          thumbnailDisplay="large"
          thumbnailAlign="right"
          :style="{
            height: '172px',
          }"
          :to="selectFromBookmarksLink"
        >
          <template #thumbnailPlaceholder>
            <KIcon
              :style="{
                fontSize: '48px',
              }"
              icon="bookmark"
              :color="$themePalette.grey.v_700"
            />
          </template>
          <template #belowTitle>
            <span>
              {{ numberOfBookmarks$({ count: bookmarksCount }) }}
            </span>
          </template>
        </KCard>
      </KCardGrid>
    </div>
    <div>
      <div class="subheader">
        <div class="side-panel-subtitle">
          {{ selectFromChannels$() }}
        </div>
      </div>
      <p
        v-if="channels.length === 0"
        class="mt-24"
      >
        {{ noAvailableResources$() }}
      </p>
      <KCardGrid layout="1-1-1">
        <AccessibleChannelCard
          v-for="channel of channels"
          :key="channel.id"
          :contentNode="channel"
          :to="selectFromChannelsLink(channel)"
          :headingLevel="3"
        />
      </KCardGrid>
    </div>
  </div>

</template>


<script>

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import AccessibleChannelCard from 'kolibri-common/components/Cards/AccessibleChannelCard.vue';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import { PageNames } from '../../../../constants';
  import { coachStrings } from '../../commonCoachStrings';
  import { SelectionTarget } from '../contants';
  import QuizResourceSelectionHeader from '../QuizResourceSelectionHeader.vue';

  /**
   * @typedef {import('../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SelectionIndex',
    components: {
      AccessibleChannelCard,
      QuizResourceSelectionHeader,
    },
    setup(props) {
      const { bookmarksFetch, channelsFetch } = props;
      const { count: bookmarksCount } = bookmarksFetch;

      const { data: channels } = channelsFetch;

      const {
        selectFromChannels$,
        noAvailableResources$,
        numberOfBookmarks$,
        bookmarksLabel$,
        selectFromBookmarks$,
        searchLabel$,
      } = coreStrings;

      const { selectResourcesDescription$ } = enhancedQuizManagementStrings;
      const { manageLessonResourcesTitle$ } = coachStrings;

      const title =
        props.target === SelectionTarget.LESSON
          ? manageLessonResourcesTitle$()
          : selectResourcesDescription$({ sectionTitle: props.sectionTitle });

      props.setTitle(title);
      props.setGoBack(null);

      return {
        bookmarksCount,
        channels,
        SelectionTarget,
        selectFromChannels$,
        noAvailableResources$,
        numberOfBookmarks$,
        bookmarksLabel$,
        selectFromBookmarks$,
        searchLabel$,
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
      /**
       * Fetch object for fetching channels.
       * @type {FetchObject}
       */
      channelsFetch: {
        type: Object,
        required: true,
      },
      /**
       * Fetch object for fetching bookmarks.
       * @type {FetchObject}
       */
      bookmarksFetch: {
        type: Object,
        required: true,
      },
      /**
       * The target entity for the selection.
       * It can be either 'quiz' or 'lesson'.
       */
      target: {
        type: String,
        required: true,
      },
      /**
       * The title of the section (valid just for quizzes).
       * @type {string}
       */
      sectionTitle: {
        type: String,
        required: false,
        default: null,
      },
      /**
       * Selection settings used for quizzes.
       */
      settings: {
        type: Object,
        required: false,
        default: null,
      },
    },
    computed: {
      selectFromBookmarksLink() {
        if (this.target === SelectionTarget.LESSON) {
          return {
            name: PageNames.LESSON_SELECT_RESOURCES_BOOKMARKS,
          };
        }
        return {
          name: PageNames.QUIZ_SELECT_RESOURCES_BOOKMARKS,
        };
      },
    },
    methods: {
      selectFromChannelsLink(channel) {
        if (this.target === SelectionTarget.LESSON) {
          return {
            name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
            query: { topicId: channel.id },
          };
        }
        return {
          name: PageNames.QUIZ_SELECT_RESOURCES_TOPIC_TREE,
          query: { topicId: channel.id },
        };
      },
    },
  };

</script>


<style scoped>

  .mb-16 {
    margin-bottom: 16px;
  }

  .mt-24 {
    margin-top: 24px;
  }

  .side-panel-subtitle {
    font-size: 16px;
    font-weight: 600;
  }

  .subheader {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .mb-24 {
    margin-bottom: 24px;
  }

</style>
