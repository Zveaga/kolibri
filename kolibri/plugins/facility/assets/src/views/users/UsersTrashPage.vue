<template>

  <ImmersivePage
    :appBarTitle="removedUsersTitle$()"
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
      <div class="removed-users-page-header">
        <h1>{{ removedUsersTitle$() }}</h1>
        <p>
          {{ removedUsersPageDescription$() }}
        </p>
      </div>
      <UsersTable
        v-if="facilityUsers.length || numAppliedFilters > 0 || dataLoading"
        :facilityUsers="facilityUsers"
        :usersCount="usersCount"
        :totalPages="totalPages"
        :dataLoading="dataLoading"
        :selectedUsers.sync="selectedUsers"
        :filterPageName="PageNames.FILTER_USERS_SIDE_PANEL__TRASH"
        :numAppliedFilters="numAppliedFilters"
        @clearFilters="resetFilters"
        @change="onUsersChange"
      >
        <template #userActions>
          <KIconButton
            icon="refresh"
            :tooltip="selectedUsers.size > 1 ? recoverSelectionLabel$() : recoverLabel$()"
          />
          <KIconButton
            icon="trash"
            :ariaLabel="deletePermanentlyLabel$()"
            :tooltip="deletePermanentlyLabel$()"
          />
        </template>
      </UsersTable>
      <div
        v-else
        class="empty-removed-users"
      >
        <div class="empty-removed-users-content">
          <strong> {{ noRemovedUsersLabel$() }}</strong>
          <p
            :style="{
              color: $themePalette.grey.v_700,
            }"
          >
            {{ removedUsersNotice$() }}
          </p>
        </div>
      </div>
    </KPageContainer>
    <router-view
      :backRoute="overrideRoute($route, { name: PageNames.USERS_TRASH_PAGE })"
      :classes="classes"
      :selectedUsers="selectedUsers"
      @change="onUsersChange"
    />
  </ImmersivePage>

</template>


<script>

  import store from 'kolibri/store';
  import { onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';

  import ImmersivePage from 'kolibri/components/pages/ImmersivePage';
  import usePreviousRoute from 'kolibri-common/composables/usePreviousRoute';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import useUserManagement from '../../composables/useUserManagement';
  import { PageNames } from '../../constants';
  import { overrideRoute } from '../../utils';
  import UsersTable from './common/UsersTable.vue';

  export default {
    name: 'UsersTrashPage',
    components: {
      UsersTable,
      ImmersivePage,
    },
    setup() {
      usePreviousRoute();
      const route = useRoute();

      const activeFacilityId = route.params.facility_id || store.getters.activeFacilityId;

      const {
        facilityUsers,
        classes,
        totalPages,
        usersCount,
        dataLoading,
        numAppliedFilters,
        fetchUsers,
        fetchClasses,
        resetFilters,
      } = useUserManagement({
        activeFacilityId,
        softDeletedUsers: true,
      });

      const selectedUsers = ref(new Set());

      function onUsersChange() {
        fetchUsers();
      }

      const {
        backToUsers$,
        recoverLabel$,
        removedUsersTitle$,
        removedUsersNotice$,
        noRemovedUsersLabel$,
        recoverSelectionLabel$,
        deletePermanentlyLabel$,
        removedUsersPageDescription$,
      } = bulkUserManagementStrings;

      onMounted(() => {
        fetchClasses();
      });

      return {
        PageNames,
        classes,
        facilityUsers,
        totalPages,
        usersCount,
        dataLoading,
        selectedUsers,
        numAppliedFilters,
        onUsersChange,
        overrideRoute,
        resetFilters,
        backToUsers$,
        recoverLabel$,
        recoverSelectionLabel$,
        deletePermanentlyLabel$,
        removedUsersTitle$,
        removedUsersNotice$,
        noRemovedUsersLabel$,
        removedUsersPageDescription$,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .removed-users-page-header {
    margin-bottom: 16px;
  }

  .empty-removed-users {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 24px;
    text-align: center;

    .empty-removed-users-content {
      margin-bottom: 16px;

      strong {
        font-size: 16px;
      }

      p {
        margin: 8px 0;
        font-size: 14px;
      }
    }
  }

</style>
