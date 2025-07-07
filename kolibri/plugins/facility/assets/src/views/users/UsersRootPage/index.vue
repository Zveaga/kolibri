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
      <KGrid>
        <KGridItem
          :layout8="{ span: 4 }"
          :layout12="{ span: 6 }"
        >
          <h1>{{ coreString('usersLabel') }}</h1>
        </KGridItem>
        <KGridItem
          :layout="{ alignment: 'right' }"
          :layout8="{ span: 4 }"
          :layout12="{ span: 6 }"
        >
          <KButton
            :text="coreString('optionsLabel')"
            :hasDropdown="true"
            :primary="false"
            appearance="raised-button"
            class="move-down options-button"
            :to="$store.getters.facilityPageLinks.UserCreatePage"
          >
            <template #menu>
              <KDropdownMenu
                :primary="false"
                :disabled="false"
                :hasIcons="true"
                :options="dropDownMenu"
              />
            </template>
          </KButton>
          <KRouterLink
            :text="$tr('newUserButtonLabel')"
            :primary="true"
            appearance="raised-button"
            class="move-down"
            :to="$store.getters.facilityPageLinks.UserCreatePage"
          />
        </KGridItem>
      </KGrid>

      <UsersTable
        :facilityUsers="facilityUsers"
        :usersCount="usersCount"
        :totalPages="totalPages"
        :dataLoading="dataLoading"
        :selectedUsers.sync="selectedUsers"
        :filterPageName="PageNames.FILTER_USERS_SIDE_PANEL"
      >
        <template #userDropdownMenu="{ user }">
          <KDropdownMenu
            :options="getManageUserOptions(user.id)"
            @select="handleManageUserSelection($event, user)"
          />
        </template>
        <template #userActions>
          <router-link :to="getSidePanelUrl(PageNames.ASSIGN_COACHES_SIDE_PANEL)">
            <KIconButton
              icon="assignCoaches"
              :ariaLabel="assignCoach$()"
              :tooltip="assignCoach$()"
            />
          </router-link>
          <router-link :to="getSidePanelUrl(PageNames.ENROLL_LEARNERS_SIDE_PANEL)">
            <KIconButton
              icon="add"
              :ariaLabel="enrollToClass$()"
              :tooltip="enrollToClass$()"
            />
          </router-link>
          <router-link :to="getSidePanelUrl(PageNames.REMOVE_FROM_CLASSES_SIDE_PANEL)">
            <KIconButton
              icon="remove"
              :ariaLabel="removeFromClass$()"
              :tooltip="removeFromClass$()"
            />
          </router-link>
          <router-link :to="getSidePanelUrl(PageNames.MOVE_TO_TRASH_TRASH_SIDE_PANEL)">
            <KIconButton
              icon="trash"
              :ariaLabel="deleteSelection$()"
              :tooltip="deleteSelection$()"
            />
          </router-link>
        </template>
      </UsersTable>
      <!-- For sidepanels -->
      <router-view
        :selectedUsers="selectedUsers"
        :classes="classes"
      />

      <!-- Modals -->

      <ResetUserPasswordModal
        v-if="modalShown === Modals.RESET_USER_PASSWORD"
        :id="selectedUser.id"
        :username="selectedUser.username"
        @cancel="closeModal"
      />

      <DeleteUserModal
        v-if="modalShown === Modals.DELETE_USER"
        :id="selectedUser.id"
        :username="selectedUser.username"
        @cancel="closeModal"
      />
    </KPageContainer>
  </FacilityAppBarPage>

</template>


<script>

  import cloneDeep from 'lodash/cloneDeep';
  import { ref, getCurrentInstance, onMounted } from 'vue';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import translatedUserKinds from 'kolibri-common/uiText/userKinds';
  import useUserManagement from '../../../composables/useUserManagement';
  import FacilityAppBarPage from '../../FacilityAppBarPage';
  import { Modals, PageNames } from '../../../constants';
  import UsersTable from '../common/UsersTable.vue';
  import ResetUserPasswordModal from './ResetUserPasswordModal';
  import DeleteUserModal from './DeleteUserModal';

  export default {
    name: 'UserPage',
    metaInfo() {
      return {
        title: this.coreString('usersLabel'),
      };
    },
    components: {
      UsersTable,
      FacilityAppBarPage,
      ResetUserPasswordModal,
      DeleteUserModal,
    },
    mixins: [commonCoreStrings, translatedUserKinds],
    setup() {
      const { userIsMultiFacilityAdmin } = useFacilities();
      const selectedUsers = ref(new Set());
      const modalShown = ref(null);
      const selectedUser = ref(null);

      const {
        viewNewUsers$,
        viewTrash$,
        resetPassword$,
        assignCoach$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
      } = bulkUserManagementStrings;

      const { $store, $router } = getCurrentInstance().proxy;
      const activeFacilityId =
        $router.currentRoute.params.facility_id || $store.getters.activeFacilityId;
      const { facilityUsers, totalPages, usersCount, dataLoading, classes, fetchClasses } =
        useUserManagement(activeFacilityId);

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
        viewNewUsers$,
        viewTrash$,
        assignCoach$,
        enrollToClass$,
        removeFromClass$,
        deleteSelection$,
        resetPassword$,
        selectedUsers,
        selectedUser,
        modalShown,
      };
    },
    computed: {
      Modals: () => Modals,
      dropDownMenu() {
        return [
          {
            label: this.viewNewUsers$(),
            id: 'view_new_users',
          },
          {
            label: this.viewTrash$(),
            id: 'view_trash',
          },
        ];
      },
    },
    methods: {
      closeModal() {
        this.modalShown = '';
      },
      getManageUserOptions(userId) {
        return [
          { label: this.coreString('editDetailsAction'), value: Modals.EDIT_USER },
          { label: this.resetPassword$(), value: Modals.RESET_USER_PASSWORD },
          {
            label: this.coreString('deleteAction'),
            value: Modals.DELETE_USER,
            disabled: userId === this.currentUserId,
          },
        ];
      },
      handleManageUserSelection(selection, user) {
        if (selection.value === Modals.EDIT_USER) {
          const link = cloneDeep(this.$store.getters.facilityPageLinks.UserEditPage);
          link.params.id = user.id;
          this.$router.push(link);
        } else {
          this.selectedUser = user;
          this.modalShown = selection.value;
        }
      },
      getSidePanelUrl(name) {
        return {
          name,
          params: { facility_id: this.$route.params.facility_id },
          query: { ...this.$route.query },
        };
      },
    },
    $trs: {
      newUserButtonLabel: {
        message: 'New User',
        context: 'Button to create new user.',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .options-button {
    margin-right: 8px;
  }

</style>
