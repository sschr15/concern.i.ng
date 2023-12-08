// ==UserScript==
// @name         Advent of Code Stat Copier
// @version      0.1.0
// @description  Allows copying of stats from the AoC stats page, for pasting in a spreadsheet or similar
// @author       sschr15
// @namespace    https://infra.link/
// @match        https://adventofcode.com/*
// @downloadURL  https://concern.i.ng/aoc-stat-copy.user.js
// @updateURL    https://concern.i.ng/aoc-stat-copy.user.js
// @source       https://concern.i.ng/aoc-stat-copy.user.js
// @supportURL   https://concern.i.ng
// @homepage     https://concern.i.ng
// @run-at       document-end
// ==/UserScript==

(function() {
    "use strict";
    const aocStatsLink = /\/\d{4}\/stats$/;
    const match = location.pathname.match(aocStatsLink);
    if (match) {
        // Firefox doesn't support clipboard.write
        const canUseNewClipboardApi = () => {
            const ua = navigator.userAgent;
            const isFirefox = ua.match(/firefox/i);
            return !isFirefox;
        }

        const copyButton = document.createElement("a");
        copyButton.innerText = "[Copy Stats]";
        copyButton.href = "#";
        copyButton.title = "Copy stats in an HTML table format."

        copyButton.addEventListener("click", async () => {
            /** @type {HTMLAnchorElement[]} */
            const completedDays = Array.from(document.querySelectorAll(".stats a[href]"));

            // sort by day number in ascending order
            completedDays.sort((a, b) => parseInt(a.href.split("/").pop()) - parseInt(b.href.split("/").pop()));

            const table = document.createElement("table");

            for (const day of completedDays) {
                const row = document.createElement("tr");
                const bothPartsCompletion = day.querySelector(".stats-both").textContent.trim();
                const partOneCompletion = day.querySelector(".stats-firstonly").textContent.trim();

                const dayNumber = day.href.split("/").pop();

                const dayColumn = document.createElement("td");
                dayColumn.innerText = `Day ${dayNumber}`;
                row.appendChild(dayColumn);

                const bothPartsColumn = document.createElement("td");
                bothPartsColumn.innerText = bothPartsCompletion;
                row.appendChild(bothPartsColumn);

                const partOneColumn = document.createElement("td");
                partOneColumn.innerText = partOneCompletion;
                row.appendChild(partOneColumn);

                table.appendChild(row);
            }

            // Using clipboard.writeText doesn't work (only Excel for desktop parses it into something pastable)
            if (canUseNewClipboardApi()) {
                // Using clipboard.write works fantastically
                const blob = new Blob([table.outerHTML], { type: "text/html" });
                const clipboardItem = new ClipboardItem({ "text/html": blob });
                await navigator.clipboard.write([clipboardItem]);
            } else {
                // Firefox doesn't support clipboard.write, so the deprecated execCommand is used instead
                const range = document.createRange();
                range.selectNode(table);
                window.getSelection().removeAllRanges();
                window.getSelection().addRange(range);
                document.execCommand("copy");
            }
        });

        const locationToInsert = document.querySelector("body main p");
        locationToInsert.appendChild(document.createElement("br"));
        locationToInsert.appendChild(copyButton);
    }
})();
