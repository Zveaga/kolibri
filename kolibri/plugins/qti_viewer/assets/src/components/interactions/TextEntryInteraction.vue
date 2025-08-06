<template>

  <input
    v-model="variable"
    class="qti-text-entry-interaction"
    :placeholder="placeholder"
    :disabled="!interactive"
    :style="{
      minWidth: `${expectedLength ?? 20}ch`,
      width: `${variable.length}ch`,
    }"
  >

</template>


<script>

  import { computed, inject } from 'vue';
  import useTypedProps from '../../composables/useTypedProps';
  import {
    NumberProp,
    QTIIdentifierProp,
    NonNegativeIntProp,
    StringProp,
    FormatProp,
  } from '../../utils/props';

  export default {
    name: 'TextEntryInteraction',
    tag: 'qti-text-entry-interaction',

    setup(props) {
      const responses = inject('responses');
      const typedProps = useTypedProps(props);
      const interactive = inject('interactive');

      const variable = computed({
        get() {
          const v = responses[typedProps.responseIdentifier.value];
          return v.value || '';
        },
        set(newValue) {
          const v = responses[typedProps.responseIdentifier.value];
          v.value = newValue;
        },
      });

      return {
        variable,
        placeholder: typedProps.placeholderText,
        interactive,
      };
    },
    props: {
      /* eslint-disable vue/no-unused-properties */
      responseIdentifier: QTIIdentifierProp(true),
      base: NumberProp(false),
      stringIdentifier: QTIIdentifierProp(false),
      expectedLength: NonNegativeIntProp(false),
      patternMask: StringProp(false),
      placeholderText: StringProp(false),
      format: FormatProp(false),
      /* eslint-enable */
    },
  };

</script>
