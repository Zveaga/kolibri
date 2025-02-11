<template>

  <KCard
    :to="to"
    :headingLevel="headingLevel"
    :orientation="windowBreakpoint === 0 ? 'vertical' : 'horizontal'"
    thumbnailDisplay="small"
    :title="contentNode.title"
    :thumbnailSrc="thumbnailSrc"
    thumbnailScaleType="contain"
    thumbnailAlign="right"
    :preserveFooter="true"
  >
    <template #thumbnailPlaceholder>
      <div class="default-folder-icon">
        <KIcon
          icon="topic"
          :color="$themePalette.grey.v_700"
        />
      </div>
    </template>

    <template #belowTitle>
      <slot name="belowTitle"></slot>
      <MetadataChips :tags="metadataTags" />
    </template>
  </KCard>

</template>


<script>

  import { toRefs } from 'vue';
  import { validateLinkObject } from 'kolibri/utils/validators';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import { useCoachMetadataTags } from 'kolibri-common/composables/useCoachMetadataTags';
  import MetadataChips from 'kolibri-common/components/MetadataChips';

  export default {
    name: 'AccessibleFolderCard',
    components: {
      MetadataChips,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const { contentNode } = toRefs(props);
      const { windowBreakpoint } = useKResponsiveWindow();
      const { getFolderTags } = useCoachMetadataTags(contentNode.value);

      return {
        metadataTags: getFolderTags(),
        windowBreakpoint,
      };
    },
    props: {
      to: {
        type: Object,
        required: true,
        validator: validateLinkObject,
      },
      contentNode: {
        type: Object,
        required: true,
      },
      headingLevel: {
        type: Number,
        required: true,
      },
      thumbnailSrc: {
        type: String,
        default: null,
      },
    },
    computed: {
      headerStyles() {
        return {
          color: this.$themeTokens.text,
          borderRadius: '4px',
          height: '24px',
          margin: '0em 1em',
          backgroundColor: this.$themePalette.grey.v_100,
        };
      },
    },
  };

</script>


<style lang="scss" scoped>

  .chips-wrapper {
    display: flex;
    justify-content: space-between;
    height: 38px;
    font-size: 12px;
  }

  .folder-header-bar {
    display: inline-block;
    margin-left: 8px;
    font-size: 16px;
  }

  .folder-header-text {
    display: inline-block;
    padding: 0;
    margin: 4px;
    font-size: 12px;
  }

  .default-folder-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 48px;
  }

</style>
