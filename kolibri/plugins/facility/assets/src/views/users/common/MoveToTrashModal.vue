<template>

  <div>
    <KModal
      v-if="usersRemoved"
      :title="undoTrashHeading$({ num: usersRemoved.length })"
      :submitText="undoAction$()"
      :cancelText="coreStrings.dismissAction$()"
      :submitDisabled="loading"
      :cancelDisabled="loading"
      @cancel="close"
      @submit="undoMoveToTrash"
    >
      <KCircularLoader v-if="loading" />
      <p>
        {{ undoTrashMessageA$({ numUsers: usersRemoved.length }) }}
      </p>
      <p>
        {{ undoTrashMessageB$() }}
      </p>
    </KModal>
    <KModal
      v-else
      :title="moveToTrashLabel$({ num: selectedUsers.size })"
    >
      <KCircularLoader v-if="loading" />
      <div
        v-else
        class="fix-line-height"
      >
        <KLabeledIcon
          v-if="adminUsers.length"
          icon="infoOutline"
          :color="$themeTokens.error"
          :style="{ marginBottom: '8px' }"
        >
          <span :style="{ color: $themeTokens.error }">
            {{ numAdminsSelected$({ num: adminUsers.length }) }}
          </span>
        </KLabeledIcon>
        <p
          :style="{
            marginLeft: adminUsers.length ? '32px' : '0',
            margin: 0,
          }"
        >
          {{ moveToTrashWarning$() }}
        </p>
      </div>
      <template #actions>
        <KButton
          :disabled="loading"
          style="margin-right: 16px"
          :text="coreStrings.cancelAction$()"
          @click="close"
        />
        <KButton
          :appearanceOverrides="removeButtonStyles"
          :disabled="loading"
          :text="moveToTrashAction$()"
          @click="moveToTrash"
        />
      </template>
    </KModal>
  </div>

</template>


<script>

  import { computed, ref } from 'vue';
  import { darken1 } from 'kolibri-design-system/lib/styles/darkenColors';
  import { themeTokens, themePalette } from 'kolibri-design-system/lib/styles/theme';

  import { UserKinds } from 'kolibri/constants';
  import useSnackbar from 'kolibri/composables/useSnackbar';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';
  import useKLiveRegion from 'kolibri-design-system/lib/composables/useKLiveRegion';
  import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
  import DeletedFacilityUserResource from 'kolibri-common/apiResources/DeletedFacilityUserResource';

  import { _userState } from '../../../modules/mappers';

  export default {
    name: 'MoveToTrashModal',
    setup(props, { emit }) {
      const { createSnackbar } = useSnackbar();
      const { sendPoliteMessage } = useKLiveRegion();

      const loading = ref(false);
      const users = ref([]);
      const usersRemoved = ref(null);

      const {
        undoAction$,
        undoTrashMessageA$,
        undoTrashMessageB$,
        trashUndoneNotice$,
        movingToTrash$,
        moveToTrashAction$,
        undoTrashHeading$,
        moveToTrashLabel$,
        numAdminsSelected$,
        usersTrashedNotice$,
        moveToTrashWarning$,
        defaultErrorMessage$,
      } = bulkUserManagementStrings;

      const adminUsers = computed(() => {
        return users.value.filter(user =>
          [UserKinds.ADMIN, UserKinds.SUPERUSER].includes(user.kind),
        );
      });

      const loadData = async () => {
        loading.value = true;
        try {
          const userModels = await FacilityUserResource.fetchCollection({
            getParams: {
              by_ids: Array.from(props.selectedUsers),
            },
          });
          users.value = userModels.map(_userState);
        } finally {
          loading.value = false;
        }
      };

      const close = () => {
        emit('close');
      };

      const moveToTrash = async () => {
        loading.value = true;
        sendPoliteMessage(movingToTrash$());
        try {
          await FacilityUserResource.deleteCollection({
            by_ids: Array.from(props.selectedUsers).join(','),
          });
          createSnackbar(usersTrashedNotice$());
          loading.value = false;
          usersRemoved.value = Array.from(props.selectedUsers);
          emit('change', { resetSelection: true });
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
          loading.value = false;
        }
      };

      const undoMoveToTrash = async () => {
        loading.value = true;
        try {
          await DeletedFacilityUserResource.restoreCollection({
            by_ids: usersRemoved.value.join(','),
          });
          createSnackbar(trashUndoneNotice$());
          emit('change');
          close();
        } catch (error) {
          createSnackbar(defaultErrorMessage$());
          loading.value = false;
        }
      };

      const removeButtonStyles = {
        color: themeTokens().textInverted,
        backgroundColor: themePalette().red.v_600,
        ':hover': { backgroundColor: darken1(themePalette().red.v_600) },
      };

      if (props.selectedUsers.size > 0) {
        loadData();
      } else {
        close();
      }

      return {
        // ref and computed properties
        loading,
        coreStrings,
        usersRemoved,
        adminUsers,
        removeButtonStyles,

        // methods
        close,
        moveToTrash,
        undoMoveToTrash,

        // translation functions
        undoAction$,
        undoTrashMessageA$,
        undoTrashMessageB$,
        moveToTrashAction$,
        undoTrashHeading$,
        moveToTrashLabel$,
        numAdminsSelected$,
        moveToTrashWarning$,
      };
    },
    props: {
      selectedUsers: {
        type: Set,
        default: () => new Set(),
      },
    },
  };

</script>


<style lang="scss" scoped>

  .fix-line-height {
    // Override default global line-height of 1.15 which is not enough
    // space for single lines content modal and makes scrollbar appear.
    line-height: 1.5;
  }

</style>
