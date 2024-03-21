import { marked } from 'marked';

function convertMarkdownToHTML(markdown) {
  return marked(markdown);
}

export default convertMarkdownToHTML;
