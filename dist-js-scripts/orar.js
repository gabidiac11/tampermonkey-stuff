// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        https://profs.info.uaic.ro/~orar/participanti/orar_I3A2.html
// @icon         https://www.google.com/s2/favicons?sz=64&domain=uaic.ro
// @grant        none
// ==/UserScript==

(function () {
    'use strict';

    // contants
    const myCourses = [
        "Calcul numeric",
        "Grafica pe calculator",
        "Tehnici de programare pe platforme mobile",
        "Cloud Computing",
        "Modelarea sistemelor digitale"
    ].map(i => i.toLowerCase());

    const myRestante = [
        "https://profs.info.uaic.ro/~orar/discipline/orar_fai.html"
    ];

    // functions
    function createMyNode(string) {
        const div = document.createElement("DIV");
        div.innerHTML = string;
        console.log({ div: div.firstChild.tagName })
        return div.firstChild;
    }

    function addNextToSibling(sibling, newNode) {
        if (sibling.nextSibling) {
            sibling.parentNode.insertBefore(newNode, sibling.nextSibling);
        } else {
            sibling.parentNode.appendChild(newNode);
        }
    }

    function appendStyle() {
        const style =
            `<style>
                .useless {
                    display: none;
                }

                body[show-useless] .useless {
                    display: table-row;
                    opacity: 0.2;
                }

                body[show-useless] .useless {
                    content: "Hide useless"
                }

                /* toggle useless */
                .toggle-useless {
                    padding: 10px;
                }

                body .toggle-useless::before {
                    content: "Show useless"
                }

                body[show-useless] .toggle-useless::before {
                    content: "Hide useless"
                }

                .restante {
                    margin-top: 30px;
                    margin-bottom: 10px;
                }

                .restante h3 {
                    margin: 5px;
                }
            </style>`;

        document.body.append(createMyNode(style));
    }

    function findUselessRows(tableNode) {


        const trs = Array.prototype.filter.call(tableNode.querySelectorAll("tr"), (tr) => {
            // filter out separtor (headers, sub-headers)
            const isSeparatorTr = tr.hasAttribute("bgcolor") || tr.children[0].hasAttribute("colspan") || tr.children.length < 3;
            if (isSeparatorTr) {
                return false;
            }

            //the 3rd column should contains non-useless titles
            const nameColumnContents = tr.children[2].innerText.toLowerCase();
            const isUseless = !myCourses.some(name => nameColumnContents.indexOf(name) > -1);
            if (isUseless) {
                tr.classList.add("useless");
                return true;
            }
            return false;
        });

        return trs;
    }

    const addUselessToggle = (tableNode) => {
        const node = createMyNode(`<button class="toggle-useless" id="toggle-useless"> </button>`);
        tableNode.parentNode.prepend(node);

        node.addEventListener("click", () => {
            if (document.body.hasAttribute("show-useless")) {
                document.body.removeAttribute("show-useless");
                return;
            }
            document.body.setAttribute("show-useless", "");
        });
    }

    async function addRestanteTable(link) {
        let text = await (await fetch(link)).text();
        window.text = text;
        if (!text) {
            return;
        }

        const node = createMyNode(
            `<div class="restante" >
                <h3> Restante fetched from <a href="${link}" target="_blank" > ${link.replace("https://profs.info.uaic.ro/~orar/discipline/", "")} </a></h3> 
                <table ${text.split("<table ")[1].split("</table>")[0]}
                </table>
            </div>`);

        const targetTable = document.querySelector(".target-table");
        addNextToSibling(targetTable, node);

        console.log(`inserted table from restante from ${link}`, { node });
    }

    function init() {
        appendStyle();

        const tableNode = document.body.querySelector("table");
        tableNode.classList.add("target-table");

        findUselessRows(tableNode);
        addUselessToggle(tableNode);

        myRestante.forEach(addRestanteTable);
    }
    init();
})();

