import pickBy from 'lodash/pickBy';
import samePageCheckGenerator from 'kolibri-common/utils/samePageCheckGenerator';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import { _userState } from '../mappers';

export function fetchSortedFacilityUsersHandler(store, { column, order, page, page_size, router }) {
  store.commit('SET_STATE', { dataLoading: true });

  const orderingParam = order === 'desc' ? `-${column}` : column || null;
  const shouldResolve = samePageCheckGenerator(store);

  console.log('Should resolve:', shouldResolve());

  return FacilityUserResource.fetchCollection({
    getParams: pickBy({
      ordering: orderingParam,
      page,
      page_size,
    }),
    force: true,
  })
    .then(users => {
      if (shouldResolve()) {
        const mappedUsers = users.results.map(_userState);
        console.log('Ordered Facility Users:', mappedUsers);

        // Update Vuex state with the fetched data
        store.commit('SET_STATE', {
          facilityUsers: mappedUsers,
          totalPages: users.total_pages,
          usersCount: users.count,
        });

        // Debugging router.push
        try {
          console.log('Before router.push');
          const currentQuery = router.currentRoute.value.query;
          const newQuery = pickBy({
            ...currentQuery,
            ordering: column,
            order,
            page,
            page_size,
          });

          if (JSON.stringify(currentQuery) === JSON.stringify(newQuery)) {
            console.log('Navigation aborted: Same route and query parameters');
            return;
          }

          router.push({
            path: router.currentRoute.value.path,
            query: newQuery,
          });
          console.log('After router.push');
        } catch (error) {
          console.error('Error during router.push:', error);
        }
      }
      store.commit('SET_STATE', { dataLoading: false });
      store.dispatch('userManagement/notLoading');
    })
    .catch(error => {
      if (shouldResolve()) {
        store.dispatch('handleApiError', { error, reloadOnReconnect: true });
      }
      store.commit('SET_STATE', { dataLoading: false });
      store.dispatch('userManagement/notLoading');
    });
}
// An action for setting up the initial state of the app by fetching data from the server
export function showUserPage(store, toRoute, fromRoute) {
  store.commit('userManagement/SET_STATE', { dataLoading: true });
  if (toRoute.name !== fromRoute.name) {
    store.dispatch('preparePage');
  }
  const facilityId = toRoute.params.facility_id || store.getters.activeFacilityId;
  const shouldResolve = samePageCheckGenerator(store);
  return FacilityUserResource.fetchCollection({
    getParams: pickBy({
      member_of: facilityId,
      page: toRoute.query.page || 1,
      page_size: toRoute.query.page_size || 30,
      search: toRoute.query.search && toRoute.query.search.trim(),
      user_type: toRoute.query.user_type,
    }),
    force: true,
  })
    .then(users => {
      if (shouldResolve()) {
        store.commit('userManagement/SET_STATE', {
          facilityUsers: users.results.map(_userState),
          totalPages: users.total_pages,
          usersCount: users.count,
        });
      }
      store.commit('userManagement/SET_STATE', { dataLoading: false });
      store.dispatch('notLoading');
    })
    .catch(error => {
      shouldResolve() ? store.dispatch('handleApiError', { error, reloadOnReconnect: true }) : null;
      store.commit('userManagement/SET_STATE', { dataLoading: false });
      store.dispatch('notLoading');
    });
}
