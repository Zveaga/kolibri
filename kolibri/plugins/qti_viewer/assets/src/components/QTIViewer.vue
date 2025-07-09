<template>

  <div class="qti-viewer">
    <KCircularLoader v-if="loading" />
  </div>

</template>


<script>

  import { computed, ref, watch } from 'vue';
  import logger from 'kolibri-logging';
  import useContentViewer, { contentViewerProps } from 'kolibri/composables/useContentViewer';
  import useQTIResource from '../composables/useQTIResource';
  import { loadQTIPackage, parseXML } from '../utils/xml';

  const logging = logger.getLogger(__filename);

  export default {
    name: 'QTIViewer',
    __usesContentViewerComposable: true,
    setup(props, context) {
      const { defaultFile, reportLoadingError } = useContentViewer(props, context);
      const packageLoading = ref(true);
      // Store resources by identifier
      const resourcesMap = ref({});

      const fileUrl = computed(() => {
        return defaultFile.value?.storage_url;
      });

      // Reactively get current resource based on itemId
      const currentResource = computed(() => {
        return resourcesMap.value[props.itemId] || null;
      });

      const resourceUrl = computed(() => currentResource.value?.href);
      // If itemData is provided, we only support injecting AssessmentItem XML
      const resourceType = computed(() =>
        props.itemData ? 'imsqti_item_xmlv3p0' : currentResource.value?.type,
      );

      const {
        xmlDoc: resourceXmlDoc,
        loading: resourceLoading,
        error: resourceError,
      } = useQTIResource(resourceUrl);

      const xmlDoc = computed(() => {
        // If itemData is provided, use it directly
        if (props.itemData) {
          return parseXML(props.itemData);
        }
        // Otherwise, use the resource XML document
        return resourceXmlDoc.value;
      });

      const loading = computed(() => {
        if (props.itemData) {
          return false;
        }
        return packageLoading.value || resourceLoading.value;
      });

      // Load and parse the QTI package
      async function load() {
        const url = fileUrl.value;
        if (!url) {
          return;
        }

        try {
          packageLoading.value = true;
          // Update the resources map
          resourcesMap.value = await loadQTIPackage(url);
        } catch (err) {
          logging.error('Error loading QTI package:', err);
          reportLoadingError(err);
        } finally {
          packageLoading.value = false;
        }
      }

      // Watch for resource loading errors
      watch(resourceError, err => {
        if (err) {
          reportLoadingError(err);
        }
      });

      // Watch for file changes
      watch(fileUrl, () => {
        load();
      });

      // Initial load
      load();

      return {
        loading,
        /* eslint-disable vue/no-unused-properties */
        xmlDoc,
        resourceType,
        /* eslint-enable */
      };
    },
    props: contentViewerProps,
  };

</script>


<style lang="scss">

  @import '../styles/qti-v3-core';

</style>
