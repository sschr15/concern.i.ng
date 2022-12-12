// ==UserScript==
// @name         Advent of Code Page Navigation
// @version      0.1
// @description  Add buttons to easily move between AoC challenge pages
// @author       sschr15
// @namespace    https://infra.link/
// @match        https://adventofcode.com/*
// @downloadURL  https://concern.i.ng/aoc.user.js
// @updateURL    https://concern.i.ng/aoc.user.js
// @source       https://concern.i.ng/aoc.user.js
// @supportURL   https://concern.i.ng
// @homepage     https://concern.i.ng
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";
    const aocChallengeLink = /\/(<year>\d{4})\/day\/(<day>\d+)/;

    const match = location.pathname.match(aocChallengeLink);
    if (match) {
        // the `+` is to convert the string to a number
        const year = +match.groups.year;
        const day = +match.groups.day;
        const prevDay = day - 1;
        const nextDay = day + 1;

        const prevLink = document.createElement("a");
        let href = prevDay > 0 ? `/${year}/day/${prevDay}` : `/${year - 1}/day/25`;
        prevLink.href = href;
        prevLink.textContent = "[&lt;&lt;]";
        prevLink.title = `Day ${prevDay}`;

        const nextLink = document.createElement("a");
        href = nextDay < 26 ? `/${year}/day/${nextDay}` : `/${year + 1}/day/1`;
        nextLink.href = href;
        nextLink.textContent = "[&gt;&gt;]";
        nextLink.title = `Day ${nextDay}`;

        const dayHeader = document.querySelector("main article.day-desc h2");
        dayHeader.innerHTML = `${prevLink.outerHTML} ${dayHeader.textContent} ${nextLink.outerHTML}`;
    }
})();
