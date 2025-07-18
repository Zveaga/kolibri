<template>

  <div class="image-container">
    <div class="img-wrapper">
      <img
        :src="src"
        :alt="alt"
        v-bind="$attrs"
        tabindex="0"
        role="button"
        :aria-label="`Expand image: ${alt}`"
        aria-haspopup="dialog"
        @click="handleExpand"
        @keydown="onImgKeydown"
      >
      <KIconButton
        class="expand-btn expand-btn-transition"
        icon="expand"
        appearance="raised-button"
        aria-label="Expand image"
        aria-haspopup="dialog"
        tooltip="Expand image"
        @click="handleExpand"
      />
    </div>
  </div>

</template>


<script>

  export default {
    name: 'SafeHtmlImage',
    inheritAttrs: false,
    props: {
      src: { type: String, required: true },
      alt: { type: String, default: '' },
    },
    methods: {
      handleExpand() {
        this.$emit('expand-img', { src: this.src, alt: this.alt });
      },
      onImgKeydown(event) {
        if (event.key === ' ') {
          event.preventDefault();
          this.handleExpand();
        }
        if (event.key === 'Enter') {
          this.handleExpand();
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  .expand-btn-transition {
    transition:
      color 0.15s,
      background-color 0.15s,
      box-shadow 0.15s,
      opacity 0.15s;
  }

</style>
