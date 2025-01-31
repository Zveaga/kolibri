<template>

  <div>
    <KCircularLoader v-if="loading && !contentNode" />
    <PreviewContent
      v-else
      :currentContentNode="contentNode"
      :ancestors="ancestors"
      :isSelected="isSelected"
      :questions="questions"
      @addResource="handleAddResource"
      @removeResource="handleRemoveResource"
    />
  </div>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import useFetchContentNode from '../../../../../../../composables/useFetchContentNode';
  import { coachStrings } from '../../../../../../common/commonCoachStrings';
  import { PageNames } from '../../../../../../../constants/index';
  import PreviewContent from './PreviewContent';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const { contentNode, ancestors, questions, loading } = useFetchContentNode(props.contentId);
      const { manageLessonResourcesTitle$ } = coachStrings;

      props.setTitle(manageLessonResourcesTitle$());
      props.setGoBack(null);

      return {
        contentNode,
        ancestors,
        questions,
        loading,
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
    },
    computed: {
      isSelected() {
        if (this.selectedResources && this.contentNode) {
          return this.selectedResources.some(resource => resource.id === this.contentNode.id);
        }
        return false;
      },
      routeBack() {
        const { params, query } = this.$route;
        return {
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
          params: params,
          query: query,
        };
      },
    },
    methods: {
      handleAddResource(content) {
        this.routeBack;
        this.$emit('selectResources', [content]);
        this.showSnackbarNotification('resourcesAddedWithCount', { count: 1 });
      },
      handleRemoveResource(content) {
        this.$emit('deselectResources', [content]);
        this.showSnackbarNotification('resourcesRemovedWithCount', { count: 1 });
      },
    },
  };

</script>
