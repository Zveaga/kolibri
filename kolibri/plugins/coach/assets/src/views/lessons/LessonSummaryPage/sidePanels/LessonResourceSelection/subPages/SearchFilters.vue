<template>

  <div>
    <div
      v-if="topic"
      class="side-panel-subtitle"
    >
      {{ $tr('searchInTitle', { folder: topic.title }) }}
    </div>
    <SearchFiltersPanel
      v-model="searchTermsComputed"
      accordion
      showChannels
      showActivities
      @close="showSearch = true"
      @searchClick="onSearchClick"
    />
  </div>

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
      topic: {
        type: Object,
        required: false,
        default: null,
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
    $trs: {
      searchInTitle: {
        message: "Search in '{folder}'",
        context: 'Title for search resources in folder',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .side-panel-subtitle {
    margin-bottom: 24px;
    font-size: 16px;
    font-weight: 600;
  }

  /deep/ .search-box-row {
    max-width: unset !important;
  }

  /deep/ h2 {
    font-size: 16px;
    font-weight: 600;
  }

</style>
