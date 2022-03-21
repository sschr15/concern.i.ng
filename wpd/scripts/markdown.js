/* jslint esversion: 6 */

// A simple program changing (some) Markdown syntax to HTML.

// First: get text in elements with a `markdown` attribute.
const markdownElements = document.querySelectorAll("[markdown]");
const children = document.querySelectorAll("[markdown] > *");

// Then: convert each element's text to HTML.
for (const element of markdownElements) {
    element.innerHTML = markdownToHTML(element.innerHTML);
}

/**
 * Converts (some) Markdown to HTML.
 * @param {String} markdown the text to convert
 */
function markdownToHTML(markdown) {
    // first remove whatever large indentation might be in the text
    // because html go brr
    // const firstLine = markdown.split("\n")[0];
    // const indentation = firstLine.match(/^\s*/)[0];
    // markdown = markdown.replace(new RegExp("\\n" + indentation, "gm"), "\n");

    // Find bold text
    markdown = markdown.replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

    // Find underlined text
    markdown = markdown.replace(/__(.+?)__/g, "<u>$1</u>");

    // Find italic text (asterisks or underscores)
    markdown = markdown.replace(/\*(.+?)\*/g, "<i>$1</i>");
    markdown = markdown.replace(/_(.+?)_/g, "<i>$1</i>");

    // Find strikethrough text
    markdown = markdown.replace(/~~(.+?)~~/g, "<s>$1</s>");

    // Find blockquotes
    markdown = markdown.replace(/^&gt;\s+?((?:[^\n]|\n{1})+?\n)/g, "<blockquote>$1</blockquote>\n");

    // find all block-level code blocks
    const codeBlocks2 = markdown.match(/```([^`]+|`{1,2}[^`])+```/g);
    if (codeBlocks2) {
        for (const codeBlock of codeBlocks2) {
            // replace each block with a <pre><code> element pair, and specify language if specified
            const language = codeBlock.match(/^```[0-9A-Za-z]+\n/);
            let text = "";
            if (language) {
                text = codeBlock.substring(language[0].length, codeBlock.length - 3);
            } else {
                text = codeBlock.substring(3, codeBlock.length - 3);
            }
            
            // sanitize the code block
            text = sanitize(text);

            // temporarily replace double newlines to circumvent the paragraph parsing part of markdownToHTML
            text = text.replace(/\n\n/g, "\x00");

            // do the replacement
            markdown = markdown.replace(codeBlock, `<pre><code${language ? ` class="${language[0].substring(3, language[0].length - 1)}"` : ""}>${text}</code></pre>`);
        }
    }

    // find all inline code blocks
    const codeBlocks = markdown.match(/`[^`]+`/g);
    if (codeBlocks) {
        for (const codeBlock of codeBlocks) {
            // sanitize the code block
            const sanitizedCodeBlock = sanitize(codeBlock.substring(1, codeBlock.length - 1));

            // replace each block with a <code> element
            markdown = markdown.replace(codeBlock, `<code>${sanitizedCodeBlock}</code>`);
        }
    }

    // find all headings
    const headings = markdown.match(/^(#{1,6})\s(.+)$/g);
    if (headings) {
        for (const heading of headings) {
            // replace each heading with a <h1> to <h6> element
            const level = heading.match(/^#{1,6}/)[0].length;
            markdown = markdown.replace(heading, `<h${level}>${heading.substring(level + 1)}</h${level}>`);
        }
    }

    // find all images
    const images = markdown.match(/!\[((?:[^\]]|\\\])+)\]\(((?:[^\)]|\\\))+)\)/g);
    if (images) {
        for (const image of images) {
            // replace each image with an <img> element
            markdown = markdown.replace(image, `<img md src="${image.substring(image.indexOf("(") + 1, image.indexOf(")"))}" alt="${image.substring(image.indexOf("[") + 1, image.indexOf("]"))}">`);
        }
    }

    // find all links
    const links = markdown.match(/\[((?:[^\]]|\\\])+)\]\(((?:[^\)]|\\\))+)\)/g);
    if (links) {
        for (const link of links) {
            // replace each link with a <a> element
            markdown = markdown.replace(link, `<a href="${link.substring(link.indexOf("(") + 1, link.indexOf(")"))}" target="_blank">${link.substring(1, link.indexOf("]"))}</a>`);
        }
    }

    // split the text into paragraphs
    const paragraphs = markdown.split(/\n[ \t]*\n/);
    if (paragraphs) {
        for (const paragraph of paragraphs) {
            // replace each paragraph with a <p> element
            markdown = markdown.replace(paragraph, `<p>${paragraph}</p>`);
        }
    }

    // for the fun of it, wikipedia wikilinks
    const wikilinks = markdown.match(/\[\[((?:[^\]]|\\\])+)\]\]/g);
    if (wikilinks) {
        for (let wikilink of wikilinks) {
            // if it starts with a colon, remove it because parsing is hard
            if (wikilink.startsWith(":")) {
                wikilink = wikilink.substring(1);
            }

            // check if it has a different site (language, or meta/commons/simple/...)
            const site = wikilink.match(/\[\[([^:]+):/);
            let url = ".wikipedia.org/wiki/";
            // is it really a site or is it just the namespace?
            // Namespaces are capitalized, sites are not
            if (site && site[1].match(/[a-z]+/)) {
                // it's a site
                url = `https://${site[1]}.wikipedia.org/wiki/`;
            } else {
                // it's just the namespace, ignore it and set language to en
                url = "https://en.wikipedia.org/wiki/";
            }

            let displayText = wikilink.substring(2, wikilink.length - 2);
            let urlText = displayText;

            // check if it has a different display text
            const displayTextMatch = wikilink.match(/\|/);
            if (displayTextMatch) {
                displayText = wikilink.substring(displayTextMatch.index + 1, wikilink.length - 2);
                urlText = wikilink.substring(2, displayTextMatch.index);
            }

            // if url text is different from display text, add a mouseover with the url text
            const mouseover = urlText !== displayText ? ` title="Wikipedia: ${urlText}"` : "";

            // url text can't contain spaces
            urlText = urlText.replace(/ /g, "_");

            // replace the wikilink with an <a> element
            markdown = markdown.replace(wikilink, `<a href="${url}${urlText}"${mouseover} target="_blank">${displayText}</a>`);
        }
    }

    //TODO: parse and convert tables and lists
    // maybe some day, but not today because my brain is hurty

    // restore double newlines from code blocks
    markdown = markdown.replace(/\x00/g, "\n\n");

    // good enough
    return markdown;
}

/**
 * Sanitizes a string for use in HTML.
 * @param {String} text The text to sanitize
 * @returns {String} The sanitized text
 */
function sanitize(text) {
    let sanitizedText = text;

    // replace ampersands with &amp;
    // sanitizedText = sanitizedText.replace(/&/g, "&amp;");
    // // (that can get very meta very fast)

    // // Replace all HTML tags with their HTML entity equivalents
    // sanitizedText = sanitizedText.replace(/</g, "&lt;");
    // sanitizedText = sanitizedText.replace(/>/g, "&gt;");

    // and that's usually good enough so return it
    return sanitizedText;
}
