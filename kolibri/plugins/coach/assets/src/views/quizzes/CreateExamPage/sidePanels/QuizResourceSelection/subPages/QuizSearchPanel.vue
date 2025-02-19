<template>

  <SearchFiltersPanel
    ref="searchFiltersPanel"
    v-model="searchTermsComputed"
    accordion
    showChannels
    :showActivities="!isQuiz"
    :title="topic && searchInFolder$({ folder: topic.title })"
    @categorySearchOpen="handleCategorySearchOpen"
  />

</template>


<script>

  import SearchFiltersPanel from 'kolibri-common/components/SearchFiltersPanel/index.vue';
  import { getCurrentInstance, onMounted, ref } from 'vue';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { PageNames } from '../../../../../../constants';
  import { SelectionTarget } from '../../../../../common/resourceSelection/contants';

  export default {
    name: 'QuizSearchPanel',
    components: {
      SearchFiltersPanel,
    },
    setup(props) {
      const prevRoute = ref(null);

      const instance = getCurrentInstance();
      const goBack = () => {
        const backRoute = prevRoute.value?.name
          ? prevRoute.value
          : {
            name: PageNames.QUIZ_SELECT_RESOURCES_INDEX,
          };
        instance.proxy.$router.push(backRoute);
      };
      const { searchLabel$ } = coreStrings;
      const { chooseACategory$ } = searchAndFilterStrings;
      const title = searchLabel$();
      onMounted(() => {
        props.setTitle(title);
        props.setGoBack(goBack);
      });

      function handleCategorySearchOpen(isOpen) {
        if (isOpen) {
          props.setTitle(chooseACategory$());
          props.setGoBack(() => {
            const searchFiltersPanelRef = instance.proxy.$refs.searchFiltersPanel;
            searchFiltersPanelRef.closeCategorySearch();
          });
        } else {
          props.setTitle(title);
          props.setGoBack(goBack);
        }
      }

      // Fetch first available labels of the selected topic
      props.searchFetch.fetchData();

      const { searchInFolder$ } = searchAndFilterStrings;

      return {
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        searchInFolder$,
        handleCategorySearchOpen,
      };
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
      isQuiz() {
        return this.target === SelectionTarget.QUIZ;
      },
    },
  };

</script>
