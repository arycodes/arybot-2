import katex from 'katex';

export default function convertLatexToHTML(text) {
    let html = text.replace(/\$\$(.*?)\$\$/gs, (_, expr) => {
        return katex.renderToString(expr, { displayMode: true });
    });

    html = html.replace(/\$(.*?)\$/gs, (_, expr) => {
        return katex.renderToString(expr, { displayMode: false });
    });

    return html;
}
