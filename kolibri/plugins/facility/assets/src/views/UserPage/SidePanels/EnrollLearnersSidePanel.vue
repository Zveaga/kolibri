<template>

  <div>
    <KModal
      v-if="showUndoModal"
      :title="undoUsersEnrolledHeading$({ num: selectedUsers.size })"
      :submitText="undoAction$()"
      :cancelText="dismissAction$()"
      :submitDisabled="loading"
      :cancelDisabled="loading"
      @cancel="handleDismissConfirmation"
      @submit="handleUndoEnrollments"
    >
      <KCircularLoader v-if="loading" />
      <span v-else>{{
        undoUsersEnrolledMessage$({
          numUsers: selectedUsers.size,
          numClasses: selectedOptions.length,
        })
      }}</span>
    </KModal>
    <SidePanelModal
      v-else
      alignment="right"
      sidePanelWidth="700px"
      @closePanel="closeSidePanel(false)"
    >
      <template #header>
        <h1>{{ enrollToClass$() }}</h1>
      </template>
      <KCircularLoader v-if="loading" />
      <div v-else>
        <div
          v-if="showErrorWarning"
          class="enroll-warning-label"
          :style="{ color: $themeTokens.error }"
        >
          <span>{{ defaultErrorMessage$() }}</span>
        </div>
        <div class="enroll-warning-label">
          <span>{{ numUsersYouHaveSelected$({ num: selectedUsers.size }) }}</span>
        </div>
        <div
          v-if="usersNotEnrolled > 0"
          class="enroll-warning-label"
        >
          <KIcon
            icon="warningIncomplete"
            class="enroll-warning-icon"
          />
          <span>{{ numUsersNotEnrolled$({ num: usersNotEnrolled }) }}</span>
        </div>
        <div
          v-if="classCoaches.length > 0"
          class="enroll-warning-label"
        >
          <KIcon
            icon="warningIncomplete"
            class="enroll-warning-icon"
          />
          <span>{{ numUsersCoaches$({ num: classCoaches.length }) }}</span>
        </div>
        <div
          v-if="selectedUsers.size > 0"
          class="enroll-warning-label"
        >
          <KIcon
            icon="info"
            :color="$themePalette.orange.v_400"
            class="enroll-warning-icon"
          />
          <span>{{ usersInClassNotAffected$() }}</span>
        </div>
        <h2 id="enroll-in-selected-classes">{{ enrollInSelectedClasses$() }}</h2>
        <SelectableList
          v-model="selectedOptions"
          :options="classList"
          :selectAllLabel="enrollInAllClasses$()"
          aria-labelledby="enroll-in-selected-classes"
          :searchLabel="searchForAClass$()"
        />
      </div>
      <template #bottomNavigation>
        <div class="bottom-nav-container">
          <KButton
            :text="coreString('cancelAction')"
            :disabled="loading"
            @click="closeSidePanel(selectedOptions.length > 0 ? true : false)"
          />
          <KButton
            primary
            :text="enrollAction$()"
            :disabled="!selectedOptions.length || loading"
            @click="enrollLearners"
          />
        </div>
      </template>
      <KModal
        v-if="showCloseConfirmationModal"
        :submitText="discardAction$()"
        :cancelText="keepEditingAction$()"
        :title="disgardChanges$()"
        @cancel="showCloseConfirmationModal = false"
        @submit="closeSidePanel(false)"
      >
        <span>{{ discardWarning$() }}</span>
      </KModal>
    </SidePanelModal>
  </div>

</template>


<script>

  import { ref } from 'vue';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import { UserKinds } from 'kolibri/constants';
  import groupBy from 'lodash/groupBy';
  import SelectableList from '../../ManageClassPage/SelectableList.vue';

  export default {
    name: 'EnrollLearnersSidePanel',
    components: {
      SidePanelModal,
      SelectableList,
    },
    mixins: [commonCoreStrings],
    setup() {
      const showUndoModal = ref(false);
      const showCloseConfirmationModal = ref(false);
      const showErrorWarning = ref(false);
      const {
        enrollToClass$,
        numUsersNotEnrolled$,
        usersInClassNotAffected$,
        numUsersCoaches$,
        searchForAClass$,
        enrollInAllClasses$,
        enrollInSelectedClasses$,
        enrollUndoneNotice$,
        numUsersYouHaveSelected$,
        undoUsersEnrolledHeading$,
        undoUsersEnrolledMessage$,
        enrollAction$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        undoAction$,
        defaultErrorMessage$,
        usersEnrolledNotice$,
      } = bulkUserManagementStrings;
      const { createSnackbar } = useSnackbar();
      const { dismissAction$ } = searchAndFilterStrings;
      return {
        enrollToClass$,
        numUsersNotEnrolled$,
        usersInClassNotAffected$,
        numUsersCoaches$,
        searchForAClass$,
        enrollInAllClasses$,
        enrollInSelectedClasses$,
        numUsersYouHaveSelected$,
        undoUsersEnrolledHeading$,
        undoUsersEnrolledMessage$,
        defaultErrorMessage$,
        dismissAction$,
        enrollAction$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        undoAction$,
        enrollUndoneNotice$,
        usersEnrolledNotice$,
        showUndoModal,
        showCloseConfirmationModal,
        showErrorWarning,
        createSnackbar,
      };
    },
    props: {
      selectedUsers: {
        type: Set,
        required: true,
      },
      classes: {
        type: Array,
        required: true,
      },
    },
    data() {
      return {
        selectedOptions: [],
        classCoaches: [],
        classLearners: [],
        loading: false,
        memberships: [],
        enrollments: [],
      };
    },
    computed: {
      classList() {
        return this.classes.map(classObj => ({
          label: classObj.name,
          id: classObj.id,
        }));
      },
      usersNotEnrolled() {
        const enrolledUsers = new Set(this.classLearners);
        return [...this.selectedUsers].filter(userId => !enrolledUsers.has(userId)).length;
      },
    },
    created() {
      this.setClassUsers();
    },
    methods: {
      async setClassUsers() {
        // Clear previous data
        this.classLearners = [];
        this.classCoaches = [];
        this.loading = true;
        // Fetch memberships and user models for all selected users
        const membershipsPromise = MembershipResource.fetchCollection({
          getParams: { user_ids: { user_ids: Array.from(this.selectedUsers).join(',') } },
        });
        const userModelsPromise = Promise.all(
          Array.from(this.selectedUsers).map(id => FacilityUserResource.fetchModel({ id })),
        );
        try {
          const [membershipsData, userModels] = await Promise.all([
            membershipsPromise,
            userModelsPromise,
          ]);
          // group memberships by user
          this.memberships = groupBy(membershipsData, 'user');
          this.classLearners = Object.keys(this.memberships);
          // filter coaches by role
          this.classCoaches = Array.from(
            userModels
              .filter(user => user.roles.some(role => role.kind.includes(UserKinds.COACH)))
              .reduce((set, user) => set.add(user.id), new Set()),
          );
        } finally {
          this.loading = false;
        }
      },
      async enrollLearners() {
        this.loading = true;
        try {
          // Find users already enrolled in the selected classes and filter them out
          this.enrollments = this.selectedOptions
            .map(collection_id => {
              const user_ids = Array.from(this.selectedUsers).filter(userId => {
                const userMemberships = this.memberships[userId] || [];
                return !userMemberships.some(m => m.collection === collection_id);
              });
              return { collection_id, user_ids };
            })
            // remove classes that have an empty user_ids array
            .filter(e => e.user_ids.length > 0);
          // If there’s no users to enroll, return early
          if (this.enrollments.length === 0) {
            this.createSnackbar(this.usersEnrolledNotice$());
            this.showUndoModal = true;
            return;
          }
          for (const membership of this.enrollments) {
            await MembershipResource.saveCollection({
              getParams: {
                collection: membership.collection_id,
              },
              data: membership.user_ids.map(user => ({
                collection: membership.collection_id,
                user: user,
              })),
            });
          }
          this.createSnackbar(this.usersEnrolledNotice$());
          this.showUndoModal = true;
        } catch (error) {
          this.$store.dispatch('handleApiError', { error });
          this.showUndoModal = false;
          this.showErrorWarning = true;
        } finally {
          this.loading = false;
        }
      },
      closeSidePanel(close = true) {
        if (close) {
          this.showCloseConfirmationModal = true;
        } else {
          this.$router.back();
        }
      },
      handleDismissConfirmation() {
        this.showUndoModal = false;
        this.$router.back();
      },
      async handleUndoEnrollments() {
        this.loading = true;
        try {
          if (this.enrollments.length > 0) {
            await Promise.all(
              this.enrollments.flatMap(({ collection_id, user_ids }) =>
                MembershipResource.deleteCollection({
                  collection: collection_id,
                  user_id: user_ids,
                }),
              ),
            );
          }
          this.createSnackbar(this.enrollUndoneNotice$());
        } catch (error) {
          this.$store.dispatch('handleApiError', { error });
          this.createSnackbar(this.defaultErrorMessage$());
        } finally {
          this.showUndoModal = false;
          this.loading = false;
          this.$router.back();
        }
      },
    },
  };

</script>


<style lang="scss" scoped>

  .enroll-warning-icon {
    position: relative;
    top: 0.4em;
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.5em;
  }

  .enroll-warning-label {
    margin-bottom: 10px;
  }

  .bottom-nav-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

</style>
