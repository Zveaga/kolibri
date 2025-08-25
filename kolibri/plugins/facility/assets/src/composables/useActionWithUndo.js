import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';
import useSnackbar from 'kolibri/composables/useSnackbar';

export default function useActionWithUndo({
  action,
  actionNotice$,
  undoAction,
  undoActionNotice$,
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
    await action();
    createSnackbar({
      text: actionNotice$(),
      autoDismiss: true,
      duration: 6000,
      actionText: undoAction$(),
      actionCallback: performUndoAction,
    });
  };

  return {
    performAction,
  };
}
