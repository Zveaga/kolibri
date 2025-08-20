<template>

  <div>
    <KModal
      v-if="isConfirmationModalOpen"
      appendToOverlay
      :submitText="submitText"
      :cancelText="cancelText"
      :title="title"
      @cancel="onCancel"
      @submit="onClose"
    >
      <div class="fix-line-height">
        <slot
          v-if="$slots.content"
          name="content"
        >
        </slot>
        <span v-else>
          {{ closeConfirmationMessage$() }}
        </span>
      </div>
      <template
        v-if="cancelTextStyle || submitTextStyle"
        #actions
      >
        <KButtonGroup>
          <KButton
            v-if="submitTextStyle"
            :text="submitText"
            :style="submitTextStyle"
            :appearance="submitTextStyle.appearance || 'raised-button'"
            :primary="submitTextStyle.primary || false"
            @click="onClose"
          />
          <KButton
            v-if="cancelTextStyle"
            :style="cancelTextStyle"
            :appearance="cancelTextStyle.appearance || 'raised-button'"
            :text="cancelText"
            :primary="cancelTextStyle.primary || false"
            @click="onCancel"
          />
        </KButtonGroup>
      </template>
    </KModal>
  </div>

</template>


<script>

  import { onMounted, onUnmounted, ref } from 'vue';
  import { useRouter } from 'vue-router/composables';
  import { coreStrings } from 'kolibri/uiText/commonCoreStrings';

  /**
   * This component is used to show a confirmation modal when the user tries to
   * close the page (by leaving the route) with unsaved changes.
   */
  export default {
    name: 'CloseConfirmationGuard',
    setup(props) {
      const router = useRouter();
      const isConfirmationModalOpen = ref(false);
      const closeConfirmationToRoute = ref(null);

      const onClose = () => {
        if (closeConfirmationToRoute.value) {
          return router.push(closeConfirmationToRoute.value);
        }
        isConfirmationModalOpen.value = false;
      };

      const onCancel = () => {
        isConfirmationModalOpen.value = false;
        closeConfirmationToRoute.value = null;
      };

      const { closeConfirmationMessage$ } = coreStrings;

      const beforeUnload = event => {
        if (props.hasUnsavedChanges) {
          if (!window.confirm(props.title)) {
            event.preventDefault();
          }
        }
      };

      onMounted(() => {
        window.addEventListener('beforeunload', beforeUnload);
      });

      onUnmounted(() => {
        window.removeEventListener('beforeunload', beforeUnload);
      });

      const beforeRouteLeave = (to, from, next) => {
        if (props.hasUnsavedChanges && !closeConfirmationToRoute.value) {
          isConfirmationModalOpen.value = true;
          closeConfirmationToRoute.value = to;
          next(false);
        } else {
          next();
        }
      };

      return {
        isConfirmationModalOpen,
        onClose,
        onCancel,
        closeConfirmationMessage$,

        /**
         * BeforeRouteLeave guard to show confirmation modal made public so that
         * parent components that are route components can use it on their
         * beforeRouteLeave guard.
         * @public
         */
        beforeRouteLeave,
      };
    },
    props: {
      hasUnsavedChanges: {
        type: Boolean,
        required: true,
      },
      title: {
        type: String,
        default: coreStrings.closeConfirmationTitle$(),
      },
      cancelText: {
        type: String,
        default: coreStrings.cancelAction$(),
      },
      cancelTextStyle: {
        type: Object,
        default: null,
      },
      submitText: {
        type: String,
        default: coreStrings.continueAction$(),
      },
      submitTextStyle: {
        type: Object,
        default: null,
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
