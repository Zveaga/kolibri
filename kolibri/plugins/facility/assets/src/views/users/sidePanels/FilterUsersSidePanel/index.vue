<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    @closePanel="$router.back()"
  >
    <template #header>
      <h1 class="side-panel-title">{{ filterUsersLabel$() }}</h1>
    </template>
    <template #default>
      <section class="filter-section">
        <h2 id="user-filter-type-label">{{ coreStrings.userTypeLabel$() }}</h2>
        <SelectableList
          v-model="workingFilters.userTypes"
          :searchable="false"
          :options="userFilterOptions"
          ariaLabelledby="user-filter-type-label"
          :searchLabel="coreStrings.searchLabel$()"
        >
          <template #selectAllLabel>
            <KLabeledIcon :label="allUsersLabel$()">
              <template #icon>
                <KIcon
                  icon="allUsers"
                  class="filter-option-icon"
                />
              </template>
            </KLabeledIcon>
          </template>
          <template #option="{ option }">
            <KLabeledIcon :label="option.label">
              <template #icon>
                <KIcon
                  :icon="option.icon"
                  class="filter-option-icon"
                />
              </template>
            </KLabeledIcon>
          </template>
        </SelectableList>
      </section>
      <section class="filter-section">
        <h2 id="class-filter-label">{{ coreStrings.classLabel$() }}</h2>
        <SelectableList
          v-model="workingFilters.classes"
          :options="classesOptions"
          ariaLabelledby="class-filter-label"
          :selectAllLabel="coreStrings.allClassesLabel$()"
          :searchLabel="coreStrings.searchLabel$()"
          maxHeight="200px"
        />
      </section>
      <div
        class="section-separator"
        :style="separatorStyles"
      ></div>
      <section class="filter-section">
        <h2>{{ coreStrings.birthYearLabel$() }}</h2>
        <BirthYearRangeSelect
          v-model="workingFilters.birthYear"
          class="birth-year-range-select"
        />
      </section>
      <div
        class="section-separator"
        :style="separatorStyles"
      ></div>
      <template v-if="!hideDateCreatedFilter">
        <section class="filter-section">
          <h2>{{ coreStrings.dateCreated$() }}</h2>
          <KSelect
            v-model="workingFilters.creationDate"
            :label="coreStrings.dateCreated$()"
            :options="creationDateOptions"
          />
        </section>
        <div
          class="section-separator"
          :style="separatorStyles"
        ></div>
      </template>
    </template>
    <template #bottomNavigation>
      <div class="bottom-nav-container">
        <KButton
          :text="coreStrings.clearAction$()"
          @click="resetWorkingFilters"
        />
        <KButton
          primary
          :text="applyFiltersLabel$()"
          @click="applyFilters"
        />
      </div>
    </template>
  </SidePanelModal>

</template>


<script>

  import { computed, ref, toRefs } from 'vue';
  import { useRoute } from 'vue-router/composables';

  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { themeTokens } from 'kolibri-design-system/lib/styles/theme';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import SelectableList from '../../../common/SelectableList.vue';
  import useUsersFilters from '../../../../composables/useUsersFilters';
  import { PageNames } from '../../../../constants';
  import BirthYearRangeSelect from './BirthYearRangeSelect.vue';

  export default {
    name: 'FilterUsersSidePanel',
    components: {
      SidePanelModal,
      SelectableList,
      BirthYearRangeSelect,
    },
    setup(props) {
      const { filterUsersLabel$, allUsersLabel$, applyFiltersLabel$ } = bulkUserManagementStrings;
      const { classes } = toRefs(props);
      const route = useRoute();
      const prevRoute = ref(null);

      const {
        workingFilters,
        classesOptions,
        userFilterOptions,
        creationDateOptions,
        applyFilters: _applyFilters,
        resetWorkingFilters,
      } = useUsersFilters({
        classes,
      });

      const hideDateCreatedFilter = computed(() => {
        return route.name === PageNames.FILTER_USERS_SIDE_PANEL__NEW_USERS;
      });

      const separatorStyles = {
        height: '1px',
        backgroundColor: themeTokens().fineLine,
        marginBottom: '24px',
      };

      const applyFilters = () => {
        const nextRouteName = prevRoute.value.name || PageNames.USER_MGMT_PAGE;
        _applyFilters({ nextRouteName });
      };

      return {
        // ref and computed properties
        workingFilters,
        // eslint-disable-next-line vue/no-unused-properties
        prevRoute,
        coreStrings,
        classesOptions,
        separatorStyles,
        userFilterOptions,
        creationDateOptions,
        hideDateCreatedFilter,

        // methods
        resetWorkingFilters,
        applyFilters,

        // translation functions
        allUsersLabel$,
        filterUsersLabel$,
        applyFiltersLabel$,
      };
    },
    props: {
      classes: {
        type: Array,
        default: () => [],
      },
    },
    beforeRouteEnter(to, from, next) {
      next(vm => {
        vm.prevRoute = from;
      });
    },
  };

</script>


<style lang="scss" scoped>

  .side-panel-title {
    font-size: 18px;
    font-weight: 600;
  }

  .filter-section {
    margin-bottom: 24px;
    font-size: 14px;

    h2 {
      margin-top: 0;
      font-size: 16px;
      font-weight: 600;
    }

    .filter-option-icon {
      position: relative;
      font-size: 18px;
    }
  }

  .birth-year-range-select {
    max-width: 316px;
  }

  .bottom-nav-container {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    width: 100%;
  }

</style>
