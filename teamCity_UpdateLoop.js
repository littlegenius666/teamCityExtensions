// ==UserScript==
// @name         TeamCity Extensions - main loop
// @namespace    https://build.code.ipreo.com/
// @version      0.1.2
// @description  Base extension for TeamCity, containing main update loop
// @author       Yelyzaveta Horbachenko
// @include      *https://build.code.ipreo.com*
// @grant        none
// @downloadURL https://github.com/littlegenius666/teamCityExtensions/blob/master/teamCity_UpdateLoop.js
// @updateURL https://github.com/littlegenius666/teamCityExtensions/blob/master/teamCity_UpdateLoop.js
// ==/UserScript==

(function() {
	'use strict';

	if (!window.extFunctions) {
		window.extFunctions = [];
	}

	var updatePageLoop = function() {
		for (var i = 0; i < window.extFunctions.length; i++)
		{
			window.extFunctions[i]();
		}

		setTimeout(updatePageLoop, 500);
	};
	updatePageLoop();
})();