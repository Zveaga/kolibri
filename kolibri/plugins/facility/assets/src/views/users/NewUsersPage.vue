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
      <div class="new-users-page-header">
        <h1>{{ newUsers$() }}</h1>
        <div>
          <KRouterLink
            primary
            appearance="raised-button"
            :text="newUser$()"
            :to="$store.getters.facilityPageLinks.UserCreatePage"
          />
        </div>
      </div>
      <UsersTable
        v-if="showUsersTable"
        :facilityUsers="facilityUsers"
        :usersCount="usersCount"
        :totalPages="totalPages"
        :dataLoading="dataLoading"
        :selectedUsers.sync="selectedUsers"
        :filterPageName="PageNames.FILTER_USERS_SIDE_PANEL__NEW_USERS"
        :numAppliedFilters="numAppliedFilters"
        @clearFilters="resetFilters"
        @change="onUsersChange"
      >
        <template #userActions>
          <router-link
            :to="overrideRoute($route, { name: PageNames.ASSIGN_COACHES_SIDE_PANEL__NEW_USERS })"
          >
            <KIconButton
              icon="assignCoaches"
              :ariaLabel="assignCoach$()"
              :tooltip="assignCoach$()"
            />
          </router-link>
          <router-link
            :to="overrideRoute($route, { name: PageNames.ENROLL_LEARNERS_SIDE_PANEL__NEW_USERS })"
          >
            <KIconButton
              icon="add"
              :ariaLabel="enrollToClass$()"
              :tooltip="enrollToClass$()"
            />
          </router-link>
          <router-link
            :to="
              overrideRoute($route, { name: PageNames.REMOVE_FROM_CLASSES_SIDE_PANEL__NEW_USERS })
            "
          >
            <KIconButton
              icon="remove"
              :ariaLabel="removeFromClass$()"
              :tooltip="removeFromClass$()"
            />
          </router-link>
          <KIconButton
            icon="trash"
            :ariaLabel="deleteSelection$()"
            :tooltip="deleteSelection$()"
            @click="isMoveToTrashModalOpen = true"
          />
        </template>
      </UsersTable>
      <div
        v-else
        class="empty-new-users"
      >
        <div class="empty-new-users-content">
          <strong> {{ noNewUsersLabel$() }}</strong>
          <p
            :style="{
              color: $themePalette.grey.v_700,
            }"
          >
            {{ noNewUsersDescription$() }}
          </p>
        </div>
        <KRouterLink
          primary
          appearance="raised-button"
          :text="addNewUserLabel$()"
          :to="$store.getters.facilityPageLinks.UserCreatePage"
        />
      </div>
    </KPageContainer>
    <!-- For sidepanels -->
    <router-view
      :backRoute="overrideRoute($route, { name: PageNames.NEW_USERS_PAGE })"
      :classes="classes"
      :selectedUsers="selectedUsers"
      @change="onUsersChange"
    />

    <!-- Modals -->
    <MoveToTrashModal
      v-if="isMoveToTrashModalOpen"
      :selectedUsers="selectedUsers"
      @close="isMoveToTrashModalOpen = false"
      @change="onUsersChange"
    />
  </ImmersivePage>

</template>


<script>

  import store from 'kolibri/store';
  import { computed, onMounted, ref } from 'vue';
  import { useRoute } from 'vue-router/composables';

  import ImmersivePage from 'kolibri/components/pages/ImmersivePage';
  import usePreviousRoute from 'kolibri-common/composables/usePreviousRoute';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import { overrideRoute } from '../../utils';
  import { PageNames } from '../../constants';
  import useUserManagement from '../../composables/useUserManagement';
  import UsersTable from './common/UsersTable.vue';
  import MoveToTrashModal from './common/MoveToTrashModal.vue';

  // Constant for the maximum number of days to consider a user as a "new user"
  const MAX_NEW_USER_DAYS = 30;

  export default {
    name: 'NewUsersPage',
    components: {
      UsersTable,
      ImmersivePage,
      MoveToTrashModal,
    },
    setup() {
      usePreviousRoute();
      const route = useRoute();
      const isMoveToTrashModalOpen = ref(false);

      const activeFacilityId = route.params.facility_id || store.getters.activeFacilityId;

      const newUsersCreationTreshold = new Date();
      newUsersCreationTreshold.setDate(newUsersCreationTreshold.getDate() - MAX_NEW_USER_DAYS);

      const {
        facilityUsers,
        search,
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
        dateJoinedGt: newUsersCreationTreshold,
      });

      const selectedUsers = ref(new Set());

      const showUsersTable = computed(
        () =>
          facilityUsers.value.length > 0 ||
          search.value?.length > 0 ||
          numAppliedFilters.value > 0 ||
          dataLoading.value,
      );

      function onUsersChange({ resetSelection = false } = {}) {
        fetchUsers();
        if (resetSelection) {
          selectedUsers.value.clear();
        }
      }

      const {
        newUser$,
        newUsers$,
        backToUsers$,
        assignCoach$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
        noNewUsersLabel$,
        addNewUserLabel$,
        noNewUsersDescription$,
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
        showUsersTable,
        numAppliedFilters,
        isMoveToTrashModalOpen,
        onUsersChange,
        overrideRoute,
        resetFilters,
        newUser$,
        newUsers$,
        backToUsers$,
        assignCoach$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
        noNewUsersLabel$,
        addNewUserLabel$,
        noNewUsersDescription$,
      };
    },
  };

</script>


<style lang="scss" scoped>

  .new-users-page-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;
  }

  .empty-new-users {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    padding: 24px;
    text-align: center;

    .empty-new-users-content {
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
