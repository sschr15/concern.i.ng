// ==UserScript==
// @name         Advent of Code Site Additions
// @version      0.5.1
// @description  Adds buttons to navigate between days, and adds another stat to stats
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
        /**
         * @type {{
         *     ratios: "daytoday" | "daytofirst" | "betweenparts" | "showtotal" | null
         * }}
         */
        const config = JSON.parse(localStorage.getItem("aoc-user-js-config")) ?? {
            ratios: "daytoday"
        }

        const refresh = () => {
            // Re-calculate all the values since they get messed up upon config change
            document.querySelectorAll(".stats-total").forEach(e => e.remove());

            if (config.ratios === null) {
                return;
            }

            let largestTotal = 0;

            const completedDays = document.querySelectorAll("body main pre a");
            let latestDay = 0;
            for (const day of completedDays) {
                const completedBoth = day.querySelector(".stats-both");
                const completedOne = day.querySelector(".stats-firstonly");

                const totalCompletions = Number(completedBoth.textContent) + Number(completedOne.textContent);
                if (totalCompletions > largestTotal) {
                    largestTotal = totalCompletions;
                }

                const currentDay = +(day.href.split("/").pop());
                const totalSpan = document.createElement("span");
                totalSpan.className = `stats-total-d${currentDay} stats-total`;
                totalSpan.textContent = `(${totalCompletions}) `;
                day.insertBefore(totalSpan, day.firstChild);
                if (currentDay > latestDay) {
                    latestDay = currentDay;
                }
            }

            if (config.ratios === "showtotal") {
                const questionMarksNeeded = largestTotal.toString().length;
                const questionMarkString = "?".repeat(questionMarksNeeded);

                const incompleteDays = document.querySelectorAll("body main pre span:not([class])");
                for (const day of incompleteDays) {
                    const newSpan = document.createElement("span");
                    newSpan.className = "stats-total";
                    newSpan.textContent = `(${questionMarkString}) `
                    day.insertBefore(newSpan, day.firstChild);
                }
            } else {
                const firstDay = document.querySelector(".stats-total-d1");
                for (let i = latestDay; i > 0; i--) {
                    const total = document.querySelector(`.stats-total-d${i}`);
                    const prev = document.querySelector(`.stats-total-d${i - 1}`);
                    if (total && prev && config.ratios !== "betweenparts") {
                        const today = Number(total.textContent.slice(1, -2));
                        const toCompareTo = config.ratios === "daytoday" ? prev : firstDay;
                        const compare = Number(toCompareTo.textContent.slice(1, -2));
                        const ratioText = (today / compare).toFixed(2);
                        total.textContent = `(${ratioText}) `;
                    } else if (total === firstDay || config.ratios === "betweenparts") {
                        // instead use ratio between all d1p1 and all d1p2
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
                    newSpan.className = "stats-total";
                    newSpan.textContent = "(????) ";
                    day.insertBefore(newSpan, day.firstChild);
                }
            }
        };

        const options = document.createElement("div");

        const createButtons = () => {
            /** @type {HTMLAnchorElement | null} */
            let currentClickedButton = null;

            const dayToDay = document.createElement("a");
            dayToDay.href = "#";
            dayToDay.textContent = "[Day-to-day]";
            dayToDay.title = "Show ratio of completions between each day";
            dayToDay.addEventListener("click", () => {
                config.ratios = "daytoday";
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                currentClickedButton.style.color = "";
                currentClickedButton = dayToDay;
                currentClickedButton.style.color = "#99ff99";
                refresh();
            });
            options.appendChild(dayToDay);

            const dayToFirst = document.createElement("a");
            dayToFirst.href = "#";
            dayToFirst.textContent = "[Day-to-total]";
            dayToFirst.title = "Show ratio of completions between each day and day 1 part 1 (approximately the ratio to the total number of people who have done AoC)";
            dayToFirst.addEventListener("click", () => {
                config.ratios = "daytofirst";
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                currentClickedButton.style.color = "";
                currentClickedButton = dayToFirst;
                currentClickedButton.style.color = "#99ff99";
                refresh();
            });
            options.appendChild(dayToFirst);

            const betweenParts = document.createElement("a");
            betweenParts.href = "#";
            betweenParts.textContent = "[Part ratio]";
            betweenParts.title = "Show ratio of completions between part 1 and part 2 of each day";
            betweenParts.addEventListener("click", () => {
                config.ratios = "betweenparts";
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                currentClickedButton.style.color = "";
                currentClickedButton = betweenParts;
                currentClickedButton.style.color = "#99ff99";
                refresh();
            });
            options.appendChild(betweenParts);

            const showTotal = document.createElement("a");
            showTotal.href = "#";
            showTotal.textContent = "[Show total]";
            showTotal.title = "Show total number of completions for each day rather than a ratio";
            showTotal.addEventListener("click", () => {
                config.ratios = "showtotal";
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                currentClickedButton.style.color = "";
                currentClickedButton = showTotal;
                currentClickedButton.style.color = "#99ff99";
                refresh();
            });
            options.appendChild(showTotal);

            const noShow = document.createElement("a");
            noShow.href = "#";
            noShow.textContent = "[Hide]";
            noShow.title = "Hide ratios";
            noShow.addEventListener("click", () => {
                config.ratios = null;
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                currentClickedButton.style.color = "";
                currentClickedButton = noShow;
                currentClickedButton.style.color = "#99ff99";
                refresh();
            });
            options.appendChild(noShow);

            if (config.ratios === "daytoday") {
                currentClickedButton = dayToDay;
            } else if (config.ratios === "daytofirst") {
                currentClickedButton = dayToFirst;
            } else if (config.ratios === "betweenparts") {
                currentClickedButton = betweenParts;
            } else if (config.ratios === "showtotal") {
                currentClickedButton = showTotal;
            } else {
                currentClickedButton = noShow;
            }

            currentClickedButton.style.color = "#99ff99";
        };

        if (localStorage.getItem("aoc-user-js-config") === null) {
            const optin = document.createElement("a");
            optin.href = "#";
            optin.textContent = "[Ratio storage opt-in]";
            optin.title = "Opt-in to storing your ratio preference in local storage. If not opted in, the ratio will always show day-to-day stats.";
            optin.addEventListener("click", () => {
                localStorage.setItem("aoc-user-js-config", JSON.stringify(config));
                optin.remove();
                createButtons();
            });
            options.appendChild(optin);
        } else {
            createButtons();
        }

        const p = document.querySelector("body main p");
        p.parentElement.insertBefore(options, p);
        refresh();
    }
})();
