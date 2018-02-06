// ==UserScript==
// @name         New TeamCity Extensions - Get Good view for Daily Report
// @namespace    http://build.code.ipreo.com/
// @version      0.1.6
// @description  Extension for TeamCity, Add button to Action (Good view for Daily Report)
// @author       Anton Ternov
// @match        https://build.code.ipreo.com/*buildId*
// @grant        none
// @downloadURL https://github.com/littlegenius666/teamCityExtensions/raw/master/teamCity_GoodViewForDailyReport.js
// @updateURL https://github.com/littlegenius666/teamCityExtensions/raw/master/teamCity_GoodViewForDailyReport.js
// ==/UserScript==

(function () {
    'use strict';

    var querySelectorForFailedTests = {
        "all": ".testList a.testWithDetails",
        "checked": '.testList tr.testRowSelected:not([style*="display: none"]) a.testWithDetails',
        "filtered": '.testList tr:not([style*="display: none"]) a.testWithDetails'
    };

	function getFailedTests(option) {
		var testNames = [];
		var testElements = document.querySelectorAll(querySelectorForFailedTests[option]);
		for (var i = 0; i < testElements.length; i++) {
			var tooltipElement = testElements[i].querySelector("span[onmouseover]");
			var testName;
			if (tooltipElement) {
				var tooltipMouseover = tooltipElement.getAttribute('onmouseover');
				testName = tooltipMouseover.substring(tooltipMouseover.indexOf("'") + 1, tooltipMouseover.lastIndexOf("'") - 1).trim();
			} else {
				testName = testElements[i].innerText.trim();
			}
			testNames[i] = testName;
		}
		return testNames;
	}
    function getSpacesNums(spaces){
            var nums = [];

            spaces.forEach(function (space) {
                    nums.push(getSpaceTestCount(space));
            }, Object.create(null));

            return nums;
     }
    function getSpaceTestCount(space){
            var str = space;
            str = str.indexOf(":") >= 0 ? str.split(':').slice(-1)[0] : str;
            var result = str.match( /([0-9A-Za-z_\.-]+) \((\d+)\)/i );
            var testCount = parseInt(result[2]);
            return testCount;
    }
    function getSpaceName (space){
            var str = space;
            str = str.indexOf(":") >= 0 ? str.split(':').slice(-1)[0] : str;
            var result = str.match( /([0-9A-Za-z_\.-]+) \((\d+)\)/i );
            var areaName = result[1];
            return areaName;
     }
    function OpenGoodView(){
        var title = document.evaluate("//div[@class='select-all']/label", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var failed = document.evaluate("//p[@id='idfailed']/span[@class='failCount']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var passed = document.evaluate("//p[@class='passedTestsBlock']/span[@class='passCount']", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        var titleValue = title === null? "":title.innerText;
        var passedValue = passed === null? "0":passed.innerText;
        var failedValue = failed === null? "0":failed.innerText;

        /*all areas*/
        var nodesArray = Array.prototype.slice.call(document.querySelectorAll("div[class*='group-div'] > div[class*='group-name']"));
        var __spaces = nodesArray.map(function(e){return e.innerText;});
        var __spacesDimension =  getSpacesNums(__spaces);

        /*all failed tests*/
        var unhiddenTests = getFailedTests("filtered");
        var __allFailedTests = getFailedTests("all");

        /*functions*/
        function getFailedTestIndexByName(name){
            var idx = __allFailedTests.indexOf(name);
            return idx;
        }
        var decodeEntities = function(encodedString) {
            var textArea = document.createElement('textarea');
            textArea.innerHTML = encodedString;
            return textArea.value;
        };

        var getNumber = function(str){
            var result = str.match( /(\d+)/i );
            var num = result[1];
            return num;
        };

        var getInfo = function(failed, passed){
            var failedNum = getNumber(failed);
            var passedNum = getNumber(passed);
            var percent = Math.round(100*( +passedNum / (+passedNum + (+failedNum)) ));
            var info = '<table border="1" bordercolor="#EEEEEE">\n';
            info += "<tr><th>all</th><th>failed</th><th>passed</th><th>%</th></tr><tr><td align='center'>"+(+passedNum + (+failedNum))+"</td><td align='center'><span style='color:red;'>"+failedNum+"</span></td><td align='center'><span style='color:green;'>"+passedNum+"</span></td><td align='center'>"+percent+"%</td></tr>";
            info += '</table>\n';
            return info;
        };

        var getSpacesLastTestIndexes = function(spaces){
            var nums = [];
            var counter = 0;

            spaces.forEach(function (space) {
                    counter += getSpaceTestCount(space);
                    nums.push(counter);
            }, Object.create(null));

            return nums;
        };

        var getSpaceNameForTestByTestIdx = function(unfilteredTestIdx){
            var spaceName = "";
            var counter = -1;
            for(var i=0;i<__spacesDimension.length;i++){
                counter += __spacesDimension[i];
                if(unfilteredTestIdx <= counter){
                    return getSpaceName(__spaces[i]);
                }
            }
            return spaceName;
        };

        var getFailedTestsTable = function(tests){
            //var table = '<table  id="tableId" border="1" bordercolor="#AAAAAA"><tr><th>Test Area</th><th>Test Case</th><th></th></tr>\n ';
            var table = '<table  id="tableId" border="1" bordercolor="#AAAAAA">\n ';
            var mystring = "";
            var testCounter = 0;
            var lastSpaceName = "";

            for(var i = 0 ; i < tests.length; i++)
            {
                var unfilteredTestIdx = getFailedTestIndexByName(tests[i]);
                var currentSpaceName = getSpaceNameForTestByTestIdx(unfilteredTestIdx);
                if(lastSpaceName !== currentSpaceName){
                    lastSpaceName = currentSpaceName;
                    table += '<tr><td>'+currentSpaceName+'</td><td>'+tests[i]+'</td><td></td></tr>\n';
                } else {
                    table += '<tr><td></td><td>'+tests[i]+'</td><td></td></tr>\n';
                }
            }
            table += '</table>\n';
            return table;
        };

        var goodView = function(title, failed, passed, tests) {
            var failedTestsTable = getFailedTestsTable(tests);
            var info = getInfo(failed, passed);

            var myWindow1 = window.open('', 'myWindow1', 'scrollbars=1,height='+Math.min(1000, screen.availHeight-100)+',width='+Math.min(1600, screen.availWidth));
            myWindow1.document.write(`
                   <!DOCTYPE html>
                        <style>
                            td {
                               font-family: "Times New Roman", Times, serif;
                               font-size: 12pt;
                            }

.button {
    background-color: #FFFFFF;
    border: 2px solid #008CBA;
    color: #008CBA;
    padding: 5px 5px;
    text-align: center;
    text-decoration: none;
    display: inline-block;
    font-size: 14px;
   -webkit-transition-duration: 0.3s;
    transition-duration: 0.3s;
}

.button:hover {
    background-color: #4CAF50;
    color: white;
}
                        </style>

<script type="text/javascript">
    function selectElementContents(el) {
        var body = document.body, range, sel;
        if (document.createRange && window.getSelection) {
            range = document.createRange();
            sel = window.getSelection();
            sel.removeAllRanges();
            try {
                range.selectNodeContents(el);
                sel.addRange(range);
            } catch (e) {
                range.selectNode(el);
                sel.addRange(range);
            }
        } else if (body.createTextRange) {
            range = body.createTextRange();
            range.moveToElementText(el);
            range.select();
        }

  try {
    // Теперь, когда мы выбрали текст ссылки, выполним команду копирования
    var successful = document.execCommand('copy');
    var msg = successful ? 'successful' : 'unsuccessful';
    console.log('Copy of results was ' + msg);
    var statusObj = document.getElementById("copiedstatus");
    statusObj.innerHTML = msg+"!";
  } catch(err) {
    console.log('Oops, unable to copy');
  }

  // Снятие выделения - ВНИМАНИЕ: вы должны использовать
  // removeRange(range) когда это возможно
  window.getSelection().removeAllRanges();
    }
</script>

                        <head>
                          <meta charset="utf-8">
                          <title>`+ title +`</title>
                        </head>
                        <body id="body">
                            <p>`+ title +`</p><div style="padding-bottom:10px;">
<div style="display: block;">`+ info +`</div>
                                              </div>
                           <div> <h1>  </h1>
<div style="padding-bottom: 15px; font-size: 20px; font-family: "Segoe UI",Arial,sans-serif;">
    <div style="display:inline-block;"> Failed tests: </div>
    <div style="display:inline-block; margin-left: 40px;margin-top:10px;"><input id="copybutton" class="button" type="button" value="Copy to Clipboard" onclick="selectElementContents( document.getElementById('tableId') );"></div>
    <div style="display:inline-block; padding-left:20px;margin: auto;"><span id="copiedstatus" style="color: #008CBA;"></span></div>
</div>
` + failedTestsTable + ` </div>
                        </body>
                    </html>`
                                    );
        };
        /*---------*/

        goodView(titleValue, failedValue, passedValue, unhiddenTests);
    }
    function addGoodReportView() {
        var action = document.querySelector('#sp_span_bdActionsContent  ul.menuList');
        if (action){
            var linkLi = document.createElement("li");
            linkLi.setAttribute("class", "menuItem");
            linkLi.setAttribute("title","");
            var button = document.createElement("input");
            button.setAttribute("type", "button");
            button.setAttribute("value", "Good View for Daily Report");
            button.onclick = OpenGoodView;

            linkLi.appendChild(button);
            action.appendChild(linkLi);
        }
    }

    addGoodReportView();
})();
