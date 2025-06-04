<template>

  <div
    class="selectable-list"
    :style="{
      borderColor: $themeTokens.fineLine,
    }"
  >
    <ul
      class="list-options"
      tabindex="0"
      role="listbox"
      :aria-labelledby="ariaLabelledby"
    >
      <li
        v-for="option in options"
        :key="option.id"
        role="option"
        class="list-option"
        :class="
          $computedClass({
            ':hover': {
              backgroundColor: $themePalette.grey.v_100,
            },
            ':not(:last-child)': {
              borderBottom: '1px solid ' + $themeTokens.fineLine,
            },
          })
        "
        :aria-selected="isOptionSelected(option)"
        @click="toggleOption(option)"
        @keydown.enter="toggleOption(option)"
        @keydown.space="toggleOption(option)"
      >
        <KCheckbox
          unfocusable
          :checked="isOptionSelected(option)"
          :label="option.label"
        />
      </li>
    </ul>
  </div>

</template>


<script>

  import { computed, toRefs } from 'vue';
  import { validateObject } from 'kolibri/utils/objectSpecs';

  export default {
    name: 'SelectableList',
    setup(props, { emit }) {
      const { value } = toRefs(props);

      const selectedOptions = computed({
        get() {
          return value.value;
        },
        set(newValue) {
          emit('input', newValue);
        },
      });

      function isOptionSelected(option) {
        return selectedOptions.value.includes(option.id);
      }

      function toggleOption(option) {
        if (isOptionSelected(option)) {
          selectedOptions.value = value.value.filter(id => id !== option.id);
        } else {
          selectedOptions.value = [...value.value, option.id];
        }
      }

      return {
        toggleOption,
        isOptionSelected,
      };
    },
    props: {
      value: {
        type: Array,
        required: true,
      },
      options: {
        type: Array,
        required: true,
        validator: options =>
          validateObject(
            { options },
            {
              options: {
                type: Array,
                required: true,
                spec: {
                  id: { type: String, required: true },
                  label: { type: String, required: true },
                },
              },
            },
          ),
      },
      ariaLabelledby: {
        type: String,
        required: true,
      },
    },
  };

</script>


<style lang="scss" scoped>

  .selectable-list {
    border: 1px solid;
    border-radius: 4px;
  }

  .list-options {
    padding: 0;
    margin: 0;
    list-style: none;
  }

  .list-option {
    display: flex;
    align-items: center;
    padding: 0 10px;
    cursor: pointer;
  }

</style>
