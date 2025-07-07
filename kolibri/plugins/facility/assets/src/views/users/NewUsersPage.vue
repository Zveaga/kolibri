<template>

  <ImmersivePage
    :appBarTitle="newUsers$()"
    :route="$store.getters.facilityPageLinks.UserPage"
  >
    <KPageContainer style="max-width: 1000px; margin: 24px auto">
      <p>
        <KRouterLink
          :to="$store.getters.facilityPageLinks.UserPage"
          icon="back"
          :text="backToUsers$()"
        />
      </p>
      <h1>{{ newUsers$() }}</h1>
      <PaginatedListContainerWithBackend
        v-model="currentPage"
        :items="facilityUsers"
        :itemsPerPage="itemsPerPage"
        :totalPageNumber="totalPages"
        :roleFilter="roleFilter"
        :numFilteredItems="usersCount"
      >
        <template #otherFilter>
          <KSelect
            v-model="roleFilter"
            :label="coreString('userTypeLabel')"
            :options="userKinds"
            :inline="true"
            class="type-filter"
          />
        </template>

        <template #filter>
          <FilterTextbox
            v-model="search"
            :placeholder="$tr('searchText')"
          />
        </template>

        <KTable
          class="move-down user-roster"
          :headers="tableHeaders"
          :caption="$tr('tableCaption')"
          :rows="tableRows"
          :dataLoading="dataLoading"
          :emptyMessage="emptyMessageForItems(facilityUsers, search)"
          sortable
          disableBuiltinSorting
          @changeSort="changeSortHandler"
        >
          <template #header="{ header, colIndex }">
            <span :class="{ visuallyhidden: colIndex === 5 }">{{ header.label }}</span>
            <span v-if="colIndex === 2">
              <CoreInfoIcon
                class="tooltip"
                :iconAriaLabel="coreString('identifierAriaLabel')"
                :tooltipText="coreString('identifierTooltip')"
              />
            </span>
          </template>
          <template #cell="{ content, colIndex }">
            <span v-if="colIndex === 0">
              <KLabeledIcon
                icon="person"
                :label="content"
                :style="{ color: $themeTokens.text }"
              />
            </span>
            <span v-else-if="colIndex === 2">
              <KOptionalText :text="content ? content : ''" />
            </span>
            <span v-else-if="colIndex === 3">
              <GenderDisplayText :gender="content" />
            </span>
            <span v-else-if="colIndex === 4">
              <BirthYearDisplayText :birthYear="content" />
            </span>
          </template>
        </KTable>
      </PaginatedListContainerWithBackend>
    </KPageContainer>
    <UserCreateSidePanel
      v-if="isCreateUserSidePanelOpen"
      @close="isCreateUserSidePanelOpen = false"
      @save="onUserCreate"
    />
  </ImmersivePage>

</template>


<script>

  import { mapState } from 'vuex';
  import { onMounted, ref } from 'vue';
  import { pickBy, debounce } from 'lodash';
  import { useRouter, useRoute } from 'vue-router/composables';

  import { UserKinds } from 'kolibri/constants';
  import FilterTextbox from 'kolibri/components/FilterTextbox';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import ImmersivePage from 'kolibri/components/pages/ImmersivePage';
  import CoreInfoIcon from 'kolibri-common/components/labels/CoreInfoIcon';
  import GenderDisplayText from 'kolibri-common/components/userAccounts/GenderDisplayText';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import BirthYearDisplayText from 'kolibri-common/components/userAccounts/BirthYearDisplayText';
  import PaginatedListContainerWithBackend from 'kolibri-common/components/PaginatedListContainerWithBackend';

  import UserCreateSidePanel from './sidePanels/UserCreate/index.vue';

  const ALL_FILTER = 'all';
  // Constant for the maximum number of days to consider a user as a "new user"
  const MAX_NEW_USER_DAYS = 30;

  export default {
    name: 'NewUsersPage',
    components: {
      ImmersivePage,
      FilterTextbox,
      CoreInfoIcon,
      GenderDisplayText,
      BirthYearDisplayText,
      UserCreateSidePanel,
      PaginatedListContainerWithBackend,
    },
    mixins: [commonCoreStrings],
    setup() {
      const router = useRouter();
      const route = useRoute();
      const isCreateUserSidePanelOpen = ref(true);

      onMounted(() => {
        const newUsersCreationTreshold = new Date();
        newUsersCreationTreshold.setDate(newUsersCreationTreshold.getDate() - MAX_NEW_USER_DAYS);

        router.replace({
          ...route,
          query: pickBy({
            ...route.query,
            date_joined__gt: newUsersCreationTreshold.toISOString(),
          }),
        });
      });

      function onUserCreate() {
        router.back();
      }

      const { newUsers$, backToUsers$ } = bulkUserManagementStrings;

      return {
        isCreateUserSidePanelOpen,
        newUsers$,
        backToUsers$,
        onUserCreate,
      };
    },
    computed: {
      ...mapState('userManagement', ['facilityUsers', 'totalPages', 'usersCount', 'dataLoading']),
      tableHeaders() {
        return [
          {
            label: this.coreString('fullNameLabel'),
            dataType: 'string',
            minWidth: '300px',
            width: '40%',
            columnId: 'full_name',
          },
          {
            label: this.coreString('usernameLabel'),
            dataType: 'string',
            minWidth: '150px',
            width: '20%',
            columnId: 'username',
          },
          {
            label: this.coreString('identifierLabel'),
            dataType: 'string',
            minWidth: '150px',
            width: '10%',
            columnId: 'identifier',
          },
          {
            label: this.coreString('genderLabel'),
            dataType: 'string',
            minWidth: '150px',
            width: '10%',
            columnId: 'gender',
          },
          {
            label: this.coreString('birthYearLabel'),
            dataType: 'date',
            minWidth: '100px',
            width: '10%',
            columnId: 'birth_year',
          },
        ];
      },
      tableRows() {
        return this.facilityUsers.map(user => {
          return [user.full_name, user.username, user.id_number, user.gender, user.birth_year];
        });
      },
      userKinds() {
        return [
          { label: this.coreString('allLabel'), value: ALL_FILTER },
          { label: this.coreString('learnersLabel'), value: UserKinds.LEARNER },
          { label: this.coreString('coachesLabel'), value: UserKinds.COACH },
          { label: this.$tr('admins'), value: UserKinds.ADMIN },
          { label: this.$tr('superAdmins'), value: UserKinds.SUPERUSER },
        ];
      },
      roleFilter: {
        get() {
          return (
            this.userKinds.find(k => k.value === this.$route.query.user_type) || this.userKinds[0]
          );
        },
        set(value) {
          value = value.value;
          if (value === ALL_FILTER) {
            value = null;
          }
          this.$router.push({
            ...this.$route,
            query: pickBy({
              ...this.$route.query,
              user_type: value,
              page: null,
            }),
          });
        },
      },
      search: {
        get() {
          return this.$route.query.search || '';
        },
        set(value) {
          this.debouncedSearchTerm(value);
        },
      },
      currentPage: {
        get() {
          return Number(this.$route.query.page || 1);
        },
        set(value) {
          this.$router.push({
            ...this.$route,
            query: pickBy({
              ...this.$route.query,
              page: value,
            }),
          });
        },
      },
      itemsPerPage: {
        get() {
          return Number(this.$route.query.page_size) || 30;
        },
        set(value) {
          this.$router.push({
            ...this.$route,
            query: pickBy({
              ...this.$route.query,
              page_size: value,
              page: null,
            }),
          });
        },
      },
    },
    created() {
      this.debouncedSearchTerm = debounce(this.emitSearchTerm, 500);
    },
    methods: {
      changeSortHandler({ sortKey, sortOrder }) {
        const columnId = this.tableHeaders[sortKey]?.columnId || null;

        const query = { ...this.$route.query };

        if (!sortOrder || !columnId) {
          //remove ordering and order from params when sortOrder is null
          delete query.ordering;
          delete query.order;
        } else {
          query.ordering = columnId;
          query.order = sortOrder;
        }

        query.page = 1;

        this.$router.push({
          path: this.$route.path,
          query: pickBy(query),
        });
      },
      emptyMessageForItems(items, filterText) {
        if (this.facilityUsers.length === 0) {
          return this.$tr('noUsersExist');
        } else if (this.roleFilter && filterText === '') {
          switch (this.roleFilter.value) {
            case UserKinds.LEARNER:
              return this.$tr('noLearnersExist');
            case UserKinds.COACH:
              return this.$tr('noCoachesExist');
            case UserKinds.ADMIN:
              return this.$tr('noAdminsExist');
            case UserKinds.SUPERUSER:
              return this.$tr('noSuperAdminsExist');
            default:
              return '';
          }
        } else if (items.length === 0) {
          return this.$tr('allUsersFilteredOut', { filterText });
        }
        return '';
      },
      emitSearchTerm(value) {
        if (value === '') {
          value = null;
        }
        this.$router.push({
          ...this.$route,
          query: pickBy({
            ...this.$route.query,
            search: value,
            page: null,
          }),
        });
      },
    },
    $trs: {
      tableCaption: {
        message: 'Users',
        context: 'Caption for the user table.',
      },
      searchText: {
        message: 'Search for a user…',
        context: 'Refers to the search option on the user page.',
      },
      admins: {
        message: 'Admins',
        context: 'Refers to the list of admins in a facility.',
      },
      superAdmins: {
        message: 'Super admins',
        context: 'A user type.',
      },
      noUsersExist: {
        message: 'No users exist',
        context: "Displayed when there are no users in the facility on the 'Users' page.",
      },
      allUsersFilteredOut: {
        message: "No users match the filter: '{filterText}'",
        context: "Refers to the 'Search for a user' filter when no users are found.",
      },
      noLearnersExist: {
        message: 'There are no learners in this facility',
        context:
          "Displayed when there are no learners in the facility. Seen when using the 'User type' filter on the 'Users' page.",
      },
      noCoachesExist: {
        message: 'There are no coaches in this facility',
        context:
          "Displayed when there are no coaches in the facility. Seen when using the 'User type' filter on the 'Users' page.",
      },
      noSuperAdminsExist: {
        message: 'There are no super admins in this facility',
        context:
          "Displayed when there are no super admins in the facility. Seen when using the 'User type' filter on the 'Users' page.",
      },
      noAdminsExist: {
        message: 'There are no admins in this facility',
        context:
          "Displayed when there are no admins in the facility. Seen when using the 'User type' filter on the 'Users' page.",
      },
    },
  };

</script>


<style lang="scss" scoped>

  .move-down {
    position: relative;
    margin-top: 24px;
  }

  .type-filter {
    margin-bottom: 0;
  }

  .role-badge {
    display: inline-block;
    padding: 1px;
    padding-right: 8px;
    padding-left: 8px;
    margin-left: 16px;
    font-size: small;
    white-space: nowrap;
    border-radius: 4px;
  }

  .labeled-icon-wrapper {
    width: auto;
  }

  .user-roster {
    overflow-x: auto;
  }

</style>
