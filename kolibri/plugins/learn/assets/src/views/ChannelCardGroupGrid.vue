<template>

  <KGrid gutter="16">
    <KGridItem
      v-for="(content, index) in contents"
      :key="content.id"
      :layout="{ span: layoutSpan }"
    >
      <ChannelCard
        v-if="index === 0"
        data-onboarding-id="firstChannelCard"
        :isFirst="true"
        :isMobile="windowIsSmall"
        :title="content.title || content.name"
        :thumbnail="content.thumbnail"
        :tagline="content.tagline || content.description"
        :numCoachContents="content.num_coach_contents"
        :link="genContentLinkBackLinkCurrentPage(content.id, false, deviceId)"
        :isRemote="isRemote"
      />
      <ChannelCard
        v-else
        :isMobile="windowIsSmall"
        :title="content.title || content.name"
        :thumbnail="content.thumbnail"
        :tagline="content.tagline || content.description"
        :isFirst="false"
        :numCoachContents="content.num_coach_contents"
        :link="genContentLinkBackLinkCurrentPage(content.id, false, deviceId)"
        :isRemote="isRemote"
      />
    </KGridItem>
    <slot></slot>
  </KGrid>

</template>


<script>

  import useKResponsiveWindow from 'kolibri-design-system/lib/composables/useKResponsiveWindow';
  import { validateObject } from 'kolibri/utils/objectSpecs';
  import useTour from 'kolibri-common/composables/useTour';
  import { onMounted, nextTick } from 'vue';
  import useCardLayoutSpan from '../composables/useCardLayoutSpan';
  import useContentLink from '../composables/useContentLink';
  import ChannelCard from './ChannelCard';

  export default {
    name: 'ChannelCardGroupGrid',
    components: {
      ChannelCard,
    },
    setup() {
      const { genContentLinkBackLinkCurrentPage } = useContentLink();
      const { windowIsSmall } = useKResponsiveWindow();
      const { layoutSpan } = useCardLayoutSpan();
      const { registerStep } = useTour();

      onMounted(async () => {
        await nextTick();
        registerStep({
          key: 'firstChannelCard',
          content: 'Channels are collections of videos, exercises, and other learning resources.',
          stepIndex: 1,
        });
      });

      return {
        genContentLinkBackLinkCurrentPage,
        windowIsSmall,
        layoutSpan,
        registerStep,
      };
    },
    props: {
      contents: {
        type: Array,
        required: true,
        validator(contents) {
          return contents.every(content =>
            validateObject(content, {
              id: { type: String, required: true },
              title: { type: String, required: false, default: '' },
              name: { type: String, required: false, default: '' },
              thumbnail: { type: String, required: false, default: '' },
              tagline: { type: String, required: false, default: '' },
              description: { type: String, required: false, default: '' },
              num_coach_contents: { type: Number, required: false, default: 0 },
            }),
          );
        },
      },
      deviceId: {
        type: String,
        required: false,
        default: null,
      },
      isRemote: {
        type: Boolean,
        default: false,
      },
    },
  };

</script>


<style lang="scss" scoped>

  .grid {
    padding-top: 8px;
  }

</style>
