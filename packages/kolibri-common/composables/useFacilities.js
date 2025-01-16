import { reactive, computed } from 'vue';
import FacilityResource from 'kolibri-common/apiResources/FacilityResource';
import useUser from 'kolibri/composables/useUser';
import redirectBrowser from 'kolibri/utils/redirectBrowser';
import FacilityDatasetResource from 'kolibri-common/apiResources/FacilityDatasetResource';
import Lockr from 'lockr';

const state = reactive({
  error: '',
  facilityConfig: {},
  facilities: [],
  facilityId: Lockr.get('facilityId') || null,
});

export function useFacilities() {
  const { userFacilityId } = useUser();

  const selectedFacility = computed(() => {
    const facilityById = facilities.value.find(f => f.id === state.facilityId);
    if (facilityById) {
      return facilityById;
    }
    return facilities.value.find(f => f.id === userFacilityId.value) || null;
  });

  //getters
  const facilities = computed(() => state.facilities);
  const facilityConfig = computed(() => state.facilityConfig);

  //actions
  async function getFacilities() {
    try {
      const facilities = await FacilityResource.fetchCollection({ force: true });
      state.facilities = facilities;
    } catch (error) {
      state.error = error.message;
    }
  }

  async function getFacilityConfig(facilityId) {
    const facId = facilityId || userFacilityId.value;

    if (!facId) {
      // No facility Id, so redirect and let Kolibri sort it out
      return redirectBrowser();
    }

    let facilityConfig;

    try {
      if (selectedFacility.value && typeof selectedFacility.value.dataset !== 'object') {
        facilityConfig = [selectedFacility.value.dataset];
      } else {
        facilityConfig = await FacilityDatasetResource.fetchCollection({
          getParams: {
            facility_id: facId,
          },
        });
      }

      let config = {};
      const facility = facilityConfig[0];

      if (facility) {
        config = { ...facility };
      }
      setFacilityConfig(config);
    } catch (error) {
      setError(error.message);
      throw error;
    }
  }

  //mutations
  function setFacilityConfig(state, facilityConfig) {
    state.facilityConfig = facilityConfig;
  }

  function setFacilities(state, facilities) {
    state.facilities = facilities;
  }

  function setError(state, error) {
    state.error = error;
  }

  return {
    facilities,
    facilityConfig,
    getFacilities,
    getFacilityConfig,
    setFacilityConfig,
    setFacilities,
    setError,
  };
}
