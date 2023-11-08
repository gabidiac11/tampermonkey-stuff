# tampermonkey-stuff

## Jira copy-paste

## Side by side translation

Splits the page in 2 clones: one translated and one in the original language.

Uses translate element free API.

### Example

![Side by side translation song step 1](https://github.com/gabidiac11/tampermonkey-stuff/blob/main/docs/img/side-by-side-translation/side-by-side-translation-song-1.png)

=> 

![Side by side translation song step 2](https://github.com/gabidiac11/tampermonkey-stuff/blob/main/docs/img/side-by-side-translation/side-by-side-translation-song-2.png)

## Page actions script
In the day to day life of FE development, we might get into situation when we keep need to refil inputs and click stuff just to get where we really want to work on the page, which is annoying. I use this script to just to a series of actions like these to make it work faster.

Example:
```js
       executeActionSequence([
        {
            label: "search input",
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
```