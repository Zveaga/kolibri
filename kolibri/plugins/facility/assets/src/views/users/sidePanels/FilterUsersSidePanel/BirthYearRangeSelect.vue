<template>

  <div class="birth-year-range-select">
    <BirthYearSelect
      v-model="startYear"
      clearable
      class="birthyear-select"
      :showInfoIcon="false"
      :label="fromLabel$()"
      :excludeNotSpecified="true"
    />
    <BirthYearSelect
      v-model="endYear"
      clearable
      class="birthyear-select"
      :showInfoIcon="false"
      :label="upToLabel$()"
      :excludeNotSpecified="true"
    />
  </div>

</template>


<script>

  import { validateObject } from 'kolibri/utils/objectSpecs';
  import BirthYearSelect from 'kolibri-common/components/userAccounts/BirthYearSelect.vue';
  import { computed } from 'vue';
  import { bulkUserManagementStrings } from 'kolibri-common/strings/bulkUserManagementStrings';

  export default {
    name: 'BirthYearRangeSelect',
    components: {
      BirthYearSelect,
    },
    setup(props) {
      const { fromLabel$, upToLabel$ } = bulkUserManagementStrings;
      const startYear = computed({
        get: () => props.value.start,
        set: value => {
          props.$emit('update:value', { ...props.value, start: value });
        },
      });
      const endYear = computed({
        get: () => props.value.end,
        set: value => {
          props.$emit('update:value', { ...props.value, end: value });
        },
      });
      return {
        startYear,
        endYear,
        fromLabel$,
        upToLabel$,
      };
    },
    props: {
      value: {
        type: Object,
        required: true,
        validator: value =>
          validateObject(value, {
            start: {
              type: Number,
              required: false,
              default: null,
            },
            end: {
              type: Number,
              required: false,
              default: null,
            },
          }),
      },
    },
  };

</script>


<style lang="scss" scoped>

  .birth-year-range-select {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;

    .birthyear-select {
      width: 100%;
    }
  }

</style>
