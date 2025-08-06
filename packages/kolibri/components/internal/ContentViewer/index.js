import { VIEWER_SUFFIX } from 'kolibri/constants';
import heartbeat from 'kolibri/heartbeat';
import { canRenderContent, getRenderableFiles, getDefaultFile, getFilePreset } from './utils';
import ContentViewerError from './ContentViewerError';

const interactionEvents = [
  'answerGiven',
  'hintTaken',
  'itemError',
  'interaction',
  'addProgress',
  'updateProgress',
  'updateContentState',
  'startTracking',
  'navigateTo',
  'finished',
];

function combineEventListeners(existing, newListener) {
  if (!existing) {
    return newListener;
  }

  if (Array.isArray(existing)) {
    return [...existing, newListener];
  }

  return [existing, newListener];
}

export default {
  functional: true,
  render: function (createElement, context) {
    const defaultItemPreset = getFilePreset(
      getDefaultFile(getRenderableFiles(context.props.files || [])),
      context.props.preset,
    );
    if (canRenderContent(defaultItemPreset)) {
      const combinedListeners = {
        ...context.listeners,
        ...context.data.on,
      };
      for (const event of interactionEvents) {
        combinedListeners[event] = combineEventListeners(
          combinedListeners[event],
          heartbeat.setUserActive,
        );
      }

      return createElement(
        defaultItemPreset + VIEWER_SUFFIX,
        {
          ...context.data,
          props: context.props,
          on: combinedListeners,
        },
        context.children,
      );
    }
    return createElement(ContentViewerError);
  },
};
