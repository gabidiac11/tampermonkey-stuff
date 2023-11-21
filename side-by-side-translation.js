// ==UserScript==
// @name         Side by side translate
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=genius.com
// @grant        none
// ==/UserScript==

(() => {
  if (window.location !== window.parent.location) {
    // The page is in an iframe
    return;
  }

  const orgBodyEl = document.body;

  const pageStyleStr =
    {
      "https://genius.com": `
      #side-by-side-container aside, footer { display: none; }
      #side-by-side-container      a {
                  pointer-events: none;
                }
          `,
    }[window.location.origin] ?? ``;

  // utils
  function createMyNode(htmlStringToBeParsed) {
    const div = document.createElement("DIV");
    div.innerHTML = htmlStringToBeParsed;
    console.log("createMyNode", { div: div.firstChild });

    return div.firstChild;
  }

  function waitAsync(time) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, time);
    });
  }

  async function executeGradualPageScroling() {
    const scrollHeight = document.body.scrollHeight;
    const innerHeight = window.innerHeight;

    const maxFactor = Math.floor(scrollHeight / innerHeight) + 1;
    for (let i = 0; i <= innerHeight * maxFactor; i++) {
      const factorSum = i * innerHeight;
      const newPageHeight =
        factorSum >= scrollHeight ? scrollHeight : factorSum;

      window.scrollTo(0, newPageHeight);
      await waitAsync(350);

      if (factorSum >= scrollHeight) break;
    }

    window.scrollTo(0, 0);
  }

  const loader = (() => {
    const node = createMyNode(
      `<div class="tr-my-stuff-loader"><div class="tr-my-stuff-spinner"></div></div>`
    );
    node.style.display = "none";
    document.body.append(node);

    return {
      show: () => {
        node.style.display = "flex";
      },
      hide: () => {
        node.style.display = "none";
      },
    };
  })();

  function addClonningPageBtn(panelEl, originalBodyStr) {
    const triggerBtn = createMyNode(
      `<button class="tr-my-stuff-btn"> Clone page side by side </button>`
    );
    triggerBtn.addEventListener("click", () =>
      createSideBySidePageClones(panelEl, originalBodyStr)
    );
    panelEl.append(triggerBtn);
  }

  function createSideBySidePageClones(panelEl, originalBodyStr) {
    panelEl.style.display = "none";

    const cleanBody = (strBody) =>
      strBody
        .replace(`id="google_translate_element"`, "")
        .replace("<iframe ", "<gunoi ")
        .replace(
          `<div class="tr-my-stuff-loader" `,
          `<div class="tr-my-stuff-loader tr-my-stuff-loader-hidden" `
        )
        .replace(
          "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit",
          "gunoi"
        );

    const translatedBody = document.getElementsByTagName("html")[0].outerHTML;

    /** * @type {HTMLElement} */
    const node = createMyNode(
      `<div style="display:flex; width: 100vw;" id="side-by-side-container">
                <div style="width:50vw"> ${cleanBody(originalBodyStr)} </div>
                <div class="s-b-s-translated" style="width:50vw"> ${cleanBody(
                  translatedBody
                )} </div>
            </div>`
    );
    const scripts = node.querySelectorAll("script");
    Array.prototype.forEach.call(scripts, (script) => {
      script.parentNode.removeChild(script);
    });

    document.body.prepend(node);
    document.body.prepend(
      createMyNode(`<style>
              #side-by-side-container .skiptranslate
              {
                  display: none;
              }
              ${pageStyleStr}
           </style>`)
    );
  }

  async function onClickAutoSideBySideTranslation(panelEl, originalBodyStr) {
    const getIframeContentItems = (selector) => {
      const iframeTranslateBanners = orgBodyEl.querySelectorAll(
        `iframe${selector}`
      );

      const iframeTrContentItems = Array.prototype.map.call(
        iframeTranslateBanners,
        (iframe) => iframe.contentDocument || iframe?.contentWindow?.document
      );
      return iframeTrContentItems;
    };

    const getEngTrLangOption = () => {
      const iframeTrContentItems = getIframeContentItems(`.skiptranslate`);
      const searchByCandidates = ["Engleză", "English", "Английский", "Engels"];

      const nodes = iframeTrContentItems
        .map((i) => i.querySelectorAll(`[id=":1.menuBody"] a span`))
        .filter((i) => !!i.length)?.[0];

      if (!nodes?.length) throw "No lang options found.";

      const engOption = Array.prototype.find.call(nodes, (node) =>
        searchByCandidates.some(
          (canditate) => node.innerText.indexOf(canditate) > -1
        )
      );
      if (!engOption) throw "Couln't find English option.";
      return engOption;
    };

    const tryShowOriginalTranslation = () => {
      const showOriginalBtn =
        getIframeContentItems(`[id=":2.container"]`)?.[0]?.getElementById(
          ":2.restore"
        );
      if (!showOriginalBtn) return false;

      showOriginalBtn.click();
      return true;
    };

    try {
      loader.show();

      if (tryShowOriginalTranslation()) {
        window.scrollTo(0, orgBodyEl.scrollHeight);
        await waitAsync(500);
        window.scrollTo(0, 0);
        await waitAsync(200);
      }

      const selectEl = orgBodyEl.querySelector(`[id=":0.targetLanguage"]`);
      if (!selectEl) throw "Couln't find lang select.";
      selectEl.click();

      await waitAsync(150);

      getEngTrLangOption().click();

      await executeGradualPageScroling();

      createSideBySidePageClones(panelEl, originalBodyStr);

      await waitAsync(300);

      if (!tryShowOriginalTranslation())
        throw "Couln't find button 'show original page content'.";
    } catch (err) {
      window.scrollTo(0, 0);
      alert(err);
    } finally {
      loader.hide();
    }
  }

  function addAutoSideBySideBtn(panelEl, originalBodyStr) {
    const btn = createMyNode(
      `<button class="tr-my-stuff-btn" >Auto side-by-side</button>`
    );
    btn.addEventListener("click", () =>
      onClickAutoSideBySideTranslation(panelEl, originalBodyStr)
    );
    panelEl.append(btn);
  }

  async function onGoogleTranslateScriptLoaded() {
    window.translationElement = new google.translate.TranslateElement(
      {
        pageLanguage: "auto",
        includedLanguages: "en",
        layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
      },
      "google_translate_element"
    );

    const originalBodyStr = document.getElementsByTagName("html")[0].outerHTML; //document.body.inner;

    const panelEl = createMyNode(`<div class="tr-my-stuff-panel"></div>`);
    document.body.prepend(panelEl);

    addClonningPageBtn(panelEl, originalBodyStr);
    addAutoSideBySideBtn(panelEl, originalBodyStr);
  }

  function appendMainStyle() {
    document.body.append(
      createMyNode(`<style>
          .tr-my-stuff-btn {
              -webkit-box-pack: center;
              justify-content: center;
              -webkit-box-align: center;
              align-items: center;
              width: auto;
              background-color: transparent;
              border-radius: 10;
              padding: 10px;
              border: 1px solid rgb(0, 0, 0);
              font-family: HelveticaNeue, Arial, sans-serif;
              font-size: 16;
              font-weight: 400;
              line-height: 1.1;
              color: rgb(0, 0, 0);
              cursor: pointer;
              margin: 5px;
              border-radius: 5px;
          }
          .tr-my-stuff-loader {
            display: flex;
            width: 100vw;
            height: 100vh;
            position: fixed;
            top: 0;
            background-color: rgba(0,0,0,0.8);
            z-index: 9999;
            justify-content: center;
            align-items: center;
          }
          .tr-my-stuff-spinner {
            display: inline-block;
            width: 100px;
            height: 100px;
          }
          .tr-my-stuff-spinner:after {
              width: 60px;
              height: 60px;
              margin: 10px;
              border-radius: 50%;
              border: 5px solid white;
              border-color: white transparent white transparent;
              animation: tr-my-stuff-spinner 1s linear infinite;
              display: block;
              content: " ";
          }
          @keyframes tr-my-stuff-spinner {
            0% {
              transform: rotate(0deg);
            }
            100% {
              transform: rotate(360deg);
            }
          }
          .tr-my-stuff-loader-hidden {
            display: none!important;
          }

          .tr-my-stuff-panel {
            display: flex;
            background-color: white;
            border: 1px solid black;
            border-radius: 5px;
            padding: 5px;
            margin: 5px;
          }
      </style>`)
    );
  }

  function loadGoogleTranslate() {
    document.body.prepend(
      createMyNode(`<div id="google_translate_element"></div>`)
    );

    const script = document.createElement("script");
    script.src =
      "//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.head.appendChild(script);
  }

  window.googleTranslateElementInit = onGoogleTranslateScriptLoaded;
  appendMainStyle();
  loadGoogleTranslate();
})();
