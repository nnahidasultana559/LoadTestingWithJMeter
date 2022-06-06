/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 98.203125, "KoPercent": 1.796875};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.1553125, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.04, 500, 1500, "Getting website home page with port"], "isController": false}, {"data": [0.030625, 500, 1500, "Flight details"], "isController": false}, {"data": [0.955, 500, 1500, "Getting website home page-0"], "isController": false}, {"data": [0.015625, 500, 1500, "Getting website home page-1"], "isController": false}, {"data": [0.03375, 500, 1500, "Setting destination"], "isController": false}, {"data": [0.046875, 500, 1500, "Getting website home page with content encoding"], "isController": false}, {"data": [0.10875, 500, 1500, "Confirming ticket"], "isController": false}, {"data": [0.011875, 500, 1500, "Getting website home page"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 6400, 115, 1.796875, 5202.959375000003, 287, 11283, 4733.5, 9896.0, 10313.9, 10610.98, 133.9612768184197, 176.25431302328624, 71.73927263212978], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Getting website home page with port", 800, 17, 2.125, 6052.773749999996, 372, 10676, 5709.5, 10212.0, 10380.9, 10585.93, 29.870808752146964, 41.10441335365171, 12.922625270704204], "isController": false}, {"data": ["Flight details", 800, 18, 2.25, 5798.646250000002, 359, 10787, 5519.0, 9986.8, 10294.5, 10592.75, 22.833656810138145, 38.01302142795981, 15.162975225482361], "isController": false}, {"data": ["Getting website home page-0", 800, 0, 0.0, 396.2825000000005, 287, 1542, 377.0, 494.9, 547.8499999999998, 731.96, 75.00468779298707, 15.805003926026625, 25.27013407087943], "isController": false}, {"data": ["Getting website home page-1", 800, 7, 0.875, 5437.201250000002, 524, 10872, 4998.5, 9497.1, 9877.4, 10706.9, 38.47263633740502, 53.513502242233336, 12.961972203520245], "isController": false}, {"data": ["Setting destination", 800, 20, 2.5, 6933.369999999994, 360, 10683, 7685.5, 10231.6, 10394.75, 10556.76, 22.43221265737599, 32.56805679205339, 13.669629588088496], "isController": false}, {"data": ["Getting website home page with content encoding", 800, 36, 4.5, 6876.827499999994, 344, 10758, 8051.5, 10319.4, 10471.65, 10625.91, 21.790646365047806, 29.297513397842724, 10.214365483616158], "isController": false}, {"data": ["Confirming ticket", 800, 10, 1.25, 4293.854999999994, 346, 10720, 3583.5, 9360.0, 10212.899999999998, 10525.93, 24.314631329402467, 36.110907961522095, 18.520910582943287], "isController": false}, {"data": ["Getting website home page", 800, 7, 0.875, 5834.71875, 833, 11283, 5368.5, 9896.0, 10273.099999999997, 11066.0, 37.553396235272025, 60.148145214289066, 25.304534572595408], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["429/Too Many Requests", 115, 100.0, 1.796875], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 6400, 115, "429/Too Many Requests", 115, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["Getting website home page with port", 800, 17, "429/Too Many Requests", 17, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Flight details", 800, 18, "429/Too Many Requests", 18, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": ["Getting website home page-1", 800, 7, "429/Too Many Requests", 7, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Setting destination", 800, 20, "429/Too Many Requests", 20, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Getting website home page with content encoding", 800, 36, "429/Too Many Requests", 36, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Confirming ticket", 800, 10, "429/Too Many Requests", 10, null, null, null, null, null, null, null, null], "isController": false}, {"data": ["Getting website home page", 800, 7, "429/Too Many Requests", 7, null, null, null, null, null, null, null, null], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
