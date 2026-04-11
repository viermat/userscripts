// ==UserScript==
// @name         Gravedigger
// @version      v1
// @description  Spy player's stats before attacking
// @author       viermat (https://github.com/viermat)
// @match        https://web.simple-mmo.com/*
// @icon         https://web.simple-mmo.com/favicon-32x32.png
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_registerMenuCommand
// ==/UserScript==

(async function () {
	"use strict";

	// Ensure script doesn't run in iframes
	if (window.top !== window.self) return;

	GM_registerMenuCommand("Get API Key", function () {
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
		});
	});

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

	// URL Path array
	var argArr = location.href.split("/");

	if (/\/user\/attack\/[0-9]+/g.test(location.href)) {
		// Calculate user's and opponents' strength and defence
		const meData = await postReq("player/me");
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
