// ==UserScript==
// @name         TeamCity Extensions - Add attachments links
// @namespace    http://build.code.ipreo.com/
// @version      0.2.1
// @description  Extension for TeamCity, adding attachments links
// @author       Yelyzaveta Horbachenko
// @include      *https://build.code.ipreo.com*
// @grant        none
// @downloadURL https://github.com/littlegenius666/teamCityExtensions/raw/master/teamCity_AddAttachments.js
// @updateURL https://github.com/littlegenius666/teamCityExtensions/raw/master/teamCity_AddAttachments.js
// ==/UserScript==

(function () {
    'use strict';
    var attachmentRegex = /Attachment\s\-\s\[File:\s\'(\w|:|-| |\\|\.|\/)+\'\s\(\S+\/(\S+)\)\]/g;

    function getAttachmentUrl(fileName) {
        var origin = window.location.origin;
        var buildTypeId = document.querySelector('[data-buildtypeid]').getAttribute('data-buildtypeid');
        var buildId = document.querySelector('[data-buildid]').getAttribute('data-buildid');
        return origin + '/repository/download/' + buildTypeId + '/' + buildId + ':id/' + fileName;
    }

    function addAttachmentsLinks() {
        var testsDetails = document.querySelectorAll('.testDetailsRow');

        for (var i = 0; i < testsDetails.length; i++) {
            var testDetails = testsDetails[i];
            var toolbar = testDetails.querySelector("#ui_extension_toolbar");
            if (toolbar && !testDetails.getAttribute('attachmentsAdded')) {
                var stackTrace = testDetails.querySelector('.fullStacktrace').innerText;

                var matches = stackTrace.match(attachmentRegex);
                if (matches) {
                    matches = matches.filter(function (match) {
                        return match.indexOf('.PNG') === -1;
                    });
                }

                if (matches && matches.length > 0) {
                    var section = document.createElement("DIV");
                    section.innerHTML = 'Attachments:';
                    toolbar.appendChild(section);


                    for (var j = 0; j < matches.length; j++) {
                        var match = matches[j];
                        var startIndex = match.indexOf("'");
                        var endIndex = match.lastIndexOf("'");
                        var filePath = match.substring(startIndex + 1, endIndex);
                        filePath = filePath.replace(/\\/g, "/");

                        var nameStartIndex = filePath.lastIndexOf("/");
                        var fileName = filePath.substring(nameStartIndex + 1);

                        var linkDiv = document.createElement("DIV");
                        var anchor = document.createElement("A");
                        anchor.innerHTML = fileName;
                        anchor.href = getAttachmentUrl(filePath);
                        linkDiv.appendChild(anchor);
                        toolbar.appendChild(linkDiv);
                    }
                }

                testDetails.setAttribute('attachmentsAdded', 'true');
            }
        }
    }


    if (!window.extFunctions) {
        window.extFunctions = [];
    }
    window.extFunctions.push(addAttachmentsLinks);
})();