import DOMPurify from 'dompurify';
import './style.scss';

const ALLOWED_URI_REGEXP = /^blob:https?:/i;
const FORBID_TAGS = ['style', 'link'];
const FORBID_ATTR = ['style'];

const parser = new DOMParser();

DOMPurify.setConfig({
  FORBID_TAGS,
  ALLOWED_URI_REGEXP,
  FORBID_ATTR,
  KEEP_CONTENT: false,
});

DOMPurify.addHook('uponSanitizeAttribute', (node, data) => {
  if ((node.nodeName === 'TD' || node.nodeName === 'TH') && data.attrName === 'colspan') {
    data.forceKeepAttr = true;
  }
});

export default {
  name: 'SafeHTML',
  functional: true,
  props: {
    html: {
      required: true,
      type: String,
    },
    windowSizeClass: {
      required: true,
      type: String,
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
          const captionId = `table-caption-${tableCounter}`;
          const children = [];
          for (const childNode of node.childNodes) {
            if (
              childNode.nodeType === Node.ELEMENT_NODE &&
              childNode.tagName.toLowerCase() === 'caption'
            ) {
              const captionAttrs = {};
              for (const attr of childNode.attributes) {
                captionAttrs[attr.name] = attr.value;
              }
              // Inject the captionId into captions
              captionAttrs.id = captionId;
              captionAttrs.class = 'safe-html' + context.props.windowSizeClass;
              children.push(
                h('caption', { attrs: captionAttrs }, mapChildren(childNode.childNodes)),
              );
            } else {
              children.push(mapNode(childNode));
            }
          }

          const firstRow = node.querySelector('tr');
          const colCount = firstRow ? firstRow.children.length : 0;
          let tableWidth = '640px';
          if (colCount > 3) {
            tableWidth = `${colCount * 200}px`;
          }

          return h(
            // Wrap tables in an accessible container
            'div',
            {
              class: 'table-container',
              attrs: { role: 'region', 'aria-labelledby': captionId },
            },
            [h(tag, { attrs: attributes, style: { width: tableWidth } }, children)],
          );
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
