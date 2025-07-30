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
          v-model="filters.userTypes"
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
          v-model="filters.classes"
          :options="classesOptions"
          ariaLabelledby="class-filter-label"
          :selectAllLabel="coreStrings.allClassesLabel$()"
          :searchLabel="coreStrings.searchLabel$()"
        />
      </section>
      <div
        class="section-separator"
        :style="separatorStyles"
      ></div>
      <section class="filter-section">
        <h2>{{ coreStrings.birthYearLabel$() }}</h2>
        <BirthYearRangeSelect
          v-model="filters.birthYear"
          class="birth-year-range-select"
        />
      </section>
      <div
        class="section-separator"
        :style="separatorStyles"
      ></div>
      <section class="filter-section">
        <h2>{{ coreStrings.dateCreated$() }}</h2>
        <KSelect
          v-model="filters.creationDate"
          :label="coreStrings.dateCreated$()"
          :options="creationDateOptions"
        />
      </section>
      <div
        class="section-separator"
        :style="separatorStyles"
      ></div>
    </template>
  </SidePanelModal>

</template>


<script>

  import { computed, reactive } from 'vue';
  import { UserKinds } from 'kolibri/constants';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import { themeTokens } from 'kolibri-design-system/lib/styles/theme';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import SelectableList from '../../../common/SelectableList.vue';
  import { DateRangeFilters } from '../../../../constants';
  import BirthYearRangeSelect from './BirthYearRangeSelect.vue';

  export default {
    name: 'FilterUsersSidePanel',
    components: {
      SidePanelModal,
      SelectableList,
      BirthYearRangeSelect,
    },
    setup(props) {
      const {
        filterUsersLabel$,
        allUsersLabel$,
        lastNDaysLabel$,
        thisMonthLabel$,
        lastNMonthsLabel$,
        lastYearLabel$,
        allTimeLabel$,
      } = bulkUserManagementStrings;

      const filters = reactive({
        userTypes: [],
        classes: [],
        birthYear: {
          start: null,
          end: null,
        },
        creationDate: null,
      });

      const userFilterOptions = [
        { id: UserKinds.SUPERUSER, label: coreStrings.superAdminsLabel$(), icon: 'superAdmins' },
        { id: UserKinds.LEARNER, label: coreStrings.learnersLabel$(), icon: 'learners' },
        { id: UserKinds.ADMIN, label: coreStrings.adminsLabel$(), icon: 'admins' },
        { id: UserKinds.COACH, label: coreStrings.coachesLabel$(), icon: 'coaches' },
      ];

      const classesOptions = computed(() =>
        props.classes.map(cls => ({
          id: cls.id,
          label: cls.name,
        })),
      );

      const creationDateOptions = [
        {
          id: DateRangeFilters.LAST_7_DAYS,
          label: lastNDaysLabel$({ num: 7 }),
        },
        {
          id: DateRangeFilters.LAST_30_DAYS,
          label: lastNDaysLabel$({ num: 30 }),
        },
        {
          id: DateRangeFilters.THIS_MONTH,
          label: thisMonthLabel$(),
        },
        {
          id: DateRangeFilters.LAST_6_MONTHS,
          label: lastNMonthsLabel$({ num: 6 }),
        },
        {
          id: DateRangeFilters.LAST_YEAR,
          label: lastYearLabel$(),
        },
        {
          id: DateRangeFilters.ALL_TIME,
          label: allTimeLabel$(),
        },
      ];

      const separatorStyles = {
        height: '1px',
        backgroundColor: themeTokens().fineLine,
        marginBottom: '24px',
      };

      return {
        // ref and computed properties
        filters,
        coreStrings,
        classesOptions,
        separatorStyles,
        userFilterOptions,
        creationDateOptions,

        // translation functions
        allUsersLabel$,
        filterUsersLabel$,
      };
    },
    props: {
      classes: {
        type: Array,
        default: () => [],
      },
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

</style>
