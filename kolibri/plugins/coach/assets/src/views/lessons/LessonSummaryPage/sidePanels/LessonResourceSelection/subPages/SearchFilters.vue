<template>

  <SearchFiltersPanel
    v-model="searchTermsComputed"
    accordion
    showChannels
    showActivities
    @close="showSearch = true"
    @searchClick="onSearchClick"
  />

</template>


<script>

  import SearchFiltersPanel from 'kolibri-common/components/SearchFiltersPanel/index.vue';
  import { getCurrentInstance, onMounted, ref } from 'vue';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { PageNames } from '../../../../../../constants';

  /**
   * @typedef {import('../../../../../../composables/useFetch').FetchObject} FetchObject
   */

  export default {
    name: 'SearchFilters',
    components: {
      SearchFiltersPanel,
    },
    setup(props) {
      const prevRoute = ref(null);

      const instance = getCurrentInstance();
      onMounted(() => {
        const { searchLabel$ } = coreStrings;
        props.setTitle(searchLabel$());

        const backRoute = prevRoute.value?.name
          ? prevRoute.value
          : {
            name: PageNames.LESSON_SELECT_RESOURCES_INDEX,
          };
        props.setGoBack(() => {
          instance.proxy.$router.push(backRoute);
        });
      });

      return {
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
      };
    },
    props: {
      setTitle: {
        type: Function,
        default: () => {},
      },
      setGoBack: {
        type: Function,
        default: () => {},
      },
      searchTerms: {
        type: Object,
        required: true,
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

    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
    methods: {
      onSearchClick() {
        this.$router.push({
          name: PageNames.LESSON_SELECT_RESOURCES_SEARCH_RESULTS,
          query: this.$route.query,
        });
      },
    },
  };

</script>


<style lang="scss" scoped>

  /deep/ .search-box-row {
    max-width: unset !important;
  }

</style>
