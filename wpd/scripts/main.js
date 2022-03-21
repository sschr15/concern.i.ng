/* jslint esversion: 6 */

// adding types to javascript is funky

const navigationPages = {
    "/": "Home",
    "/projects/better-paths.html": "Better Paths",
    "/projects/vml.html": "Version Mod Loader",
    "/projects/khasm.html": "Khasm",
    "/projects/matrix-viz.html": "Matrix Vizualizer",
}

/** @type {HTMLTableElement} */
let nav = document.getElementById("nav");

if (!nav) {
    console.log("No nav, creating one");
    nav = document.createElement("table");
    nav.id = "nav";
    document.body.innerHTML = nav.outerHTML + document.body.innerHTML;
    nav = document.getElementById("nav"); // weirdness
}

let sb = "";
const totalPages = Object.keys(navigationPages).length;
const widthPerTheEach = Math.floor(100 / totalPages);
const widthForTheFirst = widthPerTheEach * totalPages === 100 ? widthPerTheEach : widthPerTheEach + (100 - (widthPerTheEach * totalPages));
let first = true;

for (const [key, value] of Object.entries(navigationPages)) {
    const width = first ? widthForTheFirst : widthPerTheEach;
    sb += `
    <td width="${width}%" class="horizontal-center">
        <a href="${key}" class="horizontal-center">${value}</a>
    </td>
    `;
}

const tableInnerHTML = `
<tbody>
    <tr>
        ${sb}
    </tr>
</tbody>
`

nav.innerHTML = tableInnerHTML;

// optional table of contents
// specified by having a <div id="toc">
sb = "";
const toc = document.getElementById("toc");
if (toc) {
    // find all headings with a "toc" attribute and an id
    const headings = document.querySelectorAll("h1[toc][id], h2[toc][id], h3[toc][id], h4[toc][id], h5[toc][id], h6[toc][id]");
    for (const heading of headings) {
        // the heading's display text should be in the "toc" attribute
        const text = heading.getAttribute("toc");

        // create a link to the heading
        sb += `
        <li>
            <a href="#${heading.id}">${text}</a>
        </li>
        `;
    }

    // create the table of contents
    const tableInnerHTML = `
    <ul style="list-style-type: none;">
        ${sb}
    </ul>
    `

    toc.innerHTML = tableInnerHTML;
}

/** @type {HTMLHeadingElement} */
const h1AtTop = document.getElementById("top");

h1AtTop.innerHTML = '<img src="/images/eyeball-balance.png" title="My logo: an eyeball with Discord\'s Hypesquad Balance color as a perimeter" width="30" height="30" />\n' + h1AtTop.innerHTML;

/**
 * Converts links so if the page is opened as a raw file,
 * local references remain pointing to the same file.
 */
function relativizeLinks() {
    "use strict";
    /** @type {String} */
    const protocol = window.location.protocol;
    if (true) {
        // we must relativize

        const absolutePath = document.querySelector('meta[name="PATH"]').content;

        const root = window.location.href.substring(0, window.location.href.indexOf(absolutePath));

        const a = document.getElementsByTagName("a");
        const img = document.getElementsByTagName("img");
        const link = document.getElementsByTagName("link");
        const script = document.getElementsByTagName("script");

        for (let i = 0; i < a.length; i++) {
            let href = a[i].getAttribute("href");
            if (!href) continue;
            if (href.startsWith("/") && !href.startsWith("//")) {
                a[i].setAttribute("href", root + href);
            }

            href = a[i].getAttribute("href");
            if (href.endsWith("/")) {
                a[i].setAttribute("href", href + "index.html");
            }
        }

        for (let i = 0; i < img.length; i++) {
            const src = img[i].getAttribute("src");
            if (!src) continue;
            if (src.startsWith("/") && !src.startsWith("//")) {
                img[i].setAttribute("src", root + src);
            }
        }

        for (let i = 0; i < link.length; i++) {
            const href = link[i].getAttribute("href");
            if (!href) continue;
            if (href.startsWith("/") && !href.startsWith("//")) {
                link[i].setAttribute("href", root + href);
            }
        }

        for (let i = 0; i < script.length; i++) {
            const src = script[i].getAttribute("src");
            if (!src) continue;
            if (src.startsWith("/") && !src.startsWith("//")) {
                script[i].setAttribute("src", root + src);
            }
        }
    }
}
