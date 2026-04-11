// ==UserScript==
// @name         Gravedigger
// @version      v2
// @description  Spy player's stats before attacking
// @author       viermat (https://github.com/viermat)
// @match        https://web.simple-mmo.com/*
// @icon         https://web.simple-mmo.com/favicon-32x32.png
// @grant        GM_setValue
// @grant        GM_getValue
// ==/UserScript==

(async function () {
	"use strict";

	// Ensure script doesn't run in iframes
	if (window.top !== window.self) return;

	// Check for API key
	if (!GM_getValue("api_key")) {
		let tempFrame = document.createElement("iframe");
		tempFrame.setAttribute("src", "https://web.simple-mmo.com/p-api/home");
		document.body.appendChild(tempFrame);

		tempFrame.addEventListener("load", () => {
			GM_setValue(
				"api_key",
				tempFrame.contentWindow.document.querySelector(
					"input[name='api_key']",
				).value,
			);

			tempFrame.remove();
			location.reload();
		});
	}

	const API_URL = "https://api.simple-mmo.com/v1/";
	const postReq = async (url) => {
		return fetch(API_URL + url, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},

			body: JSON.stringify({
				api_key: GM_getValue("api_key"),
			}),
		}).then((r) => {
			return r.json();
		});
	};

	// Cache system
	if (!GM_getValue("cache") || GM_getValue("cache").stats.error) {
		await postReq("player/me").then((s) => {
			GM_setValue("cache", {
				lastCache: new Date().getTime(),
				stats: s,
			});
		});
	}

	// URL Path array
	var argArr = location.href.split("/");

	// Check if user is attacking another use
	if (/\/user\/attack\/[0-9]+/g.test(location.href)) {
		if (GM_getValue("cache")) {
			let diff = new Date(GM_getValue("cache").lastCache) - new Date();

			if (diff <= -2 * 60 * 1000) {
				await postReq("player/me").then((s) => {
					GM_setValue("cache", {
						lastCache: new Date().getTime(),
						stats: s,
					});
				});
			}
		}

		// Calculate user's and opponents' strength and defence
		const meData = GM_getValue("cache").stats;
		const meStr = meData.str + meData.bonus_str;
		const meDef = meData.def + meData.bonus_def;

		const oppData = await postReq(
			"player/info/" + argArr[argArr.length - 1],
		);
		const oppStr = oppData.str + oppData.bonus_str;
		const oppDef = oppData.def + oppData.bonus_def;

		displayToast(`You: ${meStr} / ${meDef}`, null, "success", 5000);
		displayToast(`Opponent: ${oppStr} / ${oppDef}`, null, "error", 5000);

		// Check if opponent is 10% stronger than user
		if (meDef + meDef * 0.1 < oppStr || meStr < oppDef + oppDef * 0.1) {
			Swal.fire({
				title: "Warning",
				imageUrl: oppData.avatar,
				imageHeight: 64,

				html: "This player's stats are higher than yours. You might be defeated!",

				showCancelButton: true,
				confirmButtonColor: "#3085d6",
				confirmButtonText: "Go back",
			}).then((result) => {
				if (result.value) window.history.back();
			});
		}
	}
})();
