import { ref } from 'vue';
import ContentNodeResource from 'kolibri-common/apiResources/ContentNodeResource';

export default function useFetchContentNode(contentId) {
  const contentNode = ref({});
  const ancestors = ref([]);
  const questions = ref([]);
  const loading = ref(true);

  const fetchContentNode = async () => {
    ContentNodeResource.fetchModel({
      id: contentId,
      getParams: { no_available_filtering: true },
    }).then(node => {
      contentNode.value = node;
      if (node != null) {
        loading.value = false;
      }

      if (node.ancestors.length) {
        ancestors.value = node.ancestors;
      }

      if (node.assessmentmetadata) {
        questions.value = node.assessmentmetadata.assessment_item_ids;
      }
    });
  };

  fetchContentNode();

  return {
    loading,
    ancestors,
    contentNode,
    questions,
  };
}
