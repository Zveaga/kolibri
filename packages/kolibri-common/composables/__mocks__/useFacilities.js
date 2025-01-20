const MOCK_DEFAULTS = {
  facilityConfig: {},
  selectedFacility: {},
  facilities: [],
  getFacilities: jest.fn(),
  getFacilityConfig: jest.fn(),
  setFacilityConfig: jest.fn(),
  setFacilities: jest.fn(),
};

export function useFacilitiesMock(overrides = {}) {
  return {
    ...MOCK_DEFAULTS,
    ...overrides,
  };
}

export default jest.fn(() => useFacilitiesMock());
