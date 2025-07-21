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

export default {
  name: 'SafeHTML',
  functional: true,
  props: {
    html: {
      required: true,
      type: String,
    },
  },
  render(h, context) {
    const sanitizedHTML = DOMPurify.sanitize(context.props.html);

    // Create temporary container to parse HTML
    const doc = parser.parseFromString(sanitizedHTML, 'text/html');

    function mapNode(node) {
      if (node.nodeType === Node.ELEMENT_NODE) {
        const tag = node.tagName.toLowerCase();
        const attributes = {};
        for (const attr of node.attributes) {
          attributes[attr.name] = attr.value;
        }
        attributes.class = 'safe-html';
        if (tag === 'table') {
          const firstRow = node.querySelector('tr');
          const colCount = firstRow ? firstRow.children.length : 0;
          let tableWidth = '640px';
          if (colCount > 3) {
            tableWidth = `${colCount * 200}px`;
          }
          return h('div', { class: 'table-responsive' }, [
            h(
              tag,
              { attrs: attributes, style: { width: tableWidth } },
              mapChildren(node.childNodes),
            ),
          ]);
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
