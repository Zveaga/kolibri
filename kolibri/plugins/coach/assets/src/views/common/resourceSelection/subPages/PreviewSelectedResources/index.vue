<template>

  <div>
    <KCircularLoader v-if="loading && !contentNode" />
    <PreviewContent
      v-else
      :currentContentNode="contentNode"
      :ancestors="ancestors"
      :isSelected="isSelected"
      :questions="questions"
      :isActionDisabled="isActionDisabled"
      :target="target"
      @addResource="handleAddResource"
      @removeResource="handleRemoveResource"
    />
  </div>

</template>


<script>

  import { getCurrentInstance, onMounted, ref } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings.js';

  import { SelectionTarget } from '../../contants.js';
  import { coachStrings } from '../../../commonCoachStrings.js';
  import { PageNames } from '../../../../../constants/index.js';
  import useFetchContentNode from '../../../../../composables/useFetchContentNode';
  import PreviewContent from './PreviewContent';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const prevRoute = ref(null);
      const instance = getCurrentInstance();
      const router = instance.proxy.$router;

      const { contentNode, ancestors, questions, loading } = useFetchContentNode(props.contentId);
      const { manageLessonResourcesTitle$ } = coachStrings;
      const { selectResourcesDescription$, selectPracticeQuizLabel$ } =
        enhancedQuizManagementStrings;

      const getTitle = () => {
        if (props.target === SelectionTarget.LESSON) {
          return manageLessonResourcesTitle$();
        }
        if (props.settings.selectPracticeQuiz) {
          return selectPracticeQuizLabel$();
        }
        return selectResourcesDescription$({ sectionTitle: props.sectionTitle });
      };
      props.setTitle(getTitle());
      props.setGoBack(null);

      const redirectBack = () => {
        if (prevRoute.value?.name) {
          return router.push(prevRoute.value);
        }
        router.push({
          name:
            props.target === SelectionTarget.LESSON
              ? PageNames.LESSON_SELECT_RESOURCES_INDEX
              : PageNames.QUIZ_SELECT_RESOURCES_INDEX,
        });
      };

      onMounted(() => {
        if (!props.contentId) {
          redirectBack();
        }
      });

      return {
        contentNode,
        ancestors,
        questions,
        loading,
        redirectBack,
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
      };
    },
    props: {
      contentId: {
        type: String,
        required: true,
      },
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      selectedResources: {
        type: Array,
        required: true,
      },
      unselectableResourceIds: {
        type: Array,
        required: false,
        default: null,
      },
      disabled: {
        type: Boolean,
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
      /**
       * Selection settings used for quizzes.
       */
      settings: {
        type: Object,
        required: false,
        default: null,
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
    },
    computed: {
      isSelected() {
        if (this.selectedResources.some(resource => resource.id === this.contentId)) {
          return true;
        }
        if (this.unselectableResourceIds?.includes(this.contentId)) {
          return true;
        }
        return false;
      },
      isActionDisabled() {
        if (this.disabled) {
          return true;
        }
        return this.unselectableResourceIds?.includes(this.contentId);
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
    methods: {
      handleAddResource(content) {
        this.redirectBack();
        this.$emit('selectResources', [content]);
      },
      handleRemoveResource(content) {
        this.redirectBack();
        this.$emit('deselectResources', [content]);
      },
    },
  };

</script>
