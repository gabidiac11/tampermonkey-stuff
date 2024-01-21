'use strict';

const appendCss = (css) => {
    const styleEl = document.createElement("STYLE");
    styleEl.innerHTML = css;
    document.head.append(styleEl);
    console.log("added csss", { styleEl });
    return styleEl;
};

// ==UserScript==
// @name         Youtube hide suggestions
// @namespace    http://tampermonkey.net/
// @version      2024-01-21
// @description  try to take over the world!
// @author       You
// @match        https://www.youtube.com/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=youtube.com
// @grant        none
// ==/UserScript==
(function () {
    const cleanAuthorString = (text) => text
        .trim()
        .replace(/[\n\r]/g, "")
        .toLowerCase();
    const videoTagSelectors = [
        // video suggestion on home page
        "ytd-rich-item-renderer",
        // video suggestion when searching
        "ytd-video-renderer",
        // video suggestion from side meniu
        "ytd-compact-video-renderer",
    ];
    const extractCurrentVideoNodes = () => videoTagSelectors.reduce((list, selector) => {
        return [
            ...list,
            ...Array.prototype.map.call(document.querySelectorAll(`${selector}:not(.tampered)`), (i) => VideoNode(i)),
        ];
    }, []);
    const VideoNode = (el) => {
        var _a, _b, _c, _d;
        const channel = cleanAuthorString((_b = (_a = el.querySelector(".ytd-channel-name")) === null || _a === void 0 ? void 0 : _a.innerText) !== null && _b !== void 0 ? _b : "");
        const title = cleanAuthorString((_d = (_c = el.querySelector("#video-title")) === null || _c === void 0 ? void 0 : _c.innerText) !== null && _d !== void 0 ? _d : "");
        const texts = Array.prototype.map.call(el.querySelectorAll(`yt-formatted-string`), (i) => i.innerText);
        return {
            channel,
            title,
            texts,
            hideThumbnail: () => {
                const thumbnail = el.querySelector("#thumbnail");
                if (!thumbnail)
                    return;
                thumbnail.style.display = "none";
            },
            markTampered: () => {
                el.classList.add("tampered");
            },
            showElement: () => {
                el.style.display = "initial";
            },
        };
    };
    const isRus = (() => {
        const russianCharacters = [
            "А",
            "а",
            "Б",
            "б",
            "В",
            "в",
            "Г",
            "г",
            "Д",
            "д",
            "Е",
            "е",
            "Ё",
            "ё",
            "Ж",
            "ж",
            "З",
            "з",
            "И",
            "и",
            "Й",
            "й",
            "К",
            "к",
            "Л",
            "л",
            "М",
            "м",
            "Н",
            "н",
            "О",
            "о",
            "П",
            "п",
            "Р",
            "р",
            "С",
            "с",
            "Т",
            "т",
            "У",
            "у",
            "Ф",
            "ф",
            "Х",
            "х",
            "Ц",
            "ц",
            "Ч",
            "ч",
            "Ш",
            "ш",
            "Щ",
            "щ",
            "Ъ",
            "ъ",
            "Ы",
            "ы",
            "Ь",
            "ь",
            "Э",
            "э",
            "Ю",
            "ю",
            "Я",
            "я",
        ];
        return (el) => {
            return [el.title, el.channel].some((c) => russianCharacters.some((rc) => rc == c));
        };
    })();
    const isAllowedChannel = (() => {
        const allowedChannels = [
            "Mr. Beat", // not beast!
            "The Armchair Historian",
            "Алексей Шевцов",
            "Tamara Eidelman",
            "Interslavic language - Medžuslovjansky jezyk",
            "Кубрик",
            "Лекторий Dостоевский",
            "BBC News - Русская служба",
            "МЕТР",
            "Центральное Телевидение",
            "Unknown5",
            "Mark Felton Productions",
            "münecat",
            "ПЕРВЫЙ НАУЧНЫЙ",
            "Spa Massage Music World -Relaxing Music",
            "Niki Proshin",
            "Продолжение следует",
            "1420 by Daniil Orain",
            "NFKRZ",
            "Patrick Boyle",
            "вДудь",
            "ВЗГЛЯД.РУ",
            "DW на русском",
            "FREEДOM. LIVE",
            "В гостях у Гордона",
            "INSIDE RUSSIA",
            "Настоящее Время",
            "Българска Национална Телевизия БНТ",
            "Медиазона",
            "Максим Кац",
            "Комсомольская Правда",
            "Редакция",
            "ШЕПЕЛИН",
            "Perun",
            "CaspianReport",
            "Living Ironically in Europe",
            "Economics Explained",
            "Chubbyemu",
            "Valentina Lisitsa QOR Records Official channel",
        ].map((i) => cleanAuthorString(i));
        return (el) => {
            return allowedChannels.some((allowedChannel) => el.channel.indexOf(allowedChannel) > -1);
        };
    })();
    const isBanciu = (el) => /Banciu[\s\0]/.test(el.title);
    const showAllowedVideoThumbnails = () => {
        const allVideos = extractCurrentVideoNodes();
        allVideos
            .filter((i) => isRus(i) || isAllowedChannel(i) || isBanciu(i))
            .forEach((i) => i.showElement());
        allVideos.forEach((i) => i.markTampered());
    };
    // main:
    // activatePrintAuthors();
    appendCss(`
    ${videoTagSelectors.join(",")} {
      display: none;
    }
  `);
    showAllowedVideoThumbnails();
    document.addEventListener("scroll", () => showAllowedVideoThumbnails());
})();
