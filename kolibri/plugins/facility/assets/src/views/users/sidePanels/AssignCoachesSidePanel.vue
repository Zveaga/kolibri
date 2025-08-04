<template>

  <div>
    <KModal
      v-if="showUndoModal"
      :title="undoAssignCoachHeading$({ num: selectedUsersCount })"
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
            numUsers: selectedUsersCount,
            numClasses: selectedClasses.length,
          })
        }}
      </span>
    </KModal>
    <SidePanelModal
      v-else
      alignment="right"
      sidePanelWidth="700px"
      @closePanel="$router.back()"
    >
      <template #header>
        <h1>{{ assignCoach$() }}</h1>
      </template>

      <div class="assign-coaches-content">
        <KCircularLoader v-if="isLoading" />
        <div v-else>
          <div
            v-if="showErrorWarning"
            class="enroll-warning-label"
            :style="{ color: $themeTokens.error }"
          >
            <span>{{ defaultErrorMessage$() }}</span>
          </div>
          <p>{{ numUsersYouHaveSelected$({ num: selectedUsersCount }) }}</p>
          <div class="warning-message">
            <KIcon
              icon="warning"
              color="yellow"
              class="sidepanel-icon"
            />
            {{ numUsersNotEnrolled$({ num: selectedUsersCount }) }}
          </div>
          <div class="warning-message">
            <KIcon
              icon="warning"
              color="yellow"
              class="sidepanel-icon"
            />
            {{ numUsersCoaches$({ num: selectedUsersCount }) }}
          </div>
          <div class="info-message">
            <KIcon
              icon="info"
              color="orange"
              class="sidepanel-icon"
            />
            {{ usersNotInClassNotAffected$() }}
          </div>
          <hr class="divider" >
          <h2>{{ assignToAClassLabel$() }}</h2>
          <SelectableList
            v-model="selectedClasses"
            :options="formattedClasses"
            aria-labelledby="classes-heading"
            :selectAllLabel="selectAllLabel$()"
            :searchLabel="searchForAClass$()"
          />

          <!-- Footer Buttons -->
          <div class="footer-buttons">
            <KButton
              appearance="secondary-button"
              @click="handleCancel"
            >
              {{ coreString('cancelAction') }}
            </KButton>
            <KButton
              primary
              appearance="raised-button"
              :disabled="!hasSelectedClasses || isLoading"
              @click="handleEnroll"
            >
              {{ enrollAction$() }}
            </KButton>
          </div>
        </div>
      </div>
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
  import SelectableList from '../../ManageClassPage/SelectableList';

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
      const createdRoles = ref([]);
      const instance = getCurrentInstance();

      const {
        defaultErrorMessage$,
        undoAssignCoachHeading$,
        undoAssignCoachMessage$,
        coachesAssignedNotice$,
        assignCoachUndoneNotice$,
        undoAction$,
        assignCoach$,
        numUsersYouHaveSelected$,
        numUsersNotEnrolled$,
        numUsersCoaches$,
        usersNotInClassNotAffected$,
        assignToAClassLabel$,
        enrollAction$,
        selectAllLabel$,
        searchForAClass$,
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

      // Methods
      async function handleEnroll() {
        if (!hasSelectedClasses.value) {
          return;
        }

        isLoading.value = true;
        showErrorWarning.value = false;
        createdRoles.value = [];

        try {
          await assignCoachesToClasses();
          createSnackbar(coachesAssignedNotice$());
          if (createdRoles.value.length > 0) {
            showUndoModal.value = true;
          }
        } catch (error) {
          showErrorWarning.value = true;
        } finally {
          isLoading.value = false;
        }
      }

      async function assignCoachesToClasses() {
        const selectedClasses = getSelectedClassObjects.value;
        const userIds = Array.from(props.selectedUsers);

        for (const classObj of selectedClasses) {
          const newRoles = await RoleResource.saveCollection({
            data: userIds.map(userId => ({
              collection: classObj.id,
              user: userId,
              kind: UserKinds.COACH,
            })),
          });
          createdRoles.value.push(...newRoles);
        }
      }

      function handleCancel() {
        instance.proxy.$router.back();
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
                await RoleResource.deleteModel(role.id);
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

      return {
        selectedClasses,
        isLoading,
        formattedClasses,
        selectedUsersCount,
        hasSelectedClasses,
        showErrorWarning,
        showUndoModal,
        defaultErrorMessage$,
        assignCoach$,
        numUsersYouHaveSelected$,
        numUsersNotEnrolled$,
        numUsersCoaches$,
        usersNotInClassNotAffected$,
        assignToAClassLabel$,
        enrollAction$,
        selectAllLabel$,
        searchForAClass$,
        handleEnroll,
        handleCancel,
        handleDismissConfirmation,
        handleUndoAssignments,
        undoAction$,
        dismissAction$,
        undoAssignCoachHeading$,
        undoAssignCoachMessage$,
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
    },
  };

</script>


<style scoped>

  .assign-coaches-content {
    position: relative;
  }

  .enroll-warning-label {
    margin-bottom: 10px;
  }

  .warning-message {
    display: flex;
    align-items: center;
  }

  .warning-icon {
    margin-right: 4px;
  }

  .info-message {
    display: flex;
    align-items: center;
  }

  .info-icon {
    margin-right: 4px;
  }

  .sidepanel-icon {
    padding-right: 8px;
    padding-left: 8px;
    font-size: 32px;
  }

  .divider {
    margin: 16px 0 0;
    border-top: 2px solid #f0f0f0;
  }

  .footer-buttons {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    padding-top: 16px;
    margin-top: 24px;
    border-top: 1px solid #eeeeee;
  }

  .adjust-line-height {
    /* Override default global line-height of 1.15 to prevent
       scrollbars in KModal and add space for single-line content */
    line-height: 1.5;
  }

</style>
