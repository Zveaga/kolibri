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
  >
    <template #thumbnailPlaceholder>
      <div class="default-folder-icon">
        <KIcon
          icon="topic"
          :color="$themePalette.grey.v_700"
          style="top: 0"
        />
      </div>
    </template>

    <template #belowTitle>
      <slot name="belowTitle"></slot>
      <MetadataChips :tags="metadataTags" />
    </template>

    <template #select>
      <slot name="select"></slot>
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
  };

</script>


<style lang="scss" scoped>

  /deep/ .k-horizontal-with-small-thumbnail {
    .k-upper-card-area {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }

    .k-around-title {
      width: 75%;
      padding-bottom: 0;
    }

    .k-footer {
      width: 75%;
    }

    .k-thumbnail {
      width: 25%;
      margin: 0 !important;
      border-top-left-radius: 0;
      border-bottom-left-radius: 0;
    }
  }

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
    font-size: 48px;
  }

</style>
