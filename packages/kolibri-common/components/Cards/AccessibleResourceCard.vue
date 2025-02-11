<template>

  <KCard
    :to="to"
    :headingLevel="headingLevel"
    :orientation="windowBreakpoint === 0 ? 'vertical' : 'horizontal'"
    thumbnailDisplay="small"
    :title="contentNode.title"
    :thumbnailSrc="thumbnailSrc"
    thumbnailAlign="right"
    :thumbnailScaleType="thumbnailScaleType"
  >
    <template #thumbnailPlaceholder>
      <div class="default-resource-icon">
        <LearningActivityIcon :kind="contentNode.learning_activities" />
      </div>
    </template>
    <template #belowTitle>
      <div>
        <KTextTruncator
          :text="contentNode.description"
          :maxLines="2"
        />
        <MetadataChips :tags="metadataTags" />
      </div>
    </template>
    <template #select>
      <slot name="select"></slot>
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
      thumbnailScaleType: {
        type: String,
        default: 'centerInside',
      },
    },
  };

</script>


<style lang="scss" scoped>

  .default-resource-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 48px;
  }

  .default-icon {
    text-align: right;
  }

</style>
