import { ref, computed, getCurrentInstance, watch } from 'vue';
import pickBy from 'lodash/pickBy';
import FacilityUserResource from 'kolibri-common/apiResources/FacilityUserResource';
import { _userState } from '../modules/mappers';

export default function useUserManagement(activeFacilityId) {
  const facilityUsers = ref([]);
  const totalPages = ref(0);
  const usersCount = ref(0);
  const dataLoading = ref(false);
  const store = getCurrentInstance().proxy.$store;
  const route = computed(() => store.state.route);
  // query params
  const page = computed(() => Number(route.value.query.page) || 1);
  const pageSize = computed(() => Number(route.value.query.page_size) || 30);
  const ordering = computed(() => route.value.query.ordering || null);
  const order = computed(() => route.value.query.order || '');
  const search = computed(() => route.value.query.search || null);
  const userType = computed(() => route.value.query.user_type || null);

  const fetchUsers = async () => {
    dataLoading.value = true;
    try {
      const resp = await FacilityUserResource.fetchCollection({
        getParams: pickBy({
          member_of: activeFacilityId,
          page: page.value,
          page_size: pageSize.value,
          search: search.value?.trim() || null,
          ordering: order.value === 'desc' ? `-${ordering.value}` : ordering.value || null,
          user_type: userType.value,
        }),
        force: true,
      });
      facilityUsers.value = resp.results.map(_userState);
      totalPages.value = resp.total_pages;
      usersCount.value = resp.count;
    } catch (error) {
      store.dispatch('handleApiError', { error, reloadOnReconnect: true });
    } finally {
      dataLoading.value = false;
      store.dispatch('notLoading');
    }
  };

  // re-running fetchUsers whenever the relevant query params change
  watch(
    () => [page.value, pageSize.value, search.value, userType.value, ordering.value, order.value],
    () => {
      fetchUsers();
    },
    { immediate: true },
  );

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
  };
}
