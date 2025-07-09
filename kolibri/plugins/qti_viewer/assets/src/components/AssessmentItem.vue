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
  import { createSafeHTML } from 'kolibri-common/components/SafeHTML';
  import ChoiceInteraction from './interactions/ChoiceInteraction.vue';
  import Prompt from './Prompt.vue';
  import SimpleChoice from './interactions/SimpleChoice.vue';

  const SafeHTML = createSafeHTML({
    [ChoiceInteraction.tag]: ChoiceInteraction,
    [Prompt.tag]: Prompt,
    [SimpleChoice.tag]: SimpleChoice,
  });

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
      xmlDoc: {
        type: Document,
        required: true,
      },
    },
  };

</script>
