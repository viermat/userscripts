// ==UserScript==
// @name         Pacdora SVG
// @version      1
// @description  Pacdora free SVG download button
// @author       shellworm
// @match        https://www.pacdora.com/dielines-detail/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    const downloadSvg = (svgString) => {
        const blob = new Blob([svgString], { type: "image/svg" });

        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");

        a.setAttribute(
            "download",
            new URLSearchParams(window.location.search).get("id") + ".svg"
        );
        a.setAttribute("href", url);

        a.style.display = "none";
        document.body.appendChild(a);

        a.click();
        a.remove();

        URL.revokeObjectURL(url);
    };

    var mainDiv = document.createElement("div");
    mainDiv.classList.add("format-file-box-item");

    var iconDiv = document.createElement("div");
    iconDiv.classList.add("format-file-box-item-content");
    iconDiv.setAttribute("gtm", "ga-dieline_export_mockup_choose");

    var nameDiv = document.createElement("div");
    nameDiv.classList.add("format-file-box-item-name");
    nameDiv.innerHTML = "SVG";

    mainDiv.setAttribute("data-v-478ed3c7", "");
    iconDiv.setAttribute("data-v-478ed3c7", "");
    nameDiv.setAttribute("data-v-478ed3c7", "");

    iconDiv.appendChild(nameDiv);
    mainDiv.appendChild(iconDiv);

    mainDiv.addEventListener("click", () => {
        if (
            document
                .querySelector("#knife-traditional")
                .innerHTML.includes("text")
        ) {
            alert("Turn off dimensions before downloading as SVG");

            var ruler = document.querySelector(".p-icon-ruler");
            if (!ruler.classList.contains("active")) ruler.click();
        } else {
            downloadSvg(document.querySelector("#knife-traditional").innerHTML);
        }
    });

    var id = setInterval(() => {
        var elem = document.querySelector(
            "div[data-v-478ed3c7].format-file-box"
        );

        if (elem != null) {
            elem.appendChild(mainDiv);
            clearInterval(id);
        }
    }, 100);
})();
