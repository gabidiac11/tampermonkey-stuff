// ==UserScript==
// @name         New Userscript
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

  const PAGE_STYLES = {
    "https://genius.com": `
    #side-by-side-container aside, footer { display: none; }
    #side-by-side-container      a {
                pointer-events: none;
              }
        `,
  };
  const pageStyleStr = PAGE_STYLES[window.location.origin] ?? ``;

  function createMyNode(htmlStringToBeParsed) {
    const div = document.createElement("DIV");
    div.innerHTML = htmlStringToBeParsed;
    console.log("createMyNode", { div: div.firstChild });

    return div.firstChild;
  }

  function googleTranslateElementInit() {
    const originalBodyStr = document.getElementsByTagName("html")[0].outerHTML; //document.body.inner;

    const createAndAddTranslationBtn = () => {
      window.translationElement = new google.translate.TranslateElement(
        {
          pageLanguage: "auto",
          includedLanguages: "en",
          layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
        },
        "google_translate_element"
      );
    };

    const addStartButton = () => {
      const btn = createMyNode(
        `<button class="tr-my-stuff-btn"> Press translate and create side by side view </button>`
      );
      btn.addEventListener("click", () => {
        btn.style.display = "none";
        addSideBySideTranslation();
      });
      document.body.prepend(btn);
    };

    const addSideBySideTranslation = () => {
      const cleanBody = (strBody) =>
        strBody
          .replace(`id="google_translate_element"`, "")
          .replace("<iframe ", "<gunoi ")
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
    };

    const main = () => {
      createAndAddTranslationBtn();
      addStartButton();
    };
    main();
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
            border-radius: 1.25rem;
            padding: 0.5rem 1.313rem;
            border: 1px solid rgb(0, 0, 0);
            font-family: HelveticaNeue, Arial, sans-serif;
            font-size: 1rem;
            font-weight: 400;
            line-height: 1.1;
            color: rgb(0, 0, 0);
            cursor: pointer;
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

  window.googleTranslateElementInit = googleTranslateElementInit;
  appendMainStyle();
  loadGoogleTranslate();
})();
