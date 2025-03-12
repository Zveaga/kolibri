import useLearningActivities from 'kolibri-common/composables/useLearningActivities';
import { ActivitiesLookup, ContentNodeKinds, LearningActivities } from 'kolibri/constants';
import { coreString, coreStrings } from 'kolibri/uiText/commonCoreStrings';

/**
 * Create a tag Object that can be used to display metadata
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

  /*
   * These are unused for now due to design decisions as we're only
   * showing up to 3 tags on a resource card (in coach) - these may
   * be useful in the future.
  const getLevelTags = () => {
    if (!contentNode.grade_levels) return [];
    return contentNode.grade_levels.map(grade_levels =>
      createTag(coreString(grade_levels), grade_levels),
    );
  };

  const getLanguageTag = () => {
    return createTag(contentNode.lang.lang_name, contentNode.lang.id);
  };
  */

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

  const getFolderTags = () => {
    return [getKindTag()];
  };

  const getResourceTags = () => {
    return [...getActivityTags(), ...getDurationTag(), ...getCategoryTags()];
  };

  // Placeholder for possible need to handle lanugage tags gracefully
  const getChannelTags = () => {
    return getResourceTags();
  };

  return {
    getChannelTags,
    getFolderTags,
    getResourceTags,
  };
}
