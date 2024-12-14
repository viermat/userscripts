// ==UserScript==
// @name         24edu Average
// @version      1
// @description  Calculate yearly average before end of the year
// @author       shellworm
// @match        https://www.24edu.ro/Catalog
// @run-at       document-idle
// @grant        none
// ==/UserScript==

(function () {
    const findSpan = (value) => {
        return $("span")
            .filter(function () {
                return $(this).text() === value;
            })
            .parents()
            .eq(5);
    };

    var gradesArr = $("span.nota");
    var grades = [
        {
            Materie: "Purtare",
            Nota: Number(
                findSpan("Purtare")
                    .find("td > span > span:nth-child(1)")
                    .text()
                    .replaceAll(",", ".")
            ).toString(),
        },
    ];

    var root = {};

    for (let i = 0; i < gradesArr.length; i++)
        grades.push(JSON.parse(gradesArr[i].getAttribute("data-nota")));

    var classes = [...new Set(grades.map((k) => k["Materie"]))];
    for (let i = 0; i < classes.length; i++) root[classes[i]] = [];
    for (let i = 0; i < grades.length; i++)
        root[grades[i]["Materie"]].push(Number(grades[i]["Nota"]));

    var average = 0;
    var averageDiv = 0;

    for (const [k, v] of Object.entries(root)) {
        average += Math.round(v.reduce((a, b) => a + b, 0) / v.length);
        averageDiv++;
    }

    var averageFinal = Number(average / averageDiv).toFixed(2);

    var date = new Date().toLocaleDateString("ro-RO");
    var medie = document.createElement("span");
    medie.innerText = `Medie generala: ${averageFinal}`;
    medie.classList.add("nota", "btn", "btn-link");
    medie.setAttribute(
        "data-nota",
        `{"$id":"1","DataNotare":"${date}","DataCreare":"${date}","EsteCalificativ":false,"LabelNota":"Nota","Materie":"Medie generala","TipNota":"Medie","Nota":"${averageFinal}"}`
    );

    findSpan("Situatie scolara (sumar)").find(".widget-body").append(medie);
})();
