<template>

  <div>
    <SidePanelModal
      alignment="right"
      sidePanelWidth="700px"
      @closePanel="$router.back()"
    >
      <template #header>
        <h1>{{ removeUsersFromClassesHeading$({ numUsers: selectedUsers.size }) }}</h1>
      </template>
      <KCircularLoader v-if="loading" />
      <div v-else>
        <div
          v-if="showErrorWarning"
          :style="{ color: $themeTokens.error, marginBottom: '10px' }"
        >
          <span>{{ defaultErrorMessage$() }}</span>
        </div>
        <div
          class="info-box"
          :style="{ backgroundColor: $themePalette.grey.v_100 }"
        >
          <KIcon
            icon="infoOutline"
            class="remove-info-icon"
          />
          <span v-if="selectedUsers.size > 0 && classCoaches.length > 0">
            <span>{{ numUsersCoaches$({ num: classCoaches.length }) }}</span>
            <div style="margin-top: 10px">
              <span class="warning-text">{{ usersNotInClasses$() }}</span>
            </div>
          </span>
          <span v-else>{{ usersNotInClasses$() }}</span>
        </div>
        <h2 id="remove-from-selected-classes">{{ SelectClassesLabel$() }}</h2>
        <SelectableList
          v-model="selectedOptions"
          :options="classList"
          :selectAllLabel="removeFromAllClassesLabel$()"
          aria-labelledby="remove-from-selected-classes"
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
              :text="removeAction$()"
              :disabled="!selectedOptions.length || loading || !selectedUsers.size"
              @click="removeUsers"
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
        <KIcon
          icon="infoOutline"
          class="remove-info-icon"
          :color="$themePalette.red.v_600"
        />
        <span
          :style="{ color: $themePalette.red.v_600 }"
          class="adjust-line-height"
        >{{ discardWarning$() }}</span>
      </KModal>
    </SidePanelModal>
  </div>

</template>


<script>

  import { ref, computed, onMounted, getCurrentInstance } from 'vue';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { UserKinds } from 'kolibri/constants';
  import groupBy from 'lodash/groupBy';
  import SelectableList from '../../common/SelectableList.vue';

  export default {
    name: 'RemoveFromClassSidePanel',
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
      const rolesByUser = ref({});
      const removedLearnerMemberships = ref([]);
      const removedCoachRoles = ref([]);
      const instance = getCurrentInstance();
      const {
        numUsersCoaches$,
        searchForAClass$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        undoAction$,
        defaultErrorMessage$,
        removeUsersFromClassesHeading$,
        usersNotInClasses$,
        removeFromAllClassesLabel$,
        SelectClassesLabel$,
        removeAction$,
        usersRemovedNotice$,
        undoUsersRemovedMessage$,
      } = bulkUserManagementStrings;
      const { createSnackbar, clearSnackbar } = useSnackbar();

      const classList = computed(() => {
        // Get all class IDs where selected users are enrolled as learners
        const learnerClassIds = Object.values(membershipsByUser.value || {})
          .flat()
          .filter(membership => membership && membership.collection)
          .map(membership => membership.collection);

        // Get all class IDs where selected users are coaches
        const coachClassIds = Object.values(rolesByUser.value || {})
          .flat()
          .filter(role => role && role.collection)
          .map(role => role.collection);

        // Combine and deduplicate class IDs
        const uniqueClassIds = new Set([...learnerClassIds, ...coachClassIds]);

        return props.classes
          .filter(classObj => uniqueClassIds.has(classObj.id))
          .map(classObj => ({
            label: classObj.name,
            id: classObj.id,
          }));
      });

      // methods
      async function setClassUsers() {
        loading.value = true;
        try {
          const userIds = Array.from(props.selectedUsers);
          const userIdsStr = userIds.join(',');

          const [membershipsData, coachRoles] = await Promise.all([
            MembershipResource.fetchCollection({
              getParams: { user_ids: userIdsStr },
            }),
            RoleResource.fetchCollection({
              getParams: {
                user_ids: userIdsStr,
                kind: UserKinds.COACH,
              },
            }),
          ]);

          membershipsByUser.value = groupBy(membershipsData, 'user');
          rolesByUser.value = groupBy(coachRoles, 'user');
          classLearners.value = Object.keys(membershipsByUser.value);
          classCoaches.value = Object.keys(rolesByUser.value);
        } finally {
          loading.value = false;
        }
      }

      function closeSidePanel(close = true) {
        if (close) {
          showCloseConfirmationModal.value = true;
        } else {
          instance.proxy.$router.back();
        }
      }

      async function undoUserRemoval() {
        clearSnackbar();

        const hasLearnerMemberships = removedLearnerMemberships.value.length > 0;
        const hasCoachRoles = removedCoachRoles.value.length > 0;

        try {
          if (hasLearnerMemberships) {
            const enrollments = removedLearnerMemberships.value.map(({ collection, user }) => ({
              collection,
              user,
            }));
            await MembershipResource.saveCollection({ data: enrollments });
          }
          if (hasCoachRoles) {
            const assignments = removedCoachRoles.value.map(({ collection, user }) => ({
              collection,
              user,
              kind: UserKinds.COACH,
            }));
            await RoleResource.saveCollection({ data: assignments });
          }
          createSnackbar(undoUsersRemovedMessage$());
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
        }
      }

      function getItemsToRemove(byUser, selectedSet) {
        return Object.values(byUser.value)
          .flat()
          .filter(item => selectedSet.has(item.collection) && item.id);
      }

      async function removeUsers() {
        loading.value = true;
        // selected classes to remove users from
        const selectedSet = new Set(selectedOptions.value);
        const learnerMembershipsToRemove = getItemsToRemove(membershipsByUser, selectedSet);
        const coachRolesToRemove = getItemsToRemove(rolesByUser, selectedSet);

        async function removeItems(resource, items) {
          if (items.length) {
            const ids = items.map(item => item.id).join(',');
            await resource.deleteCollection({ by_ids: ids });
          }
        }
        try {
          await removeItems(MembershipResource, learnerMembershipsToRemove);
          await removeItems(RoleResource, coachRolesToRemove);
          removedLearnerMemberships.value = learnerMembershipsToRemove || [];
          removedCoachRoles.value = coachRolesToRemove || [];
          closeSidePanel(false);
          createSnackbar({
            text: usersRemovedNotice$(),
            autoDismiss: true,
            duration: 6000,
            actionText: undoAction$(),
            actionCallback: () => undoUserRemoval(),
          });
        } catch (error) {
          showErrorWarning.value = true;
        } finally {
          loading.value = false;
        }
      }

      onMounted(() => {
        setClassUsers();
      });

      return {
        // ref and computed properties
        showCloseConfirmationModal,
        showErrorWarning,
        selectedOptions,
        classCoaches,
        loading,
        classList,

        // translation functions
        removeUsersFromClassesHeading$,
        numUsersCoaches$,
        searchForAClass$,
        defaultErrorMessage$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        usersNotInClasses$,
        removeFromAllClassesLabel$,
        SelectClassesLabel$,
        removeAction$,

        // methods
        closeSidePanel,
        removeUsers,
      };
    },
    props: {
      selectedUsers: {
        type: Set,
        default: () => new Set(),
      },
      classes: {
        type: Array,
        default: () => [],
      },
    },
  };

</script>


<style lang="scss" scoped>

  .info-box {
    padding: 8px;
    border-radius: 4px;
  }

  .remove-info-icon {
    position: relative;
    top: 0.4em;
    width: 1.5em;
    height: 1.5em;
    margin-right: 0.5em;
  }

  .warning-text {
    margin-left: 30px;
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
