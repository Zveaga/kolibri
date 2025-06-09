import { createTranslator } from 'kolibri/utils/i18n';

export const bulkUserManagementStrings = createTranslator('BulkUserManagementStrings', {

  // Searching and filtering
  newUser: {
    message: "New user",
    context: "Button label that lets the user create a new user"
  },
  searchForAUser: {
    message: "Search for a user",
    context: "Placeholder text for user search input",
  },
  numUsersSelected: {
    message: "{n, number} {n, plural, one {user} other {users}} selected",
    context: "A label showing the number of users selected",
  },
  numFilters: {
    message: "{n, number} {n, plural, one {filter} other {filters}}",
    context: "A label showing the number of filters active",
  },


  // Dropdown options
  viewNewUsers: {
    message: "View new users",
    context: "Label for dropdown item that links user to page of recently added users"
  },
  viewTrash: {
    message: "View trash",
    context: "Label for dropdown item that links user to trash page of soft-deleted users"
  },

  // Bulk actions
  enrollToClass: {
    message: "Enroll to class",
    context: "Label for bulk-action button that will allow user to enroll selected learners to classes"
  },
  removeFromClass: {
    message: "Remove from class",
    context: "Label for bulk-action button that will allow user to remove selected learners from classes"
  },
  assignCoach: {
    message: "Assign coach",
    context: "Label for bulk-action button that will allow user to assign selected coaches to classes"
  },
  deleteSelection: {
    message: "Delete selection",
    context: "Label for bulk-action button that will allow user to delete selected users",
  },


  // Selection warnings
  numUsersNotEnrolled: {
    message: "{num, number} {num, plural, one {user is} other {users are}} are not enrolled in any class",
    context: "A notice indicating the number of users that are selected which are not enrolled in a class"
  },
  numUsersCoaches: {
    message: "{num, number} {num, plural, one {user is} other {users are}} are coaches",
    context: "A notice indicating the number of users the user selected that are coaches"
  },

  // Assign coaches to class
  undoAssignCoachHeading: {
    message: "{num, number} {num, plural, one {coach has} other {coaches have}} been removed. Undo this?",
    context: "Confirmation heading that allows user to undo their action of removing users"
  },
  undoAssignCoachMessage: {
    message: "You've successfully assigned {numUsers, number} {numUsers, plural, one {user} other {users}} from {numClasses, number} {numClasses, plural, one {class} other {classes}}. If this was a mistake, you can undo it.",
    context: "Snackbar notification message indicating success"
  },
  coachesAssignedNotice: {
    message: "Selected coaches have been assigned",
    context: "Success notification shown after coaches have been successfully assigned to users/classes."
  },
  assignCoachUndoneNotice: {
    message: "Assign action has been undone",
    context: "Notification shown after the user has chosen to undo a recent coach assignment action."
  }

  // Remove from class
  usersNotInClassNotAffected: {
    message: "Users already not in selected classes will not be affected",
    context: "Warning message about users already not in selected classes"
  },
  undoUsersRemovedHeading: {
    message: "{num, number} {num, plural, one {user has} other {users have}} been removed. Undo this?",
    context: "Heading for undo confirmation after removing users"
  },
  undoUsersRemovedMessage: {
    message: "You've successfully removed {numUsers, number} {numUsers, plural, one {user} other {users}} from {numClasses, number} {numClasses, plural, one {class} other {classes}}. If this was a mistake, you can undo it.",
    context: "Detailed message for undo confirmation after removing users"
  },
  usersRemovedNotice: {
    message: "Selected users have been removed",
    context: "Confirmation message when users are removed from classes"
  },
  removeUndoneNotice: {
    message: "Remove action has been undone",
    context: "Confirmation message when remove action is undone"
  },

  // Enroll to class
  usersInClassNotAffected: {
    message: "Users already in selected classes will not be affected",
    context: "Warning message about users already in selected classes"
  },
  undoUsersEnrolledHeading: {
    message: "{num, number} {num, plural, one {user} other {users}} have been enrolled. Undo this?",
    context: "Heading for undo confirmation after enrolling users"
  },
  undoUsersEnrolledMessage: {
    message: "You've successfully enrolled {numUsers, number} {numUsers, plural, one {user} other {users}} to {numClasses, number} {numClasses, plural, one {class} other {classes}}. If this was a mistake, you can undo it.",
    context: "Detailed message for undo confirmation after enrolling users"
  },
  usersEnrolledNotice: {
    message: "Selected users have been enrolled",
    context: "Confirmation message when users are enrolled in classes"
  },
  enrollUndoneNotice: {
    message: "Enroll action has been undone",
    context: "Confirmation message when enroll action is undone"
  },

  // Move to trash
  undoTrashHeading: {
    message: "{num, number} {num, plural, one {user has} other {users have}} been moved to trash. Undo this?",
    context: "Confirmation heading asking if user wants to undo moving multiple users to trash"
  },
  undoTrashMessageA: {
    message: "You've successfully moved {numUsers, number} {numUsers, plural, one {user} other {users}} to trash.",
    context: "Success notification after users have been moved to trash"
  },
  undoTrashMessageB: {
    message: "These users will be deleted in 30 days. If this was a mistake, you can undo it.",
    context: "Informational message about trash deletion timeline and undo option"
  },
  usersTrashedNotice: {
    message: "Selected users have been moved to trash",
    context: "Brief notification confirming users were moved to trash"
  },
  trashUndoneNotice: {
    message: "Move to trash has been undone",
    context: "Notification confirming that the trash action was reversed"
  },

  // Copy a class
  copyClass: {
    message: 'Copy class',
    context: 'Page heading and label for confirmation button',
  },
  coachesAssignedToClass: {
    message: 'Coaches assigned to this class',
    context: 'Heading for table listing coaches',
  },
  numCoachesSelected: {
    message: '{n, number} {n, plural, one {coach} other {coaches}} selected',
    context: "Label showing the user how many coaches they've selected",
  },
  classCopiedSuccessfully: {
    message: 'Class copied successfully',
    context: 'Message shown when class copying succeeds',
  },
});
