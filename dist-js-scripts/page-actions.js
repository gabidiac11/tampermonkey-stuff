// ==UserScript==
// @name         Page actions script
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://localhost:5000
// @icon         https://www.google.com/s2/favicons?sz=64&domain=undefined.localhost
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    function clickDelay(qSelector, delay) {
      return new Promise(resolve => {
        setTimeout(() => {
         try {
           const element = document.querySelector(qSelector);
           element.click();
        } catch(err) {
            console.error(`Error while clicking ${qSelector}`, {err});
            return resolve({err});
         }
         resolve({ok: true});
        }, delay);
      })
    }

    function writeToInputDelay(qSelector, value, delay) {
      return new Promise(resolve => {
        setTimeout(() => {
         try {
           const input = document.querySelector(qSelector);
             input.value = value;
             input.dispatchEvent(new Event('input', { 'bubbles': true }));
        } catch(err) {
            console.error(`Error while writing to input ${qSelector}`, {err});
            return resolve({err});
         }
         resolve({ok: true});
        }, delay);
      })
    }

    async function executeActionSequence(sequence) {
        console.log("Tempermonkay extension: starting executing clicks", sequence);

        const results = [];
        for(const item of sequence) {
            let currentResult = {item, err: "No match for this action"};

            switch(item.type) {
                case "click":
                    currentResult = await clickDelay(item.qSelector, item.delay ?? 50);
                    break;
                case "write":
                    currentResult = await writeToInputDelay(item.qSelector, item.value, item.delay ?? 50);
                    break;
                default:
            }

            results.push({...currentResult, item});
        }
        console.log("Tempermonkay extension: fishished executing clicks", results);
    }

    // Example: Let's say we have searching page with filters and results.
    // The squence will do: set search input, open calendar, go back 15 month, click search results
    if (window.location.href.includes('/my-example')) {
       executeActionSequence([
        {
            label: "input",
            type: "write",
            value: "my value",
            delay: 1000,
            qSelector: "#my-input"
        },
        {
            label: "calendar",
            type: "click",
            delay: 100,
            qSelector: "#calendar"
        },
        ...Array.from({ length: 15 }, () => ({
            label: "calendar - arrow back",
            type: "click",
            delay: 20,
            qSelector: "#calendar-arrow-left"
        })),
        {
            label: "calendar first day available",
            type: "click",
            delay: 50,
            qSelector: "#calendar-something > div.datepicker-month .day:not(.is-disabled)"
        },
        {
            label: "search",
            type: "click",
            delay: 50,
            qSelector: "#search-btn"
        },
       ]);
    }
})();