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
      <UsersTable
        :facilityUsers="facilityUsers"
        :usersCount="usersCount"
        :totalPages="totalPages"
        :dataLoading="dataLoading"
        :selectedUsers.sync="selectedUsers"
        :filterPageName="PageNames.FILTER_USERS_SIDE_PANEL__NEW_USERS"
      >
        <template></template>
      </UsersTable>
    </KPageContainer>
    <router-view
      :backRoute="newUsersRoute"
      @change="onUserCreate"
    />
  </ImmersivePage>

</template>


<script>

  import store from 'kolibri/store';
  import { computed, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';

  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import ImmersivePage from 'kolibri/components/pages/ImmersivePage';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import useUserManagement from '../../composables/useUserManagement';
  import { PageNames } from '../../constants';
  import UsersTable from './common/UsersTable.vue';

  // Constant for the maximum number of days to consider a user as a "new user"
  const MAX_NEW_USER_DAYS = 30;

  export default {
    name: 'NewUsersPage',
    components: {
      UsersTable,
      ImmersivePage,
    },
    mixins: [commonCoreStrings],
    setup() {
      const route = useRoute();

      const activeFacilityId = route.params.facility_id || store.getters.activeFacilityId;

      const newUsersCreationTreshold = new Date();
      newUsersCreationTreshold.setDate(newUsersCreationTreshold.getDate() - MAX_NEW_USER_DAYS);

      const { facilityUsers, totalPages, usersCount, dataLoading, fetchUsers } = useUserManagement({
        activeFacilityId,
        dateJoinedGt: newUsersCreationTreshold,
      });

      const selectedUsers = ref(new Set());

      const newUsersRoute = computed(() => ({
        ...route,
        name: PageNames.NEW_USERS_PAGE,
      }));

      function onUserCreate() {
        fetchUsers();
      }

      const { newUsers$, backToUsers$ } = bulkUserManagementStrings;

      return {
        PageNames,
        newUsersRoute,
        facilityUsers,
        totalPages,
        usersCount,
        dataLoading,
        selectedUsers,
        newUsers$,
        backToUsers$,
        onUserCreate,
      };
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
