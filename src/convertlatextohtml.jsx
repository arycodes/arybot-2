import katex from "katex";
import "katex/dist/katex.min.css";

export default function convertLatexToHTML(text) {
  const codeBlockRegex = /(```[\s\S]*?```|`[^`]+`)/g;
  const segments = [];
  let lastIndex = 0;
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      const before = text.slice(lastIndex, match.index);
      segments.push(renderLatex(before));
    }

    const code = match[0]
      .replace(/^```(\w+)?/, "")
      .replace(/```$/, "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
    segments.push(`<pre><code>${code}</code></pre>`);

    lastIndex = codeBlockRegex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push(renderLatex(text.slice(lastIndex)));
  }

  return segments.join("");
}

function renderLatex(text) {
  return text.replace(
    /\$\$(.*?)\$\$|\$(.*?)\$/gs,
    (match, blockMath, inlineMath) => {
      try {
        return katex.renderToString(blockMath || inlineMath, {
          displayMode: !!blockMath,
          throwOnError: false,
        });
      } catch {
        return match;
      }
    }
  );
}
