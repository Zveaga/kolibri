<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    @closePanel="$router.back()"
  >
    <template #header>
      <h1>{{ coreString('classesLabel') }}</h1>
    </template>
  </SidePanelModal>

</template>


<script>

  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';

  export default {
    name: 'FilterUsersSidePanel',
    components: {
      SidePanelModal,
    },
    mixins: [commonCoreStrings],
  };

</script>
