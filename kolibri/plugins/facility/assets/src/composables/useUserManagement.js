import { ref, watch } from 'vue';
import store from 'kolibri/store';
import pickBy from 'lodash/pickBy';
import samePageCheckGenerator from 'kolibri-common/utils/samePageCheckGenerator';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import { _userState } from '../modules/mappers';

// Sort users by a given column and order with no regards to case sensitivity
function sortUsers(users, columnId, sortOrder) {
  if (!columnId || !sortOrder) {
    return users;
  }
  return users.sort(
    (a, b) =>
      a[columnId].localeCompare(b[columnId], undefined, { sensitivity: 'base' }) *
      (sortOrder === 'desc' ? -1 : 1),
  );
}

export default function useUserManagement(route, activeFacilityId) {
  const facilityUsers = ref([]);
  const totalPages = ref(0);
  const usersCount = ref(0);
  const dataLoading = ref(false);
  // query params
  const page = ref(Number(route.value.query.page) || 1);
  const pageSize = ref(Number(route.value.query.page_size) || 30);
  const ordering = ref(route.value.query?.ordering || null);
  const order = ref(route.value.query?.order || '');
  const search = ref(route.value.query?.search || '');
  const userType = ref(route.value.query?.user_type || null);

  const fetchUsers = async ({ sorted = false } = {}) => {
    dataLoading.value = true;
    const shouldResolve = samePageCheckGenerator(store);
    try {
      const resp = await FacilityUserResource.fetchCollection({
        getParams: pickBy({
          member_of: activeFacilityId,
          page: page.value,
          page_size: pageSize.value,
          search: search.value.trim() || '',
          user_type: userType.value,
        }),
        force: true,
      });
      if (shouldResolve()) {
        facilityUsers.value = resp.results.map(_userState);
        if (sorted && ordering.value && order.value) {
          facilityUsers.value = sortUsers(facilityUsers.value, ordering.value, order.value);
        }
        totalPages.value = resp.total_pages;
        usersCount.value = resp.count;
      }
    } catch (error) {
      if (shouldResolve()) {
        store.dispatch('handleApiError', { error, reloadOnReconnect: true });
      }
    } finally {
      dataLoading.value = false;
      store.dispatch('notLoading');
    }
  };

  // re-running fetchUsers whenever the relevant query‐params change
  watch(
    () => [
      route.value.query.page,
      route.value.query.page_size,
      route.value.query.search,
      route.value.query.user_type,
    ],
    ([newPage, newPageSize, newSearch, newUserType]) => {
      page.value = Number(newPage) || 1;
      pageSize.value = Number(newPageSize) || 30;
      search.value = newSearch || '';
      userType.value = newUserType || null;
      fetchUsers({ sorted: Boolean(ordering.value && order) });
    },
    { immediate: true },
  );

  const setSort = (columnId, sortOrder) => {
    ordering.value = columnId || null;
    order.value = sortOrder || '';
    if (ordering.value && order.value) {
      facilityUsers.value = sortUsers(facilityUsers.value, ordering.value, order.value);
    }
  };

  return {
    facilityUsers,
    totalPages,
    usersCount,
    dataLoading,
    page,
    pageSize,
    ordering,
    order,
    search,
    userType,
    // methods
    fetchUsers,
    setSort,
  };
}
