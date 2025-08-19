<template>

  <div>
    <KModal
      v-if="showUndoModal"
      :title="
        undoAssignCoachHeading$({
          numUsers: eligibleUsersCount,
          numClasses: selectedClasses.length,
        })
      "
      :submitText="undoAction$()"
      :cancelText="dismissAction$()"
      :submitDisabled="isLoading"
      :cancelDisabled="isLoading"
      @cancel="handleDismissConfirmation"
      @submit="handleUndoAssignments"
    >
      <KCircularLoader v-if="isLoading" />
      <span
        v-else
        class="adjust-line-height"
      >
        {{
          undoAssignCoachMessage$({
            numUsers: eligibleUsersCount,
            numClasses: selectedClasses.length,
          })
        }}
      </span>
    </KModal>
    <SidePanelModal
      v-else
      alignment="right"
      sidePanelWidth="700px"
      :addBottomBorder="false"
      @closePanel="closeSidePanel(selectedClasses.length > 0)"
    >
      <template #header>
        <h1>{{ assignUsersHeading$({ num: selectedUsersCount }) }}</h1>
      </template>

      <div class="assign-coaches-content">
        <KCircularLoader v-if="isLoading" />
        <div v-else>
          <div
            v-if="showErrorWarning"
            class="assign-warning-label"
            :style="{ color: $themeTokens.error }"
          >
            <span>{{ defaultErrorMessage$() }}</span>
          </div>

          <div
            class="top-info-box"
            :style="{ backgroundColor: $themePalette.grey.v_100 }"
          >
            <template v-if="ineligibleUsersCount > 0">
              <div class="info-flex">
                <KIcon
                  icon="infoOutline"
                  class="info-icon"
                />
                <div class="info-lines">
                  <div class="info-line">
                    {{ numUsersNotEligible$({ num: ineligibleUsersCount }) }}
                  </div>
                  <div class="info-line">{{ usersInClassNotAffected$() }}</div>
                </div>
              </div>
            </template>
            <template v-else>
              <div class="info-lines">
                <div class="info-line">{{ usersInClassNotAffected$() }}</div>
              </div>
            </template>
          </div>

          <h2>{{ selectClassesLabel$() }}</h2>
          <SelectableList
            v-model="selectedClasses"
            :options="formattedClasses"
            aria-labelledby="classes-heading"
            :selectAllLabel="assignToAllClasses$()"
            :searchLabel="searchForAClass$()"
          />
        </div>
      </div>
      <template #bottomNavigation>
        <div class="bottom-nav-container">
          <KButtonGroup>
            <KButton
              :text="coreString('cancelAction')"
              :disabled="isLoading"
              @click="closeSidePanel(selectedClasses.length > 0)"
            />
            <KButton
              primary
              :text="assignAction$()"
              :disabled="!hasSelectedClasses || isLoading"
              @click="handleAssign"
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
  import KIcon from 'kolibri-design-system/lib/KIcon';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import { UserKinds } from 'kolibri/constants';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { searchAndFilterStrings } from 'kolibri-common/strings/searchAndFilterStrings';
  import SelectableList from '../../common/SelectableList.vue';

  export default {
    name: 'AssignCoachesSidePanel',
    components: {
      SidePanelModal,
      KIcon,
      SelectableList,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const selectedClasses = ref([]); // Array of selected class IDs
      const isLoading = ref(false);
      const showErrorWarning = ref(false);
      const showUndoModal = ref(false);
      const showCloseConfirmationModal = ref(false);
      const createdRoles = ref([]);
      const instance = getCurrentInstance();

      const {
        defaultErrorMessage$  const ineligibleUsers = computed(() => {
        if (!props.facilityUsers || props.facilityUsers.length === 0) {
          return [];
        },
        undoAssignCoachHeading$,
        undoAssignCoachMessage$,
        coachesAssignedNotice$,
        assignCoachUndoneNotice$,
        undoAction$,
        usersInClassNotAffected$,
        assignAction$,
        searchForAClass$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        numUsersNotEligible$,
        selectClassesLabel$,
        assignUsersHeading$,
        assignToAllClasses$,
      } = bulkUserManagementStrings;
      const { createSnackbar } = useSnackbar();
      const { dismissAction$ } = searchAndFilterStrings;

      // Computed properties
      const formattedClasses = computed(() =>
        props.classes.map(cls => ({
          id: cls.id,
          label: cls.name,
        })),
      );

      const selectedUsersCount = computed(() => props.selectedUsers.size);

      const hasSelectedClasses = computed(() => selectedClasses.value.length > 0);

      const getSelectedClassObjects = computed(() =>
        props.classes.filter(cls => selectedClasses.value.includes(cls.id)),
      );

      // Filter eligible users (coaches, admins, superusers)
      const eligibleUsers = computed(() => {
        if (!props.facilityUsers || props.facilityUsers.length === 0) {
          return Array.from(props.selectedUsers);
        }

        return props.facilityUsers.filter(
          user =>
            props.selectedUsers.has(user.id) &&
            (user.kind.includes(UserKinds.COACH) ||
              user.kind === UserKinds.ADMIN ||
              user.kind === UserKinds.SUPERUSER ||
              user.is_superuser),
        );
      });

      // Filter ineligible users (learners)
      const ineligibleUsers = computed(() => {
        if (!props.facilityUsers || props.facilityUsers.length === 0) {
          return [];
        }

        return props.facilityUsers.filter(
          user => props.selectedUsers.has(user.id) && user.kind === UserKinds.LEARNER,
        );
      });
      const ineligibleUsersCount = computed(() => ineligibleUsers.value.length);

      const eligibleUsersCount = computed(() => {
        if (!props.facilityUsers || props.facilityUsers.length === 0) {
          return props.selectedUsers.size; // fallback
        }
        return eligibleUsers.value.length;
      });

      // Methods
      async function handleAssign() {
        if (!hasSelectedClasses.value) {
          return;
        }

        isLoading.value = true;
        showErrorWarning.value = false;
        createdRoles.value = [];

        try {
          await assignCoachesToClasses();
          createSnackbar(coachesAssignedNotice$());
          showUndoModal.value = true;
        } catch (error) {
          showErrorWarning.value = true;
        } finally {
          isLoading.value = false;
        }
      }

      async function assignCoachesToClasses() {
        const selectedClasses = getSelectedClassObjects.value;
        const eligibleUserIds = eligibleUsers.value.map(user => user.id);

        if (eligibleUserIds.length === 0) {
          return;
        }

        for (const classObj of selectedClasses) {
          const newRoles = await RoleResource.saveCollection({
            data: eligibleUserIds.map(userId => ({
              collection: classObj.id,
              user: userId,
              kind: UserKinds.COACH,
            })),
          });
          // Only add roles that were actually created (have an id)
          const actuallyCreatedRoles = newRoles.filter(role => role.id);
          createdRoles.value.push(...actuallyCreatedRoles);
        }
      }

      function handleDismissConfirmation() {
        showUndoModal.value = false;
        instance.proxy.$router.back();
      }

      async function handleUndoAssignments() {
        isLoading.value = true;
        try {
          if (createdRoles.value.length > 0) {
            for (const role of createdRoles.value) {
              if (role.id) {
                await RoleResource.deleteModel({ id: role.id });
              }
            }
          }
          createSnackbar(assignCoachUndoneNotice$());
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
        } finally {
          showUndoModal.value = false;
          isLoading.value = false;
          instance.proxy.$router.back();
        }
      }

      function closeSidePanel(close = true) {
        if (close) {
          showCloseConfirmationModal.value = true;
        } else {
          instance.proxy.$router.back();
        }
      }

      return {
        selectedClasses,
        isLoading,
        formattedClasses,
        selectedUsersCount,
        hasSelectedClasses,
        eligibleUsersCount,
        ineligibleUsersCount,
        showErrorWarning,
        showUndoModal,
        showCloseConfirmationModal,
        defaultErrorMessage$,
        usersInClassNotAffected$,
        assignAction$,
        searchForAClass$,
        selectClassesLabel$,
        handleAssign,
        handleDismissConfirmation,
        handleUndoAssignments,
        undoAction$,
        dismissAction$,
        undoAssignCoachHeading$,
        undoAssignCoachMessage$,
        closeSidePanel,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        numUsersNotEligible$,
        assignUsersHeading$,
        assignToAllClasses$,
      };
    },
    props: {
      /* eslint-disable vue/no-unused-properties */
      selectedUsers: {
        type: Set,
        default: () => new Set(),
      },
      /* eslint-enable vue/no-unused-properties */
      classes: {
        type: Array,
        default: () => [],
      },
      facilityUsers: {
        type: Array,
        default: () => [],
      },
    },
  };

</script>


<style scoped>

  .assign-coaches-content {
    position: relative;
  }

  .assign-warning-label {
    margin-bottom: 10px;
  }

  .bottom-nav-container {
    display: flex;
    justify-content: flex-end;
    width: 100%;
  }

  .adjust-line-height {
    /* Override default global line-height of 1.15 to prevent
       scrollbars in KModal and add space for single-line content */
    line-height: 1.5;
  }

  .top-info-box {
    padding: 12px;
    margin-bottom: 16px;
    border-radius: 8px;
  }
  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.side-panel-content) {
    padding-top: 0 !important ;
  }
  /* stylelint-disable-next-line selector-pseudo-element-no-unknown */
  ::v-deep(.side-panel-header) {
    padding-right: 32px !important ;
    padding-left: 32px !important ;
  }

  .info-flex {
    display: flex;
    align-items: flex-start;
  }

  .info-icon {
    flex: 0 0 24px;
    width: 24px;
    height: 24px;
    margin-right: 4px;
  }

  .info-lines {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .info-line {
    line-height: 1.4;
  }

  .info-line:last-child {
    margin-bottom: 0;
  }

</style>
