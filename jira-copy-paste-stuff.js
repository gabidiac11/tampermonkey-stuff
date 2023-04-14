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

    const copyTitleBtnNode = createMyNode(
      `<button id="${SELECTORS.openIssue.copyOpenIssueTitle_elementId}"> Copy title </button>`
    );
    copyTitleBtnNode.addEventListener(
      "click",
      async () => await copyToClipboard(`${issueId} - ${issueTitle}`)
    );

    const copyIdBtnNode = createMyNode(`<button> Copy id </button>`);
    copyIdBtnNode.addEventListener(
      "click",
      async () => await copyToClipboard(issueId)
    );
    [copyTitleBtnNode, copyIdBtnNode].forEach((n) =>
      breadCrumbIssueIdContainer.appendChild(n)
    );
  };

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
