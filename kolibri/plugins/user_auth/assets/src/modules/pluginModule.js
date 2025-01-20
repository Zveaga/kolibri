import Lockr from 'lockr';
import { get } from '@vueuse/core';
import useUser from 'kolibri/composables/useUser';
import useFacilities from 'kolibri-common/composables/useFacilities';
import { ComponentMap, pageNameToModuleMap } from '../constants';
import signIn from './signIn';

export default {
  state() {
    return {
      facilityId: Lockr.get('facilityId') || null,
      pageName: '',
      appBarTitle: '',
    };
  },
  actions: {
    reset(store) {
      store.commit('CORE_SET_PAGE_LOADING', false);
      store.commit('CORE_SET_ERROR', null);
    },
    setFacilitiesAndConfig(store) {
      const { getFacilities, getFacilityConfig } = useFacilities();
      return getFacilities().then(() => {
        return getFacilityConfig(store.getters.selectedFacility.id);
      });
    },
    resetModuleState(store, { toRoute, fromRoute }) {
      const moduleName = pageNameToModuleMap[fromRoute.name];
      if (toRoute.name === ComponentMap.SIGN_UP && fromRoute.name === ComponentMap.SIGN_UP) {
        return;
      }
      if (moduleName) {
        store.commit(`${moduleName}/RESET_STATE`);
      }
    },
    setFacilityId(store, { facilityId }) {
      const { getFacilityConfig } = useFacilities();
      store.commit('SET_FACILITY_ID', facilityId);
      return getFacilityConfig(facilityId);
    },
  },
  getters: {
    // Return the facility that was last selected or fallback to the default facility.

    selectedFacility(state) {
      const { facilities } = useFacilities();
      const selectedFacility = facilities.find(f => f.id === state.facilityId);
      if (selectedFacility) {
        return selectedFacility;
      } else {
        const { userFacilityId } = useUser();
        return facilities.find(f => f.id === get(userFacilityId)) || null;
      }
    },
  },
  mutations: {
    SET_PAGE_NAME(state, name) {
      state.pageName = name;
    },
    SET_FACILITY_ID(state, facilityId) {
      Lockr.set('facilityId', facilityId);
      state.facilityId = facilityId;
    },
  },
  modules: {
    signIn,
  },
};
