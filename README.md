# tampermonkey-stuff

`/dist` are scripts generated with typescript (isolated from imports)

`/dist-js-script` are scripts that are not generated with typescript (a TODO)

## jira copy-paste - script

## Side by side translation - script

Splits the page in 2 clones: one translated and one in the original language.

Uses translate element free API.

### Example

![Side by side translation song step 1](https://github.com/gabidiac11/tampermonkey-stuff/blob/main/docs/img/side-by-side-translation/side-by-side-translation-song-1.png)

=> 

![Side by side translation song step 2](https://github.com/gabidiac11/tampermonkey-stuff/blob/main/docs/img/side-by-side-translation/side-by-side-translation-song-2.png)

## Page actions script - script
In the day to day life of FE development, we might get into situation when we keep needing to refill inputs, click stuff just to get where we really want to work on the page, which is annoying. I use this script to just to run a series of actions like these just to skip tediuous work.

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

## Restrict Youtube suggestions - script
       This script was created because I felt that youtube is taking advantage of our tendency to click on stupid gossip, overly political stuff, over-the-top videos. This is making us more addicted, waste more time, and keep us doom scrolling. And that's how we find ourselves more than often losing brain cells at 3 AM in the morning. Besides that, we may come to youtube with certain goal to achieve. We fail to watch the videos we really care about and the ones we need some brain power to follow (educational videos, relieble history videos, channels we're subscribed which upload with lower frequency). I may prefer to watch videos in a foreign language I want to learn (other than English), but can't follow on that because other gossip videos popup.