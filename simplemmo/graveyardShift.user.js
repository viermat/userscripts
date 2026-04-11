// ==UserScript==
// @name 		 Graveyard Shift
// @version      v1
// @description  Get notifications when the boss is almost attackable
// @author       viermat (https://github.com/viermat)
// @match        https://web.simple-mmo.com/*
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// @grant        unsafeWindow
// ==/UserScript==

(async function () {
	GM_registerMenuCommand("Set earliest notification", function () {
		let value = prompt(
			"Set how soon the notifications should start (in minutes)",
			5,
		);
		if (value) GM_setValue("timeout", value);
	});

	GM_registerMenuCommand("Set notification interval", function () {
		let value = prompt(
			"Set how often the notification should appear when the world boss is soon (in minutes)",
			2,
		);

		if (value) GM_setValue("interval", value);
	});

	/**
	 * Get date when boss is attackable
	 * @param {String} timeLeft Unparsed string for time left until boss is attackable
	 * @returns {Date} Parsed date
	 */
	function parseTime(timeLeft) {
		const timeArr = timeLeft.split(/[a-z]+/);

		let secs = 0;

		secs += /([0-9]+)/g.exec(timeArr[0])[1] * 24 * 60 ** 2 || 0;
		secs += /([0-9]+)/g.exec(timeArr[1])[1] * 60 ** 2 || 0;
		secs += /([0-9]+)/g.exec(timeArr[2])[1] * 60 || 0;

		let returnDate = new Date();
		returnDate.setSeconds(returnDate.getSeconds() + secs);

		return returnDate;
	}

	// Use iframe to avoid using the public API
	let tempFrame = document.createElement("iframe");
	tempFrame.setAttribute(
		"src",
		"https://web.simple-mmo.com/battle/world-bosses",
	);
	tempFrame.setAttribute("style", "display: none");
	document.body.appendChild(tempFrame);

	const BOSSES = [];

	tempFrame.addEventListener("load", () => {
		// Push earliest boss first
		let earliestBoss = tempFrame.contentWindow.document.querySelector(
			"div.p-4 > div > div.ml-3",
		);

		BOSSES.push({
			name: earliestBoss
				.querySelector(".text-gray-900")
				.textContent.trim(),
			level: earliestBoss
				.querySelector(".text-gray-500")
				.textContent.trim(),
			avatar: earliestBoss.parentElement.querySelector(
				"div.flex-shrink-0 > img",
			).src,
			date: parseTime(
				earliestBoss
					.querySelector("p.text-gray-400")
					.textContent.trim(),
			),
		});

		// Push rest of the bosses
		tempFrame.contentWindow.document
			.querySelectorAll("div.truncate > div:nth-child(3) > div")
			.forEach((e) => {
				let mainDiv = e.closest(".truncate");

				BOSSES.push({
					name: mainDiv
						.querySelector(".font-bold")
						.textContent.trim(),
					level: mainDiv
						.querySelector(".font-normal")
						.textContent.trim(),
					avatar: mainDiv.parentElement.querySelector("img").src,
					date: parseTime(e.textContent.trim()),
				});
			});

		tempFrame.remove();
	});

	/**
	 * Check if any boss needs a notification
	 * @param {Object[]} bosses Parsed bosses list
	 * @param {Number} timeout How much time before notification (in minutes)
	 * @param {Number} [toastTimeout=15] Toast timeout (in seconds)
	 */
	function handleNotify(bosses, timeout, toastTimeout = 15) {
		bosses.forEach((b) => {
			let diff = b.date.getTime() - new Date().getTime();

			if (diff >= 0 && diff <= timeout * 60 * 1000) {
				unsafeWindow.game_data.settings.toast_position = "bottom_left";

				// Build custom <img> as the argument offered by displayToast for icon does not allow for resizing
				displayToast(
					`<img width="30" height="30" src=${b.avatar} /> ${b.name} (${b.level}) at ${b.date
						.getHours()
						.toString()
						.padStart(2, "0")}:${b.date
						.getMinutes()
						.toString()
						.padStart(2, "0")}`,
					null,
					"info",
					15 * 1000,
				);

				unsafeWindow.game_data.settings.toast_position = null;
			}
		});
	}

	// First page load check
	handleNotify(BOSSES, GM_getValue("timeout"));

	// Regular check
	setInterval(
		() => {
			handleNotify(BOSSES, GM_getValue("timeout"));
		},

		GM_getValue("interval") * 60 * 1000,
	);
})();
