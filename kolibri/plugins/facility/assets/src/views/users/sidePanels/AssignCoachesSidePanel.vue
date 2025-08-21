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
      @closePanel="closeSidePanel"
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

          <h2>{{ SelectClassesLabel$() }}</h2>
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
              @click="closeSidePanel"
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

      <CloseConfirmationGuard
        ref="closeConfirmationGuardRef"
        :hasUnsavedChanges="hasUnsavedChanges"
        :title="disgardChanges$()"
        :submitText="discardAction$()"
        :cancelText="keepEditingAction$()"
      >
        <template #content>
          <span class="adjust-line-height">{{ discardWarning$() }}</span>
        </template>
      </CloseConfirmationGuard>
    </SidePanelModal>
  </div>

</template>


<script>

  import { ref, computed, getCurrentInstance } from 'vue';
  import { useRoute } from 'vue-router/composables';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import KIcon from 'kolibri-design-system/lib/KIcon';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import { UserKinds } from 'kolibri/constants';
  import RoleResource from 'kolibri-common/apiResources/RoleResource';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { useGoBack } from 'kolibri-common/composables/usePreviousRoute';
  import commonCoreStrings, { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import CloseConfirmationGuard from '../common/CloseConfirmationGuard.vue';
  import { getRootRouteName, overrideRoute } from '../../../utils';
  import SelectableList from '../../common/SelectableList.vue';
  import { _userState } from '../../../modules/mappers';

  export default {
    name: 'AssignCoachesSidePanel',
    components: {
      SidePanelModal,
      KIcon,
      SelectableList,
      CloseConfirmationGuard,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const selectedClasses = ref([]); // Array of selected class IDs
      const isLoading = ref(false);
      const showErrorWarning = ref(false);
      const showUndoModal = ref(false);
      const createdRoles = ref([]);
      const instance = getCurrentInstance();
      const facilityUsers = ref([]);
      const route = useRoute();
      const closeConfirmationGuardRef = ref(null);

      const goBack = useGoBack({
        getFallbackRoute: () => {
          return overrideRoute(route, {
            name: getRootRouteName(route),
          });
        },
      });

      const {
        undoAssignCoachHeading$,
        undoAssignCoachMessage$,
        coachesAssignedNotice$,
        assignCoachUndoneNotice$,
        undoAction$,
        usersInClassNotAffected$,
        assignAction$,
        searchForAClass$,
        defaultErrorMessage$,
        discardAction$,
        discardWarning$,
        keepEditingAction$,
        disgardChanges$,
        numUsersNotEligible$,
        SelectClassesLabel$,
        assignUsersHeading$,
        assignToAllClasses$,
      } = bulkUserManagementStrings;
      const { createSnackbar } = useSnackbar();
      const { dismissAction$ } = coreStrings;

      const loadUsers = async () => {
        isLoading.value = true;
        const users = await FacilityUserResource.fetchCollection({
          getParams: {
            by_ids: Array.from(props.selectedUsers).join(','),
          },
        });
        facilityUsers.value = users.map(_userState);
        isLoading.value = false;
      };
      loadUsers();

      // Computed properties
      const formattedClasses = computed(() => {
        return [...props.classes]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map(({ id, name }) => ({ id, label: name }));
      });

      const selectedUsersCount = computed(() => props.selectedUsers.size);

      const hasSelectedClasses = computed(() => selectedClasses.value.length > 0);

      const hasUnsavedChanges = computed(() => selectedClasses.value.length > 0);

      // Filter eligible users (coaches, admins, superusers)
      const eligibleUsers = computed(() => {
        return facilityUsers.value.filter(
          user =>
            user.kind.includes(UserKinds.COACH) ||
            user.kind === UserKinds.ADMIN ||
            user.kind === UserKinds.SUPERUSER ||
            user.is_superuser,
        );
      });

      // Filter ineligible users (learners)
      const ineligibleUsers = computed(() => {
        return facilityUsers.value.filter(user => user.kind === UserKinds.LEARNER);
      });
      const ineligibleUsersCount = computed(() => ineligibleUsers.value.length);

      const eligibleUsersCount = computed(() => {
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
        const selectedClassObjects = props.classes.filter(cls =>
          selectedClasses.value.includes(cls.id),
        );
        const eligibleUserIds = eligibleUsers.value.map(user => user.id);
        if (eligibleUserIds.length === 0) {
          return;
        }

        if (selectedClassObjects.length === 0) {
          throw new Error('No classes selected');
        }

        const roleData = selectedClassObjects.flatMap(classObj =>
          eligibleUserIds.map(userId => ({
            collection: classObj.id,
            user: userId,
            kind: UserKinds.COACH,
          })),
        );

        const newRoles = await RoleResource.saveCollection({
          data: roleData,
        });

        // Only add roles that were actually created (have an id)
        const actuallyCreatedRoles = newRoles.filter(role => role.id);
        createdRoles.value.push(...actuallyCreatedRoles);
      }

      function handleDismissConfirmation() {
        showUndoModal.value = false;
        selectedClasses.value = [];
        instance.proxy.$emit('clearSelection');
        instance.proxy.$router.back();
      }

      async function handleUndoAssignments() {
        isLoading.value = true;
        try {
          if (createdRoles.value.length > 0) {
            const roleIds = createdRoles.value.filter(role => role.id).map(role => role.id);

            if (roleIds.length > 0) {
              await RoleResource.deleteCollection({ by_ids: roleIds });
            }
          }
          createSnackbar(assignCoachUndoneNotice$());
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
        } finally {
          showUndoModal.value = false;
          isLoading.value = false;
          selectedClasses.value = [];
          instance.proxy.$emit('clearSelection');
          goBack();
        }
      }

      function closeSidePanel() {
        goBack();
      }

      return {
        selectedClasses,
        isLoading,
        formattedClasses,
        selectedUsersCount,
        hasSelectedClasses,
        hasUnsavedChanges,
        eligibleUsersCount,
        ineligibleUsersCount,
        showErrorWarning,
        showUndoModal,
        defaultErrorMessage$,
        usersInClassNotAffected$,
        assignAction$,
        searchForAClass$,
        SelectClassesLabel$,
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
        closeConfirmationGuardRef,
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
    beforeRouteLeave(to, from, next) {
      this.$refs.closeConfirmationGuardRef?.beforeRouteLeave(to, from, next);
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
