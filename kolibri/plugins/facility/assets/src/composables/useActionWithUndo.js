import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
import useSnackbar from 'kolibri/composables/useSnackbar';

export default function useActionWithUndo({
  action,
  actionNotice$,
  undoAction,
  undoActionNotice$,
  onBlur,
}) {
  const { undoAction$, defaultErrorMessage$ } = bulkUserManagementStrings;
  const { createSnackbar, clearSnackbar } = useSnackbar();

  const performUndoAction = async () => {
    clearSnackbar();
    try {
      await undoAction();
      createSnackbar(undoActionNotice$());
    } catch (error) {
      createSnackbar(defaultErrorMessage$());
    }
  };

  const performAction = async () => {
    const success = await action();
    if (!success) {
      return;
    }

    createSnackbar({
      text: actionNotice$(),
      autofocus: true,
      autoDismiss: true,
      duration: 6000,
      actionText: undoAction$(),
      onBlur,
      actionCallback: performUndoAction,
    });
  };

  return {
    performAction,
  };
}
