export const createHtmlElement = (htmlStringToBeParsed: string) => {
  const div = document.createElement("DIV");
  div.innerHTML = htmlStringToBeParsed;
  console.log("createMyNode", { div: div.children[0] });
  return div.children[0] as HTMLElement;
};
