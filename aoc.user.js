// ==UserScript==
// @name         Advent of Code Page Navigation
// @version      0.4
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
    const aocChallengeLink = /\/(?<year>\d{4})\/day\/(?<day>\d+)/;
    const aocStatsLink = /\/\d{4}\/stats$/;

    let match = location.pathname.match(aocChallengeLink);
    if (match) {
        // the `+` is to convert the string to a number
        const year = +match.groups.year;
        const day = +match.groups.day;
        const prevDay = day - 1;
        const nextDay = day + 1;

        const prevLink = document.createElement("a");
        let href = prevDay > 0 ? `/${year}/day/${prevDay}` : `/${year - 1}/day/25`;
        prevLink.href = href;
        prevLink.textContent = "[<<]";
        prevLink.title = `Day ${prevDay}`;
        if (prevDay === 0) {
            prevLink.title += ` (${year - 1})`;
        }

        const nextLink = document.createElement("a");
        href = nextDay < 26 ? `/${year}/day/${nextDay}` : `/${year + 1}/day/1`;
        nextLink.href = href;
        nextLink.textContent = "[>>]";
        nextLink.title = `Day ${nextDay}`;
        if (nextDay === 26) {
            nextLink.title += ` (${year + 1})`;
        }

        const dayHeader = document.querySelector("main article.day-desc h2");
        dayHeader.innerHTML = `${prevLink.outerHTML} ${dayHeader.textContent} ${nextLink.outerHTML}`;
    }

    match = location.pathname.match(aocStatsLink);
    if (match) {
        // Add ratios to each day!
        const completedDays = document.querySelectorAll("body main pre a");
        let latestDay = 0;
        for (const day of completedDays) {
            const completedBoth = day.querySelector(".stats-both");
            const completedOne = day.querySelector(".stats-firstonly");

            const totalCompletions = Number(completedBoth.textContent) + Number(completedOne.textContent);
            const currentDay = +(day.href.split("/").pop());
            const totalSpan = document.createElement("span");
            totalSpan.className = `stats-total-d${currentDay}`;
            totalSpan.textContent = `(${totalCompletions}) `;
            day.insertBefore(totalSpan, day.firstChild);
            if (currentDay > latestDay) {
                latestDay = currentDay;
            }
        }

        for (let i = latestDay; i > 0; i--) {
            const total = document.querySelector(`.stats-total-d${i}`);
            const prev = document.querySelector(`.stats-total-d${i - 1}`);
            if (total && prev) {
                const today = Number(total.textContent.slice(1, -2));
                const yesterday = Number(prev.textContent.slice(1, -2));
                const ratioText = (today / yesterday).toFixed(2);
                total.textContent = `(${ratioText}) `;
            } else if (total) {
                // Day 1: let's instead go with ratio between all d1p1 and all d1p2
                const full = total.textContent.slice(1, -2);
                const partial = total.parentElement.querySelector(".stats-both").textContent;
                const ratioText = (Number(partial) / Number(full)).toFixed(2);
                console.log({full, partial, ratioText});
                total.textContent = `(${ratioText}) `;
            }
        }
        const incompleteDays = document.querySelectorAll("body main pre span:not([class])");
        for (const day of incompleteDays) {
            const newSpan = document.createElement("span");
            newSpan.textContent = "(????) ";
            day.insertBefore(newSpan, day.firstChild);
        }
    }
})();
