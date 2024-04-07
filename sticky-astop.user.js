// ==UserScript==
// @name         Sticky A-Stop
// @version      0.0.1
// @description  Highlights past the end of a match any driver stations whose A-Stop was triggered during the match.
// @author       sschr15
// @namespace    https://infra.link/
// @match        http://10.0.100.5/FieldMonitor
// @downloadURL  https://concern.i.ng/sticky-astop.user.js
// @updateURL    https://concern.i.ng/sticky-astop.user.js
// @source       https://concern.i.ng/sticky-astop.user.js
// @supportURL   https://concern.i.ng
// @homepage     https://concern.i.ng
// @run-at       document-end
// ==/UserScript==

(function() {
    'use strict';

    const matchState = document.getElementById('matchStateTop');
    setInterval(() => {
        if (matchState.classList.contains('matchStateRed') && matchState.innerText.startsWith("PRE-START")) {
            document.querySelectorAll('td[style]').forEach(e => e.style = undefined);
        }
        const aStops = document.getElementsByClassName('fieldMonitor-blackDiamondA');
        for (const aStop of aStops) {
            aStop.parentElement.style = "background: black;";
        }
    }, 100);
})();
