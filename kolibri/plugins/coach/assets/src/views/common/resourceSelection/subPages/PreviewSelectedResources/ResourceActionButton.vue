<template>

  <div class="d-flex-center">
    <span
      v-if="isSelected"
      class="mr-16"
    >
      <KIcon icon="onDevice" />
      {{ addedIndicator$() }}
    </span>

    <KButton
      v-if="isSelected"
      :text="removeAction$()"
      primary
      :disabled="isActionDisabled"
      @click="$emit('removeResource')"
    />
    <KButton
      v-else
      :text="addText$()"
      :primary="false"
      :disabled="isActionDisabled"
      @click="$emit('addResource')"
    />
  </div>

</template>


<script>

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';

  export default {
    name: 'ResourceActionButton',
    setup() {
      const { removeAction$ } = coreStrings;
      const { addText$, addedIndicator$ } = searchAndFilterStrings;

      return {
        addText$,
        removeAction$,
        addedIndicator$,
      };
    },
    props: {
      isSelected: {
        type: Boolean,
        required: true,
      },
      isActionDisabled: {
        type: Boolean,
        required: true,
      },
    },
  };

</script>


<style scoped lang="scss">

  .mr-16 {
    margin-right: 16px;
  }

  .d-flex-center {
    display: flex;
    align-items: center;
  }

</style>
