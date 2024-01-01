// ==UserScript==
// @name         Inject style
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        *://*/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        none
// ==/UserScript==

import { createHtmlElement } from "../utils";

(function () {
  "use strict";
  const myStyle = [
    {
      host: "lenta.ru",
      css: `
      .topic-body__content-text {
        font-size: 20px;
      }
      `,
    },
  ].find((i) => window.location.host.indexOf(i.host) > -1);
  if (!myStyle) {
    return;
  }

  document.body.append(createHtmlElement(`<style my-style>${myStyle.css}</style>`));
})();
