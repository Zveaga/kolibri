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
      data-focus="true"
      aria-multiselectable="true"
      :style="{ outline: 'none' }"
      :aria-labelledby="ariaLabelledby"
      :aria-activedescendant="getElementOptionId(focusedOption)"
      @focus="onListFocus"
      @blur="onListBlur"
      @keydown="handleKeydown"
    >
      <li
        v-for="option in options"
        :id="getElementOptionId(option)"
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
            ...(isOptionFocused(option) ? $coreOutline : {}),
          })
        "
        :aria-selected="isOptionSelected(option)"
        @click="toggleOption(option)"
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

  import { ref, computed, toRefs, getCurrentInstance } from 'vue';
  import { validateObject } from 'kolibri/utils/objectSpecs';

  export default {
    name: 'SelectableList',
    setup(props, { emit }) {
      const { value, options } = toRefs(props);
      const focusedIndex = ref(null);

      const focusedOption = computed(() => {
        if (focusedIndex.value === null || !options.value.length) {
          return null;
        }
        return options.value[focusedIndex.value];
      });

      const instance = getCurrentInstance();
      const uid = instance.proxy._uid;

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

      function isOptionFocused(option) {
        return focusedOption.value?.id === option.id;
      }

      function toggleOption(option) {
        if (!option) {
          return;
        }

        if (isOptionSelected(option)) {
          selectedOptions.value = value.value.filter(id => id !== option.id);
        } else {
          selectedOptions.value = [...value.value, option.id];
        }
      }

      function getElementOptionId(option) {
        if (!option?.id) {
          return null;
        }

        return `sl-option-${uid}-${option.id}`;
      }

      function onListFocus() {
        if (!options.value.length) {
          return;
        }
        focusedIndex.value = 0;
      }

      function onListBlur() {
        focusedIndex.value = null;
      }

      function handleFocusNavigation(key) {
        const diff = key === 'ArrowDown' ? 1 : -1;
        // adding options.length and using modulo to wrap around
        // enables circular navigation
        focusedIndex.value =
          (focusedIndex.value + diff + options.value.length) % options.value.length;
      }

      function handleKeydown(event) {
        if (!options.value.length) {
          return;
        }

        const { key } = event;

        switch (key) {
          case 'ArrowDown':
          case 'ArrowUp':
            handleFocusNavigation(key);
            break;
          case 'Home':
            focusedIndex.value = 0;
            break;
          case 'End':
            focusedIndex.value = options.value.length - 1;
            break;
          case ' ':
            toggleOption(focusedOption.value);
            break;
          default:
            // Early return for unsupported keys so that we don't prevent default behavior
            return;
        }

        event.preventDefault();
      }

      return {
        onListBlur,
        onListFocus,
        toggleOption,
        focusedOption,
        isOptionFocused,
        isOptionSelected,
        getElementOptionId,
        handleKeydown,
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
