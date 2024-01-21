export const createHtmlElement = (htmlStringToBeParsed: string) => {
  const div = document.createElement("DIV");
  div.innerHTML = htmlStringToBeParsed;
  console.log("createMyNode", { div: div.children[0] });
  return div.children[0] as HTMLElement;
};

export const appendCss = (css: string) => {
  const styleEl = document.createElement("STYLE");
  styleEl.innerHTML = css;
  document.head.appendChild(styleEl);
  console.log("added csss", { styleEl });
  return styleEl as HTMLElement;
};