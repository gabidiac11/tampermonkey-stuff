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

import { appendCss } from "../utils";

(function () {
  "use strict";
  const cleanAuthorString = (text: string) =>
    text
      .trim()
      .replace(/[\n\r]/g, "")
      .toLowerCase();
  const videoTagSelectorDesktop = [
    // video suggestion on home page
    "ytd-rich-item-renderer",
    // video suggestion when searching
    "ytd-video-renderer",
    // video suggestion from side meniu
    "ytd-compact-video-renderer",
  ];
  const videoTagSelectorMobile = [
    // mobile suggestion on home page
    "ytm-rich-item-renderer",
    // mobile video suggestion when searching
    "ytm-video-with-context-renderer",
  ];
  const videoTagSelectors = videoTagSelectorDesktop.concat(
    videoTagSelectorMobile
  );
  const extractCurrentVideoNodes = () =>
    videoTagSelectors.reduce((list, selector) => {
      return [
        ...list,
        ...(Array.prototype.map.call(
          document.querySelectorAll(`${selector}:not(.tampered)`),
          (i) => VideoNode(i)
        ) as unknown[] as IVideoNode[]),
      ];
    }, [] as IVideoNode[]);

  type IVideoNode = {
    title: string;
    channel: string;
    texts: string[];
    hideThumbnail: () => void;
    markTampered: () => void;
    showElement: () => void;
    hideElement: () => void;
  };

  const VideoNode = (el: HTMLElement) => {
    const getDataDesktop = () => {
      const channel = cleanAuthorString(
        el.querySelector<HTMLElement>(".ytd-channel-name")?.innerText ?? ""
      );
      const title = cleanAuthorString(
        el.querySelector<HTMLElement>("#video-title")?.innerText ?? ""
      );
      const texts = Array.prototype.map.call(
        el.querySelectorAll(`yt-formatted-string`),
        (i) => i.innerText
      ) as unknown as string[];

      return {
        channel,
        title,
        texts,
      };
    };

    const getDataMobile = () => {
      const channel = cleanAuthorString(
        el.querySelector<HTMLElement>(
          "ytm-badge-and-byline-renderer .ytm-badge-and-byline-item-byline"
        )?.innerText ?? ""
      );
      const title = cleanAuthorString(
        el.querySelector<HTMLElement>("h3")?.innerText ?? ""
      );
      const texts = [el.innerText];

      return {
        channel,
        title,
        texts,
      };
    };

    const isDesktop = () =>
      videoTagSelectorDesktop.some((i) => el.tagName.toLowerCase() === i);

    const data = isDesktop() ? getDataDesktop() : getDataMobile();
    return {
      channel: data.channel,
      title: data.title,
      texts: data.texts,
      hideThumbnail: () => {
        const thumbnail = el.querySelector<HTMLElement>("#thumbnail");
        if (!thumbnail) return;
        thumbnail.style.display = "none";
      },
      markTampered: () => {
        el.classList.add("tampered");
      },
      showElement: () => {
        el.classList.add("tampered-display-visible");
      },
      hideElement: () => {
        el.classList.remove("tampered-display-visible");
      },
      el,
    } as IVideoNode;
  };

  const activatePrintAuthors = () => {
    let soFarAuthors: string[] = [];

    const print = () => {
      const allVideos = Array.prototype.map.call(
        document.querySelectorAll(`ytd-rich-item-renderer:not(.tampered)`),
        (i) => VideoNode(i)
      ) as unknown[] as IVideoNode[];
      allVideos.forEach((a) => a.markTampered());

      const authors = allVideos
        .map((i) => i.channel)
        .filter((i) => !!i)
        .filter((i) => !soFarAuthors.some((soFar) => soFar === i));

      const uniqueAuthors = authors.reduce(
        (prev, curr) => {
          if (!prev.occurence[curr]) {
            prev.list.push(curr);
            prev.occurence[curr] = true;
          }
          return prev;
        },
        { list: [], occurence: {} } as {
          list: string[];
          occurence: { [key: string]: boolean };
        }
      ).list;

      soFarAuthors = [...soFarAuthors, ...uniqueAuthors];
      if (!uniqueAuthors.length) return;
      console.log(soFarAuthors);
    };
    print();
    document.addEventListener("scroll", () => print());
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
    return (el: IVideoNode) => {
      return [el.title, el.channel].some((c) =>
        russianCharacters.some((rc) => rc == c)
      );
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
    return (el: IVideoNode) => {
      return allowedChannels.some(
        (allowedChannel) => el.channel.indexOf(allowedChannel) > -1
      );
    };
  })();

  const isBanciu = (el: IVideoNode) => /Banciu[\s\0]/.test(el.title);

  const showAllowedVideoThumbnails = () => {
    const allVideos = extractCurrentVideoNodes();
    // allVideos.forEach(i => i.hideElement())
    allVideos
      .filter((i) => isRus(i) || isAllowedChannel(i) || isBanciu(i))
      .forEach((i) => i.showElement());
    console.log({ allVideos });
    allVideos.forEach((i) => i.markTampered());
  };

  // main:
  // activatePrintAuthors();

  appendCss(`
    ${videoTagSelectors.join(",")} {
      display: none!important;
    }

    ${videoTagSelectors.map((i) => `${i}.tampered-display-visible`).join(",")} {
      display: initial!important;
    }

    ytm-reel-shelf-renderer {
      display: none!important;
    }
    ytm-pivot-bar-renderer ytm-pivot-bar-item-renderer:nth-child(2) {
      display: none!important;
    }
  `);
  showAllowedVideoThumbnails();
  document.addEventListener("scroll", () => showAllowedVideoThumbnails());
})();
export {};
