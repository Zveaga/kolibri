import { ref } from 'vue';
import useLearningActivities from 'kolibri-common/composables/useLearningActivities';
import { ActivitiesLookup, ContentNodeKinds, LearningActivities } from 'kolibri/constants';
import { coreString, coreStrings } from 'kolibri/uiText/commonCoreStrings';

/**
 * Create a tag Object
 * @param {string} label - text to display
 * @param {string} key - unique key for the tag - should map to le-utils constants
 * @param {string} icon - icon to display (mapping to KIcon)
 */
function createTag(label, key, icon) {
  return {
    label,
    key,
    icon,
  };
}

export function useCoachMetadataTags(contentNode) {
  const { durationEstimation } = useLearningActivities(contentNode);

  const tags = ref([]);

  function getKindTag() {
    if (contentNode.kind === ContentNodeKinds.CHANNEL) {
      return createTag(coreStrings.$tr('channel'), 'channel');
    }
    if (contentNode.kind === ContentNodeKinds.TOPIC) {
      return createTag(coreStrings.$tr('folder'), 'folder', 'topic');
    }
  }

  const getCategoryTags = () => {
    if (!contentNode.categories) return [];
    return contentNode.categories.map(category => createTag(coreString(category), category));
  };

  const getLevelTags = () => {
    if (!contentNode.grade_levels) return [];
    return contentNode.grade_levels.map(grade_levels =>
      createTag(coreString(grade_levels), grade_levels),
    );
  };

  const getLanguageTag = () => {
    if (!contentNode.lang) return [];
    return createTag(contentNode.lang.lang_name, contentNode.lang.id);
  };

  const getActivityTags = () => {
    if (!contentNode.learning_activities) return [];

    if (contentNode.learning_activities.length > 1) {
      return createTag(
        coreStrings.$tr('multipleLearningActivities'),
        'multipleLearningActivities',
        'allActivities',
      );
    } else {
      return contentNode.learning_activities.map(activity => {
        let icon;
        if (activity === LearningActivities.EXPLORE) {
          icon = 'interactSolid';
        } else {
          icon = ActivitiesLookup[activity].toLowerCase() + 'Solid';
        }
        return createTag(coreString(activity), activity, icon);
      });
    }
  };

  const getDurationTag = () => {
    if (!contentNode.duration) return [];
    return [createTag(durationEstimation.value, contentNode.duration)];
  };

  const getSpecificCategoryTag = () => {
    if (!contentNode.categories) return [];
    const specificCategories = contentNode.categories.filter(
      category => category.split('.').length > 2,
    );
    return specificCategories.map(category => createTag(coreString(category), category));
  };

  const getFolderTags = () => {
    return [getKindTag()];
  };

  const getResourceTags = () => {
    return [...getActivityTags(), ...getDurationTag(), ...getCategoryTags()];
  };

  if (
    contentNode.kind === ContentNodeKinds.CHANNEL ||
    contentNode.kind === ContentNodeKinds.TOPIC
  ) {
    tags.value = [
      getKindTag(),
      ...getCategoryTags().slice(0, 3),
      ...getLevelTags().slice(0, 3),
      getLanguageTag(),
    ];
  } else {
    tags.value = [
      ...getActivityTags(),
      //getDurationTag(),
      ...getLevelTags(),
      ...getSpecificCategoryTag(),
      getLanguageTag(),
    ].slice(0, 3);
  }

  return {
    tags,
    getFolderTags,
    getResourceTags,
  };
}
