import DOMPurify from 'dompurify';
import './style.scss';
import SafeHtmlTable from './SafeHtmlTable.js';

const ALLOWED_URI_REGEXP = /^(?:(?:blob:https?|data):|[^a-z]|[a-z+.-]+(?:[^a-z+.\-:]|$))/i;
const FORBID_TAGS = ['style', 'link'];
const FORBID_ATTR = ['style'];

const parser = new DOMParser();

DOMPurify.setConfig({
  FORBID_TAGS,
  ALLOWED_URI_REGEXP,
  FORBID_ATTR,
  KEEP_CONTENT: false,
});

export default {
  name: 'SafeHTML',
  functional: true,
  props: {
    html: {
      required: true,
      type: String,
    },
    styleOverrides: {
      type: Object,
      default: () => ({}),
    },
  },
  render(h, context) {
    const sanitizedHTML = DOMPurify.sanitize(context.props.html);

    // Create temporary container to parse HTML
    const doc = parser.parseFromString(sanitizedHTML, 'text/html');

    let tableCounter = 0;

    function mapNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const attributes = {};
        for (const attr of node.attributes) {
          attributes[attr.name] = attr.value;
        }
        attributes.class = 'safe-html';

        if (tag === 'table') {
          tableCounter += 1;
          return h(SafeHtmlTable, {
            props: {
              node,
              attributes,
              tableCounter,
              windowSizeClass: context.props.styleOverrides
                ? context.props.styleOverrides.windowSizeClass
                : '',
              mapNode,
              mapChildren,
            },
          });
        }
        return h(tag, { attrs: attributes }, mapChildren(node.childNodes));
      } else if (node.nodeType === Node.TEXT_NODE) {
        return node.textContent;
      }
      return null;
    }

    function mapChildren(childNodes) {
      return Array.from(childNodes).map(mapNode).filter(Boolean);
    }

    return mapChildren(doc.body.childNodes);
  },
};
