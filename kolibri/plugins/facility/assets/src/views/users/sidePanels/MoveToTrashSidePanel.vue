<template>

  <SidePanelModal
    alignment="right"
    sidePanelWidth="700px"
    @closePanel="closeSidePanel"
  >
    <template #header>
      <h1>{{ moveToTrashLabel$() }}</h1>
    </template>
    <template #default>
      <KCircularLoader v-if="loading" />
      <div
        v-else
        class="selection-metadata"
      >
        <KLabeledIcon
          icon="warning"
          :color="$themePalette.orange.v_500"
        >
          <strong>{{ numUsersYouHaveSelected$({ num: selectedUsers.size }) }}</strong>
        </KLabeledIcon>
        <p
          v-for="message in selectionMessages"
          :key="message"
        >
          {{ message }}
        </p>
      </div>
      <div class="attention-warning">
        <KLabeledIcon
          icon="warning"
          :color="$themePalette.orange.v_500"
        >
          <strong>{{ attentionLabel$() }}</strong>
        </KLabeledIcon>
        <p>
          {{ attentionMessageA$() }}
        </p>
        <p>
          {{ attentionMessageB$() }}
        </p>
        <p>
          {{ attentionMessageC$() }}
        </p>
      </div>
    </template>
    <template #bottomNavigation>
      <div class="bottom-nav-container">
        <KButton
          :text="coreStrings.cancelAction$()"
          @click="closeSidePanel"
        />
        <KButton
          primary
          :text="moveToTrashLabel$()"
          :disabled="loading || !selectedUsers.size"
          @click="moveToTrash"
        />
      </div>
    </template>
  </SidePanelModal>

</template>


<script>

  import uniq from 'lodash/uniq';
  import groupBy from 'lodash/groupBy';
  import { computed, ref } from 'vue';
  import { useRouter } from 'vue-router/composables';

  import { UserKinds } from 'kolibri/constants';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import SidePanelModal from 'kolibri-common/components/SidePanelModal';
  import MembershipResource from 'kolibri-common/apiResources/MembershipResource';
  import useKLiveRegion from 'kolibri-design-system/lib/composables/useKLiveRegion';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  import { _userState } from '../../../modules/mappers';

  export default {
    name: 'MoveToTrashSidePanel',
    components: {
      SidePanelModal,
    },
    setup(props) {
      const router = useRouter();
      const { createSnackbar } = useSnackbar();
      const { sendPoliteMessage } = useKLiveRegion();

      const loading = ref(false);
      const users = ref([]);
      const usersEnrollments = ref({});

      const {
        movingToTrash$,
        attentionLabel$,
        moveToTrashLabel$,
        attentionMessageA$,
        attentionMessageB$,
        attentionMessageC$,
        numAdminsSelected$,
        usersTrashedNotice$,
        defaultErrorMessage$,
        numUsersYouHaveSelected$,
        numLearnersEnrolledInNClasses$,
        numCoachesAssignedToNClasses$,
      } = bulkUserManagementStrings;

      const learnersUsers = computed(() => {
        return users.value.filter(user => user.kind === UserKinds.LEARNER);
      });

      const coachesUsers = computed(() => {
        return users.value.filter(user =>
          [UserKinds.COACH, UserKinds.ASSIGNABLE_COACH].includes(user.kind),
        );
      });

      const adminUsers = computed(() => {
        return users.value.filter(user =>
          [UserKinds.ADMIN, UserKinds.SUPERUSER].includes(user.kind),
        );
      });

      const numClassesLearnersEnrolled = computed(() => {
        // Get all enrollments for the selected learners
        const enrollmentsCollections = [];
        for (const learner of learnersUsers.value) {
          const userEnrollments = usersEnrollments.value[learner.id] || [];
          enrollmentsCollections.push(...userEnrollments.map(enrollment => enrollment.collection));
        }
        // Get unique collections and filter them by the actual classes
        const classEnrollments = uniq(
          enrollmentsCollections.filter(collection =>
            props.classes.some(cls => cls.id === collection),
          ),
        );
        return classEnrollments.length;
      });

      const numClassesCoachesAssigned = computed(() => {
        // Get all coaches' collections roles where the kind is COACH
        const coachAssignments = [];
        for (const coach of coachesUsers.value) {
          coachAssignments.push(
            ...coach.roles
              .filter(role => role.kind === UserKinds.COACH)
              .map(role => role.collection),
          );
        }
        // Get unique collections and filter them by the classes
        const classEnrollments = uniq(
          coachAssignments.filter(collection => props.classes.some(cls => cls.id === collection)),
        );
        return classEnrollments.length;
      });

      const selectionMessages = computed(() => {
        const messages = [];
        if (adminUsers.value.length > 0) {
          messages.push(
            numAdminsSelected$({
              num: adminUsers.value.length,
            }),
          );
        }
        if (learnersUsers.value.length > 0) {
          messages.push(
            numLearnersEnrolledInNClasses$({
              num: learnersUsers.value.length,
              numClasses: numClassesLearnersEnrolled.value,
            }),
          );
        }
        if (coachesUsers.value.length > 0) {
          messages.push(
            numCoachesAssignedToNClasses$({
              num: coachesUsers.value.length,
              numClasses: numClassesCoachesAssigned.value,
            }),
          );
        }
        return messages;
      });

      const loadData = async () => {
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
          usersEnrollments.value = groupBy(membershipsData, 'user');
          users.value = userModels.map(_userState);
        } finally {
          loading.value = false;
        }
      };

      const closeSidePanel = () => {
        router.back();
      };

      const moveToTrash = async () => {
        loading.value = true;
        sendPoliteMessage(movingToTrash$());
        try {
          await FacilityUserResource.deleteCollection({
            by_ids: Array.from(props.selectedUsers).join(','),
          });
          createSnackbar(usersTrashedNotice$());
          closeSidePanel();
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
          loading.value = false;
        }
      };

      loadData();

      return {
        // computed properties
        loading,
        selectionMessages,
        coreStrings,

        // methods
        moveToTrash,
        closeSidePanel,

        // translation functions
        attentionLabel$,
        moveToTrashLabel$,
        attentionMessageA$,
        attentionMessageB$,
        attentionMessageC$,
        numUsersYouHaveSelected$,
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

  .selection-metadata,
  .attention-warning {
    font-size: 14px;
  }

  .bottom-nav-container {
    display: flex;
    gap: 16px;
    justify-content: flex-end;
    width: 100%;
  }

</style>
