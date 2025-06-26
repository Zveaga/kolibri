<template>

  <FacilityAppBarPage>
    <KPageContainer>
      <p>
        <KRouterLink
          v-if="userIsMultiFacilityAdmin"
          :to="{
            name: facilityPageLinks.AllFacilitiesPage.name,
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

      <PaginatedListContainerWithBackend
        v-model="currentPage"
        :items="facilityUsers"
        :itemsPerPage="itemsPerPage"
        :totalPageNumber="totalPages"
        :roleFilter="roleFilter"
        :numFilteredItems="usersCount"
      >
        <KGrid>
          <KGridItem
            :layout="{ alignment: 'right' }"
            :layout8="{ span: 4 }"
            :layout12="{ span: 6 }"
          >
            <div class="search-filter-section">
              <FilterTextbox
                v-model="search"
                :placeholder="$tr('searchText')"
                :aria-label="$tr('searchText')"
                class="move-down search-box"
              />
              <KButton
                appearance="basic-link"
                :text="filterLabel$()"
                class="filter-button move-down"
              />
            </div>
          </KGridItem>
          <KGridItem
            :layout="{ alignment: 'right' }"
            :layout8="{ span: 4 }"
            :layout12="{ span: 6 }"
            class="move-down"
          >
            <span v-if="selectedUsers.size > 0">
              <span class="selected-count">
                {{ numUsersSelected$({ n: selectedUsers.size }) }}
              </span>

              <KButton
                appearance="basic-link"
                :text="coreString('clearAction')"
                @click="clearSelectedUsers"
              />
            </span>
            <KIconButton
              icon="assignCoaches"
              :ariaLabel="assignCoach$()"
              :tooltip="assignCoach$()"
            />
            <KIconButton
              icon="add"
              :ariaLabel="enrollToClass$()"
              :tooltip="enrollToClass$()"
            />
            <KIconButton
              icon="remove"
              :ariaLabel="removeFromClass$()"
              :tooltip="removeFromClass$()"
            />
            <KIconButton
              icon="trash"
              :ariaLabel="deleteSelection$()"
              :tooltip="deleteSelection$()"
            />
          </KGridItem>
        </KGrid>
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
            <template v-if="colIndex === 0">
              <span class="screen-reader-only">{{ selectLabel$() }}</span>
              <KCheckbox
                :label="selectAllLabel$()"
                :checked="selectAllState.checked"
                :indeterminate="selectAllState.indeterminate"
                :showLabel="false"
                @change="handleSelectAllToggle"
              />
            </template>
            <template v-else>
              <span :class="{ visuallyhidden: colIndex === 7 }">{{ header.label }}</span>
              <span v-if="colIndex === 3">
                <CoreInfoIcon
                  class="tooltip"
                  :iconAriaLabel="coreString('identifierAriaLabel')"
                  :tooltipText="coreString('identifierTooltip')"
                />
              </span>
            </template>
          </template>

          <template #cell="{ content, colIndex, row }">
            <div v-if="colIndex === 0">
              <KCheckbox
                :label="getTranslatedSelectedArialabel(row)"
                :checked="isUserSelected(row[6])"
                :showLabel="false"
                :aria-label="selectLabel$()"
                @change="() => handleUserSelectionToggle(row[6])"
              />
            </div>
            <span v-else-if="colIndex === 1">
              <KLabeledIcon
                icon="person"
                :label="content"
                :style="{ color: $themeTokens.text }"
              />
              <UserTypeDisplay
                aria-hidden="true"
                :userType="row[6].kind"
                :omitLearner="true"
                class="role-badge"
                data-test="userRoleBadge"
                :class="$computedClass(userRoleBadgeStyle)"
              />
            </span>
            <span v-else-if="colIndex === 3">
              <KOptionalText :text="content ? content : ''" />
            </span>
            <span v-else-if="colIndex === 4">
              <GenderDisplayText :gender="content" />
            </span>
            <span v-else-if="colIndex === 5">
              <BirthYearDisplayText :birthYear="content" />
            </span>
            <span v-else-if="colIndex === 6"> </span>
            <span v-else-if="colIndex === 7">
              <KIconButton
                icon="optionsVertical"
                :disabled="!userCanBeEdited(content)"
              >
                <template #menu>
                  <KDropdownMenu
                    :primary="false"
                    :disabled="false"
                    :hasIcons="true"
                    :options="manageUserOptions(content.id)"
                    @select="handleManageUserSelection($event, content)"
                  />
                </template>
              </KIconButton>
            </span>
          </template>
        </KTable>
      </PaginatedListContainerWithBackend>

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

  import { ref } from 'vue';
  import { mapState, mapGetters } from 'vuex';
  import debounce from 'lodash/debounce';
  import pickBy from 'lodash/pickBy';
  import { UserKinds } from 'kolibri/constants';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import FilterTextbox from 'kolibri/components/FilterTextbox';
  import UserTypeDisplay from 'kolibri-common/components/UserTypeDisplay';
  import CoreInfoIcon from 'kolibri-common/components/labels/CoreInfoIcon';
  import { enhancedQuizManagementStrings } from 'kolibri-common/strings/enhancedQuizManagementStrings';
  import GenderDisplayText from 'kolibri-common/components/userAccounts/GenderDisplayText';
  import BirthYearDisplayText from 'kolibri-common/components/userAccounts/BirthYearDisplayText';
  import PaginatedListContainerWithBackend from 'kolibri-common/components/PaginatedListContainerWithBackend';
  import useFacilities from 'kolibri-common/composables/useFacilities';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import translatedUserKinds from 'kolibri-common/uiText/userKinds';
  import cloneDeep from 'lodash/cloneDeep';
  import useUser from 'kolibri/composables/useUser';
  import { showUserPage } from '../../modules/userManagement/handlers';
  import FacilityAppBarPage from '../FacilityAppBarPage';
  import { Modals } from '../../constants';
  import ResetUserPasswordModal from './ResetUserPasswordModal';
  import DeleteUserModal from './DeleteUserModal';

  const ALL_FILTER = 'all';

  export default {
    name: 'UserPage',
    metaInfo() {
      return {
        title: this.coreString('usersLabel'),
      };
    },
    components: {
      UserTypeDisplay,
      GenderDisplayText,
      BirthYearDisplayText,
      CoreInfoIcon,
      FacilityAppBarPage,
      FilterTextbox,
      ResetUserPasswordModal,
      DeleteUserModal,
      PaginatedListContainerWithBackend,
    },
    mixins: [commonCoreStrings, translatedUserKinds],
    setup() {
      const { currentUserId, isSuperuser } = useUser();
      const { userIsMultiFacilityAdmin } = useFacilities();
      const selectedUsers = ref(new Set());
      const modalShown = ref(null);
      const selectedUser = ref(null);

      const { selectAllLabel$ } = enhancedQuizManagementStrings;

      const {
        viewNewUsers$,
        viewTrash$,
        numUsersSelected$,
        createdAt$,
        filterLabel$,
        resetPassword$,
        enrollToClass$,
        removeFromClass$,
        assignCoach$,
        deleteSelection$,
        selectLabel$,
      } = bulkUserManagementStrings;

      return {
        userIsMultiFacilityAdmin,
        viewNewUsers$,
        viewTrash$,
        numUsersSelected$,
        createdAt$,
        filterLabel$,
        selectedUsers,
        selectedUser,
        modalShown,
        isSuperuser,
        currentUserId,
        selectAllLabel$,
        resetPassword$,
        enrollToClass$,
        removeFromClass$,
        assignCoach$,
        deleteSelection$,
        selectLabel$,
      };
    },
    computed: {
      ...mapGetters(['facilityPageLinks']),
      ...mapState('userManagement', ['facilityUsers', 'totalPages', 'usersCount', 'dataLoading']),
      Modals: () => Modals,

      tableHeaders() {
        return [
          {
            label: this.selectAllLabel$(),
            dataType: 'undefined',
            width: '48px',
            columnId: 'selection',
          },

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
            width: '15%',
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
            minWidth: '120px',
            width: '10%',
            columnId: 'gender',
          },

          {
            label: this.coreString('birthYearLabel'),
            dataType: 'date',
            minWidth: '120px',
            width: '10%',
            columnId: 'birth_year',
          },
          {
            label: this.createdAt$(),
            dataType: 'date',
            minWidth: '150px',
            width: '10%',
            columnId: 'created_at',
          },
          {
            label: '',
            dataType: 'undefined',
            minWidth: '180px',
            width: '10%',
            columnId: 'userActions',
          },
        ];
      },
      tableRows() {
        return this.facilityUsers.map(user => {
          return [
            '',
            user.full_name || '',
            user.username || '',
            user.id_number || '',
            user.gender || '',
            user.birth_year || '',
            user,
            user,
          ];
        });
      },

      selectAllState() {
        const visibleUserIds = this.facilityUsers.map(user => user.id);
        const selectedVisibleUsers = visibleUserIds.filter(id => this.selectedUsers.has(id));

        const isChecked =
          selectedVisibleUsers.length === visibleUserIds.length && selectedVisibleUsers.length > 0;
        const isIndeterminate = selectedVisibleUsers.length > 0 && !isChecked;

        return { checked: isChecked, indeterminate: isIndeterminate };
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
      userRoleBadgeStyle() {
        return {
          color: this.$themeTokens.textInverted,
          backgroundColor: this.$themeTokens.annotation,
          '::selection': {
            color: this.$themeTokens.text,
          },
        };
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

    watch: {
      $route: {
        /**
         * When the route changes, this watcher will call showUserPage
         * to fetch and update the user table. On initial page load,
         * showUserPage is already called from the router handler,
         * so we skip calling it again if oldVal is undefined.
         */
        handler(newVal, oldVal) {
          // When previous route is undefined, page is loading for the first time,
          // and in that case 'showUserPage' was called from routes.js handlers
          if (oldVal === undefined) {
            return;
          } else {
            showUserPage(this.$store, newVal, oldVal);
          }
        },
        immediate: true,
        deep: true,
      },
    },

    created() {
      this.debouncedSearchTerm = debounce(this.emitSearchTerm, 500);
    },

    methods: {
      handleSelectAllToggle() {
        const visibleUserIds = this.facilityUsers.map(user => user.id);
        const { checked } = this.selectAllState;

        if (checked) {
          visibleUserIds.forEach(id => this.selectedUsers.delete(id));
        } else {
          visibleUserIds.forEach(id => this.selectedUsers.add(id));
        }

        this.selectedUsers = new Set(this.selectedUsers);
      },

      handleUserSelectionToggle(user) {
        if (this.selectedUsers.has(user.id)) {
          this.selectedUsers.delete(user.id);
        } else {
          this.selectedUsers.add(user.id);
        }
        this.selectedUsers = new Set(this.selectedUsers);
      },

      clearSelectedUsers() {
        this.selectedUsers = new Set();
      },

      isUserSelected(user) {
        return this.selectedUsers.has(user.id);
      },

      changeSortHandler({ sortKey, sortOrder }) {
        const columnId = this.tableHeaders[sortKey]?.columnId || null;

        const query = { ...this.$route.query };

        if (!sortOrder || !columnId || columnId === 'selection') {
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
      closeModal() {
        this.modalShown = '';
      },
      manageUserOptions(userId) {
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
      userCanBeEdited(user) {
        // If logged-in user is a superuser, then they can edit anybody (including other SUs).
        // Otherwise, only non-SUs can be edited.
        return this.isSuperuser || !user.is_superuser;
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
      getTranslatedSelectedArialabel(row) {
        return this.selectLabel$() + ' ' + row[1] + ', ' + this.typeDisplayMap[row[6].kind];
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
      newUserButtonLabel: {
        message: 'New User',
        context: 'Button to create new user.',
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

  .role-badge {
    display: inline-block;
    padding: 2px 8px;
    margin-left: 12px;
    font-size: 12px;
    font-weight: 500;
    white-space: nowrap;
    border-radius: 2px;
  }

  .labeled-icon-wrapper {
    width: auto;
  }

  .user-roster {
    overflow-x: auto;
  }

  .options-button {
    margin-right: 8px;
  }

  .search-filter-section {
    display: flex;
    justify-content: start;
  }

  .search-box {
    width: 294px;
  }

  .filter-button {
    padding-top: 8px;
    margin-left: 1em;
  }

  .screen-reader-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

</style>
