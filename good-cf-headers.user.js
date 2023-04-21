// ==UserScript==
// @name         Good CurseForge Headers
// @version      0.2
// @description  who needs information about cf's socials or giving feedback
// @author       sschr15
// @namespace    https://infra.link/
// @match        https://www.curseforge.com/minecraft/*
// @match        https://www.curseforge.com/Minecraft/*
// @match        https://legacy.curseforge.com/minecraft/*
// @match        https://legacy.curseforge.com/Minecraft/*
// @downloadURL  https://concern.i.ng/good-cf-headers.user.js
// @updateURL    https://concern.i.ng/good-cf-headers.user.js
// @source       https://concern.i.ng/good-cf-headers.user.js
// @supportURL   https://concern.i.ng
// @homepage     https://concern.i.ng
// @run-at       document-end
// @grant        GM_xmlhttpRequest
// ==/UserScript==

await (async function() {
	"use strict";

	let greaseMonkeyXHR = details => {
		details.method = details.method ? details.method : "GET";
		details.anonymous = true;
		details.responseType = details.responseType ? details.responseType : "arraybuffer";
		return new Promise((resolve, reject) => {
			details.onload = resolve;
			details.onerror = reject;
			GM_xmlhttpRequest(details);
		});
	};

	const rootOfAllEvil = document.querySelector("nav.curseforge-header");

    const isModPage = /\/minecraft\/mc-mods\/.+/.test(window.location.pathname);

    const selector = outerWidth <= 1045 ? "div div.md\\:hidden div.hidden" : "div div.md\\:flex"; // don't ask me why cf's names are so bad
    const currentNavDiv = rootOfAllEvil.querySelector(selector);

    // Clear the current div in its entirety
    for (const child of currentNavDiv.children) {
        currentNavDiv.removeChild(child);
    }

    const placeholderId = "placeholder-" + Math.floor(Math.random() * 1000000).toString(36);

    // Overwrite to our own values
    const newEntriesForAll = `
        <a href="https://www.curseforge.com/minecraft/mc-mods">Mods</a>
        <div>
            <span>Mod Loaders</span>
            <div><ul id="modloader-list">
                <li><a href="https://www.curseforge.com/minecraft/mc-mods?filter-game-version=2020709689%3A9153">Quilt</a></li>
                <li><a href="https://www.curseforge.com/minecraft/mc-mods?filter-game-version=2020709689%3A7499">Fabric</a></li>
                <li><a href="https://www.curseforge.com/minecraft/mc-mods?filter-game-version=2020709689%3A7498">Forge</a></li>
                <li><a href="https://www.curseforge.com/minecraft/mc-mods?filter-game-version=2020709689%3A7500">Rift</a></li>
            </ul></div>
        </div>
        <div>
            <span>Java Versions</span>
            <div><ul id="java-list">
                <li class="${placeholderId}">Loading...</li>
            </ul></div>
        </div>
        <div>
            <span>Minecraft Versions</span>
            <div><ul id="mc-list">
                <li class="${placeholderId}">Loading...</li>
            </ul></div>
        </div>
    `;

    currentNavDiv.innerHTML = newEntriesForAll;

    const modloaderList = currentNavDiv.querySelector("#modloader-list");
    const javaList = currentNavDiv.querySelector("#java-list");
    const mcList = currentNavDiv.querySelector("#mc-list");

    let versionStorage = null;
    if (localStorage.CFHeadVersions != null) {
        try {
            versionStorage = JSON.parse(localStorage.CFHeadVersions);
        } catch (e) {
            console.error(e);
            versionStorage = null;
        }
    }

    if (versionStorage == null || versionStorage.lastUpdate == null || Date.now() - versionStorage.lastUpdate > 1000 * 60 * 60 * 24 * 7) { // update at least each week
        /**
         * @type {Document}
         */
        let html = null
        if (window.location.pathname != "/minecraft/mc-mods") {
            const text = await fetch("https://www.curseforge.com/minecraft/mc-mods").then(response => response.text())
            html = new DOMParser().parseFromString(text, "text/html");
        } else {
            html = document;
        }
        const versionsSelector = html.querySelector("select#filter-game-version");

        /**
         * @param version {string}
         * @returns {string | null}
         */
        function inferCategory(version) {
            if (version.includes(".")) return "mc-list";
            if (version.includes("Java") && version != "Java") return "java-list";
            if (version.match(/^\s*  /)) return "modloader-list";
            return null;
        }

        const versions = Array.from(versionsSelector.children).filter(e => e.id.includes("gameversion-")).map(e => {
            const version = e.textContent;
            const category = inferCategory(version);
            if (category == null) return null;
            return {
                "version": version.trim(),
                "category": category,
                "link": e.getAttribute("value")
            };
        }).filter(e => e != null);

        const mcVersions = versions.filter(e => e.category == "mc-list");
        const javaVersions = versions.filter(e => e.category == "java-list");
        const modloaderVersions = versions.filter(e => e.category == "modloader-list");

        versionStorage = {
            lastUpdate: Date.now(),
            mcVersions: mcVersions,
            javaVersions: javaVersions,
            modloaderVersions: modloaderVersions
        };

        localStorage.CFHeadVersions = JSON.stringify(versionStorage);
    }

    for (const version of versionStorage.mcVersions) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/minecraft/mc-mods?filter-game-version=${version.link}">${version.version}</a>`;
        mcList.appendChild(li);

        const maybePlaceholder = mcList.querySelector(`li.${placeholderId}`);
        if (maybePlaceholder != null) {
            mcList.removeChild(maybePlaceholder);
        }
    }
    for (const version of versionStorage.javaVersions) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/minecraft/mc-mods?filter-game-version=${version.link}">${version.version}</a>`;
        javaList.appendChild(li);

        const maybePlaceholder = javaList.querySelector(`li.${placeholderId}`);
        if (maybePlaceholder != null) {
            javaList.removeChild(maybePlaceholder);
        }
    }
    for (const version of versionStorage.modloaderVersions) {
        const li = document.createElement("li");
        li.innerHTML = `<a href="/minecraft/mc-mods?filter-game-version=${version.link}">${version.version}</a>`;
        modloaderList.appendChild(li);
    }

    // fix the inserted tags to contain the correct classes
    for (const child of currentNavDiv.children) {
        if (child instanceof HTMLAnchorElement) {
            child.classList.add("top-nav__nav-link", "no-underline");
        } else if (child instanceof HTMLDivElement) {
            child.classList.add("top-nav__dropdown", "balloon-wrapper", "balloon-padding");
            child.querySelector("span").classList.add("top-nav__nav-label");
            child.querySelector("div").classList.add("balloon", "balloon--down", "balloon--dropmenu");
            child.querySelector("ul").classList.add("balloon__list");
            child.querySelectorAll("a").forEach(a => a.classList.add("balloon__link", "no-underline"));
        }
    }
})();
