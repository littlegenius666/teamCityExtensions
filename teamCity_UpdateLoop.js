// ==UserScript==
// @name         TeamCity Extensions - main loop
// @namespace    http://ipreo.com/
// @version      0.1.2
// @description  Base extension for TeamCity, containing main update loop
// @author       Yelyzaveta Horbachenko
// @include      *tc41ny1us02*
// @grant        none
// @downloadURL https://github.com/Dreamescaper/teamCityExtensions/raw/master/teamCity_UpdateLoop.js
// @updateURL https://github.com/Dreamescaper/teamCityExtensions/raw/master/teamCity_UpdateLoop.js
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