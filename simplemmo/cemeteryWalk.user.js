// ==UserScript==
// @name         Cemetery Walk
// @version      v2
// @description  Undetectable auto stepper
// @author       viermat (https://github.com/viermat)
// @match        https://web.simple-mmo.com/travel*
// @grant        none
// ==/UserScript==

(function () {
	"use strict";

	// Create custom menu category
	const titleOld = document.querySelector("h3");
	const title = titleOld.cloneNode(true);

	title.textContent = "viermat";
	titleOld.parentElement.append(
		document.querySelectorAll("hr")[2].cloneNode(),
		title,
	);

	// Create action button
	const btnOld = Array.from(document.querySelectorAll("span")).find((span) =>
		span.textContent.includes("Inventory"),
	);

	const btn = btnOld.parentElement.cloneNode(true);
	btnOld.parentElement.parentElement.appendChild(btn);

	// Action button's text element
	const btnSpan = btn.querySelector("span");

	// Check for SMMO's "captcha"
	new MutationObserver((mList) => {
		for (const m of mList) {
			if (m.type === "childList") {
				if (
					Array.from(document.querySelectorAll("*")).find((btn) =>
						btn.textContent.includes("I'm a person! Promise!"),
					)
				) {
					// Kill stepper
					window.isOn = false;
					alert("Human confirmation needed");
					changeColor();
				}
			}
		}
	}).observe(document.querySelector('div[class="px-4 py-3"]'), {
		childList: true,
		subtree: true,
	});

	/**
	 * Change stepper action button color
	 * @param {String} [color="crimson"] color Button color
	 */
	function changeColor(color = "crimson") {
		btnSpan.style.color = color;
		btn.querySelector("svg").setAttribute("fill", color);
	}

	/**
	 * Stepper interval checker
	 * @param {Number} t Interval timeout for stepping
	 */
	function autoStep(t) {
		window.goodbye = setInterval(
			() => {
				if (window.isOn) {
					window.fakeX = 800 + Math.floor(Math.random() * 90);
					window.fakeY = 880 + Math.floor(Math.random() * 30);

					let result = Array.from(
						document.querySelectorAll("span"),
					).find((span) => span.textContent.includes("Take a Step"));

					if (result) result = result.parentElement;
					if (!result.disabled) result.click();

					autoStep(t);
				}

				clearInterval(window.goodbye);
			},
			t + Math.floor(Math.random() * 500),
		);
	}

	// Stylize action button
	btnSpan.textContent = "Stepper";
	btn.style.cursor = "pointer";

	// Set default color
	changeColor();

	// Repurpose "a" element into a button
	btn.removeAttribute("href");
	btn.addEventListener("click", () => {
		window.isOn = !window.isOn;

		if (window.isOn) changeColor("lime");
		else changeColor();

		autoStep(1200);
	});

	// Monkey-patching fetch
	// This is the most important part of the user script, as this makes the step request seem legit by faking cursor position and denying event dispatching.

	const oldFetch = window.fetch;

	window.fetch = async (...args) => {
		if (
			args[0].startsWith("https://") &&
			new URL(args[0]).href.startsWith(
				"https://api.simple-mmo.com/api/action/travel/4",
			)
		) {
			var params = args[1].body;

			params.set("s", "false");
			params.set("d_1", window.fakeX || 830);
			params.set("d_2", window.fakeY || 890);
		}

		return oldFetch(...args);
	};
})();
