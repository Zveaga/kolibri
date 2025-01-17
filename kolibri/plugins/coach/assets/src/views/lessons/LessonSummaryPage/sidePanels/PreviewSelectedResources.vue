<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    closeButtonIconType="close"
    @closePanel="() => $router.go(-1)"
    @shouldFocusFirstEl="() => null"
  >
    <template #header>
      <div>
        <h2>{{ manageLessonResourcesTitle$() }}</h2>
      </div>
    </template>
    <PreviewContent
      :currentContentNode="contentNode"
      :ancestors="ancestors"
      :isSelected="isSelected"
      :questions="questions"
      @addResource="handleAddResource"
      @removeResource="handleRemoveResource"
    />
  </SidePanelModal>

</template>


<script>

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import useFetchContentNode from '../../../../composables/useFetchContentNode';
  import useResourceSelection from '../../../../composables/useResourceSelection';
  import { coachStrings } from '../../../common/commonCoachStrings';
  import { PageNames } from '../../../../constants/index';
  import PreviewContent from './PreviewContent';

  export default {
    name: 'PreviewSelectedResources',
    components: {
      SidePanelModal,
      PreviewContent,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const { contentNode, ancestors, questions } = useFetchContentNode(props.contentId);
      const { selectedResources, selectResources, deselectResources } = useResourceSelection();
      const { manageLessonResourcesTitle$ } = coachStrings;

      return {
        contentNode,
        ancestors,
        questions,
        manageLessonResourcesTitle$,
        selectedResources,
        selectResources,
        deselectResources,
      };
    },
    props: {
      contentId: {
        type: String,
        required: true,
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
