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

import { createHtmlElement } from "../utils";

(function () {
  "use strict";

  interface IBookState {
    node: HTMLElement;
    checkbox: IBookCheckbox | null;
    id: string;
    isRead: boolean;
    name: string;
    author: string;
  }
  interface IBookCheckbox {
    input: HTMLInputElement;
    label: HTMLLabelElement;
  }

  const checkbox = (
    checkbox: HTMLElement,
    onChangeEvent: (checked: boolean) => void
  ) => {
    const input = checkbox.querySelector("input") as HTMLInputElement;
    const label = checkbox.querySelector("label") as HTMLLabelElement;

    const markCheckState = () => {
      label.innerText = input.checked ? "Puiuț citit." : "Puiuț ne-citit.";
    };
    const changeListener = (ev: Event) => {
      markCheckState();
      onChangeEvent(input.checked);
    };
    input.addEventListener("change", changeListener);
    markCheckState();

    return { input, label } as IBookCheckbox;
  };

  const bookStorageManager = (() => {
    interface IReadingState {
      [bookId: string]: 1;
    }

    const lcKey = "daniela-54898dbe-e67f-4ab8-87b2-8773f393a5fa";
    const updateBooks = (readingState: IReadingState) =>
      localStorage.setItem(`books-${lcKey}`, JSON.stringify(readingState));

    const createDefaultState = () => {
      const state = {} as IReadingState;
      updateBooks(state);
      return state;
    };
    const getInitBookState = () => {
      const stateStr = localStorage.getItem(`books-${lcKey}`);
      if (!stateStr) {
        return createDefaultState();
      }
      const readingState = JSON.parse(stateStr) as unknown as IReadingState;
      if (!readingState) {
        return createDefaultState();
      }
      return readingState;
    };
    const readingState = getInitBookState();

    return {
      isRead: (bookId: string) => !!readingState[bookId],
      updateIsRead: (bookId: string, isRead: boolean) => {
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
    let bookStates: IBookState[] = [];

    const addCheckbox = (bookState: IBookState) => {
      const node = createHtmlElement(`
        <div style="
        padding: 10px 20px;
    " class="bd-highlight">
          <input ${bookState.isRead ? "checked" : ""} type="checkbox" id="${
        bookState.id
      }">
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
      const nodes = Array.from(
        document.querySelectorAll(
          ".list-group.list-group-flush .list-group-item.book-list-item:not(.tampered)"
        )
      ) as HTMLElement[];

      const bookStates: IBookState[] = nodes.map((node) => {
        const name = node.querySelector(`a[href^="/books/"]`)?.innerHTML ?? "";
        if (!name) throw "Could not get book name from HTML";

        const author =
          node.querySelector(`a[href^="/authors/"]`)?.innerHTML ?? "";
        if (!author) throw "Could not get book author from HTML";

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
        } catch (err) {
          alert(`Tamper script: ${err}`);
        }
      },
    };
  })();

  setTimeout(() => {
    bookStateManager.updateFromPage();
    document.addEventListener("scroll", () =>
      bookStateManager.updateFromPage()
    );
  }, 1000);
})();
