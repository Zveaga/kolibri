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
  nSelected: {
    message: "{n, number} selected",
    context: "A label showing `n` items are selected",
  }
  nFilters: {
    message: "{n, number} filters",
    context: "A label showing `n` filters are selected",
  }


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
  downloadSelection: {
    message: "Download selection",
    context: "Label for bulk-action button that will allow user to download a CSV of their selected users",
  },
  deleteSelection: {
    message: "Delete selection",
    context: "Label for bulk-action button that will allow user to delete selected users",
  },


  // Selection warnings
  numUsersNotEnrolled: {
    message: "{num, number} users are not enrolled in any class"
    context: "A notice indicating the number of users that are selected which are not enrolled in a class"
  },
  numUsersCoaches: {
    message: "{num, number} users are coaches",
    context: "A notice indicating the number of users the user selected that are coaches"
  },

  // Assign coaches to class
  undoAssignCoachHeading: {
    message: "{num, number} users have been removed. Undo this?"
  },
  undoAssignCoachHeading: {
    message: "You've successfully assigned {numUsers, number} users from {numClasses, number} classes. If this was a mistake, you can undo it."
  },
  coachesAssignedNotice: {
    message: "Selected coaches have been assigned",
  }
  assignCoachUndoneNotice: {
    message: "Assign action has been undone"
  },

  // Remove from class
  usersNotInClassNotAffected: {
    message: "Users already not in selected classes will not be affected",
  },
  undoUsersRemovedHeading: {
    message: "{num, number} users have been removed. Undo this?"
  },
  undoUsersRemovedMessage: {
    message: "You've successfully removed {numUsers, number} users from {numClasses, number} classes. If this was a mistake, you can undo it."
  },
  usersRemovedNotice: {
    message: "Selected users have been removed",
  }
  removeUndoneNotice: {
    message: "Remove action has been undone"
  },

  // Enroll to class
  usersInClassNotAffected: {
    message: "Users already in selected classes will not be affected",
  },
  undoUsersEnrolledHeading: {
    message: "{num, number} users have been enrolled. Undo this?"
  },
  undoUsersEnrolledMessage: {
    message: "You've successfully enrolled {numUsers, number} users from {numClasses, number} classes. If this was a mistake, you can undo it."
  },
  usersEnrolledNotice: {
    message: "Selected users have been enrolled",
  }
  enrollUndoneNotice: {
    message: "Enroll action has been undone"
  },

  // Move to trash
  undoTrashHeading: {
    message: "{num, number} users have been moved to trash. Undo this?"
  },
  undoTrashMessageA: {
    message: "You've successfully enrolled {numUsers, number} users to trash."
  },
  undoTrashMessageB: {
    message: "These users will be deleted in 30 days. If this was a mistake, you can undo it.",
  },
  usersTrashedNotice: {
    message: "Selected users have been moved to trash",
  },
  trashUndoneNotice: {
    message: "Move to trash has been undone",
  },

  // Export to CSV
  youSelectedNumUsers: {
    message: "You've selected {num, number} users"
  },
  warnCategoryDataMissing: {
    message: "Some users lack some category data so some rows may be blank."
  },
});
