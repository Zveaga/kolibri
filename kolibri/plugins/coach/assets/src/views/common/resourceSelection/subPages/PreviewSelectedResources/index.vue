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

  import { getCurrentInstance, ref } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';

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
      const previousRoute = ref(null);
      const instance = getCurrentInstance();

      const { contentNode, ancestors, questions, loading } = useFetchContentNode(props.contentId);
      const { manageLessonResourcesTitle$ } = coachStrings;

      props.setTitle(manageLessonResourcesTitle$());
      props.setGoBack(null);

      const routeBack = () => {
        const backRoute = previousRoute.value?.name
          ? previousRoute.value
          : {
            name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          };
        instance.proxy.$router.push(backRoute);
      };

      return {
        contentNode,
        ancestors,
        questions,
        loading,
        routeBack,
        // eslint-disable-next-line vue/no-unused-properties
        previousRoute,
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
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.previousRoute = from;
      });
    },
    methods: {
      handleAddResource(content) {
        this.routeBack();
        this.$emit('selectResources', [content]);
      },
      handleRemoveResource(content) {
        this.routeBack();
        this.$emit('deselectResources', [content]);
      },
    },
  };

</script>
