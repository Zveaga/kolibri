<template>

  <div>
    <SidePanelModal
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
          <KButtonGroup>
            <KButton
              :text="coreString('cancelAction')"
              :disabled="loading"
              @click="closeSidePanel(selectedOptions.length > 0 ? true : false)"
            />
            <KButton
              primary
              :text="enrollAction$()"
              :disabled="!selectedOptions.length || loading || !selectedUsers.size"
              @click="enrollLearners"
            />
          </KButtonGroup>
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
        <span class="adjust-line-height">{{ discardWarning$() }}</span>
      </KModal>
    </SidePanelModal>
  </div>

</template>


<script>

  import { ref, computed, getCurrentInstance } from 'vue';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { UserKinds } from 'kolibri/constants';
  import groupBy from 'lodash/groupBy';
  import SelectableList from '../../common/SelectableList.vue';
  import useActionWithUndo from '../../../composables/useActionWithUndo';

  export default {
    name: 'EnrollLearnersSidePanel',
    components: {
      SidePanelModal,
      SelectableList,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const showCloseConfirmationModal = ref(false);
      const showErrorWarning = ref(false);
      const selectedOptions = ref([]);
      const classCoaches = ref([]);
      const classLearners = ref([]);
      const loading = ref(false);
      const membershipsByUser = ref({});
      const createdMemberships = ref([]);
      const instance = getCurrentInstance();
      const {
        enrollToClass$,
        numUsersNotEnrolled$,
        usersInClassNotAffected$,
        numUsersCoaches$,
        searchForAClass$,
        enrollInAllClasses$,
        enrollInSelectedClasses$,
        numUsersYouHaveSelected$,
        enrollUndoneNotice$,
        enrollAction$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        defaultErrorMessage$,
        usersEnrolledNotice$,
      } = bulkUserManagementStrings;

      // Computed properties
      const classList = computed(() =>
        props.classes.map(classObj => ({
          label: classObj.name,
          id: classObj.id,
        })),
      );

      const usersNotEnrolled = computed(() => {
        const enrolledUsers = new Set(classLearners.value);
        return [...props.selectedUsers].filter(userId => !enrolledUsers.has(userId)).length;
      });

      // Methods
      async function setClassUsers() {
        classLearners.value = [];
        classCoaches.value = [];
        loading.value = true;
        const membershipsPromise = MembershipResource.fetchCollection({
          getParams: { user_ids: Array.from(props.selectedUsers).join(',') },
        });
        const userModelsPromise = FacilityUserResource.fetchCollection({
          getParams: {
            by_ids: Array.from(props.selectedUsers).join(','),
          },
        });
        try {
          const [membershipsData, userModels] = await Promise.all([
            membershipsPromise,
            userModelsPromise,
          ]);
          membershipsByUser.value = groupBy(membershipsData, 'user');
          classLearners.value = Object.keys(membershipsByUser.value);
          classCoaches.value = Array.from(
            userModels
              .filter(user => user.roles.some(role => role.kind.includes(UserKinds.COACH)))
              .reduce((set, user) => set.add(user.id), new Set()),
          );
        } finally {
          loading.value = false;
        }
      }

      async function _enrollLearners() {
        loading.value = true;
        createdMemberships.value = [];
        const enrollments = selectedOptions.value.flatMap(collection_id => {
          const alreadyEnrolled = membershipsByUser.value;
          return Array.from(props.selectedUsers)
            .filter(
              userId => !(alreadyEnrolled[userId] || []).some(m => m.collection === collection_id),
            )
            .map(user => ({ collection: collection_id, user }));
        });
        if (enrollments.length === 0) {
          loading.value = false;
          return;
        }
        try {
          const newMemberships = await MembershipResource.saveCollection({ data: enrollments });
          createdMemberships.value = newMemberships;
        } catch (error) {
          showErrorWarning.value = true;
        } finally {
          loading.value = false;
        }
      }

      const { performAction: enrollLearners } = useActionWithUndo({
        action: _enrollLearners,
        actionNotice$: usersEnrolledNotice$,
        undoAction: handleUndoEnrollments,
        undoActionNotice$: enrollUndoneNotice$,
      });

      function closeSidePanel(close = true) {
        if (close) {
          showCloseConfirmationModal.value = true;
        } else {
          instance.proxy.$router.back();
        }
      }

      async function handleUndoEnrollments() {
        if (createdMemberships.value.length > 0) {
          const ids = createdMemberships.value.map(m => m.id).join(',');
          await MembershipResource.deleteCollection({ by_ids: ids });
        }
      }

      return {
        enrollToClass$,
        numUsersNotEnrolled$,
        usersInClassNotAffected$,
        numUsersCoaches$,
        searchForAClass$,
        enrollInAllClasses$,
        enrollInSelectedClasses$,
        numUsersYouHaveSelected$,
        defaultErrorMessage$,
        enrollAction$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        showCloseConfirmationModal,
        showErrorWarning,
        selectedOptions,
        classCoaches,
        loading,
        classList,
        usersNotEnrolled,
        setClassUsers,
        enrollLearners,
        closeSidePanel,
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
    created() {
      this.setClassUsers();
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

  .adjust-line-height {
    // Override default global line-height of 1.15 to prevent
    // scrollbars in KModal and add space for single-line content
    line-height: 1.5;
  }

</style>
