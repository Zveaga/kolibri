<template>

  <div>
    <SafeHTML
      v-if="itemBody"
      :html="itemBodyMarkup"
    />
  </div>

</template>


<script>

  import { computed } from 'vue';
  import SafeHTML from 'kolibri-common/components/SafeHTML';

  export default {
    name: 'AssessmentItem',
    components: {
      SafeHTML,
    },
    setup(props) {
      const itemBody = computed(() => {
        return props.xmlDoc.querySelector('qti-item-body');
      });

      // Process item body for display
      const itemBodyMarkup = computed(() => {
        return itemBody.value?.innerHTML || '';
      });

      return {
        itemBody,
        itemBodyMarkup,
      };
    },
    props: {
      // Can receive XML from inline item or loaded from file
      xmlDoc: {
        type: Document,
        required: true,
      },
    },
  };

</script>
