<template>

  <KCard
    :to="to"
    :headingLevel="headingLevel"
    :orientation="windowBreakpoint === 0 ? 'vertical' : 'horizontal'"
    thumbnailDisplay="large"
    :title="contentNode.title"
    :thumbnailSrc="thumbnailSrc"
    thumbnailAlign="right"
    thumbnailScaleType="contain"
    style="min-height: 160px"
  >
    <template #thumbnailPlaceholder>
      <div class="default-resource-icon">
        <LearningActivityIcon :kind="contentNode.learning_activities" />
      </div>
    </template>
    <template #belowTitle>
      <div>
        <KTextTruncator
          v-if="contentNode.description"
          :text="contentNode.description"
          :maxLines="2"
          style="margin-bottom: 0.5rem"
        />
        <slot name="belowTitle"></slot>
        <MetadataChips :tags="metadataTags" />
      </div>
    </template>
    <template #footer>
      <div class="default-icon">
        <KIconButton
          :icon="isBookmarked ? 'bookmark' : 'bookmarkEmpty'"
          size="mini"
          :color="$themePalette.grey.v_700"
          :ariaLabel="coreString('savedFromBookmarks')"
          :tooltip="coreString('savedFromBookmarks')"
          @click.stop="$emit('toggleBookmark', contentNode.id)"
        />
      </div>
    </template>
    <template #select>
      <slot name="select"></slot>
    </template>
  </KCard>

</template>


<script>

  import { toRefs } from 'vue';
  import { validateLinkObject } from 'kolibri/utils/validators';
  import commonCoreStrings from 'kolibri/uiText/commonCoreStrings';
  import MetadataChips from 'kolibri-common/components/MetadataChips';
  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import { useCoachMetadataTags } from 'kolibri-common/composables/useCoachMetadataTags';
  import LearningActivityIcon from './../ResourceDisplayAndSearch/LearningActivityIcon.vue';

  export default {
    name: 'AccessibleResourceCard',
    components: {
      LearningActivityIcon,
      MetadataChips,
    },
    mixins: [commonCoreStrings],
    setup(props) {
      const { contentNode } = toRefs(props);
      const { getResourceTags } = useCoachMetadataTags(contentNode.value);
      const { windowBreakpoint } = useKResponsiveWindow();
      return {
        metadataTags: getResourceTags(),
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
      isBookmarked: {
        type: Boolean,
        default: false,
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

  /deep/ .k-horizontal-with-large-thumbnail {
    .k-upper-card-area {
      display: flex;
      flex-direction: row;
      align-items: flex-start;
      justify-content: space-between;
    }

    .k-below-title {
      padding: 0;
    }

    .k-around-title {
      width: 75%;
      padding-bottom: 0;
    }

    .k-footer {
      width: 75%;
      padding: 0 0.5rem 0.5rem 0;
    }

    .k-thumbnail {
      width: 25%;
      margin: 0;
    }
  }

  .default-resource-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    max-height: 160px;
    font-size: 48px;
  }

  .default-icon {
    text-align: right;

    .button {
      width: 32px !important;
      height: 32px !important;
      line-height: 0px;
    }
  }

</style>
