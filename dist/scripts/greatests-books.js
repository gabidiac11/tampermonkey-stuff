'use strict';

const createHtmlElement = (htmlStringToBeParsed) => {
    const div = document.createElement("DIV");
    div.innerHTML = htmlStringToBeParsed;
    console.log("createMyNode", { div: div.children[0] });
    return div.children[0];
};

// ==UserScript==
// @name         Greatest books
// @namespace    http://tampermonkey.net/
// @version      2023-12-31
// @description  try to take over the world!
// @author       You
// @match        https://thegreatestbooks.org/**
// @icon         https://www.google.com/s2/favicons?sz=64&domain=thegreatestbooks.org
// @grant        none
// ==/UserScript==
(function () {
    const checkbox = (checkbox, onChangeEvent) => {
        const input = checkbox.querySelector("input");
        const label = checkbox.querySelector("label");
        const markCheckState = () => {
            label.innerText = input.checked ? "Puiuț citit." : "Puiuț ne-citit.";
        };
        const changeListener = (ev) => {
            markCheckState();
            onChangeEvent(input.checked);
        };
        input.addEventListener("change", changeListener);
        markCheckState();
        return { input, label };
    };
    const bookStorageManager = (() => {
        const lcKey = "daniela-54898dbe-e67f-4ab8-87b2-8773f393a5fa";
        const updateBooks = (readingState) => localStorage.setItem(`books-${lcKey}`, JSON.stringify(readingState));
        const createDefaultState = () => {
            const state = {};
            updateBooks(state);
            return state;
        };
        const getInitBookState = () => {
            const stateStr = localStorage.getItem(`books-${lcKey}`);
            if (!stateStr) {
                return createDefaultState();
            }
            const readingState = JSON.parse(stateStr);
            if (!readingState) {
                return createDefaultState();
            }
            return readingState;
        };
        const readingState = getInitBookState();
        return {
            isRead: (bookId) => !!readingState[bookId],
            updateIsRead: (bookId, isRead) => {
                if (isRead) {
                    readingState[bookId] = 1;
                    updateBooks(readingState);
                    return;
                }
                delete readingState[bookId];
                updateBooks(readingState);
            },
        };
    })();
    const bookStateManager = (() => {
        let bookStates = [];
        const addCheckbox = (bookState) => {
            const node = createHtmlElement(`
        <div style="
        padding: 10px 20px;
    " class="bd-highlight">
          <input ${bookState.isRead ? "checked" : ""} type="checkbox" id="${bookState.id}">
            <label style="margin-lef:5px" for="${bookState.id}"></label>
        </div>`);
            const buttonActionContainer = bookState.node.querySelector(".row");
            if (!buttonActionContainer)
                throw `Could not find html buttons-container for book ${bookState.id}`;
            buttonActionContainer.appendChild(node);
            bookState.checkbox = checkbox(node, (checked) => {
                bookStorageManager.updateIsRead(bookState.id, checked);
                bookState.isRead = bookStorageManager.isRead(bookState.id);
            });
        };
        const extractUnmarkedBooksFromPage = () => {
            const nodes = Array.from(document.querySelectorAll(".list-group.list-group-flush .list-group-item.book-list-item:not(.tampered)"));
            const bookStates = nodes.map((node) => {
                var _a, _b, _c, _d;
                const name = (_b = (_a = node.querySelector(`a[href^="/books/"]`)) === null || _a === void 0 ? void 0 : _a.innerHTML) !== null && _b !== void 0 ? _b : "";
                if (!name)
                    throw "Could not get book name from HTML";
                const author = (_d = (_c = node.querySelector(`a[href^="/authors/"]`)) === null || _c === void 0 ? void 0 : _c.innerHTML) !== null && _d !== void 0 ? _d : "Unknown";
                const id = `${name}-${author}`;
                return {
                    id,
                    node,
                    name,
                    author,
                    checkbox: null,
                    isRead: bookStorageManager.isRead(id),
                };
            });
            bookStates.forEach((item) => {
                item.node.classList.add("tampered");
                addCheckbox(item);
            });
            return bookStates;
        };
        return {
            updateFromPage: () => {
                try {
                    const newBookStates = extractUnmarkedBooksFromPage();
                    bookStates = [...bookStates, ...newBookStates];
                    console.log({ bookStates });
                }
                catch (err) {
                    alert(`Tamper script: ${err}`);
                }
            },
        };
    })();
    setTimeout(() => {
        bookStateManager.updateFromPage();
        document.addEventListener("scroll", () => bookStateManager.updateFromPage());
    }, 1000);
})();
