<template>

  <FacilityAppBarPage>
    <KPageContainer>
      <p>
        <KRouterLink
          v-if="userIsMultiFacilityAdmin"
          :to="{
            name: $store.getters.facilityPageLinks.AllFacilitiesPage.name,
            params: { subtopicName: 'UserPage' },
          }"
          icon="back"
          :text="coreString('changeLearningFacility')"
        />
      </p>
      <div class="users-page-header">
        <h1>{{ coreString('usersLabel') }}</h1>
        <div class="users-page-header-actions">
          <KButton
            hasDropdown
            :primary="false"
            :text="coreString('optionsLabel')"
          >
            <template #menu>
              <KDropdownMenu
                :options="pageDropdownOptions"
                @select="handlePageDropdownSelection"
              />
            </template>
          </KButton>
          <KRouterLink
            primary
            appearance="raised-button"
            :text="newUser$()"
            :to="$store.getters.facilityPageLinks.UserCreatePage"
          />
        </div>
      </div>

      <UsersTable
        :facilityUsers="facilityUsers"
        :usersCount="usersCount"
        :totalPages="totalPages"
        :dataLoading="dataLoading"
        :selectedUsers.sync="selectedUsers"
        :filterPageName="PageNames.FILTER_USERS_SIDE_PANEL"
        :numAppliedFilters="numAppliedFilters"
        @clearFilters="resetFilters"
        @change="onUsersChange"
      >
        <template #userActions>
          <router-link
            :to="overrideRoute($route, { name: PageNames.ASSIGN_COACHES_SIDE_PANEL })"
            :class="{ 'disabled-link': !canAssignCoaches }"
          >
            <KIconButton
              icon="assignCoaches"
              :ariaLabel="assignCoach$()"
              :tooltip="assignCoach$()"
              :disabled="!canAssignCoaches"
            />
          </router-link>
          <router-link
            :to="overrideRoute($route, { name: PageNames.ENROLL_LEARNERS_SIDE_PANEL })"
            :class="{ 'disabled-link': !canEnrollOrRemoveFromClass }"
          >
            <KIconButton
              icon="add"
              :ariaLabel="enrollToClass$()"
              :tooltip="enrollToClass$()"
              :disabled="!canEnrollOrRemoveFromClass"
            />
          </router-link>
          <router-link
            :to="overrideRoute($route, { name: PageNames.REMOVE_FROM_CLASSES_SIDE_PANEL })"
            :class="{ 'disabled-link': !canEnrollOrRemoveFromClass }"
          >
            <KIconButton
              icon="remove"
              :ariaLabel="removeFromClass$()"
              :tooltip="removeFromClass$()"
              :disabled="!canEnrollOrRemoveFromClass"
            />
          </router-link>
          <KIconButton
            icon="trash"
            :ariaLabel="deleteSelection$()"
            :tooltip="deleteSelection$()"
            :disabled="!hasSelectedUsers || listContainsLoggedInUser"
            @click="isMoveToTrashModalOpen = true"
          />
        </template>
      </UsersTable>
      <!-- For sidepanels -->
      <router-view
        :selectedUsers="selectedUsers"
        :classes="classes"
        @change="onUsersChange"
      />

      <!-- Modals -->
      <MoveToTrashModal
        v-if="isMoveToTrashModalOpen"
        :selectedUsers="selectedUsers"
        @close="isMoveToTrashModalOpen = false"
        @change="onUsersChange"
      />
    </KPageContainer>
  </FacilityAppBarPage>

</template>


<script>

  import { ref, getCurrentInstance, onMounted } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import useUser from 'kolibri/composables/useUser';
  import { UserKinds } from 'kolibri/constants';
  import usePreviousRoute from 'kolibri-common/composables/usePreviousRoute';
  import useUserManagement from '../../../composables/useUserManagement';
  import FacilityAppBarPage from '../../FacilityAppBarPage';
  import { PageNames } from '../../../constants';
  import UsersTable from '../common/UsersTable.vue';
  import { overrideRoute } from '../../../utils';
  import MoveToTrashModal from '../common/MoveToTrashModal.vue';

  export default {
    name: 'UserPage',
    metaInfo() {
      return {
        title: this.coreString('usersLabel'),
      };
    },
    components: {
      UsersTable,
      MoveToTrashModal,
      FacilityAppBarPage,
    },
    mixins: [commonCoreStrings],
    setup() {
      usePreviousRoute();
      const { currentUserId } = useUser();
      const { userIsMultiFacilityAdmin } = useFacilities();
      const selectedUsers = ref(new Set());
      const isMoveToTrashModalOpen = ref(false);

      const {
        newUser$,
        viewTrash$,
        assignCoach$,
        viewNewUsers$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
      } = bulkUserManagementStrings;

      const { $store, $router } = getCurrentInstance().proxy;
      const activeFacilityId =
        $router.currentRoute.params.facility_id || $store.getters.activeFacilityId;
      const {
        facilityUsers,
        totalPages,
        usersCount,
        dataLoading,
        classes,
        numAppliedFilters,
        fetchUsers,
        fetchClasses,
        resetFilters,
      } = useUserManagement({ activeFacilityId });

      const onUsersChange = ({ resetSelection = false } = {}) => {
        fetchUsers();
        if (resetSelection) {
          selectedUsers.value.clear();
        }
      };

      onMounted(() => {
        fetchClasses();
      });

      return {
        PageNames,
        userIsMultiFacilityAdmin,
        facilityUsers,
        totalPages,
        usersCount,
        dataLoading,
        classes,
        numAppliedFilters,
        isMoveToTrashModalOpen,
        resetFilters,
        onUsersChange,
        newUser$,
        viewTrash$,
        assignCoach$,
        viewNewUsers$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
        selectedUsers,
        currentUserId,
      };
    },
    computed: {
      pageDropdownOptions() {
        return [
          {
            label: this.viewNewUsers$(),
            id: 'view_new_users',
            value: PageNames.NEW_USERS_PAGE,
          },
          {
            label: this.viewTrash$(),
            id: 'view_trash',
          },
        ];
      },
      hasSelectedUsers() {
        return this.selectedUsers && this.selectedUsers.size > 0;
      },
      listContainsLoggedInUser() {
        return this.selectedUsers.has(this.currentUserId);
      },
      canAssignCoaches() {
        if (!this.hasSelectedUsers) return false;
        return this.facilityUsers
          .filter(user => this.selectedUsers.has(user.id))
          .every(
            user =>
              user.kind.includes(UserKinds.COACH) ||
              user.kind === UserKinds.ADMIN ||
              user.kind === UserKinds.SUPERUSER ||
              user.is_superuser,
          );
      },
      canEnrollOrRemoveFromClass() {
        if (!this.hasSelectedUsers) return false;
        return this.facilityUsers
          .filter(user => this.selectedUsers.has(user.id))
          .every(
            user =>
              user.kind === UserKinds.LEARNER ||
              user.kind.includes(UserKinds.COACH) ||
              user.kind === UserKinds.ADMIN ||
              user.kind === UserKinds.SUPERUSER ||
              user.is_superuser,
          );
      },
    },
    methods: {
      overrideRoute,
      handlePageDropdownSelection(option) {
        if (option.value) {
          this.$router.push({
            name: option.value,
            params: { facility_id: this.$store.getters.activeFacilityId },
          });
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  .users-page-header {
    display: flex;
    gap: 16px;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 16px;

    h1 {
      margin: 16px 0;
    }

    .users-page-header-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      align-items: center;
      justify-content: flex-end;
    }
  }

  .disabled-link {
    pointer-events: none;
    cursor: not-allowed;
  }

</style>
