<template>

  <SearchFilters
    v-model="searchTermsComputed"
    :topic="topic"
    :searchTerms="searchTerms"
    :searchFetch="searchFetch"
    :setTitle="setTitle"
    :setGoBack="setGoBack"
    :target="target"
  />

</template>


<script>

  import SearchFilters from '../../../../../common/SearchFilters.vue';

  export default {
    name: 'QuizSearchPanel',
    components: {
      SearchFilters,
    },
    props: {
      searchTerms: {
        type: Object,
        required: true,
      },
      searchFetch: {
        type: Object,
        required: true,
      },
      topic: {
        type: Object,
        required: false,
        default: null,
      },
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      target: {
        type: String,
        required: false,
        default: 'quiz',
      },
    },
    computed: {
      searchTermsComputed: {
        get() {
          return this.searchTerms;
        },
        set(value) {
          this.$emit('update:searchTerms', value);
        },
      },
    },
  };

</script>
