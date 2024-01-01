// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://*.atlassian.net/jira/software/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=atlassian.net
// @grant        none
// ==/UserScript==

const myStyle = `
  .tampermonkey-btn {
    appearance: auto;
    writing-mode: horizontal-tb !important;
    font-style: ;
    font-variant-ligatures: ;
    font-variant-caps: ;
    font-variant-numeric: ;
    font-variant-east-asian: ;
    font-variant-alternates: ;
    font-weight: ;
    font-stretch: ;
    font-size: ;
    font-family: ;
    font-optical-sizing: ;
    font-kerning: ;
    font-feature-settings: ;
    font-variation-settings: ;
    text-rendering: auto;
    color: buttontext;
    letter-spacing: normal;
    word-spacing: normal;
    line-height: normal;
    text-transform: none;
    text-indent: 0px;
    text-shadow: none;
    display: inline-block;
    text-align: center;
    align-items: flex-start;
    cursor: default;
    box-sizing: border-box;
    background-color: buttonface;
    margin: 0em;
    padding: 1px 6px;
    border-width: 2px;
    border-style: outset;
    border-color: buttonborder;
    border-image: initial;


    -webkit-box-align: baseline;
    align-items: baseline;
    box-sizing: border-box;
    display: inline-flex;
    font-size: inherit;
    font-style: normal;
    font-family: inherit;
    font-weight: 500;
    max-width: 100%;
    position: relative;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    height: 2.28571em;
    line-height: 2.28571em;
    vertical-align: middle;
    width: auto;
    -webkit-box-pack: center;
    justify-content: center;
    color: var(--ds-text, #42526E) !important;
    border-width: 0px;
    border-radius: 3px;
    text-decoration: none;
    transition: background 0.1s ease-out 0s, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38) 0s;
    background: var(--ds-background-neutral, rgba(9, 30, 66, 0.04));
    padding: 0px 10px;
    outline: none;
    margin: 0 0 0 10px;
  }


  .tamper-monkye-btn > span {
    -webkit-box-align: baseline;
    align-items: baseline;
    box-sizing: border-box;
    display: inline-flex;
    font-size: inherit;
    font-style: normal;
    font-family: inherit;
    font-weight: 500;
    max-width: 100%;
    position: relative;
    text-align: center;
    white-space: nowrap;
    cursor: pointer;
    height: 2.28571em;
    line-height: 2.28571em;
    vertical-align: middle;
    width: auto;
    -webkit-box-pack: center;
    justify-content: center;
    color: var(--ds-text, #42526E) !important;
    border-width: 0px;
    border-radius: 3px;
    text-decoration: none;
    transition: background 0.1s ease-out 0s, box-shadow 0.15s cubic-bezier(0.47, 0.03, 0.49, 1.38) 0s;
    background: var(--ds-background-neutral, rgba(9, 30, 66, 0.04));
    padding: 0px 10px;
    outline: none;
    margin: 0px;


    opacity: 1;
    transition: opacity 0.3s ease 0s;
    margin: 0px 2px;
    -webkit-box-flex: 1;
    flex-grow: 1;
    flex-shrink: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .tampermonkey-btns-wrapper {
    height: 20px;
    width: 20px;
    position: relative;
  }
  .tampermonkey-btns-wrapper > div {
    position: absolute;
    display: flex;
    top: -4px;
    left: 0;
  }
`;

(function () {
  "use strict";

  const SELECTORS = {
    openIssue: {
      issueIdContainer: `[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"]`,
      issueIdSpan: `[data-test-id="issue.views.issue-base.foundation.breadcrumbs.breadcrumb-current-issue-container"] a[data-testid="issue.views.issue-base.foundation.breadcrumbs.current-issue.item"] span`,
      issueTitle: `[data-test-id="issue.views.issue-base.foundation.summary.heading"]`,
      copyOpenIssueTitle_elementId: `tampermonkey-btn-copy-issue`,
    },
  };

  const PAGES = {
    openIssueWithModalPage: "openIssuePage",
    activeSprintPage: "activeSprintPage",
  };

  // UTILS:
  const createMyNode = (htmlStringToBeParsed) => {
    const div = document.createElement("DIV");
    div.innerHTML = htmlStringToBeParsed;
    console.log("createMyNode", { div: div.firstChild });

    return div.firstChild;
  };

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      console.log(`Text copied to clipboard: '${text}'`);
      return true;
    } catch (err) {
      console.error("Failed to copy text: ", err);
      return false;
    }
  };

  const getCurrentPage = () => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get("selectedIssue") && urlParams.get("modal")) {
      return PAGES.openIssueWithModalPage;
    }

    if (window.location.href.indexOf("/boards/") > -1) {
      return PAGES.activeSprintPage;
    }
  };

  // ISSUE MODAL PAGE:
  const addButtonCopyTitleForTimesheet_ToOpenIssue = async () => {
    if (getCurrentPage() !== PAGES.openIssueWithModalPage) {
      return;
    }
    if (
      document.getElementById(SELECTORS.openIssue.copyOpenIssueTitle_elementId)
    ) {
      return;
    }

    const breadCrumbIssueIdContainer = document.querySelector(
      SELECTORS.openIssue.issueIdContainer
    );
    if (breadCrumbIssueIdContainer == null) {
      console.log(
        `Cound find element with breadCrumbIssueIdContainer at ${SELECTORS.openIssue.issueIdContainer}`
      );
      return;
    }

    const issueId = document.querySelector(
      SELECTORS.openIssue.issueIdSpan
    ).innerHTML;
    const issueTitle = document.querySelector(
      SELECTORS.openIssue.issueTitle
    ).innerHTML;

    const createCopyTitleBtn = () => {
      const copyTitleBtnNode = createMyNode(
        `<button class="tampermonkey-btn" id="${SELECTORS.openIssue.copyOpenIssueTitle_elementId}"><span> Copy title <span></button>`
      );
      copyTitleBtnNode.addEventListener(
        "click",
        async () => await copyToClipboard(`${issueId} - ${issueTitle}`)
      );
      return copyTitleBtnNode;
    };
    const createCopyIdBtn = () => {
      const copyIdBtnNode = createMyNode(
        `<button class="tampermonkey-btn"><span> Copy ID </span></button>`
      );
      copyIdBtnNode.addEventListener(
        "click",
        async () => await copyToClipboard(issueId)
      );
      return copyIdBtnNode;
    };

    const wrapperButtonsNode = createMyNode(
      `<div class="tampermonkey-btns-wrapper"><div></div></div>`
    );
    [createCopyTitleBtn(), createCopyIdBtn()].forEach((n) =>
      wrapperButtonsNode.firstChild.appendChild(n)
    );
    breadCrumbIssueIdContainer.appendChild(wrapperButtonsNode);
  };

  // SYLTE
  document.body.append(createMyNode(`<style>${myStyle}</style>`));

  const currentPage = getCurrentPage();
  //TODO:
  // monitorHTTPRequests();

  switch (currentPage) {
    case PAGES.openIssueWithModalPage:
      setTimeout(() => addButtonCopyTitleForTimesheet_ToOpenIssue(), 2000);
      break;
  }

  window.addEventListener("click", () => {
    addButtonCopyTitleForTimesheet_ToOpenIssue();
  });

  // GENERAL MONITORING
  const monitorHTTPRequests = () => {
    const oldXHR = window.XMLHttpRequest;
    function createXHR() {
      const realXHR = new oldXHR();

      realXHR.addEventListener("readystatechange", function () {
        console.log({ this: this });
        const isModalRequestDoneAndFinished =
          this.readyState === 4 &&
          this.status === 200 &&
          this.responseURL.includes("?rapidViewId=");

        if (isModalRequestDoneAndFinished) {
          console.log(
            "Request to operation=issueViewInteractiveQuery detected!"
          );
          setTimeout(() => addButtonCopyTitleForTimesheet_ToOpenIssue(), 2000);
        }
      });
      return realXHR;
    }
    window.XMLHttpRequest = createXHR;
  };
})();
