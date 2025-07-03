import router from 'kolibri/router';
import { isNavigationFailure, NavigationFailureType } from 'vue-router';
import logger from 'kolibri-logging';
import useFacilities from 'kolibri-common/composables/useFacilities';
import { PageNames } from './constants';
import MoveToTrashSidePanel from './views/UserPage/SidePanels/MoveToTrashSidePanel';
import FilterUsersSidePanel from './views/UserPage/SidePanels/FilterUsersSidePanel';
import AssignCoachesSidePanel from './views/UserPage/SidePanels/AssignCoachesSidePanel';
import RemoveFromClassSidePanel from './views/UserPage/SidePanels/RemoveFromClassSidePanel';
import EnrollLearnersSidePanel from './views/UserPage/SidePanels/EnrollLearnersSidePanel';

const logging = logger.getLogger(__filename);

export function facilityParamRequiredGuard(toRoute, subtopicName) {
  const { userIsMultiFacilityAdmin } = useFacilities();
  if (userIsMultiFacilityAdmin.value && !toRoute.params.facility_id) {
    router
      .replace({
        name: 'ALL_FACILITIES_PAGE',
        params: { subtopicName },
      })
      .catch(e => {
        if (!isNavigationFailure(e, NavigationFailureType.duplicated)) {
          logging.debug(e);
          throw Error(e);
        }
      });
    return true;
  }
}

const sidePanelRoutes = [
  {
    name: PageNames.MOVE_TO_TRASH_TRASH_SIDE_PANEL,
    path: 'trash',
    component: MoveToTrashSidePanel,
  },
  {
    name: PageNames.FILTER_USERS_SIDE_PANEL,
    path: 'filter',
    component: FilterUsersSidePanel,
  },
  {
    name: PageNames.ASSIGN_COACHES_SIDE_PANEL,
    path: 'assign-coaches',
    component: AssignCoachesSidePanel,
  },
  {
    name: PageNames.REMOVE_FROM_CLASSES_SIDE_PANEL,
    path: 'remove-from-classes',
    component: RemoveFromClassSidePanel,
  },
  {
    name: PageNames.ENROLL_LEARNERS_SIDE_PANEL,
    path: 'enroll-learners',
    component: EnrollLearnersSidePanel,
  },
];

export function getSidePanelRoutes(...pageNames) {
  const pages = new Set(pageNames);
  return sidePanelRoutes.filter(route => pages.has(route.name));
}
