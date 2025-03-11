<template>

  <div class="header-container">
    <div class="header">
      <h1>{{ title }}</h1>
      <div>
        <slot name="actions"></slot>
      </div>
    </div>
  </div>

</template>


<script>

  //import { mapState } from 'vuex';

  export default {
    name: 'CoachHeader',
    props: {
      title: {
        type: String,
        required: true,
      },
    },
  };

</script>


<style scoped>

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

</style>
