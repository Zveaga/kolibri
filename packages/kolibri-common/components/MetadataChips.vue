<template>

  <div
    class="metadata-chips"
  >
    <div
      v-for="({ label, key, icon }) in tags"
      :key="key"
      :style="{ backgroundColor: $themePalette.grey.v_100 }"
      class="chip"
    >
      <KIcon
        v-if="icon"
        class='icon'
        :icon="icon"
      />
      <span
        class="chip-text"
        :style="{ color: $themePalette.grey.v_700 }"
      >
        {{ label }}
      </span>
    </div>
  </div>

</template>


<script>

  import { toRefs } from 'vue';

  export default {
    name: 'MetadataChips',
    props: {
      /**
       * A list of tags to display
       * @type {Object[Tag]}
       * @property {string} label
       * @property {string} key
       * @property {string} icon
       */
      tags: {
        type: Array,
        required: true,
        validator: (tags) => tags.every(tag => tag.label && tag.key),
      },
    },
  };

</script>


<style scoped lang="scss">

  .metadata-chips {
    display: flex;
    align-items: center;
    padding: 4px;
    border-radius: 4px;
  }

  .chip-text {
    padding: 0 4px;
    font-size: 12px;
  }

  .icon {
    top: 0!important;
  }

  .chip {
    display: flex;
    position: relative;
    padding: 4px;
    margin-right: 4px;
  }

</style>
