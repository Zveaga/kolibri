<template>

  <div>
    <KCircularLoader v-if="loading" />
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

  import { getCurrentInstance } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import useFetchContentNode from '../../../../../../composables/useFetchContentNode';
  import useResourceSelection from '../../../../../../composables/useResourceSelection';
  import { coachStrings } from '../../../../../common/commonCoachStrings';
  import { PageNames } from '../../../../../../constants/index';
  import PreviewContent from '../../PreviewContent';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      PreviewContent,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const { contentNode, ancestors, questions, loading } = useFetchContentNode(props.contentId);
      const { selectedResources, selectResources, deselectResources } = useResourceSelection();
      const { manageLessonResourcesTitle$ } = coachStrings;
      const instance = getCurrentInstance();

      props.setTitle(manageLessonResourcesTitle$());
      props.setGoBack(() => {
        return instance.proxy.$router.go(-1);
      });

      return {
        contentNode,
        ancestors,
        questions,
        selectedResources,
        selectResources,
        deselectResources,
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
    },
    data() {
      return {
        justRemovedResource: false,
      };
    },
    computed: {
      isSelected() {
        if (this.justRemovedResource) {
          return true;
        }
        if (this.selectedResources && this.contentNode && this.contentNode.id) {
          return this.selectedResources.some(
            resource => resource.contentnode_id === this.contentNode.id,
          );
        }
        return false;
      },
    },
    methods: {
      handleAddResource(content) {
        this.routeBack().then(() => {
          this.selectResources([content]);
          this.showSnackbarNotification('resourcesAddedWithCount', { count: 1 });
        });
      },
      handleRemoveResource(content) {
        this.justRemovedResource = true;
        this.deselectResources([content]);
        this.routeBack().then(() => {
          this.showSnackbarNotification('resourcesRemovedWithCount', { count: 1 });
        });
      },
      routeBack() {
        const { params, query } = this.$route;
        return this.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_TOPIC_TREE,
          params: params,
          query: query,
        });
      },
    },
  };

</script>
