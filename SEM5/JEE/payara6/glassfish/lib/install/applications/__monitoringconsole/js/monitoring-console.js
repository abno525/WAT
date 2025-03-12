/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

Chart.defaults.global.defaultFontColor = "#eeeeee";
Chart.defaults.global.tooltips.enabled = false;

/**
 * The different parts of the Monitoring Console are added as the below properties by the individual files.
 */
const MonitoringConsole =  {

  /**
   * Static configuration data for page presets.
   */
  Data: {},

   /**
    * Functions of manipulate the model of the MC (often returns a layout that is applied to the View)
    **/ 
  Model: {},

   /**
    * Functions to update the actual HTML page of the MC
    **/
	View: {},

   /**
    * API functions to talk to the server.
    **/ 
  Controller: {},

   /**
    * Functions specifically to take the data and prepare the display particular chart type using the underlying charting library.
    *
    * Each of the type objects below shares the same public API that is used by Model and View to apply the model to the chart to update the view properly.
    **/
	Chart: {

    /**
     * A collection of general adapter functions for the underlying chart library
     */ 
    Common: {},
   /**
    * Line chart adapter API for monitoring series data
    **/
    Line: {},
   /**
    * Bar chart adapter API for monitoring series data
    **/
    Bar: {},

    /**
     * Trace 'gantt chart' like API, this is not a strict adapter API as the other two as the data to populate this is specific to traces
     */
    Trace: {},

  }
};
MonitoringConsole.Chart.getAPI = function(widget) {
  switch (widget.type) {
    default:
    case 'line': return MonitoringConsole.Chart.Line;
    case 'bar': return MonitoringConsole.Chart.Bar;
    case 'alert': return MonitoringConsole.Chart.Line;
  }
};
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * API to talk to the server.
 *
 * Main purpose is isolate and document the API between client and server.
 **/
MonitoringConsole.Controller = (function() {

  function requestWithJsonBody(method, url, queryData, onSuccess, onFailure) {
    $.ajax({
       url: url,
       type: method,
       data: JSON.stringify(queryData),
       contentType:"application/json; charset=utf-8",
       dataType:"json",
    }).done(onSuccess).fail(onFailure);
  }

  function requestWithoutBody(method, url, onSuccess, onFailure) {
    $.ajax({ type: method, url: url }).done(onSuccess).fail(onFailure);
  }

  function requestJSON(url, onSuccess, onFailure) {
    $.getJSON(url, onSuccess).fail(onFailure);
  }

  /**
  * @param {array|object} queries   - a JS array with query objects as expected by the server API (object corresponds to java class SeriesQuery)
  *                                   or a JS object corresponding to java class SeriesRequest
  * @param {function}     onSuccess - a callback function with one argument accepting the response object as send by the server (java class SeriesResponse)
  * @param {function}     onFailure - a callback function with no arguments
  */
  function requestListOfSeriesData(queries, onSuccess, onFailure) {
    const request = !Array.isArray(queries) ? queries : { queries: queries }; 
    requestWithJsonBody('POST', 'api/series/data/', request, onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a function with one argument accepting an array of series names
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfSeriesNames(onSuccess, onFailure) {
    requestJSON("api/series/", onSuccess, onFailure);
  }

  /**
  * @param {string}   series    - name of the metric series
  * @param {function} onSuccess - a function with one argument accepting an array request traces as returned by the server (each trace object corresponds to java class RequestTraceResponse)
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfRequestTraces(series, onSuccess, onFailure) {
    requestJSON("api/trace/data/" + series, onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfWatches(onSuccess, onFailure) {
    requestJSON("api/watches/data/", (response) => onSuccess(response.watches), onFailure);
  }

  /**
  * @param {object}   watch     - a JS watch object as expected by the server API (object corresponds to java class WatchData)
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestCreateWatch(watch, onSuccess, onFailure) {
    requestWithJsonBody('PUT', 'api/watches/data/', watch, onSuccess, onFailure);
  }

  /**
  * @param {string}   name      - name of the watch to delete
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestDeleteWatch(name, onSuccess, onFailure) {
    requestWithoutBody('DELETE', 'api/watches/data/' + name + '/', onSuccess, onFailure);
  }

  /**
  * @param {string}   name      - name of the watch to disable
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestDisableWatch(name, onSuccess, onFailure) {
    requestWithoutBody('PATCH', 'api/watches/data/' + name + '/?disable=true', onSuccess, onFailure);
  }

  /**
  * @param {string}   name      - name of the watch to enable
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestEnableWatch(name, onSuccess, onFailure) {
    requestWithoutBody('PATCH', 'api/watches/data/' + name + '/?disable=false', onSuccess, onFailure);
  }

  /**
  * @param {number}   serial    - serial of the alert to ackknowledge
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestAcknowledgeAlert(serial, onSuccess, onFailure) {
    requestWithoutBody('POST', 'api/alerts/ack/' + serial + '/', onSuccess, onFailure);
  }

  /**
  * @param {object}   page      - a JS page object as defined and used by the UI
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestUpdateRemotePage(page, onSuccess, onFailure) {
    requestWithJsonBody('PUT', 'api/pages/data/' + page.id + '/', page, onSuccess, onFailure);
  }

  /**
  * @param {string}   pageId    - ID of the page to delete
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestDeleteRemotePage(pageId, onSuccess, onFailure)  {
    requestWithoutBody('DELETE', 'api/pages/data/' + pageId + '/', onSuccess, onFailure);
  }

  /**
  * @param {string}   pageId    - ID of the page to get from server
  * @param {function} onSuccess - a function with one argument accepting an array request traces as returned by the server (each trace object corresponds to java class RequestTraceResponse)
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestRemotePage(pageId, onSuccess, onFailure) {
    requestJSON('api/pages/data/' + pageId + '/', onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a callback function with no arguments
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfRemotePages(onSuccess, onFailure) {
    requestJSON('api/pages/data/', onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a function with one argument accepting an array of page names
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfRemotePageNames(onSuccess, onFailure) {
    requestJSON("api/pages/", onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a function with one argument accepting an array of page names
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestListOfAlerts(onSuccess, onFailure) {
    requestJSON("api/alerts/data/", onSuccess, onFailure);
  }

  /**
  * @param {function} onSuccess - a function with one argument accepting an array of page names
  * @param {function} onFailure - a callback function with no arguments
  */
  function requestAlertDetails(serial, onSuccess, onFailure) {
    requestJSON(`api/alerts/data/${serial}/`, onSuccess, onFailure);
  }

  /**
  * Public API to talk to the server.
  * 
  * Note that none of the functions have a direct return value.
  * All function "return" data by calling their "onSuccess" callback with the result
  * or the "onFailure" callback in case the equest failed.
  */ 
  return {
    requestListOfSeriesData: requestListOfSeriesData,
    requestListOfSeriesNames: requestListOfSeriesNames,
    requestListOfRequestTraces: requestListOfRequestTraces,
    requestListOfWatches: requestListOfWatches,
    requestCreateWatch: requestCreateWatch,
    requestDeleteWatch: requestDeleteWatch,
    requestDisableWatch: requestDisableWatch,
    requestEnableWatch: requestEnableWatch,
    requestAcknowledgeAlert: requestAcknowledgeAlert,
    requestUpdateRemotePage: requestUpdateRemotePage,
    requestDeleteRemotePage: requestDeleteRemotePage,
    requestRemotePage: requestRemotePage,
    requestListOfRemotePages: requestListOfRemotePages,
    requestListOfRemotePageNames: requestListOfRemotePageNames,
    requestListOfAlerts: requestListOfAlerts,
    requestAlertDetails: requestAlertDetails,
  };
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Conains the "static" data of the monitoring console.
 * Most of all this are the page presets.
 */
MonitoringConsole.Data = (function() {

	/**
	 * List of known name-spaces and their text description.
	 */
    const NAMESPACES = {
        web: 'Web Statistics',
        http: 'HTTP Statistics',
        jvm: 'JVM Statistics',
        metric: 'MP Metrics',
        trace: 'Request Tracing',
        map: 'Cluster Map Storage Statistics',
        topic: 'Cluster Topic IO Statistics',
        monitoring: 'Monitoring Console Internals',
        health: 'Health Checks',
        sql: 'SQL Tracing',
        other: 'Other',
    };

    /**
     * Description texts used in the preset pages...
     */
	const TEXT_HTTP_HIGH = "Requires *HTTP monitoring* to be enabled: Goto _Configurations_ => _Monitoring_ and set *HTTP Service* to *HIGH*.";
	const TEXT_WEB_HIGH = "Requires *WEB monitoring* to be enabled: Goto _Configurations_ => _Monitoring_ and set *Web Container* to *HIGH*.";
	const TEXT_REQUEST_TRACING = "If you enabled request tracing at _Configurations_ => _Request Tracing_, not seeing any data means no requests passed the tracing threshold which is a good thing.";

	const TEXT_CPU_USAGE = "Requires *CPU Usage HealthCheck* to be enabled: Go to _Configurations_ => _HealthCheck_ => _CPU Usage_ tab and check *enabled*";
	const TEXT_HEAP_USAGE = "Requires *Heap Usage HealthCheck* to be enabled: Go to _Configurations_ => _HealthCheck_ => _Heap Usage_ tab and check *enabled*";
	const TEXT_GC_PERCENTAGE = "Requires *Garbage Collector HealthCheck* to be enabled: Go to _Configurations_ => _HealthCheck_ => _Garbage Collector_ tab and check *enabled*";
	const TEXT_MEM_USAGE = "Requires *Machine Memory HealthCheck* to be enabled: Go to _Configurations_ => _HealthCheck_ => _Machine Memory Usage_ tab and check *enabled*";
	const TEXT_POOL_USAGE = "Requires *Connection Pool HealthCheck* to be enabled: Go to _Configurations_ => _HealthCheck_ => _Connection Pool_ tab and check *enabled*";
	const TEXT_LIVELINESS = "Requires *MicroProfile HealthCheck Checker* to be enabled: Go to _Configurations_ => _HealthCheck_ => _MicroProfile HealthCheck Checker_ tab and check *enabled*";

	/**
	 * Page preset information improted on page load.
	 */
	const PAGES = {
		core: {
			name: 'Core',
			numberOfColumns: 3,
			widgets: [
				{ series: 'ns:jvm HeapUsage', unit: 'percent',  
					grid: { item: 1, column: 0}, 
					axis: { min: 0, max: 100 },
					decorations: {
						thresholds: { reference: 'now', alarming: { value: 50, display: true }, critical: { value: 80, display: true }}}},
				{ series: 'ns:jvm CpuUsage', unit: 'percent',
					grid: { item: 1, column: 1}, 
					axis: { min: 0, max: 100 },
					decorations: {
						thresholds: { reference: 'now', alarming: { value: 50, display: true }, critical: { value: 80, display: true }}}},							
				{ series: 'ns:jvm ThreadCount', unit: 'count',  
					grid: { item: 0, column: 1}},
				{ series: 'ns:http ThreadPoolCurrentThreadUsage', unit: 'percent',
					grid: { item: 1, column: 2},
					status: { missing: { hint: TEXT_HTTP_HIGH }},
					axis: { min: 0, max: 100 },
					decorations: {
						thresholds: { reference: 'avg', alarming: { value: 50, display: true }, critical: { value: 80, display: true }}}},														
				{ series: 'ns:web RequestCount', unit: 'count',
					grid: { item: 0, column: 2}, 
					options: { perSec: true },
					status: { missing: { hint: TEXT_WEB_HIGH }}},
				{ series: 'ns:web ActiveSessions', unit: 'count',
					grid: { item: 0, column: 0},
					status: { missing: { hint: TEXT_WEB_HIGH }}},
			]
		},
		rag: {
			name: 'Traffic Light Status',
			numberOfColumns: 4,
			type: 'query',
			content: { series: 'ns:health ?:* *', maxSize: 32, ttl: 60, filter: 'rag' },
		},
		request_tracing: {
			name: 'Request Tracing',
			numberOfColumns: 4,
			widgets: [
				{ id: '1 ns:trace @:* Duration', series: 'ns:trace @:* Duration', type: 'bar', unit: 'ms',
					displayName: 'Trace Duration Range',
					grid: { item: 0, column: 0, colspan: 4, rowspan: 1 },
					axis: { min: 0, max: 5000 },
					options: { drawMinLine: true },
					status: { missing: { hint: TEXT_REQUEST_TRACING }},
					coloring: 'series',
					decorations: { alerts: { noAmber: true, noRed: true }}},
				{ id: '2 ns:trace @:* Duration', series: 'ns:trace @:* Duration', type: 'line', unit: 'ms', 
					displayName: 'Trace Duration Above Threshold',
					grid: { item: 1, column: 0, colspan: 2, rowspan: 3 },
					options: { noFill: true },
					coloring: 'series'},
				{ id: '3 ns:trace @:* Duration', series: 'ns:trace @:* Duration', type: 'annotation', unit: 'ms',
					displayName: 'Trace Data',
					grid: { item: 1, column: 2, colspan: 2, rowspan: 3 },
					coloring: 'series'},
			]
		},
		http: {
			name: 'HTTP',
			numberOfColumns: 3,
			widgets: [
				{ series: 'ns:http ConnectionQueueCountOpenConnections', unit: 'count',
					grid: { column: 0, item: 0},
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
				{ series: 'ns:http ThreadPoolCurrentThreadsBusy', unit: 'count',
					grid: { column: 0, item: 1},
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
				{ series: 'ns:http ServerCount2xx', unit: 'count', 
					grid: { column: 1, item: 0},
					options: { perSec: true },
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
				{ series: 'ns:http ServerCount3xx', unit: 'count', 
					grid: { column: 1, item: 1},
					options: { perSec: true },
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
				{ series: 'ns:http ServerCount4xx', unit: 'count', 
					grid: { column: 2, item: 0},
					options: { perSec: true },
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
				{ series: 'ns:http ServerCount5xx', unit: 'count', 
					grid: { column: 2, item: 1},
					options: { perSec: true },
					status: { missing : { hint: TEXT_HTTP_HIGH }}},
			]
		},
		health_checks: {
			name: 'Health Checks',
			numberOfColumns: 4,
			widgets: [
				{ series: 'ns:health CpuUsage', unit: 'percent', displayName: 'CPU',
  					grid: { column: 0, item: 0},
  					axis: { max: 100 },
  					status: { missing : { hint: TEXT_CPU_USAGE }}},
				{ series: 'ns:health HeapUsage', unit: 'percent', displayName: 'Heap',
  					grid: { column: 1, item: 1},
  					axis: { max: 100 },
  					status: { missing : { hint: TEXT_HEAP_USAGE }}},
				{ series: 'ns:health TotalGcPercentage', unit: 'percent', displayName: 'GC',
  					grid: { column: 1, item: 0},
  					axis: { max: 30 },
  					status: { missing : { hint: TEXT_GC_PERCENTAGE }}},
				{ series: 'ns:health PhysicalMemoryUsage', unit: 'percent', displayName: 'Memory',
  					grid: { column: 0, item: 1},
  					axis: { max: 100 },
  					status: { missing : { hint: TEXT_MEM_USAGE }}},
				{ series: 'ns:health @:* PoolUsage', unit: 'percent', coloring: 'series', displayName: 'Connection Pools',
  					grid: { column: 1, item: 2},
  					axis: { max: 100 },          					
  					status: { missing : { hint: TEXT_POOL_USAGE }}},
				{ series: 'ns:health LivelinessUp', unit: 'percent', displayName: 'MP Health',
  					grid: { column: 0, item: 2},
  					axis: { max: 100 },
  					options: { noCurves: true },
  					status: { missing : { hint: TEXT_LIVELINESS }}},
				{ series: 'ns:health ?:* *', unit: 'percent', type: 'alert', displayName: 'Alerts',
  					grid: { column: 2, item: 0, colspan: 2, rowspan: 3}}, 
			]
		},
		monitoring: {
			name: 'Monitoring',
			numberOfColumns: 3,
			widgets: [
				{ series: 'ns:monitoring @:* CollectionDuration', unit: 'ms', displayName: 'Sources Time',
					grid: { column: 0, item: 0, span: 2},
					axis: { max: 200 },
					coloring: 'series', ordering: 'dec', limit: 8 },
				{ series: 'ns:monitoring @:* AlertCount', displayName: 'Alerts',
					grid: { column: 2, item: 2},
					coloring: 'series', colors: 'Amber:amber AmberAck:amber Red:red RedAck:red'},
				{ series: 'ns:monitoring CollectedSourcesCount', displayName: 'Sources',
					grid: { column: 0, item: 2}},
				{ series: 'ns:monitoring CollectedSourcesErrorCount', displayName: 'Sources with Errors', 
					grid: { column: 1, item: 2}},
				{ series: 'ns:monitoring CollectionDuration', unit: 'ms', displayName: 'Metrics Time',
					grid: { column: 2, item: 0},
					axis: { max: 1000},
					options: { drawMaxLine: true }},
				{ series: 'ns:monitoring WatchLoopDuration', unit: 'ms', displayName: 'Watches Time', 
					grid: { column: 2, item: 1},
					options: { drawMaxLine: true }},
			],
		},
		jvm: {
			name: 'JVM',
			numberOfColumns: 3,
			widgets: [
				{ series: 'ns:jvm TotalLoadedClassCount', displayName: 'Loaded Classes', 
					grid: { column: 2, item: 0}},
				{ series: 'ns:jvm UnLoadedClassCount', displayName: 'Unloaded Classes',
					grid: { column: 2, item: 1}},
				{ series: 'ns:jvm CommittedHeapSize', unit: 'bytes', displayName: 'Heap Size',
					grid: { column: 1, item: 0}},
				{ series: 'ns:jvm UsedHeapSize', unit: 'bytes', displayName: 'Used Heap', 
					grid: { column: 0, item: 0}},
				{ series: 'ns:jvm ThreadCount', displayName: 'Live Threads', 
					grid: { column: 1, item: 1}},
				{ series: 'ns:jvm DaemonThreadCount', displayName: 'Daemon Threads',
					grid: { column: 0, item: 1}},
			],
		},
		sql: {
			name: 'SQL',
			numberOfColumns: 3,
			widgets: [
				{ id: '1 ns:sql @:* MaxExecutionTime', 
					unit: 'ms',
					type: 'annotation',
					series: 'ns:sql @:* MaxExecutionTime',
					displayName: 'Slow SQL Queries',
					grid: { column: 0, item: 1, colspan: 2, rowspan: 2},
					mode: 'table',
					sort: 'value',
					fields: ['Timestamp', 'SQL', 'Value']},
				{ id: '2 ns:sql @:* MaxExecutionTime',
					unit: 'ms',
					series: 'ns:sql @:* MaxExecutionTime',
					displayName: 'Worst SQL Execution Time',
					grid: { column: 2, item: 1 },
					coloring: 'series' },						
				{ id: '3 ns:sql @:* MaxExecutionTime',
					unit: 'ms',
					type: 'alert',
					series: 'ns:sql @:* MaxExecutionTime',
					displayName: 'Slow SQL Alerts',
					grid: { column: 2, item: 2 },
					options: { noAnnotations: true }},
			],
		},
		alerts: {
			name: 'Alerts',
			numberOfColumns: 1,
			widgets: [
				{id: '1 ?:* *', series: '?:* *', type: 'alert', displayName: 'Ongoing Alerts',
					grid: {column: 0, item: 1},
					decorations: { alerts: { noStopped: true }},
					options: { noAnnotations: true}},
				{id: '2 ?:* *', series: '?:* *', type: 'alert', displayName: 'Past Unacknowledged Alerts',
					grid: {column: 0, item: 2},
					decorations: { alerts: { noOngoing: true, noAcknowledged: true}},
					options: { noAnnotations: true}},
			],
		},
		threads: {
			name: 'Threads',
			numberOfColumns: 4,
			widgets: [
				{ series: 'ns:health StuckThreadDuration', type: 'annotation', mode: 'table', unit: 'ms',
					displayName: 'Stuck Thread Incidents',
					grid: {column: 0, item: 1, colspan: 3, rowspan: 1},
					fields: ["Thread", "Started", "Value", "Threshold", "Suspended", "Locked", "State"]},
				{ series: 'ns:health HoggingThreadDuration', type: 'annotation', mode: 'table', unit: 'ms',
					displayName: 'Hogging Thread Incidents',
					grid: {column: 0, item: 2, colspan: 3, rowspan: 1},
					fields: ["Thread", "When", "Value", "Usage%", "Threshold%", "Method", "Exited"]},
				{ series: 'ns:jvm ThreadCount', displayName: 'Live Threads', 
					grid: {column: 3, item: 1}},
				{ series: 'ns:jvm DaemonThreadCount', displayName: 'Daemon Threads', 
					grid: {column: 3, item: 2}},							
			],
		},
		application_metrics: {
			name: 'Application Metrics',
			type: 'query',
			numberOfColumns: 4,
			content: { series: 'ns:metric ?:* *', maxSize: 32, ttl: 60 },
		}
	};


	/**
	 * Public API for data access
	 */ 
	return { 
		PAGES: PAGES,
		NAMESPACES: NAMESPACES,
	};
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * The object that manages the internal state of the monitoring console page.
 * 
 * It depends on the MonitoringConsole.Utils object.
 */
MonitoringConsole.Model = (function() {
	/**
	 * Key used in local stage for the userInterface
	 */
	const LOCAL_UI_KEY = 'fish.payara.monitoring-console.defaultConfigs';
	

	const Data = MonitoringConsole.Data;
	const Controller = MonitoringConsole.Controller;

	//TODO idea: Classification. one can setup a table where a value range is assigned a certain state - this table is used to show that state in the UI, simple but effective

	function getPageId(name) {
    	return name.replace(/[^-a-zA-Z0-9]/g, '_').toLowerCase();
    }

	
	/**
	 * Internal API for managing set model of the user interface.
	 */
	var UI = (function() {

		/**
		 * All page properties must not be must be values as page objects are converted to JSON and back for local storage.
		 * 
		 * {object} - map of pages, name of page as key/field;
		 * {string} name - name of the page
		 * {object} widgets -  map of the chart configurations with series as key
		 * 
		 * Each page is an object describing a page or tab containing one or more graphs by their configuration.
		 */
		var pages = {};
		
		/**
		 * General settings for the user interface
		 */
		var settings = sanityCheckSettings({});
		
		/**
		 * Makes sure the page data structure has all required attributes.
		 */
		function sanityCheckPage(page) {
			if (!page.id)
				page.id = getPageId(page.name);
			if (!page.widgets)
				page.widgets = {};
			if (page.type === undefined)
				page.type = 'manual';
			if (typeof page.sync !== 'object')
				page.sync = { autosync: true };
			if (typeof page.content !== 'object')
				page.content = {};
			if (!page.numberOfColumns || page.numberOfColumns < 1)
				page.numberOfColumns = 1;
			if (page.rotate === undefined)
				page.rotate = true;
			if (typeof page.options !== 'object')
				page.options = {};
			page.widgets = sanityCheckWidgets(page.widgets);
			return page;
		}

		function sanityCheckWidgets(widgets) {
			// make widgets from array to object if needed
			let widgetsArray = Array.isArray(widgets) ? widgets : Object.values(widgets);
			widgetsArray.forEach(sanityCheckWidget);
			let widgetsObj = {};
			for (let widget of widgetsArray)
				widgetsObj[widget.id] = widget;
			return widgetsObj;
		}
		
		/**
		 * Makes sure a widget (configiguration for a chart) within a page has all required attributes
		 */
		function sanityCheckWidget(widget) {
			if (!widget.id)
				widget.id = '1 ' + widget.series;
			widget.target = 'chart-' + widget.id.replace(/[^-a-zA-Z0-9_]/g, '_');
			if (!widget.type)
				widget.type = 'line';
			if (!widget.unit)
				widget.unit = 'count';
			if (typeof widget.options !== 'object')
				widget.options = {};
			//TODO no data can be a good thing (a series hopefully does not come up => render differently to "No Data" => add a config for that switch)
			if (typeof widget.grid !== 'object')
				widget.grid = {};
			if (typeof widget.decorations !== 'object')
				widget.decorations = {};
			if (typeof widget.decorations.waterline !== 'object') {
				let value = typeof widget.decorations.waterline === 'number' ? widget.decorations.waterline : undefined;
				widget.decorations.waterline = { value: value };
			}
			if (typeof widget.decorations.thresholds !== 'object')
				widget.decorations.thresholds = {};
			if (typeof widget.decorations.alerts !== 'object')
				widget.decorations.alerts = {};
			if (typeof widget.decorations.annotations !== 'object')
				widget.decorations.annotations = {};							
			if (typeof widget.decorations.thresholds.alarming !== 'object')
				widget.decorations.thresholds.alarming = {};			
			if (typeof widget.decorations.thresholds.critical !== 'object')
				widget.decorations.thresholds.critical = {};			
			if (typeof widget.axis !== 'object')
				widget.axis = {};
			if (typeof widget.status !== 'object')
				widget.status = {};
			if (typeof widget.status.missing !== 'object')
				widget.status.missing = {};
			if (typeof widget.status.alarming !== 'object')
				widget.status.alarming = {};
			if (typeof widget.status.critical !== 'object')
				widget.status.critical = {};
			return widget;
		}

		function sanityCheckSettings(settings) {
			if (settings === undefined)
				settings = {};
			if (settings.theme === undefined)
				settings.theme = {};
			if (settings.theme.colors === undefined)
				settings.theme.colors = {};
			if (settings.theme.options === undefined)
				settings.theme.options = {};
			if (settings.nav === undefined)
				settings.nav = {};
			if (settings.rotation === undefined)
				settings.rotation = {};
			if (typeof settings.rotation.interval !== 'number')
				settings.rotation.interval = 60;
			if (typeof settings.alerts !== 'object')
				settings.alerts = {};
			return settings;
		}
		
		function doStore(isPageUpdate, page) {
			if (page === undefined)
				page = pages[settings.home];
			if (isPageUpdate) {
				page.sync.lastModifiedLocally = new Date().getTime();
			}
			window.localStorage.setItem(LOCAL_UI_KEY, doExport());
			if (isPageUpdate && page.sync.autosync && settings.role == 'admin') {
				doPushLocal(undefined, undefined, page);
			}
		}

		function doPushLocal(onSuccess, onError, page) {
			if (page === undefined)
				page = pages[settings.home];
			let basedOnRemoteLastModified = page.sync.basedOnRemoteLastModified;
			let lastModifiedLocally = page.sync.lastModifiedLocally;
			let preferredOverRemoteLastModified = page.sync.preferredOverRemoteLastModified;
			page.sync.basedOnRemoteLastModified = lastModifiedLocally || new Date().getTime();
			page.sync.lastModifiedLocally = undefined;
			page.sync.preferredOverRemoteLastModified = undefined;
			Controller.requestUpdateRemotePage(page, 
				() => { // success
					doStore();
					if (onSuccess)
						onSuccess(page);
				},
				() => { // failure
					page.sync.basedOnRemoteLastModified = basedOnRemoteLastModified;
					page.sync.lastModifiedLocally = lastModifiedLocally;
					page.sync.preferredOverRemoteLastModified = preferredOverRemoteLastModified;
					if (onError)
						onError(page);
				}
			);			
		}

		function doPushAllLocal(onSuccess, onError) {	
			Controller.requestListOfRemotePageNames((pageIds) => {
				pageIds.forEach(pageId => {
					doPushLocal(onSuccess, onError, pages[pageId]);
				});
			});
		}

		function doPullRemote(pageId, onSuccess, onError) {
			if (pageId === undefined)
				pageId = settings.home;
			return new Promise(function(resolve, reject) {
				Controller.requestRemotePage(pageId, (page) => {				
					pages[page.id] = page;
					doStore(false, page);
					resolve(page);
					if (typeof onSuccess === 'function')
						onSuccess(page);
				}, () => {
					reject(undefined);
					if (typeof onError === 'function')
						onError(page);
				});
			});
		}

		function providePullRemoteModel(consumer) {
			function createPullRemoteModelItem(localPage, remotePage) {
				let page = localPage !== undefined ? localPage : remotePage;
				let checked = true;
				if ((settings.role == 'admin' || settings.role == 'user') && localPage !== undefined) {
					checked = (localPage.sync.preferredOverRemoteLastModified === undefined 
							|| localPage.sync.preferredOverRemoteLastModified < remotePage.sync.basedOnRemoteLastModified)
							&& !(localPage.sync.basedOnRemoteLastModified == remotePage.sync.basedOnRemoteLastModified && localPage.sync.lastModifiedLocally === undefined);
				}
				return {
					id: page.id,
					name: page.name,
					checked: checked,
					lastLocalChange: localPage != undefined ? localPage.sync.lastModifiedLocally : undefined,
					lastRemoteChange: remotePage !== undefined ? remotePage.sync.basedOnRemoteLastModified : undefined,
					lastRemoteUpdate: localPage != undefined ? localPage.sync.basedOnRemoteLastModified : undefined,
				};
			}

			Controller.requestListOfRemotePages(remotePages => {
				consumer({ 
					pages: Object.values(remotePages).map(remotePage => createPullRemoteModelItem(pages[remotePage.id], remotePage)), 
					onUpdate: async function (pageIds, onSuccess, onError) {
						for (let remotePageId of Object.keys(remotePages)) {
							if (!pageIds.includes(remotePageId)) {
								pages[remotePageId].sync.preferredOverRemoteLastModified = remotePages[remotePageId].sync.basedOnRemoteLastModified;
							}
						}
						await Promise.all(pageIds.map(pageId => doPullRemote(pageId, onSuccess, onError)));
					}
				});
			});
		}
		
		function doDeselect() {
			Object.values(pages[settings.home].widgets)
				.forEach(widget => widget.selected = false);
		}
		
		function doCreate(name) {
			if (!name)
				throw "New page must have a unique name";
			var id = getPageId(name);
			if (pages[id])
				throw "A page with name "+name+" already exist";
			let page = sanityCheckPage({name: name});
			pages[page.id] = page;
			settings.home = page.id;
			return page;
		}

		
		function doImport(userInterface, replaceExisting, onSuccess, onError) {
			if (!userInterface) {
				return false;
			}
			if (userInterface.pages && userInterface.settings)
				settings = sanityCheckSettings(userInterface.settings);
			let importedPages = !userInterface.pages ? userInterface : userInterface.pages;
			// override or add the entry in pages from userInterface
			if (Array.isArray(importedPages)) {
				for (let i = 0; i < importedPages.length; i++) {
					let page = importedPages[i];
					try {
						page = sanityCheckPage(page);
						if (replaceExisting || pages[page.id] === undefined) {
							pages[page.id] = page;
							if (typeof onSuccess === 'function')
								onSuccess(page);
						}
					} catch (ex) {
						if (typeof onError === 'function')
							onError(page, ex);
					}
				}
			} else {
				for (let [id, page] of Object.entries(importedPages)) {
					try {
						if (replaceExisting || pages[id] === undefined) {
							page.id = id;
							pages[id] = sanityCheckPage(page); 
							if (typeof onSuccess === 'function')
								onSuccess(page);							
						}
					} catch (ex) {
						if (typeof onError === 'function')
							onError(page, ex);
					}
				}
			}
			if (settings.home === undefined && Object.keys(pages).length > 0) {
				settings.home = Object.keys(pages)[0];
			}
			doStore();
			return true;
		}
		
		function doExport() {
			return JSON.stringify({ pages: pages, settings: settings });
		}



      	function doLayout(columns) {
			let page = pages[settings.home];
			if (!page)
				return [];
			if (columns)
				page.numberOfColumns = columns;
			let numberOfColumns = page.numberOfColumns || 1;
			// init temporary and result data structure
			let widgetsByColumn = new Array(numberOfColumns);
			var layout = new Array(numberOfColumns);
			for (let col = 0; col < numberOfColumns; col++) {
				widgetsByColumn[col] = [];
				layout[col] = [];
			}
			// organise widgets in columns
			Object.values(page.widgets).forEach(function(widget) {
				let column = widget.grid && widget.grid.column ? widget.grid.column : 0;
				widgetsByColumn[Math.min(Math.max(column, 0), widgetsByColumn.length - 1)].push(widget);
			});
			// order columns by item position
			for (let col = 0; col < numberOfColumns; col++) {
				widgetsByColumn[col] = widgetsByColumn[col].sort(function (a, b) {
					if (!a.grid || !a.grid.item)
						return -1;
					if (!b.grid || !b.grid.item)
						return 1;
					return a.grid.item - b.grid.item;
				});
			}
			// do layout by marking cells with item (left top corner in case of span), null (empty) and undefined (spanned)
			for (let col = 0; col < numberOfColumns; col++) {
				let columnWidgets = widgetsByColumn[col];
				for (let item = 0; item < columnWidgets.length; item++) {
					let widget = columnWidgets[item];
					let colspan = getColSpan(widget, numberOfColumns, col);
					let rowspan = getRowSpan(widget);
					let info = { colspan: colspan, rowspan: rowspan, widget: widget};
					let column0 = layout[col];
					let row0 = getEmptyRowIndex(column0, colspan);
					for (let spanX = 0; spanX < colspan; spanX++) {
						let column = layout[col + spanX];
						if (spanX == 0) {
							if (!widget.grid)
								widget.grid = { column: col, colspan: colspan, rowspan: rowspan }; // init grid
							if (widget.grid.item === undefined)
								widget.grid.item = row0;
							if (widget.grid.colspan === undefined)
								widget.grid.colspan = colspan;
							if (widget.grid.rowspan === undefined)
								widget.grid.rowspan = rowspan;
							widget.grid.span = undefined;						
						} else {
							while (column.length < row0)
								column.push(null); // null marks empty cells
						}
						for (let spanY = 0; spanY < rowspan; spanY++) {
							let cell = spanX === 0 && spanY === 0 ? info : undefined;
							if (row0 + spanY > column.length) {
								column.push(cell);	
							} else {
								column[row0 + spanY] = cell;
							}
						}
					}
				}
			}
			// give the layout a uniform row number
			let maxRows = layout.map(column => column.length).reduce((acc, cur) => acc ? Math.max(acc, cur) : cur);
			for (let col = 0; col < numberOfColumns; col++) {
				while (layout[col].length < maxRows) {
					layout[col].push(null);
				}
			}
			if (page.options.fillEmptyCells === true)
				fillEmptyCells(layout, numberOfColumns);
			return layout;
      	}

      	function fillEmptyCells(layout) {
			for (let col = 0; col < layout.length; col++) {
				let row = 0;
				let len = layout[col].length;
				while (row < len) {
					while (row < len && layout[col][row] !== null)
						row++;
					if (row < len) {
						const row0 = row - 1;
						const cell = layout[col][row0];
						if (cell != null) {
							while (row < len && layout[col][row] == null)
								row++;
							const diff = row - row0;
							if (diff > 1 && cell.colspan == 1) {
								cell.rowspan += diff - 1;
								for (let r = row0 + 1; r < row; r++)
									layout[col][r] = undefined;
							}
						} else {
							row = len;
						}
					}
				}
			}
      	}

      	function getRowSpan(widget) {
      		let span = widget.grid && widget.grid.span ? widget.grid.span : 1;
      		if (widget.grid && widget.grid.rowspan)
      			span =  widget.grid.rowspan;
      		if (typeof span === 'string')
      			span = parseInt(span);
      		return span;
      	}

      	function getColSpan(widget, numberOfColumns, currentColumn) {
			let span = widget.grid && widget.grid.span ? widget.grid.span : 1;
			if (widget.grid && widget.grid.colspan)
				span = widget.grid.colspan;
			if (typeof span === 'string') {
				if (span === 'full') {
				   span = numberOfColumns;
				} else {
				   span = parseInt(span);
				}
			}
			return span > numberOfColumns - currentColumn ? numberOfColumns - currentColumn : span;
      	}

		/**
		 * @return {number} row position in column where n rows are still empty ('null' marks empty)
		 */
      	function getEmptyRowIndex(column, n) {
      		let row = column.findIndex((elem,index,array) => array.slice(index, index + n).every(e => e === null));
			return row < 0 ? column.length : row;
      	}
		
	   /**
	    * Mapping from a possible MP unit alias to the unit key to use
	    */
	   	const Y_AXIS_UNIT = {
	      days: 'sec',
	      hours: 'sec',
	      minutes: 'sec',	      
	      seconds: 'sec',
	      per_second: 'sec',
	      milliseconds: 'ms',
	      microseconds: 'us',

	      nanoseconds: 'ns',
	      percent: 'percent',
	      bytes: 'bytes',
	      updown: 'updown',
   		};

   		const QUERY_ORDER = ['Overall', 'Health', 'Liveness', 'Readiness'];

      	async function doQueryPage() {
      		function sortByGroup(matches) {
	  			function compareByOrder(a, b) {
	  				function indexOf(e) {
	  					let i = 0;
	  					while (i < QUERY_ORDER.length && !e.series.includes(QUERY_ORDER[i]))
	  						i++;
	  					return i;
	  				}
	  				return indexOf(b) - indexOf(a);
	  			}      			
				const byGroup = {};
				for (let match of matches) {
					let group = 'none';
					let groupIndex = match.series.indexOf('@');
					if (groupIndex > 0)
						group = match.series.substring(groupIndex, match.series.indexOf(' ', groupIndex));
					if (byGroup[group] === undefined)
						byGroup[group] = [];
					byGroup[group].push(match);
				}
				for (let group of Object.values(byGroup))
					group.sort(compareByOrder);
				return byGroup;
      		}

      		const page = pages[settings.home];
      		if (page.content === undefined)
      			return;
      		const content = new Promise(function(resolve, reject) {
				Controller.requestListOfSeriesData({ groupBySeries: true, queries: [{
	      			widgetId: 'auto', 
	      			series: page.content.series,
	      			truncate: ['ALERTS'],
	      			exclude: [],
	      			history: false,
      			}]}, 
      			(response) => resolve(response.matches),
      			() => reject(undefined));

			});
			let matches = await content;
			matches.sort((a, b) => a.data[0].stableCount - b.data[0].stableCount);
			if (matches.length > page.content.maxSize)
				matches = matches.slice(0, page.content.maxSize);
			const matchesByGroup = sortByGroup(matches);
			const widgets = [];
			const numberOfColumns = page.numberOfColumns;
			const now = new Date().getTime();
			let column = 0;
			for (let group of Object.values(matchesByGroup)) {
				for (let match of group) {
					const points = match.data[0].points;
					if (now - points[points.length-2] < 60000) { // only matches with data updates in last 60sec
						const widget = doInferWidget(match);
						if (page.content.filter === undefined || widget.type == page.content.filter) {
							widget.grid = { column: column % numberOfColumns, item: column };
							widgets.push(widget);
							column++;											
						}
					}
				}
			}
			page.widgets = sanityCheckWidgets(widgets);
			page.content.expires = now + ((page.content.ttl || (60 * 60 * 24 * 365)) * 1000);
			doStore(true, page);
			return page;
      	}

      	function doInferWidget(match) {
      		function yAxisUnit(metadata) {
      			if (Y_AXIS_UNIT[metadata.Unit] !== undefined)
      				return Y_AXIS_UNIT[metadata.Unit];
      			if (Y_AXIS_UNIT[metadata.BaseUnit] !== undefined)
      				return Y_AXIS_UNIT[metadata.BaseUnit];
      			return 'count';
      		}
			let metadata = match.annotations.filter(a => a.permanent)[0];
			let attrs = {};
			let type = 'line';
			if (metadata) {
				if (metadata.attrs)
					attrs = metadata.attrs;
			}
			if (attrs.Unit === undefined && match.watches.length > 0) { // is there a watch we can used to get the unit from?
				let watch = match.watches[0];
				attrs.Unit = watch.unit;
				let name = watch.name;
				if (name.indexOf('RAG ') == 0)
					name = name.substring(4);
				attrs.DisplayName = name;
				type = 'rag';
			}
			let data = match.data[0];
			let scaleFactor;
			if (attrs.ScaleToBaseUnit > 1) {
				scaleFactor = Number(attrs.ScaleToBaseUnit);
			}
			let decimalMetric = attrs.Type == 'gauge';
			let unit = yAxisUnit(attrs);
			let max = decimalMetric ? 10000 : 1;
			if (attrs.Unit == 'none' && data.observedMax <= max && data.observedMin >= 0) {
				unit = 'percent';
				scaleFactor = 100;
			}
			return {
				id: match.series,
				type: type,
				series: match.series,
				displayName: attrs.DisplayName,
				description: attrs.Description,
				unit: unit,
				options: { 
					decimalMetric: decimalMetric,
				},
				scaleFactor: scaleFactor,
			};      		
      	}

      	function doAddWidget(series, grid, factory) {
			if (!(typeof series === 'string' || Array.isArray(series) && series.length > 0 && typeof series[0] === 'string'))
				throw 'configuration object requires string property `series`';
			if (factory === undefined || typeof factory !== 'function')
				factory = function(id) { return { id: id, series: series }; };			
			doDeselect();
			let layout = doLayout();
			let page = pages[settings.home];
			let widgets = page.widgets;
			let id = (Object.values(widgets)
				.filter(widget => widget.series == series)
				.reduce((acc, widget) => Math.max(acc, widget.id.substr(0, widget.id.indexOf(' '))), 0) + 1) + ' ' + series;				
			
			let widget = sanityCheckWidget(factory(id));
			widgets[widget.id] = widget;
			widget.selected = true;
			if (grid !== undefined) {
				widget.grid = grid;
			} else {
				// automatically fill most empty column
				let usedCells = new Array(layout.length);
				for (let i = 0; i < usedCells.length; i++) {
					usedCells[i] = 0;
					for (let j = 0; j < layout[i].length; j++) {
						let cell = layout[i][j];
						if (cell === undefined || cell !== null && typeof cell === 'object')
							usedCells[i]++;
					}
				}
				let indexOfLeastUsedCells = usedCells.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
				widget.grid.column = indexOfLeastUsedCells;
				widget.grid.item = Object.values(widgets)
					.filter(widget => widget.grid.column == indexOfLeastUsedCells)
					.reduce((acc, widget) => widget.grid.item ? Math.max(acc, widget.grid.item) : acc, 0) + 1;
			}
			doStore(true);      		
      	}

		return {
			themeConfigure(fn) {
				fn(settings.theme);
				doStore();
			},

			themePalette: function() {
				return settings.theme.palette;
			},

			themeOption: function(name, defaultValue) {
				let value = settings.theme.options[name];
				return Number.isNaN(value) || value === undefined ? defaultValue : value;
			},

			themeColor: function(name) {
				return settings.theme.colors[name];
			},

			currentPage: function() {
				return pages[settings.home];
			},			
			
			listPages: function() {
				return Object.values(pages).map(function(page) { 
					return { id: page.id, name: page.name, active: page.id === settings.home };
				});
			},
			
			exportPages: function() {
				return JSON.parse(JSON.stringify(Object.values(pages)));
			},
			
			importPages: function(pages, onSuccess, onError) {
				doImport(pages, true, onSuccess, onError);
			},

			queryPage: () => doQueryPage(),

			/**
			 * Loads and returns the userInterface from the local storage
			 */
			load: function() {
				let localStorage = window.localStorage;
				let ui = localStorage.getItem(LOCAL_UI_KEY);
				if (ui)
				doImport(JSON.parse(ui), true);
				doImport(JSON.parse(JSON.stringify({ pages: Data.PAGES })), false);
				return pages[settings.home];
			},
			
			/**
			 * Creates a new page with given name, ID is derived from name.
			 * While name can be changed later on the ID is fixed.
			 */
			createPage: function(name) {
				return doCreate(name);
			},
			
			renamePage: function(name) {
				let pageId = getPageId(name);
				if (pages[pageId])
					return false;
				let page = pages[settings.home];
				page.name = name;
				page.id = pageId;
				pages[pageId] = page;
				delete pages[settings.home];
				settings.home = pageId;
				doStore(true);
				return true;
			},

			configurePage: function(change) {
				const page = pages[settings.home];
				change(page);
				doStore(true, page);
			},
			
			/**
			 * Deletes the active page and changes to the first page.
			 * Does not delete the last page.
			 */
			deletePage: function(pageId, onSuccess, onError) {
				if (pageId === undefined)
					pageId = settings.home;
				let presets = Data.PAGES;
				let hasPreset = presets && presets[pageId];
				if (hasPreset) {
					onError('Page cannot be deleted.');
					return;
				}
				let pageIds = Object.keys(pages);
				if (pageIds.length <= 1) {
					onError('Last page cannot be deleted.');
					return;
				}
				let deletion = () => {
					delete pages[pageId];
					if (pageId == settings.home)
						settings.home = pageIds[0];
					doStore(false);
					if (typeof onSuccess === 'function')
						onSuccess();
				};
				if (settings.role === 'admin') {
					let page = pages[pageId];
					if (page.sync.basedOnRemoteLastModified !== undefined) {
						Controller.requestDeleteRemotePage(pageId, deletion, onError);
					} else {
						deletion();
					}
				} else {
					deletion();
				}
			},

			resetPage: function(pageId) {
				if (pageId === undefined)
					pageId = settings.home;				
				let presets = Data.PAGES;
				if (presets && presets[pageId]) {
					let preset = presets[pageId];
					preset.id = pageId; // make sure the preset itself has the ID set
					pages[pageId] = sanityCheckPage(JSON.parse(JSON.stringify(preset)));
					doStore(true);
					return true;
				}
				return false;
			},

			hasPreset: function(pageId) {
				if (pageId === undefined)
					pageId = settings.home;
				let presets = Data.PAGES;
				return presets && presets[pageId];
			},
			
			switchPage: function(pageId) {
				if (pageId === undefined) { // rotate to next page from current page
					let pageIds = Object.values(pages).filter(page => page.rotate).map(page => page.id);
					pageId = pageIds[(pageIds.indexOf(settings.home) + 1) % pageIds.length];
				}
				if (!pages[pageId])
					return undefined;
				settings.home = pageId;
				return pages[settings.home];
			},

			rotatePage: function(rotate) {
				if (rotate === undefined)
					return pages[settings.home].rotate;
				pages[settings.home].rotate = rotate;
				doStore(true);
			},
			
			removeWidget: function(widgetId) {
				let widgets = pages[settings.home].widgets;
				if (widgetId && widgets) {
					delete widgets[widgetId];
				}
				doStore(true);
			},
			
			addWidget: doAddWidget,

			inferWidget: function(match) {
				return doInferWidget(match);
			},
			
			configureWidget: function(widgetUpdate, widgetId) {
				let selected = widgetId
					? [pages[settings.home].widgets[widgetId]]
					: Object.values(pages[settings.home].widgets).filter(widget => widget.selected);
				selected.forEach(widget => widgetUpdate(widget));
				doStore(selected.length);
			},
			
			select: function(widgetId, exclusive) {
				let page = pages[settings.home];
				let widget = page.widgets[widgetId];
				widget.selected = widget.selected !== true;
				if (exclusive) {
					Object.values(page.widgets).forEach(function(widget) {
						if (widget.id != widgetId) {
							widget.selected = false;
						}
					});
				}
				doStore();
				return widget.selected === true;
			},
			
			deselect: function() {
				doDeselect();
				doStore();
			},
			
			selected: function() {
				return Object.values(pages[settings.home].widgets)
					.filter(widget => widget.selected)
					.map(widget => widget.id);
			},
			
			arrange: function(columns) {
				let layout = doLayout(columns);
				doStore(columns !== undefined);
				return layout;
			},
			
			/*
			 * Settings
			 */
			
			showSettings: function() {
				return settings.display === true
					|| Object.keys(pages[settings.home].widgets).length == 0
					|| Object.values(pages[settings.home].widgets).filter(widget => widget.selected).length > 0;
			},
			openSettings: function() {
				settings.display = true;
				doStore();
			},
			closeSettings: function() {
				settings.display = false;
				doDeselect();
				doStore();
			},

			Alerts: {
				showPopup: function(showPopup) {
					if (showPopup === undefined)
						return settings.alerts.noPopup !== true;
					settings.alerts.noPopup = showPopup !== true;
					doStore();
				},			

				confirm: function(changeCount, redAlerts, amberAlerts) {
					if (settings.alerts.confirmed === undefined || changeCount > settings.alerts.confirmed.changeCount) {
						settings.alerts.confirmed = { changeCount, redAlerts, amberAlerts };
						doStore();
					}
				},

				confirmedChangeCount: () => settings.alerts.confirmed === undefined ? -1 : settings.alerts.confirmed.changeCount,
				confirmedRedAlerts: () => settings.alerts.confirmed === undefined ? [] : settings.alerts.confirmed.redAlerts || [],
				confirmedAmberAlerts: () => settings.alerts.confirmed === undefined ? [] : settings.alerts.confirmed.amberAlerts || [],
			},

			Navigation: {
				isCollapsed: () => settings.nav.collapsed === true,
				isExpanded: () => settings.nav.collapsed !== true,
				collapse: () => {
					settings.nav.collapsed = true;
					doStore();
				},
				expand: () => {
					settings.nav.collapsed = false;
					doStore();
				},
				toggle: () => {
					settings.nav.collapsed = settings.nav.collapsed !== true;
					doStore();					
				},
			},

			Role: {
				get: () => settings.role || 'user',
				set: (role) => {
					settings.role = role;
					doStore();					
				},
				isAdmin: () => settings.role == 'admin',
				isGuest: () => settings.role == 'guest',
				isUser:  () => settings.role === undefined || settings.role == 'user',
				isDefined: () => settings.role !== undefined,
				name: function() {
					return {
						guest: 'Guest',
						user: 'User',
						admin: 'Administrator'
					}[settings.role || 'user'];
				},
					
			}, 

			Sync: {

				providePullRemoteModel: providePullRemoteModel,

				/*
				 * Updates the local current page with the remote page
				 */
				pullRemote: doPullRemote,

				/*
				 * Updates the remote page with the current local page
				 */
				pushLocal: doPushLocal,

				/*
				 * Updates all remote pages with the respective local page
				 */
				pushAllLocal: doPushAllLocal,

				/*
				 * Should a page automatically be pushed to remote when changed by an admin?
				 */ 
				auto: (autosync) => {
					if (autosync === undefined)
						return pages[settings.home].sync.autosync !== false;
					pages[settings.home].sync.autosync = autosync;
				},

				isLocallyChanged: () => pages[settings.home].sync.lastModifiedLocally,
				isLocal: () => pages[settings.home].sync.basedOnRemoteLastModified === undefined,
				isRemote: () => pages[settings.home].sync.basedOnRemoteLastModified !== undefined,
			},

			Rotation: {
				isEnabled: () => settings.rotation && settings.rotation.enabled,
				enabled: function(enabled) {
					settings.rotation.enabled = enabled === undefined ? true : enabled;
					doStore();
				},
				interval: function(duration) {
					if (!settings.rotation)
						settings.rotation = {};
					if (duration === undefined)
						return settings.rotation.interval;
					if (typeof duration === 'number') {
						settings.rotation.interval = duration;
						doStore();
					}
				}
			},

			Refresh: {
				isPaused: () => settings.refresh && settings.refresh.paused,
				paused: function(paused) {
					settings.refresh.paused = paused;
					doStore();
				},
				interval: function(duration) {
					if (!settings.refresh)
						settings.refresh = {};
					if (duration == undefined)
						return settings.refresh.interval;
					if (typeof duration === 'number') {
						settings.refresh.interval = duration;
						doStore();
					}
				}
			}
		};
	})();
	
	/**
	 * Internal API for managing charts on a page
	 */
	var Charts = (function() {

		/**
		 * {object} - map of the charts objects for active page as created by Chart.js with series as key
		 */
		var charts = {};
		
		function doDestroy(widgetId) {
			let chart = charts[widgetId];
			if (chart) {
				delete charts[widgetId];
				chart.destroy();
			}
		}

		return {
			/**
			 * Returns a new Chart.js chart object initialised for the given MC level configuration to the charts object
			 */
			getOrCreate: function(widget) {
				let widgetId = widget.id;
				let chart = charts[widgetId];
				if (chart)
					return chart;
				chart = MonitoringConsole.Chart.getAPI(widget).onCreation(widget);			
				charts[widgetId] = chart;
				return chart;
			},
			
			clear: function() {
				Object.keys(charts).forEach(doDestroy);
			},
			
			destroy: function(widgetId) {
				doDestroy(widgetId);
			},
			
			update: function(widget) {
				let chart = charts[widget.id];
				if (chart) {
					MonitoringConsole.Chart.getAPI(widget).onConfigUpdate(widget, chart);
					chart.update();
				}
			},
		};
	})();
	
	const DEFAULT_INTERVAL = 2;

	/**
	 * Internal API for data loading from server
	 */
	var Interval = (function() {
		
	    /**
	     * {function} - a function called with no extra arguments when interval tick occured
	     */
	    var onIntervalTick;

		/**
		 * {function} - underlying interval function causing the ticks to occur
		 */
		var intervalFn;
		
		/**
		 * {number} - tick interval in seconds
		 */
		var refreshInterval = DEFAULT_INTERVAL;
		
		function pause() {
			if (intervalFn) {
				clearInterval(intervalFn);
				intervalFn = undefined;
			}
		}

		function resume(atRefreshInterval) {
			onIntervalTick();
			if (atRefreshInterval && atRefreshInterval != refreshInterval) {
				pause();
				refreshInterval = atRefreshInterval;
			}
			if (refreshInterval === 0)
				refreshInterval = DEFAULT_INTERVAL;
			if (intervalFn === undefined) {
				intervalFn = setInterval(onIntervalTick, refreshInterval * 1000);
			}
		}
		
		return {
			
			init: function(onIntervalFn) {
				onIntervalTick = onIntervalFn;
			},
			
			/**
			 * Causes an immediate invocation of the tick target function
			 */
			tick: function() {
				onIntervalTick(); //OBS wrapper function needed as onIntervalTick is set later
			},
			
			/**
			 * Causes an immediate invocation of the tick target function and makes sure an interval is present or started
			 */
			resume: resume,
			
			pause: pause,
			isPaused: () => intervalFn === undefined,

			interval: function(duration) {
				if (duration === undefined)
					return refreshInterval;
				resume(duration);
			}
		};
	})();

	/**
	 * Internal API for the page rotation interval handling.
	 */ 
	let Rotation = (function() {

	    /**
	     * {function} - a function called with no extra arguments when interval tick occured
	     */
	    var onIntervalTick;

		/**
		 * {function} - underlying interval function causing the ticks to occur
		 */
		var intervalFn;

		return {

			init: function(onIntervalFn) {
				onIntervalTick = onIntervalFn;
			},

			resume: function(atRefreshInterval) {
				if (intervalFn)
					clearInterval(intervalFn); // free old 
				if (atRefreshInterval)
					intervalFn = setInterval(onIntervalTick, atRefreshInterval * 1000);
			}
		};
	})();
	
	/**
	 * Internal API for creating data update messages send to the view from server responses.
	 */ 
	let Update = (function() {

		function addHistory(widget, data) {
			function prependPoints(dest, src, time0, interval) {
				let mostPastTime = dest[0];
				let time = time0;
				const prepended = [];
				for (let i = 0; i < src.length; i++) {
					if (time < mostPastTime) {
						prepended.push(time);
						prepended.push(src[i]);
					}
					time += interval;
				}
				return prepended.length == 0 ? dest : prepended.concat(dest);
			}
			const aggregates = widget.options.drawAggregates;
			data.forEach(function(seriesData) {
				if (seriesData.minutes && aggregates !== false)
					seriesData.points = prependPoints(seriesData.points, seriesData.minutes.avgs, seriesData.minutes.start, seriesData.minutes.interval);
				if (seriesData.hours && (aggregates === true || aggregates == 'day' || aggregates == 'month'))
					seriesData.points = prependPoints(seriesData.points, seriesData.hours.avgs, seriesData.hours.start, seriesData.hours.interval);
				if (seriesData.days && (aggregates === true || aggregates == 'month'))
					seriesData.points = prependPoints(seriesData.points, seriesData.days.avgs, seriesData.days.start, seriesData.days.interval);
			});
			return data;		
		}

		/**
		 * Shortens the shown time frame to one common to all series but at least to the last minute.
		 */
		function retainCommonTimeFrame(widget, data) {
			if (!data || data.length == 0)
				return [];
			if (widget.options.drawAggregates !== false && widget.options.drawAggregates !== undefined)
				return addHistory(widget, data);
			let now = Date.now();
			let startOfLastMinute = now - 60000;
			let startOfShortestSeries = data.reduce((high, e) => Math.max(e.points[0], high), 0);
			let startCutoff = data.length == 1 ? startOfShortestSeries : Math.min(startOfLastMinute, startOfShortestSeries);
			let endOfShortestSeries = data.reduce((low, e) =>  {
				let endTime = e.points[e.points.length - 2];
				return endTime > now - 4000 ? Math.min(endTime, low) : low;
			}, now);
			let endCutoff = endOfShortestSeries;
			data.forEach(function(seriesData) {
				let src = seriesData.points;
				if (src.length == 4 && src[2] >= startCutoff) {
					if (src[1] == src[3]) {
						// extend a straight line between 2 points to cutoff
						seriesData.points = [Math.max(seriesData.observedSince, Math.min(startOfShortestSeries, src[2] - 59000)), src[1], src[2], src[3]];						
					}
				} else {
					let points = [];
					for (let i = 0; i < src.length; i += 2) {
						if (src[i] >= startCutoff && src[i] <= endCutoff) {
							points.push(src[i]);
							points.push(src[i+1]);
						}
					}
					seriesData.points = points;				
				}
			});
			return data.filter(seriesData => seriesData.points.length >= 2 
				&& seriesData.points[seriesData.points.length - 2] > startOfLastMinute);
		}

		function adjustDecimals(data, factor, divisor) {
			data.forEach(function(seriesData) {
				seriesData.points = seriesData.points.map((val, index) => index % 2 == 0 ? val : val * factor / divisor);
				seriesData.observedMax = seriesData.observedMax * factor / divisor; 
				seriesData.observedMin = seriesData.observedMin * factor / divisor;
				seriesData.observedSum = seriesData.observedSum * factor / divisor;
			});
		}

		function perSecond(data) {
			data.forEach(function(seriesData) {
				let points = seriesData.points;
				if (!points)
				  return;
				let pointsPerSec = new Array(points.length - 2);
				for (let i = 0; i < pointsPerSec.length; i+=2) {
				  let t0 = points[i];
				  let t1 = points[i+2];
				  let y0 = points[i+1];
				  let y1 = points[i+3];
				  let dt = t1 - t0;
				  let dy = y1 - y0;
				  let y = (dt / 1000) * dy;
				  pointsPerSec[i] = t1;
				  pointsPerSec[i+1] = y;				  
				}
				if (pointsPerSec.length === 2)
				  pointsPerSec = [points[0], pointsPerSec[1], pointsPerSec[0], pointsPerSec[1]];
				seriesData.points = pointsPerSec;
				//TODO update min/max/avg per sec 
			});
		}

		function addAssessment(widget, data, alerts, watches) {
			function unifyWatch(watch) {
				for (let seriesState of Object.values(watch.states))
					for (let [instance, state] of Object.entries(seriesState))
						if (typeof state === 'string') {
							seriesState[instance] = { level: state, since: undefined };
						}
			}
			function defined(e) {
				return e !== undefined;
			}
			data.forEach(function(seriesData) {
				let instance = seriesData.instance;
				let series = seriesData.series;
				let status = 'normal';
				let since;
				if (Array.isArray(watches) && watches.length > 0) {
					// unify watch state as it was just a string and become an object later
					for (let watch of watches)
						unifyWatch(watch);
					// evaluate state
					const watchStatus = watches
						.filter(watch => !watch.disabled && !watch.stopped)
						.map(watch => watch.states[series]).filter(defined)
						.map(states => states[instance]).filter(defined);
					let states = watchStatus 
						.map(state => state.level).filter(defined);
					if (states.includes('red')) {
						status = 'red';
					} else if (states.includes('amber')) {
						status = 'amber';
					} else if (states.includes('green')) {
						status = 'green';
					} else if (states.length > 0) {
						status = 'white';
					}
					since = Math.max( ... watchStatus.map(state => state.since).filter(defined));
				}
				let thresholds = widget.decorations.thresholds;
				if (thresholds.reference && thresholds.reference !== 'off') {
					let value = seriesData.points[seriesData.points.length-1];
					switch (thresholds.reference) {
						case 'min': value = seriesData.observedMin; break;
						case 'max': value = seriesData.observedMax; break;
						case 'avg': value = seriesData.observedSum / seriesData.observedValues; break;
					}
					let alarming = thresholds.alarming.value;
					let critical = thresholds.critical.value;
					let desc = alarming && critical && critical < alarming;
					if (alarming && ((!desc && value >= alarming) || (desc && value <= alarming))) {
						status = 'alarming';
					}
					if (critical && ((!desc && value >= critical) || (desc && value <= critical))) {
						status = 'critical';
					}
				}
				if (Array.isArray(alerts) && alerts.length > 0) {					
					if (alerts.filter(alert => alert.instance == instance && alert.level === 'red').length > 0) {
						status = 'red';
					} else if (alerts.filter(alert => alert.instance == instance && alert.level === 'amber').length > 0) {
						status = 'amber';
					}
				}
				seriesData.assessments = { status: status, since: since };
			});
		}

		function createOnSuccess(widgets, onDataUpdate, getConfirmedAlertSerials) {
			return function(response) {
				const confirmedAlertsSerials = getConfirmedAlertSerials();
				Object.values(widgets).forEach(function(widget, index) {
					let allMatches = response.matches;
					let widgetMatches = allMatches.filter(match => match.widgetId == widget.id);
					let data = [];
					let alerts = [];
					let watches = [];
					let annotations = [];
					for (let i = 0; i  < widgetMatches.length; i++)  {
						data = data.concat(widgetMatches[i].data);
						alerts = alerts.concat(widgetMatches[i].alerts);
						watches = watches.concat(widgetMatches[i].watches);
						annotations = annotations.concat(widgetMatches[i].annotations);
					}
					for (let alert of alerts)
						alert.confirmed = confirmedAlertsSerials.includes(alert.serial);
					data = retainCommonTimeFrame(widget, data);
					if (widget.options.decimalMetric || widget.scaleFactor !== undefined && widget.scaleFactor !== 1)
						adjustDecimals(data, widget.scaleFactor ? widget.scaleFactor : 1,  widget.options.decimalMetric ? 10000 : 1);
					if (widget.options.perSec)
						perSecond(data);
					addAssessment(widget, data, alerts, watches);
					onDataUpdate({
						widget: widget,
						data: data,
						alerts: alerts,
						watches: watches,
						annotations: annotations,
						chart: () => Charts.getOrCreate(widget),
					});
				});
				const alertsStats = response.alerts;
				alertsStats.byIdOnPage = {};
				for (let match of response.matches)
					for (let alert of match.alerts)
						alertsStats.byIdOnPage[alert.serial] = alert; 
				// by convention the same function is called for global updates 
				// in that case it does not have a widget property but just the below:
				onDataUpdate({ alerts: alertsStats });
			};
		}

		function createOnError(widgets, onDataUpdate) {
			return function() {
				Object.values(widgets).forEach(function(widget) {
					onDataUpdate({
						widget: widget,
						chart: () => Charts.getOrCreate(widget),
					});
				});
			};
		}

		function createQuery(widgets) {
			let queries = [];
			const widgetsArray = Object.values(widgets);
			for (let i = 0; i < widgetsArray.length; i++) {
				const widget = widgetsArray[i];
				let truncate = [];
				let exclude = [];
				let alerts = widget.decorations.alerts;
				let noAlerts = alerts.noOngoing === true && alerts.noStopped === true
					|| alerts.noAcknowledged === true && alerts.noUnacknowledged === true
					|| alerts.noAmber === true && alerts.noRed === true;
				if (noAlerts)
					exclude.push('ALERTS');
				if (widget.options.noAnnotations)
					exclude.push('ANNOTATIONS');
				switch (widget.type) {
					case 'alert':
						exclude.push('POINTS');
						exclude.push('WATCHES');
						break;
					case 'annotation':
						exclude.push('ALERTS');
						exclude.push('POINTS');
						exclude.push('WATCHES');
						break;
					default:
						truncate.push('ALERTS');
				}
				pushQueryItems(widget, queries, truncate, exclude);
			}
			return queries;
		}

		function pushQueryItems(widget, queries, truncate, exclude) {
			const series = widget.series;
			const history = widget.options.drawAggregates !== false && widget.options.drawAggregates !== undefined;
			const id = widget.id;
			if (Array.isArray(series)) {
				series.forEach(s => queries.push({ widgetId: id, series: s, truncate: truncate, exclude: exclude, instances: undefined, history: history }));
			} else {
				queries.push({ widgetId: id, series: series, truncate: truncate, exclude: exclude, instances: undefined, history: history }); 
			}
		}

		return {
			createQuery: createQuery,
			createOnSuccess: createOnSuccess,
			createOnError: createOnError,
		};
	})();




	function doInit(onDataUpdate, onPageUpdate) {
		UI.load();
		Interval.init(async function() {
			let page = UI.currentPage();
			if (page.type == 'query') {
				const now = new Date().getTime();
				if (page.widgets === undefined || page.content.expires === undefined || now >= page.content.expires) {
					page = await UI.queryPage();
					onPageUpdate(doSwitchPage(page.id));
				}
			}
			let widgets = page.widgets;
			Controller.requestListOfSeriesData(Update.createQuery(widgets), 
				Update.createOnSuccess(widgets, onDataUpdate, 
					() => UI.Alerts.confirmedRedAlerts().concat(UI.Alerts.confirmedAmberAlerts())),
				Update.createOnError(widgets, onDataUpdate));
		});
		if (UI.Refresh.interval() === undefined) {
			UI.Refresh.interval(DEFAULT_INTERVAL);
		}
		if (!UI.Refresh.isPaused())
			Interval.resume(UI.Refresh.interval());
		Rotation.init(() => onPageUpdate(doSwitchPage()));
		if (UI.Rotation.isEnabled()) {
			Rotation.resume(UI.Rotation.interval());	
		}
		return UI.arrange();
	}

	function doConfigureSelection(widgetUpdate) {
		UI.configureWidget(createWidgetUpdate(widgetUpdate));
		return UI.arrange();
	}

	function doConfigureWidget(widgetId, widgetUpdate) {
		UI.configureWidget(createWidgetUpdate(widgetUpdate), widgetId);
		return UI.arrange();
	}

	function createWidgetUpdate(widgetUpdate) {
		return function(widget) {
			let type = widget.type;
			widgetUpdate(widget);
			if (widget.type === type) {
				Charts.update(widget);
			} else {
				Charts.destroy(widget.id);
			}
		};
	}

	function doSwitchPage(pageId) {
		if (UI.switchPage(pageId)) {
			Charts.clear();
			Interval.tick();
			window.location.hash = pageId;
		}
		return UI.arrange();		
	}

	/**
	 * The public API object ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
	 */
	return {
		
		init: doInit,
		
		/**
		 * @param {function} consumer - a function with one argument accepting the array of series names
		 */
		listSeries: (consumer) => Controller.requestListOfSeriesNames(consumer),

		listPages: UI.listPages,
		exportPages: UI.exportPages,
		importPages: UI.importPages,
		
		/**
		 * API to control the chart refresh interval.
		 */
		Refresh: {
			pause: function() { 
				Interval.pause();
				UI.Refresh.paused(true);
			},
			paused: function(paused) {
				if (paused === undefined)
					return UI.Refresh.isPaused();
				UI.Refresh.paused(paused);
				if (paused) {
					Interval.pause();
				} else {
					Interval.resume(UI.Refresh.interval());
				}
			},
			isPaused: UI.Refresh.isPaused,
			resume: function(duration) {
				if (duration !== undefined) {
					UI.Refresh.interval(duration);
				}
				UI.Refresh.paused(false);
				Interval.resume(UI.Refresh.interval());
			},
			interval: function(duration) {
				if (duration === undefined)
					return UI.Refresh.interval();
				UI.Refresh.interval(duration);
				Interval.resume(UI.Refresh.interval());				
			},
		},

		Theme: {
			palette: UI.themePalette,
			option: UI.themeOption,
			color: UI.themeColor,
			configure: UI.themeConfigure,
		},
		
		Role: UI.Role,

		Settings: {
			isDispayed: UI.showSettings,
			open: UI.openSettings,
			close: UI.closeSettings,
			toggle: () => UI.showSettings() ? UI.closeSettings() : UI.openSettings(),

			Alerts: UI.Alerts,

			Rotation: {
				isEnabled: UI.Rotation.isEnabled,
				enabled: function(enabled) {
					UI.Rotation.enabled(enabled);
					Rotation.resume(UI.Rotation.isEnabled() ? UI.Rotation.interval() : 0);
				},
				interval: function(duration) {
					if (duration === undefined)
						return UI.Rotation.interval();
					UI.Rotation.interval(duration);
					Rotation.resume(UI.Rotation.isEnabled() ? UI.Rotation.interval() : 0);
				}
			},

			Navigation: UI.Navigation,
		},

		
		/**
		 * API to control the active page manipulate the set of charts contained on it.
		 */
		Page: {
			
			current: () => UI.currentPage(),
			configure: function(change) {
				UI.configurePage(change);
				return UI.arrange();
			},
			id: () => UI.currentPage().id,
			name: () => UI.currentPage().name,
			rename: UI.renamePage,
			rotate: UI.rotatePage,
			isEmpty: () => (Object.keys(UI.currentPage().widgets).length === 0),
			numberOfColumns: () => UI.currentPage().numberOfColumns,

			create: function(name) {
				UI.createPage(name);
				Charts.clear();
				return UI.arrange();
			},
			
			erase: function(pageId, onSuccess, onError) {
				UI.deletePage(pageId, () => {
					Charts.clear();
					Interval.tick();
					if (typeof onSuccess === 'function')
						onSuccess();
				}, onError);
			},
			
			reset: function(pageId) {
				if (UI.resetPage(pageId)) {
					Charts.clear();
					Interval.tick();
					return true;
				}
				return false;
			},

			hasPreset: UI.hasPreset,
			
			changeTo: function(pageId) {
				return doSwitchPage(pageId);
			},

			Sync: UI.Sync,
			
			/**
			 * Returns a layout model for the active pages charts and the given number of columns.
			 * This also updates the grid object of the active pages configuration.
			 * 
			 * @param {number} numberOfColumns - the number of columns the charts should be arrange in
			 */
			arrange: UI.arrange,
			
			Widgets: {
				
				add: function(series, grid, factory) {
					if (Array.isArray(series) && series.length == 1)
						series = series[0];
					if (Array.isArray(series) || series.trim()) {
						UI.addWidget(series, grid, factory);
						Interval.tick();
					}
					return UI.arrange();
				},

				infer: UI.inferWidget,
				
				remove: function(widgetId) {
					Charts.destroy(widgetId);
					UI.removeWidget(widgetId);
					return UI.arrange();
				},
				
				configure: doConfigureWidget,

				moveLeft: (widgetId) => doConfigureWidget(widgetId, function(widget) {
	                if (!widget.grid.column || widget.grid.column > 0) {
	                    widget.grid.column = widget.grid.column ? widget.grid.column - 1 : 1;
	                }
	            }),

	            moveRight: (widgetId) => doConfigureWidget(widgetId, function(widget) {
	                if (!widget.grid.column || widget.grid.column < 4) {
	                    widget.grid.column = widget.grid.column ? widget.grid.column + 1 : 1;
	                }
	            }),

				/**
				 * API for the set of selected widgets on the current page.
				 */
				Selection: {
					
					listSeries: UI.selected,
					isSingle: () => UI.selected().length == 1,
					first: () => UI.currentPage().widgets[UI.selected()[0]],
					toggle: UI.select,
					clear: UI.deselect,
					
					/**
					 * @param {function} widgetUpdate - a function accepting chart configuration applied to each chart
					 */
					configure: doConfigureSelection,

				},
			},
			
		},

	};
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Utilities to convert values given in units from and to string.
 **/
MonitoringConsole.View.Units = (function() {

   const PERCENT_FACTORS = {
      '%': 1
   };

   /**
    * Factors used for any time unit to milliseconds
    */
   const SEC_FACTORS = {
      h: 60 * 60, hours: 60 * 60,
      m: 60, min: 60, mins: 60,
      s: 1, sec: 1, secs: 1,
      _: [['d', 'h'], ['d', 'h', 'm'], ['d', 'h', 'm', 's'], ['h', 'm'], ['h', 'm', 's'], ['m', 's']]
   };

   /**
    * Factors used for any time unit to milliseconds
    */
   const MS_FACTORS = {
      d: 24 * 60 * 60 * 1000, days: 24* 60 * 60 * 1000,
      h: 60 * 60 * 1000, hours: 60 * 60 * 1000,
      m: 60 * 1000, min: 60 * 1000, mins: 60 * 1000,
      s: 1000, sec: 1000, secs: 1000,
      ms: 1,
      us: 1/1000, μs: 1/1000,
      ns: 1/1000000,
      _: [['d', 'h'], ['d', 'h', 'm'], ['d', 'h', 'm', 's'], ['h', 'm'], ['h', 'm', 's'], ['h', 'm', 's', 'ms'], ['m', 's'], ['m', 's', 'ms'], ['s', 'ms']]
   };

   /**
    * Factors used for any time unit to microseconds
    */
   const US_FACTORS = {
      h: 60 * 60 * 1000 * 1000, hours: 60 * 60 * 1000 * 1000,
      m: 60 * 1000 * 1000, min: 60 * 1000 * 1000, mins: 60 * 1000 * 1000,
      s: 1000 * 1000, sec: 1000 * 1000, secs: 1000 * 1000,
      ms: 1000,
      us: 1, μs: 1,
      ns: 1/1000,
      _: [['h', 'm'], ['h', 'm', 's'], ['h', 'm', 's', 'ms'], ['m', 's'], ['m', 's', 'ms'], ['s', 'ms'], ['ms', 'us']]
   };

   /**
    * Factors used for any time unit to nanoseconds
    */
   const NS_FACTORS = {
      h: 60 * 60 * 1000 * 1000000, hours: 60 * 60 * 1000 * 1000000,
      m: 60 * 1000 * 1000000, min: 60 * 1000 * 1000000, mins: 60 * 1000 * 1000000,
      s: 1000 * 1000000, sec: 1000 * 1000000, secs: 1000 * 1000000,
      ms: 1000000,
      us: 1000, μs: 1000,
      ns: 1,
      _: [['h', 'm'], ['h', 'm', 's'], ['h', 'm', 's', 'ms'], ['m', 's'], ['m', 's', 'ms'], ['s', 'ms'], ['ms', 'us', 'ns'], ['ms', 'us']]
   };

   /**
    * Factors used for any memory unit to bytes
    */
   const BYTES_FACTORS = {
      kB: 1024, kb: 1024,
      MB: 1024 * 1024, mb: 1024 * 1024,
      GB: 1024 * 1024 * 1024, gb: 1024 * 1024 * 1024,
      TB: 1024 * 1024 * 1024 * 1024, tb: 1024 * 1024 * 1024 * 1024,
   };

   /**
    * Factors used for usual (unit less) count values
    */
   const COUNT_FACTORS = {
      K: 1000,
      M: 1000 * 1000
   };

   /**
    * Factors by unit
    */
   const FACTORS = {
      count: COUNT_FACTORS,
      sec: SEC_FACTORS,
      ms: MS_FACTORS,
      us: US_FACTORS,
      ns: NS_FACTORS,
      bytes: BYTES_FACTORS,
      percent: PERCENT_FACTORS,
      updown: {},
   };

   const UNIT_NAMES = {
      count: 'Count',
      sec: 'Seconds', 
      ms: 'Milliseconds',
      us: 'Microseconds',
      ns: 'Nanoseconds', 
      bytes: 'Bytes', 
      percent: 'Percentage',
      updown: 'Up/Down',
   };

   const ALERT_STATUS_NAMES = { 
      white: 'Normal', 
      green: 'Healthy', 
      amber: 'Degraded', 
      red: 'Unhealthy' 
   };

   function parseNumber(valueAsString, factors) {
      if (!valueAsString || typeof valueAsString === 'string' && valueAsString.trim() === '')
         return undefined;
      let valueAsNumber = Number(valueAsString);
      if (!Number.isNaN(valueAsNumber))
         return valueAsNumber;
      let valueAndUnit = valueAsString.split(/(-?[0-9]+\.?[0-9]*)/);
      let sum = 0;
      for (let i = 1; i < valueAndUnit.length; i+=2) {
         valueAsNumber = Number(valueAndUnit[i].trim());
         let unit = valueAndUnit[i+1].trim().toLowerCase();
         let factor = factors[unit];
         sum += valueAsNumber * factor;               
      }
      return sum;
   }

   function formatDecimal(valueAsNumber) {
      if (!hasDecimalPlaces(valueAsNumber)) {
         return Math.round(valueAsNumber).toString();
      } 
      let text = valueAsNumber.toFixed(1);
      return text.endsWith('.0') ? Math.round(valueAsNumber).toString() : text;
   }

   function formatNumber(valueAsNumber, factors, useDecimals = false, separator = '') {
      if (valueAsNumber === undefined)
         return undefined;
      if (valueAsNumber === 0)
         return '0';
      if (!factors)
         return formatDecimal(valueAsNumber);
      if (valueAsNumber < 0)
         return '-' + formatNumber(-valueAsNumber, factors, useDecimals);
      let largestFactorUnit;
      let largestFactor = 0;
      let factor1Unit = '';
      for (let [unit, factor] of Object.entries(factors)) {
         if (unit != '_' && (valueAsNumber >= 0 && factor > 0 || valueAsNumber < 0 && factor < 0)
            && (useDecimals && (valueAsNumber / factor) >= 1 || !hasDecimalPlaces(valueAsNumber / factor))
            && factor > largestFactor) {
            largestFactor = factor;
            largestFactorUnit = unit;
         }
         if (factor === 1)
            factor1Unit = unit;
      }
      if (!largestFactorUnit)
         return formatDecimal(valueAsNumber) + factor1Unit;
      if (useDecimals)
         return formatDecimal(valueAsNumber / largestFactor) + largestFactorUnit;
      let valueInUnit = Math.round(valueAsNumber / largestFactor);
      if (factors._) {
         for (let i = 0; i < factors._.length; i++) {
            let combination = factors._[i];
            let rest = valueAsNumber;
            let text = [];
            if (combination[combination.length - 1] == largestFactorUnit) {
               for (let j = 0; j < combination.length; j++) {
                  let unit = combination[j];
                  let factor = factors[unit];
                  let times = Math.floor(rest / factor);
                  if (times === 0)
                     break;
                  rest -= times * factor;
                  text.push(times + unit);                      
               }
            }
            if (rest === 0) {
               return text.join(separator);
            }
         }
      }
      return valueInUnit + largestFactorUnit;
   }

   function hasDecimalPlaces(number) {
      return number % 1 != 0;
   }

   function formatTime(hourOrDateOrTimestamp, minute, second, millis) {
      if (typeof hourOrDateOrTimestamp === 'string')
         hourOrDateOrTimestamp = Number(hourOrDateOrTimestamp);
      if (typeof hourOrDateOrTimestamp === 'number' && hourOrDateOrTimestamp > 24) { // assume timestamp
         hourOrDateOrTimestamp = new Date(hourOrDateOrTimestamp);
      }
      if (typeof hourOrDateOrTimestamp === 'object') { // assume Date
         minute = hourOrDateOrTimestamp.getMinutes();
         second = hourOrDateOrTimestamp.getSeconds();
         millis = hourOrDateOrTimestamp.getMilliseconds();
         hourOrDateOrTimestamp = hourOrDateOrTimestamp.getHours();
      }
      let str = as2digits(hourOrDateOrTimestamp);
      str += ':' + as2digits(minute ? minute : 0);
      if (second)
         str += ':' +  as2digits(second);
      if (millis)
         str += '.' + as3digits(millis);
      return str;
   }

   function formatDateTime(dateOrTimestamp) {
      if (dateOrTimestamp === undefined)
         return '';
      if (typeof dateOrTimestamp === 'string')
         dateOrTimestamp = Number(dateOrTimestamp);
      if (typeof dateOrTimestamp === 'number')
         dateOrTimestamp = new Date(dateOrTimestamp);
      // now dateOrTimestamp should be a Date object
      let now = new Date();
      let diffMs = now - dateOrTimestamp;
      diffMs = Math.round(diffMs / 1000) * 1000; // truncate ms
      if (diffMs > 120000) // 2 mins
         diffMs = Math.round(diffMs / 60000) * 60000; // truncate sec
      if (diffMs > 7200000) // 2h
         diffMs = Math.round(diffMs / 3600000) * 3600000; // truncate min
      const time = formatTime(Math.round(dateOrTimestamp.getTime() / 60000) * 60000); // nothing below h
      let date = dateOrTimestamp.toLocaleDateString();
      if (date == now.toLocaleDateString())
         date = '';
      return time + ', ' + date + ' (' + formatNumber(diffMs, MS_FACTORS, false, ', ') + ' ago)';
   }

   function as2digits(number) {
      return number.toString().padStart(2, '0');
   }

   function as3digits(number) {
      return number.toString().padStart(3, '0');
   }

   const DECIMAL_NUMBER_PATTERN = '([0-9]+\.)?[0-9]+';

   function pattern(factors) {
      if (!factors)
         return DECIMAL_NUMBER_PATTERN;
      return '(' + DECIMAL_NUMBER_PATTERN + '(' + Object.keys(factors).filter(unit => unit != '_').join('|') + ')? *)+';
   }

   function patternHint(factors) {
      if (!factors)
         return 'a integer or decimal number';
      return 'a integer or decimal number, optionally followed by a unit: ' + Object.keys(factors).filter(unit => unit != '_').join(', ');
   }

   function maxAlertLevel(a, b) {
      const table = ['white', 'normal', 'green', 'alarming', 'amber', 'critical', 'red'];
      return table[Math.max(0, Math.max(table.indexOf(a), table.indexOf(b)))];
   }

   /**
    * Public API below:
    */
   return {
      Alerts: {
         maxLevel: maxAlertLevel,
         name: (level) => ALERT_STATUS_NAMES[level == undefined ? 'white' : level],
      },
      
      names: () => UNIT_NAMES,
      formatTime: formatTime,
      formatDateTime: formatDateTime,
      formatNumber: formatNumber,
      formatMilliseconds: (valueAsNumber) => formatNumber(valueAsNumber, MS_FACTORS),
      formatNanoseconds: (valueAsNumber) => formatNumber(valueAsNumber, NS_FACTORS),
      formatBytes: (valueAsNumber) => formatNumber(valueAsNumber, BYTES_FACTORS),
      parseNumber: parseNumber,
      parseMilliseconds: (valueAsString) => parseNumber(valueAsString, MS_FACTORS),
      parseNanoseconds: (valueAsString) => parseNumber(valueAsString, NS_FACTORS),
      parseBytes: (valueAsString) => parseNumber(valueAsString, BYTES_FACTORS),
      converter: function(unit) {
         if (unit == 'updown')
            return {
               format: (stateAsNumber) => stateAsNumber == 0 ? 'Down' : 'Up',
               parse: (stateAsString) => stateAsString == 'Down' || stateAsString == '0' ? 0 : 1,
               pattern: () => 'up|down|0|1',
               patternHint: () => 'up, down, 0, 1'
            };
         let factors = FACTORS[unit];
         return {
            format: (valueAsNumber, useDecimals) => formatNumber(valueAsNumber, factors, useDecimals),
            parse: (valueAsString) => parseNumber(valueAsString, factors),
            pattern: () =>  pattern(factors),
            patternHint: () => patternHint(factors),
         };
      }
   };
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Utilities to convert color values and handle color schemes.
 *
 * Color schemes are named sets of colors that are applied to the model.
 * This is build purely on top of the model. 
 * The model does not remember a scheme, 
 * schemes are just a utility to reset color configurations to a certain set.
 **/
MonitoringConsole.View.Colors = (function() {

   const Theme = MonitoringConsole.Model.Theme;

   const SCHEMES = {
      Payara: {
         name: 'Payara',
         palette: [ 
            '#008fcc', '#42d4f4', '#469990', '#aaffc3', 
            '#bfef45', '#ffe119', '#ffd8b1', '#9A6324', 
            '#800000', '#911eb4', '#f032e6', '#fabebe', '#e6beff', '#fffac8' ],
         opacity: 10,
         colors:  { 
            error: '#e6194B', missing: '#0096D6',
            waterline: '#3cb44b', alarming: '#f58231', critical: '#e6194B',
            white: '#ffffff', green: '#3cb44b', amber: '#f58231', red: '#e6194B',
         }
      },

      '80s': {
         name: '80s',
         opacity: 10,
         palette: [ '#c04df9', '#f3ea5f', '#08c1ef', '#d28f47', '#b86739'],
         colors:  { 
            waterline: '#2bd1fc', alarming: '#e8a634', critical: '#ff3f3f',
            white: '#ffffff', green: '#b6f778', amber: '#e8a634', red: '#ff3f3f',
         }
      },

      Pastels: {
         name: 'Pastels',
         opacity: 10,
         palette: [ '#deccff', '#96c0bc', '#dbd259', '#bd6283', '#08c7f7' ],
         colors:  { 
            waterline: '#82e69f', alarming: '#dbd259', critical: '#b95f51',
            white: '#ffffff', green: '#82e69f', amber: '#d49e54', red: '#b95f51',
         }
      },

      Neon: {
         name: 'Neon',
         opacity: 10,
         palette: [ '#f700d8', '#eff109', '#0ed4f7', '#00b8aa', '#0000f7'],
         colors:  { 
            waterline: '#00aff3', alarming: '#f64e0c', critical: '#dc143c',
            white: '#ffffff', green: '#6cf700', amber: '#f64e0c', red: '#dc143c',
         }
      },

      'Vapor Wave': {
         name: 'Vapor Wave',
         opacity: 10,
         palette: [ '#b8a9df', '#01cdfe', '#b967ff', '#fffb96', '#05ffa1'],
         colors:  { 
            waterline: '#01cdfe', alarming: '#edae50', critical: '#FB637A',
            white: '#ffffff', green: '#a2dda9', amber: '#edae50', red: '#e05267', 
         }
      },
   };

   /**
    * Object used as map to remember the colors by coloring stratgey.
    * Each strategy leads to an object map that remebers the key as fields 
    * and the index associated with the key as value.
    * This is a mapping from e.g. the name 'DAS' to index 0. 
    * The index is then used to pick a color form the palette.
    * This makes sure that same key, for example the instance name,
    * always uses the same color accross widgets and pages.
    */
   let colorIndexMaps = {};

   function lookup(coloring, key, palette) {
      let mapName = coloring || 'instance';
      let map = colorIndexMaps[mapName];
      if (map === undefined) {
         map = {};
         colorIndexMaps[mapName] = map;
      }
      let index = map[key];
      if (index === undefined) {
         index = Object.keys(map).length;
         map[key] = index;
      }
      return derive(palette, index);
   }

   /**
    * Returns a palette color.
    * If index is outside of the palette given a color is derived from the palette.
    * The derived colors are intentionally biased towards light non-grayish colors.
    */
   function derive(palette, index = 1) {
      let color = palette[index % palette.length];
      if (index < palette.length)
         return color;
      let [r, g, b] = hex2rgb(color);
      let offset = index - palette.length + 1;
      let shift = (offset * 110) % 255;
      r = (r + shift) % 255;
      g = (g + shift) % 255;
      b = (b + shift) % 255;
      let variant = offset % 6;
      if (variant == 0 || variant == 3 || variant == 4)
         r = Math.round(r / 2);
      if (variant == 1 || variant == 3 || variant == 5)
         g = Math.round(g / 2);
      if (variant == 2 || variant == 4 || variant == 5)
         b = Math.round(b / 2);
      if (r + g + b < 380 && r < 120) r = 255 - r;
      if (r + g + b < 380 && g < 120) g = 255 - g;
      if (r + g + b < 380 && b < 120) b = 255 - b;
      return rgb2hex(r, g, b);
   }

   function random(palette) {
      if (Array.isArray(palette))
         return derive([palette[0]], palette.length); 
      const letters = '0123456789ABCDEF';
      let color = '#';
      for (let i = 0; i < 6; i++) {
         color += letters[Math.floor(Math.random() * 16)];
      }
      return color;
   }

   function hex2rgb(hex) {
      return hex.match(/\w\w/g).map(x => parseInt(x, 16));
   }

   function rgb2hex(r, g, b) {
      return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
   }

   function hex2rgba(hex, alpha = 1) {
      const [r, g, b] = hex2rgb(hex);
      return `rgba(${r},${g},${b},${alpha})`;
   }

   function schemeOptions() {
      return Object.keys(SCHEMES);
   }

   function applyScheme(name, override = true) {
      const createSetColorFn = (name, color) => (theme) => theme.colors[name] = color;
      let scheme = SCHEMES[name];
      if (scheme) {
         if (override || Theme.palette() === undefined)
            Theme.configure(theme => theme.palette = scheme.palette);
         if (override || Theme.option('opacity') === undefined)
            Theme.configure(theme => theme.options.opacity = scheme.opacity);
         if (scheme.colors) {
            for (let [name, color] of Object.entries(scheme.colors)) {
               if (override || Theme.color(name) === undefined)
                  Theme.configure(createSetColorFn(name, color));
            }
         }            
      }
   }

   /**
    * Public API of the color utility module.
    */
   return {
      lookup: lookup,
      random: random,
      hex2rgba: hex2rgba,
      schemes: schemeOptions,
      scheme: applyScheme,
   };
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Data/Model driven view components.
 *
 * Each of them gets passed a model creates a DOM structure in form of a jQuery object 
 * that should be inserted into the page DOM using jQuery.
 *
 * Besides general encapsulation the idea is to benefit of a function approch 
 * that utilises pure functions to compute the page context from a fixed state input.
 * This makes the code much easier to understand and maintain as it is free of overall page state.
 **/
MonitoringConsole.View.Components = (function() {

  const Controller = MonitoringConsole.Controller;
  const Units = MonitoringConsole.View.Units;
  const Colors = MonitoringConsole.View.Colors;
  const Selection = MonitoringConsole.Model.Page.Widgets.Selection;

  function isFunction(obj) {
    return typeof obj === 'function';
  }

  function isString(obj) {
    return typeof obj === 'string';
  }

  function isJQuery(obj) {
    return obj instanceof jQuery;
  }

  function createIcon(icon) {
    const svgElem = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    const useElem = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    useElem.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'images/icons.svg#' + icon);
    svgElem.appendChild(useElem);
    return $(svgElem)
      .attr('class', 'icon ' + icon)
      .attr('viewBox', [0, 0, 16, 16])
      .attr('aria-hidden', true)
      .attr('focusable', false)
      .attr('width', '16px')
      .attr('height', '16px');
  }

  /**
   * Model: { class, icon, alt, text }
   */
  function createIconButton(model) {
    const btn = $('<button/>', { class: model.class, title: model.alt })
      .append(createIcon( model.icon));
    if (model.text) {
      btn.append($('<span/>').text(model.text));
    } else if (model.alt) {
      btn.append($('<span/>', { class: 'visually-hidden'}).text(model.alt)); 
    }
    return btn;
  }

   /**
    * This is the side panel showing the details and settings of widgets
    */
   let Settings = (function() {

      function createRow(model, inputs) {
        let components = $.isFunction(inputs) ? inputs() : inputs;
        if (isString(components))
            components = document.createTextNode(components);
        let config = {};
        if (model.description)
          config.title = model.description;
        let tr = $('<tr/>');
        tr.append($('<td/>', config).text(model.label)).append($('<td/>').append(components));
        return tr;
      }

      function enhancedOnChange(onChange, updatePage) {
        if (onChange.length == 2) {
          return (value) => {
            let layout = Selection.configure((widget) => onChange(widget, value));
            if (updatePage) {
              MonitoringConsole.View.onPageUpdate(layout);
            }
          };
        }
        return onChange;
      }

      function createCheckboxInput(model) {
        let config = { id: model.id, type: 'checkbox', checked: model.value };
        if (model.description && !model.label)
          config.title = model.description;
        let onChange = enhancedOnChange(model.onChange);
        return $("<input/>", config)
          .on('change', function() {
            let checked = this.checked;
            onChange(checked);
          });
      }

      function createRangeInput(model) {
        let config = { id: model.id, type: 'number', value: model.value};
        if (model.min)
          config.min = model.min;
        if (model.max)
          config.max = model.max;
        if (model.description && !model.label)
          config.title = model.description;
        let onChange = enhancedOnChange(model.onChange, true);
        return $('<input/>', config)
          .on('input change', function() {  
            let val = this.valueAsNumber;
            if (Number.isNaN(val))
              val = undefined;
            onChange(val);
          });
      }

      function createDropdownInput(model) {
        let config = { id: model.id };
        if (model.description && !model.label)
          config.title = model.description;
        let dropdown = $('<select/>',  );
        if (Array.isArray(model.options)) {
          model.options.forEach(option => dropdown.append($('<option/>',
            { text: option, value: option, selected: model.value === option})));
        } else {
          Object.keys(model.options).forEach(option => dropdown.append($('<option/>', 
            { text:model.options[option], value:option, selected: model.value === option})));          
        }
        let onChange = enhancedOnChange(model.onChange, true);
        dropdown.change(() => {
          let val = dropdown.val();
          if (val === '_') val = undefined;
          if (val === 'false') val = false;
          if (val === 'true') val = true;
          onChange(val);
        });
        return dropdown;
      }

      function createToggleInput(model) {
        let checked = model.value;
        const toggle = $('<button/>', { id: model.id, class: 'toggle', role:'switch', 'aria-checked': checked })
          .append($('<span/>', {'aria-hidden': true, class: 'toggle__off' }).text(model.options['false']))
          .append($('<span/>', {'aria-hidden': true, class: 'toggle__on'}).text(model.options['true']));
        const onChange = enhancedOnChange(model.onChange);
        toggle.click(function() {
          checked = !checked;
          toggle.attr('aria-checked', checked);
          onChange(checked);
        });
        return toggle;
      }

      function createValueInput(model) {
        let unit = model.unit;
        if (isString(unit)) {
          if (unit === 'percent')
            return createRangeInput({id: model.id, min: 0, max: 100, value: model.value, onChange: model.onChange });
          if (unit === 'count')
            return createRangeInput(model);
        }
        return createTextInput(model);
      }

      function createTextAreaInput(model) {
        const config = { rows: 3 };
        let readonly = model.onChange === undefined;
        if (readonly)
          config.readonly = true;
        if (model.placeholder)
          config.placeholder = model.placeholder;
        if (model.description)
          config.title = model.description;
        const input = $('<textarea/>', config);
        if (model.value)
          input.append(model.value);
        if (!readonly) {
          let onChange = enhancedOnChange(model.onChange, false);
          input.on('input change', function() {
            const val = input.val();
            onChange(val == '' ? undefined : val);
          });
        }
        return input;
      }

      function createTextInput(model) {
        function getConverter() {
          if (model.unit === undefined)
            return { format: (str) => str, parse: (str) => str };
          if (isFunction(model.unit))
            return Units.converter(model.unit());
          return Units.converter(model.unit);
        }
        let value = model.value;
        if (Array.isArray(value))
          return createMultiTextInput(model);
        let converter = getConverter();
        let config = { 
          id: model.id,
          type: 'text', 
          value: converter.format(model.value), 
          class: `input-${model.type}`,
        };
        if (model.description && !model.label)
          config.title = model.description;
        let readonly = model.onChange === undefined;
        if (!readonly && isString(model.unit)) {
          if (converter.pattern !== undefined)
            config.pattern = converter.pattern();
          if (converter.patternHint !== undefined)
            config.title = (config.title ? config.title + ' ' : '') + converter.patternHint();
        }
        if (model.placeholder)
          config.placeholder = model.placeholder;
        let input = $('<input/>', config);
        if (!readonly) {
          let onChange = enhancedOnChange(model.onChange, true);
          input.on('input change', function() {
            let val = getConverter().parse(this.value);
            onChange(val);
          });          
        } else {
          input.prop('readonly', true);
        }
        return input;
      }

      function createMultiTextInput(model) {
        let value = model.value;
        if (value === undefined && model.defaultValue !== undefined)
          value = model.defaultValue;
        if (!Array.isArray(value))
          value = [value];
        const list = $('<span/>');
        let texts = [...value];
        let i = 0;
        for (i = 0; i < value.length; i++) {
          list.append(createMultiTextInputItem(list, model, value, texts, i));
        }
        const add = $('<button/>', { text: '+'});
        add.click(() => {
          texts.push('');
          createMultiTextInputItem(list, model, '', texts, i++).insertBefore(add);
        });
        list.append(add);
        return list;
      }

      function createMultiTextInputItem(list, model, values, texts, index) {
        const id = model.id + '-' + (index + 1);
        return createTextInput({
            id: id,
            unit: model.unit,
            type: model.type,
            value: values[index],
            onChange: (widget, text) => {
              const isNotEmpty = text => text !== undefined && text != '';
              texts[index] = text;
              let nonEmptyTexts = texts.filter(isNotEmpty);
              if (!isNotEmpty(text)) {
                if (nonEmptyTexts.length > 0)
                  list.children('#' + id).remove();
              }
              model.onChange(widget, nonEmptyTexts.length == 1 ? nonEmptyTexts[0] : nonEmptyTexts);
            }
          });
      }

      function createColorInput(model) {
        let value = model.value;
        if (value === undefined && model.defaultValue !== undefined)
          value = model.defaultValue;
        if (Array.isArray(value))
          return createMultiColorInput(model);
        let config = { id: model.id, type: 'color', value: value };
        if (model.description && !model.label)
          config.title = model.description;
        let onChange = enhancedOnChange(model.onChange);
        let input = $('<input/>', config);
        input.change(function() { 
            let val = input.val();
            if (val === model.defaultValue)
              val = undefined;
            onChange(val);
          });
        let wrapper = $('<span/>', {class: 'color-picker'}).append(input);
        if (model.defaultValue === undefined)
          return wrapper;
        return $('<span/>').append(wrapper).append($('<input/>', { 
          type: 'button', 
          value: ' ',
          title: 'Reset to default color', 
          style: 'background-color: ' + model.defaultValue,
          class: 'color-reset',
        }).click(() => {
          onChange(undefined);
          input.val(model.defaultValue);
        }));
      }

      function createMultiColorInput(model) {
        let value = model.value;
        if (value === undefined && model.defaultValue !== undefined)
          value = model.defaultValue;
        if (!Array.isArray(value))
          value = [value];
        let list = $('<span/>');
        //TODO model id goes where?
        let colors = [...value];
        let onChange = enhancedOnChange(model.onChange);
        for (let i = 0; i < value.length; i++) {
          list.append(createMultiColorItemInput(colors, i, onChange));
        }
        let add = $('<button/>', {text: '+', class: 'color-list'});
        add.click(() => {
          colors.push(Colors.random(colors));
          createMultiColorItemInput(colors, colors.length-1, onChange).insertBefore(add);
          onChange(colors);
        });
        let remove = $('<button/>', {text: '-', class: 'color-list'});
        remove.click(() => {
          if (colors.length > 1) {
            colors.length -= 1;
            list.children('.color-picker').last().remove();
            onChange(colors);
          }
        });
        list.append(add);
        list.append(remove);
        return list;
      }

      function createMultiColorItemInput(colors, index, onChange) {
        return createColorInput({ value: colors[index], onChange: (val) => {
          colors[index] = val;
          onChange(colors);
        }});
      }

      function createInput(model) {
         switch (model.type) {
            case 'checkbox': return createCheckboxInput(model);
            case 'dropdown': return createDropdownInput(model);
            case 'range'   : return createRangeInput(model);
            case 'value'   : return createValueInput(model);
            case 'text'    : return createTextInput(model);
            case 'textarea': return createTextAreaInput(model);
            case 'color'   : return createColorInput(model);
            case 'toggle'  : return createToggleInput(model);
            default        : return model.input;
         }
      }

      function createComponent(model) {
        const config = { id: model.id, class: 'Settings' };
        const hasToggle = isFunction(model.onSidebarToggle);
        if (hasToggle)
          config.class += model.collapsed ? ' SettingsCollapsed' : ' SettingsExpanded';
        const sidebar = $('<aside/>', config);
        const header = $('<header/>');
        sidebar.append(header);
        if (hasToggle)
          header.append(createIconButton({
              class: 'btn-icon btn-toggle',
              icon: 'icon-toggle',
              alt: model.collapsed ? 'Open Settings' : 'Hide Settings'
            })
            .click(model.onSidebarToggle));
        if (hasToggle && model.onWidgetAdd)
          header.append(createIconButton({ 
            class: model.collapsed ? 'btn-icon btn-add' : 'btn-add',
            icon: 'icon-plus',
            text: model.collapsed ? undefined : 'Add New Chart',
            alt: 'Add a widget to this page...' })
            .click(model.onWidgetAdd));
        if (hasToggle && model.collapsed) 
          return sidebar;
        const SyntheticId = (function() {
          let nextId = 0;
          return { next: () => nextId++ };
        })();
        if (!hasToggle) {
          sidebar.append(createGroupList(model.groups, SyntheticId, false));
          return sidebar;
        }
        const groups = model.groups.filter(g => g.available !== false);
        const appGroups = groups.filter(g => g.type == 'app');
        const pageGroups = groups.filter(g => g.type == 'page');
        const widgetGroups = groups.filter(g => g.type === undefined || g.type == 'widget');
        const groupPanels = $('<div/>', { class: 'SettingsGroups'});
        if (appGroups.length > 0)
          groupPanels.append(createGroupList(appGroups, SyntheticId, true, 'App Settings', 'icon-global'));
        if (pageGroups.length > 0) 
          groupPanels.append(createGroupList(pageGroups, SyntheticId, false, '', 'icon-page'));  
        if (widgetGroups.length > 0) 
          groupPanels.append(createGroupList(widgetGroups, SyntheticId, true, 'Widget Settings'));  
        return sidebar.append(groupPanels);
      }

      function createGroupList(groups, idProvider, tabs = false, name = "", icon = undefined) {
        function upper(str) {
          return str.charAt(0).toUpperCase() + str.slice(1);      
        }

        const box = $('<div/>', {class: 'Settings' + upper(groups[0].type || 'Widget') + (tabs ? ' SettingsTabs' : ' SettingsList')});
        const list = $('<div/>');
        if (tabs && name != "") {
          const caption = $('<h4/>').append(createIcon('icon-menu-arrow')).append($('<span/>').text(name));
          if (icon)
            caption.append(createIcon(icon));
          caption.click(() => { 
            list.toggle();
            caption.toggleClass('state-collapsed');
          });
          box.append(caption);
          if (groups[0].collapsed) { // first tab controlls if entire group is initially collapsed
            caption.addClass('state-collapsed');
            list.css('display', 'none');
          }
        }
        box.append(list);
        const containers = [];
        for (let group of groups) {          
          const container = $('<div/>', { id: group.id, class: 'SettingsGroup' });
          if (!tabs && group.collapsed === true)
            container.css('display', 'none');
          const table = createGroup(group, idProvider);
          containers.push(container.append(table));
        }
        const headers = [];
        for (let group of groups) {
          if (!tabs && icon)
            group.icon = icon;
          headers.push(createHeader(group, tabs));
        }
        for (let i = 0; i < groups.length; i++) {
          const container = containers[i];
          const header = headers[i];
          if (tabs) {
            header.click(() => {
              containers.forEach(c => c.hide());
              container.show();
              headers.forEach(h => h.removeClass('state-active'));
              header.addClass('state-active');
            });
            if (i == 0) {
              header.addClass('state-active');
            } else {
              container.css('display', 'none');
            }
            list.append(header);
          } else {
            const group = groups[i];
            if (group.collapsed)
              header.addClass('state-collapsed');
            list.append(header.click(() => {
              container.toggle();
              header.toggleClass('state-collapsed');
            }));
            list.append(container);
          }
        }
        if (tabs) // when using tabs containers are appended last
          for (let container of containers)
            list.append(container);
        return box;
      }

      function createHeader(group, tabs) {
        if (!tabs && group.caption === undefined)
          return $('<span/>');
        const config = {};
        if (group.description)
          config.title = group.description;
        if (tabs)
          return $('<button/>').text(group.caption);
        const header = $('<h4/>', config)
          .append(createIcon('icon-menu-arrow'))
          .append($('<span/>').text(group.caption));
        if (group.icon)
          header.append(createIcon(group.icon));
        return header;
      }

      function createGroup(group, idProvider) {
        const table = $('<table />');
        for (let entry of group.entries) {
           if (entry.available !== false) {
             let type = entry.type;
             let auto = type === undefined;
             let input = entry.input;
             if (entry.id === undefined)
               entry.id = 'setting_' + idProvider.next();
            if (!auto) {
                table.append(createRow(entry, createInput(entry)));
             } else {
                if (Array.isArray(input)) {
                  input = createMultiInput(input, idProvider, 'x-input');
                }
                table.append(createRow(entry, input));
             }
          }
        }
        return table;
      }

      function createMultiInput(inputs, idProvider, css) {
        let box = $('<div/>', {class: css});
        for (let i = 0; i < inputs.length; i++) {
          let entry = inputs[i];
          if (Array.isArray(entry)) {
            box.append(createMultiInput(entry, idProvider));
          } else if (entry.available !== false) {
            if (entry.id === undefined)
              entry.id = 'setting_' + idProvider.next();
            let input = createInput(entry);
            if (entry.label) {
              let config = { 'for': entry.id };
              if (entry.description)
                config.title = entry.description;
              box.append($('<span/>').append(input).append($('<label/>', config).html(entry.label))).append("\n");
            } else {
              box.append(input);
            }
          }                    
        }
        return box;
      }

      return { 
        createComponent: createComponent,
        createInput: createInput,
      };
   })();

  /**
  * Legend is a generic component showing a number of current values annotated with label and color.
  */ 
  let Legend = (function() {

    function createItem(item) {
      const item0 = Array.isArray(item) ? item[0] : item;
      const label = $('<div/>', { class: 'LegendLabel' });
      if (item0.label)
        label.append($('<span/>', { title: item0.label }).text(item0.label));
      const items = Array.isArray(item) ? item : [item];
      const entry = $('<li/>');
      const addedColors = [];
      for (let i of items) {
        if (!addedColors.includes(i.color)) {
          entry.append(createLineColorIndicator(i));
          addedColors.push(i.color);
        }
      }
      const isMultiColor = addedColors.length > 1;
      const groups = $('<div/>');
      label.append(groups);
      for (let i of items) {
        if (isMultiColor)
          i.item = i.color;
        groups.append(createItemValue(i));
      }      
      return entry.append(label);
    }

    function createLineColorIndicator(item) {
      return $('<div/>', { 
        class: 'LegendColorIndicator', 
        style: `background-color: ${item.color};` 
      });
    }

    function createItemValue(item) {
      let instance = item.showInstance ? item.instance : undefined;
      const value = item.value;
      const status = item.status;
      const color = item.item;
      const highlight = item.highlight;
      let big = value;
      let small = '';
      if (isString(value) && value.indexOf(' ') > 0) {
        big = value.substring(0, value.indexOf(' '));
        small = value.substring(value.indexOf(' '));
      }
      const valueLabel = $('<strong/>', { 
        class: status ? 'status-' + status : '',
        style: highlight ? `color: ${highlight};` : ''
      }).append(big)
        .append($('<small/>').text(small));
      let title = instance;
      if (instance == 'server') { // special rule for DAS
        instance = 'DAS';
        title = "Data for the Domain Administration Server (DAS); plain instance name is 'server'";
      }
      return instance !== undefined
        ? [$('<span/>', { title: title, style: color ? `color: ${color};` : '' }).text(instance), valueLabel]
        : valueLabel;
    }

    function createComponent(model) {
      function sameGroupItems(items, item) {
        return items.filter(e => e.label == item.label);
      }
      const legend = $('<ol/>',  {class: 'Legend'});
      const items = Array.isArray(model) ? model : model.items;
      const compact = Array.isArray(model) ? false : model.compact;
      for (let item of items) {
        if (item.hidden !== true && item.grouped !== true) {
          if (compact && item.label !== undefined) {
            const group = sameGroupItems(items, item);
            // search for all item with similar label and group them
            if (group.length == 1) {
              legend.append(createItem(item));
            } else {
              legend.append(createItem(group));
              group.forEach(e => e.grouped = true); // mark to avoid occur twice          
            }
          } else { // plain add all not hidden
            legend.append(createItem(item));
          }
        }
      }
      return legend;
    }

    return { createComponent: createComponent };
  })();

  /**
   * Component drawn for each widget legend item to indicate data status.
   */
  const Indicator = (function() {

    function createComponent(model) {
      if (!model.text) {
        return $('<div/>', {class: 'Indicator', style: 'display: none;'});
      }
      let title;
      if (model.status == 'missing') {
        title = model.text.replace(/\*([^*]+)\*/g, '$1').replace(/_([^_]+)_/g, '$1');
      }
      const indicator = $('<div/>', { 
        class: 'Indicator status-' + model.status, 
        style: 'color: ' + model.color + ';',
        title: title,
      });
      if (model.status == 'missing') {
        indicator.prepend($('<p/>').html('&#128268;'));
      } else {
        let html = model.text.replace(/\*([^*]+)\*/g, '<b>$1</b>').replace(/_([^_]+)_/g, '<i>$1</i>');
        indicator.html(html);
      }
      return indicator;
    }

    return { createComponent: createComponent };
  })();


  const RAGIndicator = (function() {

    function createComponent(model) {
      const indicator = $('<div/>', { class: 'RAGIndicator' });
      const itemHeight = Math.floor(100 / model.items.length);
      for (let item of model.items) {
        const diffMs = item.since === undefined ? undefined : new Date() - item.since;
        let text = item.label;
        if (text == 'server')
          text = 'DAS';
        indicator.append($('<div/>', { 
          class: 'Item',
          style: `border-left-color: ${item.color};`,
        })
        .append($('<span/>', { 
          class: `RAGIndicatorLight ${diffMs === undefined || diffMs > 60000 ? '' : 'RAGIndicatorRecent'}`,
          style: `background-color: ${item.background};`,
        }))

        .append($('<div/>')
          .append($('<strong/>').text(item.value))
          .append($('<span/>').text(text))
          .append($('<span/>').text(item.since === undefined || item.since <= 0 ? '' : `Since ${Units.formatDateTime(item.since)}`))
        ));
      }
      return indicator;
    }

    return { createComponent: createComponent };

  })();

  /**
   * An alert table is a widget that shows a table of alerts that have occured for the widget series.
   */
  let AlertTable = (function() {

    function createComponent(model) {
      let items = model.items === undefined ? [] : model.items.sort(sortMostUrgetFirst);
      config = { class: 'AlertTable' };
      if (model.id)
        config.id = model.id;
      if (items.length == 0)
        config.style = 'display: none';
      let table = $('<div/>', config);
      const prefix = sharedStart(items.map(alert => alert.serial.toString()));
      for (let item of items) {
        table.append(createAlertRow(item, model.verbose, prefix));
      }
      return table;
    }

    function createAlertRow(item, verbose, prefix) {
      item.frames = item.frames.sort(sortMostRecentFirst); //NB. even though sortMostUrgetFirst does this as well we have to redo it here - JS...
      let endFrame = item.frames[0];
      let ongoing = endFrame.until === undefined;
      let level = endFrame.level;
      let color = ongoing ? endFrame.color : Colors.hex2rgba(endFrame.color, 0.6);
      let box = $('<div/>', { style: `border-color: ${color};` });
      box.append($('<input/>', { type: 'checkbox', checked: item.acknowledged, disabled: item.acknowledged })
        .change(() => acknowledge(item)));
      box.append(createGeneralGroup(item, verbose, prefix));
      box.append(createStatisticsGroup(item, verbose));
      if (ongoing && verbose)
        box.append(createConditionGroup(item));
      if (verbose && Array.isArray(item.annotations) && item.annotations.length > 0)
        box.append(createAnnotationGroup(item));
      let row = $('<div/>', { 
        id: `Alert-${item.serial}`, 
        class: `Item ${level} ${item.confirmed ? 'AlertTableConfirmed' : ongoing ? 'AlertTableUnconfirmed' : ''}`, 
        style: `border-color: ${item.color};`,
      });
      row.append(box);
      return row;
    }

    function acknowledge(item) {
      Controller.requestAcknowledgeAlert(item.serial);
    }

    function sharedStart(arr) {
      if (arr.length <= 1)
        return '';
      const e0 = arr[0];
      const len0 = e0.length;
      for (let p = 0; p < len0; p++)
        for (let i = 1; i < arr.length; i++)
          if (e0.charAt(p) != arr[i].charAt(p))
            return e0.substring(0, p);
      return '';
    }

    function createAnnotationGroup(item) {
      let id = `Alert-${item.serial}-Annotations`;
      let element = $('#' + id); 
      let display = element.length == 0 || element.is(":visible") ? 'block' : 'none';
      let groups = $('<div/>', { id: id, style: 'display: ' + display + ';' });
      let baseColor = item.frames[0].color;
      for (let i = 0; i < item.annotations.length; i++) {
        let annotation = item.annotations[i];
        groups.append(AnnotationTable.createEntry({
          unit: item.unit,
          time: annotation.time,
          value: annotation.value,
          attrs: annotation.attrs,
          color: Colors.hex2rgba(baseColor, 0.45),
          fields: annotation.fields,
        }));
      }
      let label = display == 'none' ? '[ + ]' : '[ - ]';
      let group = $('<div/>');
      appendProperty(group, 'Annotations', $('<a/>').text(label).click(() => groups.toggle()));
      group.append(groups);
      return group;
    }

    function createConditionGroup(item) {
      let endFrame = item.frames[0];
      let circumstance = item.watch[endFrame.level];
      let group = $('<div/>', { class: 'Group' });
      appendProperty(group, 'Start', formatCondition(circumstance.start, item.unit));
      if (circumstance.stop) {
        appendProperty(group, 'Stop', formatCondition(circumstance.stop, item.unit));
      }
      return group;
    }

    function createStatisticsGroup(item, verbose) {
        let endFrame = item.frames[0];
        let startFrame = item.frames[item.frames.length - 1];
        let duration = durationMs(startFrame, endFrame);
        let amberStats = computeStatistics(item, 'amber');
        let redStats = computeStatistics(item, 'red');
        let group = $('<div/>', { class: 'Group' });
        appendProperty(group, 'Since', Units.formatTime(startFrame.since));
        appendProperty(group, 'For', formatDuration(duration));
        if (redStats.count > 0 && verbose)
          appendProperty(group, 'Red', redStats.text);
        if (amberStats.count > 0 && verbose)
          appendProperty(group, 'Amber', amberStats.text);
      return group;
    }

    function createGeneralGroup(item, verbose, prefix) {
      let group = $('<div/>', { class: 'Group' });
      appendProperty(group, 'Alert', $('<strong/>')
          .append($('<small/>').text(prefix))
          .append(item.serial.toString().substring(prefix.length)));
      appendProperty(group, 'Watch', item.name);
      if (item.series)
        appendProperty(group, 'Series', item.series);
      if (item.instance && verbose)
        appendProperty(group, 'Instance', item.instance === 'server' ? 'DAS' : item.instance);
      return group;
    }

    function computeStatistics(item, level) {
      const reduceCount = (count, frame) => count + 1;
      const reduceDuration = (duration, frame) => duration + durationMs(frame, frame);
      let frames = item.frames;
      let matches = frames.filter(frame => frame.level == level);
      let count = matches.reduce(reduceCount, 0);
      let duration = matches.reduce(reduceDuration, 0);
      return { 
        count: count,
        duration: duration,
        text: formatDuration(duration) + ' x' + count, 
      };
    }

    function durationMs(frame0, frame1) {
      return (frame1.until === undefined ? new Date() : frame1.until) - frame0.since;
    }

    function formatDuration(ms) {
      return Units.converter('sec').format(Math.round(ms/1000));
    }

    /**
     * Sorts alerts starting with ongoing most recent red and ending with ended most past amber.
     */
    function sortMostUrgetFirst(a, b) {
      a.frames = a.frames.sort(sortMostRecentFirst);
      b.frames = b.frames.sort(sortMostRecentFirst);
      let aFrame = a.frames[0]; // most recent frame is not at 0
      let bFrame = b.frames[0];
      let aOngoing = aFrame.until === undefined;
      let bOngoing = bFrame.until === undefined;
      if (aOngoing != bOngoing)
        return aOngoing ? -1 : 1;
      let aLevel = aFrame.level;
      let bLevel = bFrame.level;
      if (aLevel != bLevel)
        return aLevel === 'red' ? -1 : 1;
      return bFrame.since - aFrame.since; // start with most recent item
    }

    function sortMostRecentFirst(a, b) {
      return b.since - a.since; // sort most recent frame first 
    }

    return { createComponent: createComponent };
  })();


  /**
   * The annotation table is shown for widgets of type 'annotation'.
   * Alert lists with annotations visible also use the list entry to add annotations to alert entries.
   * 
   * The interesting part with annotations is that the attributes can be any set of string key-value pairs.
   * Still, the values should be formatted meaningfully. Therefore formatters can be set which analyse each
   * key-value-pair to determine how to display them.
   *
   * The annotation table can either display a list style similar to alert table or an actual table with
   * rows and columns. An that case all items are expected to have the same fields value.
   */
  let AnnotationTable = (function() {

    function inRange(x, min, max) {
      return x >= min && x <= max;
    }

    let SQLValueFormatter = {
      applies: (item, attrKey, attrValue) => attrValue.includes(' ') && attrValue.trim().endsWith(';'),
      format:  (item, attrValue) => attrValue,
      type: 'pre',
    };

    let TimeValueFormatter = {
      applies: (item, attrKey, attrValue) => inRange(new Date().getTime() - Number(attrValue), 0, 86400000), // 1 day in millis
      format:  (item, attrValue) => Units.formatTime(attrValue),  
    };

    let UnitValueFormatter = (function(names) {
      return {
        applies: (item, attrKey, attrValue) => names.indexOf(attrKey) >= 0 && !Number.isNaN(parseInt(attrValue)),
        format: (item, attrValue) => Units.converter(item.unit).format(Number(attrValue)),
      };
    });

    let SeriesValueFormatter = {
      applies: (item, attrKey, attrValue) => attrKey == 'Series' || attrValue.startsWith('ns:'),
      format: (item, attrValue) => attrValue,
      type: 'code',
    };

    let PlainValueFormatter = {
      applies: (item, attrKey, attrValue) => true,
      format: (item, attrValue) => attrValue,
    };

    let DEFAULT_FORMATTERS = [
      TimeValueFormatter,
      UnitValueFormatter('Threshold'),
      SeriesValueFormatter,
      SQLValueFormatter,
      PlainValueFormatter,
    ];

    function createComponent(model) {
      let items = model.items || [];
      config = { class: 'AnnotationTable' };
      if (model.id)
        config.id = model.id;
      if (items.length == 0)
        config.style = 'display: none';
      let isTable = model.mode === 'table';
      let tag = isTable ? '<table/>' : '<div/>';
      let table = $(tag, config);
      if (model.sort === undefined && isTable || model.sort == 'value')
        items = items.sort((a, b) => b.value - a.value);
      if (model.sort == 'time')
        items = items.sort((a, b) => b.time - a.time);
      for (let item of items) {
        if (isTable) {
          if (table.children().length == 0) {
            let tr = $('<tr/>');
            for (let key of Object.keys(createAttributesModel(item)))
              tr.append($('<th/>').text(key));
            table.append(tr);
          }
          table.append(createTableEntry(item));  
        } else {
          table.append(createListEntry(item));  
        }
      }
      return table;
    }

    function createListEntry(item) {      
      let attrs = createAttributesModel(item);
      let group = $('<div/>', { class: 'Group Annotation', style: `border-color: ${item.color};` });
      for (let [key, entry] of Object.entries(attrs)) {
        appendProperty(group, key, entry.value, entry.type);
      }      
      return group;
    }

    function createTableEntry(item) {
      let attrs = createAttributesModel(item);
      let row = $('<tr/>', { class: 'Annotation' });
      let style = { 'style': `border-left-color: ${item.color};` };
      for (let entry of Object.values(attrs)) {
        let td = $('<td/>', style);
        style = {}; // clear after 1. column
        if (entry.type) {
          td.append($('<' + entry.type + '/>').append(entry.value));
        } else {
          td.text(entry.value);
        }
        row.append(td);
      }
      return row;
    }

    function createAttributesModel(item) {
      let attrs = {}; // new object is both sorted by default order and accessible by key
      if (item.series)
        attrs.Series = { value: item.series, type: 'code' };        
      if (item.instance)
        attrs.Instance = { value: item.instance };
      attrs.When = { value: Units.formatTime(item.time) };
      attrs.Value = { value: Units.converter(item.unit).format(item.value) };
      for (let [key, value] of Object.entries(item.attrs)) {
        let formatter = selectFormatter(item, key, value, item.formatters);
        attrs[key] = { value: formatter.format(item, value), type: formatter.type };        
      }
      if (!item.fields)
        return attrs;
      let model = {};
      for (let field of item.fields) {
        let entry = attrs[field];
        if (entry)
          model[field] = entry;
      }
      return model;
    }

    function selectFormatter(item, attrKey, attrValue, formatters) {
      if (formatters === undefined)
        return selectFormatter(item, attrKey, attrValue, DEFAULT_FORMATTERS);
      for (let formatter of formatters) 
        if (formatter.applies(item, attrKey, attrValue))
          return formatter;
      if (formatters !== DEFAULT_FORMATTERS)
        return selectFormatter(item, attrKey, attrValue, DEFAULT_FORMATTERS);
      return PlainValueFormatter;
    }

    return { 
      createComponent: createComponent,
      createEntry: createListEntry, 
    };
  })();

  /**
   * Lists existing watches to explain their logic to the user.
   */
  const WatchList = (function() {

    function createComponent(model) {
      const config = { class: 'WatchListContainer' };
      if (model.id)
        config.id = model.id;
      const container = $('<div/>', config);
      let items = model.items.filter(watch => watch.programmatic);
      if (items.length > 0) {
        container.append($('<h3>').html('System Watches'));
        container.append(createList(items, model));
      }
      items = model.items.filter(watch => !watch.programmatic);
      if (items.length > 0) {
        container.append($('<h3>').html('User Watches'));
        container.append(createList(items, model));
      }      
      return container;
    }

    function createList(items, model) {
        const list = $('<dl/>', { class: 'WatchList' });
        for (let item of items)
          createItem(list, item, model.colors, model.actions);
        return list;
    }

    function createItem(list, item, colors, actions) {
      const label = $('<b/>').text(item.name + (item.stopped ? ' (stopped)' : ''));
      const icon = createIconButton({
          class: 'btn-icon',
          icon: 'icon-menu-arrow',
          alt: 'Expand/Collapse Details'
      });
      const dt = $('<dt/>', { class: 'state-collapsed state-' + (item.disabled || item.stopped ? 'disabled' : 'enabled') })
        .append(icon)
        .append(label)
        .append($('<code/>').text(item.series));
      const onClick = () =>  {
        dt.nextUntil('dt').toggle();
        dt.toggleClass('state-collapsed');
      };
      icon.click(onClick);
      label.click(onClick);
      if (isFunction(actions.onEdit)) {
        dt.append($('<button/>').text(item.programmatic ? 'Copy' : 'Edit').click(() => actions.onEdit(item)));
      } else {
        dt.append($('<span/>'));
      }
      if (!item.programmatic && isFunction(actions.onDelete)) {
        dt.append($('<button/>').text('Delete').click(() => actions.onDelete(item.name)));
      } else {
        dt.append($('<span/>'));
      }
      if (item.disabled && isFunction(actions.onEnable)) {
        dt.append($('<button/>', { class: 'primary' }).text('Enable').click(() => actions.onEnable(item.name)));        
      } else if (!item.disabled && isFunction(actions.onDisable)) {
        dt.append($('<button/>', { class: 'primary' }).text('Disable').click(() => actions.onDisable(item.name)));        
      } else {
        dt.append($('<span/>')); 
      }
      list.append(dt);
      for (let level of ['red', 'amber', 'green'])
        if (item[level])
          list.append(createCircumstance(level, item[level], item.unit, item.series, colors[level]));
    }

    function createCircumstance(level, model, unit, series, color) {
      function plainText(condition) {
        let text = condition.text();
        return text.substring(text.indexOf('value') + 5);
      }
      const circumstance = $('<dd/>', { class: 'WatchCondition', style: `color: ${color}; display: none;`});
      let levelText = paddedLeftWith('&nbsp;', Units.Alerts.name(level), 'Unhealthy'.length);
      let text = `<b>${levelText}:</b> <em>If</em> ${series} <em>in</em> ${Units.names()[unit]} <em>is</em> `;
      text += plainText(formatCondition(model.start, unit));
      if (model.suppress)
        text += ` <em>unless</em> ${model.surpressingSeries} ${plainText(formatCondition(model.suppress, model.surpressingUnit))}`;
      if (model.stop)
        text += ` <em>until</em> ${plainText(formatCondition(model.stop, unit))}`;
      return circumstance.html(text);
    }

    return { createComponent: createComponent };
  })();

  /**
   * A component that creates the form to compose a single new watch
   */
  const WatchBuilder = (function() {
    
    function createComponent(model) {
      const config = { class: 'WatchBuilder' };
      if (model.id)
        config.id = model.id;
      const editedWatch = model.watch;
      const readonly = model.onSelect === undefined;
      const builder = $('<div/>', config);
      const conditionText = $('<span/>');
      const updateText = () => conditionText.html('If <b>' + (editedWatch.series === undefined ? '?' : editedWatch.series) + '</b> in <b>' + (editedWatch.unit === undefined ? '?' : Units.names()[editedWatch.unit]) + '</b>...');
      updateText();
      const nameInput = Settings.createInput({ type: 'text', value: editedWatch.name, onChange: (name) => editedWatch.name = name});
      const unitDropdown = Settings.createInput({ type: 'dropdown', value: editedWatch.unit, options: Units.names(), onChange: (selected) => { editedWatch.unit = selected; updateText(); }});
      const seriesInput = Settings.createInput({ type: 'text', value: editedWatch.series, onChange: readonly ? undefined : (series) => { editedWatch.series = series; updateText(); }});
      const popupId = 'popup-popup';

      const form = $('<div/>', {class: 'WatchBuilderForm'})
        .append($('<div/>')
          .append($('<label/>').text('Name'))
          .append(nameInput))
        .append($('<div/>')
          .append($('<label/>').text('Series'))
          .append(seriesInput)
          .append(readonly ? "" : $('<button/>').text('Select...').click(
            () => model.onSelect(popupId, editedWatch.series, 
              (series) => seriesInput.val(series).change()))))
        .append($('<div/>')
          .append($('<label/>').text('Unit'))
          .append(unitDropdown))
        .append($('<div/>')
          .append($('<label/>').text('Condition'))
          .append(conditionText))
        .append($('<div/>', { id: popupId }));

      builder.append(form);
      for (let level of ['red', 'amber', 'green']) {
        builder.append(createLevelBuilder(level, editedWatch, model.colors[level]));
      }
      return builder;
    }

    function createLevelBuilder(level, editedWatch, color) {
      const editedCircumstance = editedWatch[level] || { level: level };
      const editedStartCondition = editedCircumstance.start || { operator: '>', forTimes: 1 };
      const editedStopCondition = editedCircumstance.stop || { operator: '<', forTimes: 1 };
      const defined = editedWatch[level] !== undefined;
      const levelBox = $('<span/>', defined ? {} : { style: 'display: none;'});
      let enableCheckbox = Settings.createInput({type: 'checkbox', value: defined, onChange: (checked) => {
        if (checked) {
          levelBox.show();
          editedWatch[level] = editedCircumstance;
          editedCircumstance.start = editedStartCondition;
        } else {
          levelBox.hide();
          editedWatch[level] = undefined;
        }
      }});
      const isUntilDefined = editedCircumstance.stop !== undefined;
      const untilBox = $('<span/>', isUntilDefined ? {} : { style: 'display: none;'})
        .append(createConditionBuilder(editedWatch, editedCircumstance, editedStopCondition));      
      const untilCheckbox = Settings.createInput({ type: 'checkbox', value: isUntilDefined, onChange: (checked) => {
        if (checked) {
          untilBox.show();
          editedCircumstance.stop = editedStopCondition;
        } else {
          untilBox.hide();
          editedCircumstance.stop = undefined;
        }
      }});
      levelBox
        .append(' <em>is<em/> ').append(createConditionBuilder(editedWatch, editedCircumstance, editedStartCondition))
        .append(' <em>until</em> ').append(untilCheckbox).append(untilBox);
      return $('<div/>', { class: 'WatchCondition', style: `color: ${color};` })
        .append(enableCheckbox).append(`<b>${paddedLeftWith('&nbsp;', Units.Alerts.name(level), 'Unhealthy'.length)}</b>`)
        .append(levelBox);
    }

    function createConditionBuilder(editedWatch, editedCircumstance, editedCondition) {
      function getKind() {
        if (editedCondition.forTimes === 0 || editedCondition.forMillis === 0)
          return 'inSample';
        if (editedCondition.forTimes < 0 || editedCondition.forMillis < 0)
          return 'inLast';
        if (editedCondition.onAverage)
          return 'forAvgOfLast';
        return 'forLast';
      }
      const kindOptions = {
        forLast: 'for last', 
        forAvgOfLast: 'for average of last', 
        inLast: 'in last', 
        inSample: 'in sample'
      };
      const forInBox = $('<span/>', getKind() != 'inSample' ? {} : { style: 'display: none;' });
      function updateEditedCondition(selectedKind, forLastInputValue) {
        if (selectedKind === undefined)
          selectedKind = getKind();
        const isCount = forLastInputValue === undefined 
          ? editedCondition.forTimes !== undefined
          : /^[0-9]+$/i.test(forLastInputValue);
        const forLast = forLastInputValue === undefined
          ? editedCondition.forTimes !== undefined ? Math.abs(editedCondition.forTimes) : Math.abs(editedCondition.forMillis)
          : Units.converter(isCount ? 'count' : 'ms').parse(forLastInputValue);
        editedCondition.onAverage = selectedKind === 'forAvgOfLast';
        if (selectedKind == 'forLast' || selectedKind == 'forAvgOfLast') {
          editedCondition.forTimes = isCount ? Math.abs(forLast) : undefined;
          editedCondition.forMillis = isCount ? undefined : Math.abs(forLast);
        } else if (selectedKind == 'inLast') {
          editedCondition.forTimes = isCount ? - Math.abs(forLast) : undefined;
          editedCondition.forMillis = isCount ? undefined : - Math.abs(forLast);
        }
        if (selectedKind == 'inSample') {
          forInBox.hide();
          editedCondition.forTimes = 0;
          editedCondition.forMillis = undefined;
        } else {
          forInBox.show();
        }        
      }
      const forInValue = editedCondition.forTimes !== undefined 
        ? Math.abs(editedCondition.forTimes) 
        : editedCondition.forMillis !== undefined ? Units.converter('ms').format(Math.abs(editedCondition.forMillis)) : 1;
      const operatorDropdown = Settings.createInput({ type: 'dropdown', value: editedCondition.operator, options: ['<', '<=', '=', '>', '>='], onChange: (selected) => editedCondition.operator = selected});
      const thresholdInput = Settings.createInput({ type: 'value', unit: () => editedWatch.unit, value: editedCondition.threshold, onChange: (value) => editedCondition.threshold = value});
      const forInInput = Settings.createInput({ type: 'text', value: forInValue, onChange: (value) => updateEditedCondition(undefined, value)});     
      const kindDropdown = Settings.createInput({ type: 'dropdown', value: getKind(), options: kindOptions, onChange: (selected) => updateEditedCondition(selected, undefined)});
      return $('<span/>')
        .append(operatorDropdown)
        .append(thresholdInput)
        .append(kindDropdown)
        .append(forInBox.append(forInInput));
    }

    return { createComponent: createComponent };

  })();


  /**
   * Combines the WatchList and WatchBuilder into one component to list and create watches.
   */ 
  const WatchManager = (function() {

    function createComponent(model) {
      const config = { class: 'WatchManager' };
      if (model.id)
        config.id = model.id;
      const manager = $('<div/>', config);
      model.id = undefined; // id should not be set by sub-components
      manager.append($('<div/>', {id: 'WatchBuilder'}));
      if (isFunction(model.actions.onCreate))
        manager.append(createIconButton({
          icon: 'icon-plus',
          text: 'Add New Watch',
          alt: 'Create a new watch...'
        }).click(() => model.actions.onCreate()));
      manager.append(WatchList.createComponent(model));
      return manager;
    }

    return { createComponent: createComponent };
  })();


  /**
   * A component that creates a tabular overview for pages and their synchronisation state.
   * Users select which pages to synchronise (pull from remote).
   */
  const PageManager = (function() {

    function createComponent(model) {
      const config = { class: 'PageManager' };
      if (model.id)
        config.id = model.id;
      const manager = $('<div/>', config);
      const list = $('<table/>').append($('<tr/>')
        .append($('<th/>').text('Page'))
        .append($('<th/>').append($('<div/>').append($('<span/>').text('Local Version')).append($('<span/>').text('Based on Server Version'))))
        .append($('<th/>').text('Latest Server Version'))
      );
      model.pages.forEach(page => list.append(createItem(model, page)));
      return manager
        .append($('<p/>').text('Please select the pages that should be updated with their server configuration.'))
        .append($('<span/>', { class: 'recent' }).text('Newest Version'))
        .append(list);
    }

    function createItem(model, page) {
      if (page.checked)
        model.onSelection(page.id);
      const id = `select-${page.id}`;
      const checkbox = $('<input/>', { id: id, type: 'checkbox', checked: page.checked })
        .on('change', function() {
          if (this.checked) {
            model.onSelection(page.id);
          } else {
            model.onDeselection(page.id);
          }
        });
      const localIsMostRecent = page.lastLocalChange > page.lastRemoteChange;
      const remoteIsMostRecent = page.lastLocalChange === undefined || page.lastLocalChange <= page.lastRemoteChange;
      const baseIsMostRecent = remoteIsMostRecent && page.lastRemoteUpdate !== undefined && page.lastRemoteUpdate == page.lastRemoteChange;
      const remoteNotModified = page.lastRemoteUpdate !== undefined && page.lastLocalChange === undefined;
      const localAttrs = localIsMostRecent ? {class: 'recent'} : {};
      const remoteAttrs = remoteIsMostRecent ? {class: 'recent'} : {};
      const baseAttrs =  baseIsMostRecent ? {class: 'recent'} : {};
      const localText =  remoteNotModified ? '(unmodified server version)' : Units.formatDateTime(page.lastLocalChange);
      return $('<tr/>')
        .append($('<td/>').append(checkbox).append(' ').append($('<label/>', { for: id }).text(page.name)))
        .append($('<td/>').append($('<div/>').append($('<span/>', localAttrs).text(localText)).append($('<span/>', baseAttrs).text(Units.formatDateTime(page.lastRemoteUpdate)))))
        .append($('<td/>').append($('<span/>', remoteAttrs).text(Units.formatDateTime(page.lastRemoteChange))));
    }

    return { createComponent: createComponent };
  })();



  /**
    * A component that creates a wizard for series selection
    */
  const SelectionWizard = (function() {

    function createComponent(model) {
      const config = { class: 'SelectionWizard'};
      if (model.id)
        config.id = model.id;
      const wizard = $('<div/>', config);
      
      const state = {
        selection: {},  // key propertys of selected matches
        properties: {}, // those bound to a specific value by chosing a filter option
        filters: new Array(model.filters.length) // state for each filter: input (text), selected (index), filter (fn)
      };
      for (let i = 0; i < state.filters.length; i++)
        state.filters[i] = {};

      for (let i = 0; i < model.filters.length; i++)
        model.filters[i].id = i;

      // applying the state to the UI
      let matches;

      const update = async function() {
        if (matches === undefined) {
          matches = (await model.onSearch(state.properties))
            .sort((a, b) => a[model.key].localeCompare(b[model.key]));
          if (model.selection)
            for (let key of model.selection) {
              const match = matchForKey(key, model.key, matches);
              if (match !== undefined)
                state.selection[key] = match;
            }

        } else {
          model.onChange(Object.keys(state.selection), state.selection);
        }
        matches.forEach(match => match.filtered = false);
        populateWizard(model, wizard, state, matches);
      };
      state.changed = update;
      update();
      return wizard;
    }

    function populateWizard(model, wizard, state, matches) {
      wizard.empty();

      const searchBox = $('<header/>', { class: 'SelectionWizardSearch' });
        for (let filter of model.filters)
          searchBox.append(createFilter(model, filter, matches, state));
      wizard.append(searchBox);

      const matchesCount = countTotalMatches(matches);
      const noFilter = matchesCount == matches.length;
      const selectionCount = Object.keys(state.selection).length;
      wizard.append($('<h4/>').text(noFilter 
        ? 'Please select a filter...' 
        : `${matchesCount} matches for total of ${matches.length} metrics`));
      wizard.append($('<h4/>').text(selectionCount + ' Selected'));
      wizard.append(noFilter ? $('<ol/>') : createMatchList(model, state, matches));
      wizard.append(selectionCount == 0 ? $('<ol/>') : createSelectionList(model, state, matches));
    }

    function matchForKey(key, keyProperty, matches) {
      return matches.find(match => match[keyProperty] == key);
    }

    function countTotalMatches(matches) {
      let c = 0;
      for (let match of matches)
        if (!match.filtered)
          c++;
      return c;
    }

    function createSelectionList(model, state, matches) {
      const list = $('<ol/>', { class: 'SelectionWizardSelection' });
      for (let match of Object.values(state.selection))
        list.append(createMatchEntry(model, state, match, true));
      return list;
    }

    function createMatchList(model, state, matches) {
      const list = $('<ol/>', { class: 'SelectionWizardMatches' });
      for (let match of matches)
        if (!match.filtered)
          list.append(createMatchEntry(model, state, match, false));
      return list;
    }

    function createMatchEntry(model, state, match, describe) {
      const keyAccessor = model.properties[model.key];
      const key = keyAccessor(match);
      const id = 'match-' + key.replace(/[^-a-zA-Z0-9_]/g, '_');
      const checked = state.selection[key] !== undefined;
      const input = $('<input/>', { type: 'checkbox', id: id, checked: checked }).change(function() {
        if (this.checked) {
          state.selection[key] = match;  
        } else {
          delete state.selection[key];
        }
        state.changed();
      });
      const entry = {};
      for (let property of model.entry)
        entry[property] = model.properties[property].call(this, match);
      entry.selected = state.selection[key] !== undefined;
      entry.describe = describe;
      return $('<li/>').append(input).append($('<label/>', { for: id }).append(model.render(entry)));
    }

    function createFilter(model, filter, matches, state) {
      if (!isSatisfied(filter.requires, state)) {     
        return $('<span/>');
      }
      filter.type = computeFilterType(filter);
      
      const label = $('<label/>', { for: `filter-${filter.id}`, text: filter.label });
      const filterInput = createFilterInput(model, filter, state, matches);

      const filterState = state.filters[filter.id];
      const active = filterState !== filterState.filter !== undefined || filterState.input !== undefined;
      if (active) {
        applyFilter(model, filter, state, matches);
      }
      return $('<div/>', { class: 'SelectionWizardFilter' })
        .append(label)
        .append(filterInput);
    }

    function applyFilter(model, filter, state, matches) {
      for (let match of matches) {
        if (!match.filtered && !matchesFilter(match, model, filter, state)) {
          match.filtered = true;
        }
      }
    }

    function matchesFilter(match, model, filter, state, option) {
      const filterState = state.filters[filter.id];
      const match2property = model.properties[filter.property];          
      const propertyValue = match2property(match);  
      if (filter.type == 'text') { // filter uses input and predicate function
        let input = filterState.input;
        return input == undefined || input == '' || filter.filter(propertyValue, input);
      }
      const optionFilter = option === undefined ? filterState.filter : option.filter;                 
      // type 'list' and 'auto' below
      if (isString(optionFilter)) // option uses a constant value
        return propertyValue == optionFilter;
      if (isFunction(optionFilter)) // option uses a predicate function              
        return optionFilter(propertyValue);
      return true;
    }

    function countMatches(model, filter, state, matches, option) {
      let c = 0;
      for (let match of matches)
        if (matchesFilter(match, model, filter, state, option))
          c++;
      return c;
    }

    function computeFilterType(filter) {
      if (isFunction(filter.filter))
        return 'text';
      if (filter.options !== undefined)
        return 'list';
      return 'auto';
    }

    function createFilterInput(model, filter, state, matches) {
      switch (filter.type) {
      case 'text': return createFilterWithTextInput(model, filter, state, matches);
      case 'list': return createFilterWithListInput(model, filter, state, matches);
      default:
      case 'auto': return createFilterWithAutoInput(model, filter, state, matches);
      }
    }

    function createFilterWithTextInput(model, filter, state, matches) {
      const filterState = state.filters[filter.id];
      const active = filterState !== undefined;
      const id = 'filter-text-' + filter.id;
      const field = $('<input/>', { id: id, type: 'text', value: active ? filterState.input || '' : '' });
      field.on('input change', function() {
        state.filters[filter.id].input = field.val();
        state.changed().then(() => {
          const input = $('#' + id);
          const val = input.val();
          input.focus().val('').val(val); // gains focus and moves caret to end
        });
      });
      return field;
    }

    function createFilterWithListInput(model, filter, state, matches) {
      const filterState = state.filters[filter.id];
      const options = isFunction(filter.options) ? filter.options() : filter.options;
      const selectField = $('<select/>');
      selectField.change(() => {
        let index = selectField.val();
        if (index >= 0) {
          let f = options[index].filter;
          state.filters[filter.id].filter = f;
          state.filters[filter.id].selected = index;
          state.properties[filter.property] = isString(f) ? f : undefined;          
        } else {
          state.filters[filter.id] = {};
          state.properties[filter.property] = undefined;
        }
        state.changed();
      });
      selectField.append($('<option/>', { value: -1, text: '(any)' }));
      for (let i = 0; i < options.length; i++) {       
        let label = options[i].label + ' (' + countMatches(model, filter, state, matches, options[i]) +  ')';
        selectField.append($('<option/>', { value: i, text: label, selected: filterState.selected == i }));
      }
      return selectField;      
    }

    function createFilterWithAutoInput(model, filter, state, matches) {
      const filterState = state.filters[filter.id];
      const match2property = model.properties[filter.property];
      // options are derived from the matches as the set of actual values
      const set = {};
      for (let match of matches) {        
        let propertyValue = match2property(match);
        if (propertyValue !== undefined)
          set[propertyValue] = set[propertyValue] === undefined ? 1 : set[propertyValue] + 1;
      }
      const options = Object.keys(set);
      const selectField = $('<select/>');
      selectField.change(() => {
        let f = selectField.val();
        if (f != '') {
          state.filters[filter.id].filter = f;
          state.properties[filter.property] = f;
        } else {
          state.filters[filter.id] = {};
          state.properties[filter.property] = undefined;
        }
        state.changed();
      });
      selectField.append($('<option/>', { value: '', text: '(any)' }));
      for (let option of options) {
        let text = option + ' ('+ set[option] +')';
        selectField.append($('<option/>', { value: option, text: text, selected: filterState.filter == option }));      
      }
      return selectField;
    }

    function isSatisfied(requires, state) {
      if (requires === undefined)
        return true;
      for (let [property, required] of Object.entries(requires)) {
        let bound = state.properties[property];
        if (isString(required)) {
          if (bound != required)
            return false;          
        } else if (isFunction(required)) {
          if (!required(bound))
            return false;
        }

      }
      return true;
    }

    return { createComponent: createComponent };
  })();


  /**
    * A component that creates a model window.
    */
  const ModalDialog = (function() {

    function createComponent(model) {
      if (model.id === undefined)
        model.id = 'ModalDialog';
      const config = { 
        id: model.id,
        class: 'ModalDialog' 
      };
      const overlay = $('<div/>', config);
      const dialog = $('<div/>', {
        class: `ModalDialogContent${(model.style && !model.style.includes(':') ? ' ' +  model.style : '')}${model.icon ? ' ModalDialogIcon' : ''}`,
        style: model.style && model.style.includes(':') ? model.style : undefined,
      });
      if (model.title !== undefined && model.title != '') {
        const header = $('<h2/>').html(model.title);
        if (model.icon !== undefined)
          header.prepend(createIcon(model.icon));
        dialog.append(header);
      }
      if (isString(model.closeProperty)) {
        const button = model.buttons.find(button => button.property == model.closeProperty);
        dialog.append(createIconButton({
          class: 'btn-icon btn-close', 
          icon: 'icon-cross',
          alt: button === undefined ? 'Cancel' : button.label 
        }).click(createClickHandler(model, model.closeProperty)));
      }      
      const scrollpane = $('<div/>', { class: 'ModalDialogScroll'});
      dialog.append(scrollpane);
      const content = isFunction(model.context) ? model.content() : model.content;
      if (Array.isArray(content)) {
        content.forEach(e => scrollpane.append(e));
      } else {
        scrollpane.append(content);
      }
      if (model.buttons) {
        const bar = $('<div/>', { class: 'ModalDialogButtons' });
        for (let button of model.buttons)
          bar.append(createButton(model, button));        
        dialog.append(bar);
      }
      return overlay.append(dialog);
    }

    function createButton(model, button) {
      const config = { 
        id: model.id + '-' + button.property,
        text: button.label 
      };
      if (!button.secondary)
        config['class'] = 'primary';
      return $('<button/>', config).click(createClickHandler(model, button.property));
    }

    function createClickHandler(model, property) {
      return () => {
        $('#' + model.id).hide();
        if (isFunction(model.onExit))
          model.onExit(model.results[property], property);
      };
    }

    return { createComponent: createComponent };
  })();


  /**
   * A component that creates left navgation sidebar. 
   *
   * Main task of the sidebar is to manage and switch pages.
   * It also gives access to data refresh speed and page rotation start/stop.
   * The bar has a collapse and an expanded state. 
   */ 
  const NavSidebar = (function() {

    function createComponent(model) {
      const collapsed = model.collapsed === true; // false is default
      const config = { class: 'NavSidebar' + (collapsed ? ' NavCollapsed' : ' NavExpanded') };
      if (model.id)
        config.id = model.id;

      const sidebar = $('<aside/>', config);
      const header = $('<header/>');
      sidebar.append(header);
      header.append(createIconButton({ 
        class: 'btn-icon btn-toggle',
        icon: 'icon-toggle',
        alt: 'Toggle Sidebar',
      }).click(model.onSidebarToggle));
      if (model.logo !== undefined)
        header.append($('<a/>', { class: 'NavLogo' }).click(model.onLogoClick).append($('<img/>', { src: model.logo, alt: 'Payara' })));      
      const controls = $('<dl/>', {class: 'NavControls'});
      if (collapsed) {
        const page = model.pages.filter(page => page.selected)[0];
        sidebar.append($('<div/>', {class: 'NavTitle'}).append($('<h1/>').text(page.label).click(model.onSidebarToggle)));
        for (let i = 1; i <= 4; i++)
          controls.append($('<dd/>').append(createLayoutButton(model, i)));
        controls.append($('<dt/>'));
        controls.append($('<dd/>').append(createRefreshButton(model)));
        controls.append($('<dt/>'));
        controls.append($('<dd/>').append(createRotationButton(model)));
      } else {
        sidebar.append(createPageList(model));
        sidebar.append(createAddPagePanel(model));
        controls.append($('<dt/>').text('Layout Columns'));
        for (let i = 1; i <= 4; i++)
          controls.append($('<dd/>').append(createLayoutButton(model, i)));
        controls.append($('<dt/>').text('Data Refresh'));
        controls.append($('<dd/>').append(createRefreshButton(model)));
        controls.append($('<dd/>').append(createRefreshInput(model)));
        controls.append($('<dt/>').text('Page Rotation'));
        controls.append($('<dd/>').append(createRotationButton(model)));
      }
      sidebar.append(controls);
      return sidebar;
    }

    function createPageList(model) {
      const list = $('<ul/>');
      for (let page of model.pages)
        list.append(createPageItem(model, page));
      return $('<nav/>', { class: 'NavPages'}).append(list);
    }

    function createPageItem(model, page) {      
      const label = $('<a/>', { href: '#' + page.id}).text(page.label);
      const item = $('<li/>', { class: 'NavItem' + (page.selected ? ' selected' : '')});
      item.append(label);
      if (page.selected) {
        if (isFunction(page.onReset))
          item.append(createIconButton({
            class: 'btn-icon',
            icon: 'icon-reset',
            alt: 'Reset Page',
          }).click(page.onReset));
        label.click(model.onSidebarToggle);
      } else {
        if (isFunction(page.onSwitch))
          label.click(page.onSwitch);
      }
      if (isFunction(page.onDelete)) {
        item.append(createIconButton({
          class: 'btn-icon',
          icon: 'icon-delete',
          alt: 'Delete Page',
        }).click(page.onDelete));
      }
      return item;
    }

    function createAddPagePanel(model) {
      return $('<div/>', { class: 'NavAdd'})
        .append(createIconButton({
          icon: 'icon-plus',
          text: 'Add New Page',
        }).click(model.onPageAdd));
    }

    function createRefreshInput(model) {
      let max = Math.max(10, model.refreshSpeed);
      const value = $('<span/>').html(model.refreshSpeed + 's&nbsp;');
      const button = $('<input/>', { type: 'range', min: 1, max: max, step: 1, value: model.refreshSpeed });
      button.on('change input', () =>  {
          let val = Number(button.val());
          value.html(val + 's&nbsp;');
          model.onRefreshSpeedChange(val);
      });
      return $('<span/>')
        .append($('<label/>').text('Speed'))
        .append(button)
        .append(value);
    }

    function createLayoutButton(model, numberOfColumns) {
      return createIconButton( {
          class: 'btn-icon btn-layout' + (model.layoutColumns == numberOfColumns ? ' btn-selected' : ''),
          icon: `icon-${numberOfColumns}-column`,
          alt: 'Use '+numberOfColumns+' column layout' 
      }).click(() => model.onLayoutChange(numberOfColumns));
    }

    function createRotationButton(model) {
      return createIconButton({
        class: 'btn-icon btn-rotation', 
        icon: model.rotationEnabled ? 'icon-page-rotation-paused' : 'icon-page-rotation',
        alt: (model.rotationEnabled ? 'Stop' : 'Start') + ' page rotation'
      }).click(model.onRotationToggle);
    }

    function createRefreshButton(model) {
      return createIconButton({
        class: 'btn-icon',
        icon: model.refreshEnabled ? 'icon-pause' : 'icon-play',
        alt: (model.refreshEnabled ? 'Pause' : 'Unpause') + ' data updates'
      }).click(model.onRefreshToggle);
    }

    return { createComponent: createComponent };
  })();


  /**
   * FeedbackBanner
   */
  const FeedbackBanner = (function() {

    function createComponent(model) {
      let typeClass = '';
      const isSuccess = model.type == 'success';
      const isError = model.type == 'error';
      if (isSuccess)
        typeClass = 'FeedbackBannerSuccess';
      if (isError)
        typeClass = 'FeedbackBannerError';
      const config = { 
        class: `FeedbackBanner  ${typeClass}`,
        role: 'dialog',
        'aria-labelledby': 'this-modal-title'
      };
      if (model.id === undefined)
        model.id = 'FeedbackBanner';
      config.id = model.id;      
      const banner = $('<div/>', config);
      banner.append(createIconButton({
        class: 'btn-icon btn-close',
        icon: 'icon-cross',
        alt: 'Close Dialog'
      }).click(() => banner.remove()));
      if (isSuccess)
        banner.append(createIcon('icon-tick'));
      if (isError)
        banner.append(createIcon('icon-cross'));
      banner.append($('<p/>').append(model.message));
      return banner;
    }

    return { createComponent: createComponent };
  })();


  /**
   * WidgetHeader is the title and tool icon(s) bar on top of a widget.
   */
  const WidgetHeader = (function() {

    function createComponent(model) {
      const config = { class: 'WidgetHeader' + (model.selected() ? ' WidgetHeaderSelected' : '')};
      if (model.id)
        config.id = model.id;
      const header = $('<div/>', config);
      return header
        .append($('<h3/>', { title: model.description })
          .append($('<span/>').text(model.title))
          .append(createIcon('icon-pencil'))
          .click(() => {            
            model.onClick();
            if (model.selected()) {
              header.addClass('WidgetHeaderSelected');
            } else {
              header.removeClass('WidgetHeaderSelected');
            }
          })); 
    }

    return { createComponent: createComponent };
  })();


  /**
   * AlertIndicator is the global alerts summary shown at the botton of the page (footer)
   */ 
  const AlertIndicator = (function() {

    function createComponent(model) {
      const config = { class: 'AlertIndicator'};
      if (model.id)
        config.id = model.id;
      addTotal(model.redAlerts);
      addTotal(model.amberAlerts);
      if (model.redAlerts.totalCount == 0 && model.amberAlerts.totalCount == 0) {
        model.class += ' AlertIndicatorNoAlerts';
      }
      const indicator = $('<aside/>', config);
      if (model.redAlerts.totalCount > 0) {
        indicator.append($('<a/>', { 
          style: `color: ${model.redAlerts.color};`,
          class: model.redAlerts.unacknowledgedCount > 0 ? 'AlertIndicatorActive' : undefined,
          title: `${model.redAlerts.unacknowledgedCount} unacknowledged ongoing red alerts (${model.redAlerts.acknowledgedCount} acknowledged)`,
          href: '#alerts',
        }).html(`<b>&#x26a0;</b> ${model.redAlerts.unacknowledgedCount} <small>(${model.redAlerts.acknowledgedCount})</small>`));
      }
      if (model.amberAlerts.totalCount > 0) {
        indicator.append($('<a/>', { 
          style: `color: ${model.amberAlerts.color};`,
          class: model.amberAlerts.unacknowledgedCount > 0 ? 'AlertIndicatorActive' : undefined,
          title: `${model.amberAlerts.unacknowledgedCount} unacknowledged ongoing amber alerts (${model.amberAlerts.acknowledgedCount} acknowledged)`,
          href: '#alerts',
        }).html(`<b>&#x26a0;</b> ${model.amberAlerts.unacknowledgedCount} <small>(${model.amberAlerts.acknowledgedCount})</small>`));        
      }
      return indicator;
    }

    function addTotal(level) {
      level.totalCount = level.acknowledgedCount + level.unacknowledgedCount;
    }

    return { createComponent: createComponent };
  })();

  /*
   * Shared functions
   */

  function appendProperty(parent, label, value, tag = "strong") {
    parent.append($('<span/>')
      .append($('<small>', { text: label + ':' }))
      .append(isJQuery(value) ? value : $('<' + tag + '/>').append(value))
    ).append('\n'); // so browser will line break;
  }

  function formatCondition(condition, unit) {
    if (condition === undefined)
      return '';
    const forTimes = condition.forTimes;
    const forMillis = condition.forMillis;
    let any = forTimes === 0 || forMillis === 0;
    let anyN = forTimes < 0 || forMillis < 0;
    let threshold = Units.converter(unit).format(condition.threshold);
    let text = ''; 
    let forText = '';
    let forValue;
    text += 'value ' + condition.operator + ' ' + threshold;
    if (forTimes !== undefined || forMillis !== undefined) {
      if (any) {
        forText += ' in sample';
      } else if (anyN) {
        forText += ' in last ';
      } else if (condition.onAverage) {
        forText += ' for average of last ';
      } else {
        forText += ' for last ';
      }
    }
    if (forTimes !== undefined && forTimes !== 0)
      forValue = Math.abs(condition.forTimes) + 'x';
    if (forMillis !== undefined && forMillis !== 0)
      forValue = Units.converter('ms').format(Math.abs(condition.forMillis));
    let desc = $('<span/>').append(text);
    if (forText != '')
      desc.append($('<small/>', { text: forText})).append(forValue);
    return desc;
  }

  function paddedLeftWith(char, text, length) {
    let n = length - text.length;
    for (let i = 0; i < n; i++)
      text = char + text;
    return text;
  }

  /*
  * Public API below:
  *
  * All methods return a jquery element reflecting the given model to be inserted into the DOM using jQuery
  */
  return {
      createSettings: model => Settings.createComponent(model),
      createLegend: model => Legend.createComponent(model),
      createIndicator: model => Indicator.createComponent(model),
      createAlertTable: model => AlertTable.createComponent(model),
      createAnnotationTable: model => AnnotationTable.createComponent(model),
      createWatchManager: model => WatchManager.createComponent(model),
      createWatchBuilder: (model, watch) => WatchBuilder.createComponent(model, watch),
      createPageManager: model => PageManager.createComponent(model),
      createModalDialog: model => ModalDialog.createComponent(model),
      createSelectionWizard: model => SelectionWizard.createComponent(model),
      createRAGIndicator: model => RAGIndicator.createComponent(model),
      createNavSidebar: model => NavSidebar.createComponent(model),
      createFeedbackBanner: model => FeedbackBanner.createComponent(model),
      createWidgetHeader: model => WidgetHeader.createComponent(model),
      createAlertIndicator: model => AlertIndicator.createComponent(model),
      createIconButton: model => createIconButton(model),
  };

})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

MonitoringConsole.Chart.Common = (function() {

   function createCustomTooltipFunction(createHtmlTooltip) {
      return function(tooltipModel) {
        let tooltip = $('#chartjs-tooltip');
        if (tooltipModel.opacity === 0) {
          tooltip.css({opacity: 0}); // without this the tooptip sticks and is not removed when moving the mouse away
          return;
        }
        tooltipModel.opacity = 1;
        $(tooltip).empty().append(createHtmlTooltip(tooltipModel.dataPoints));
        var position = this._chart.canvas.getBoundingClientRect(); // `this` will be the overall tooltip
        tooltip.css({opacity: 1, left: position.left + (tooltipModel.caretX/2), top: position.top + tooltipModel.caretY});
      };
   }

   function formatDate(date) {
      if (typeof date === 'number') {
         date = new Date(date);
      }
      let dayOfMonth = date.getDate();
      let month = date.getMonth() + 1;
      let year = date.getFullYear();
      let hour = date.getHours();
      let min = date.getMinutes().toString().padStart(2, '0');
      let sec = date.getSeconds().toString().padStart(2, '0');
      let ms = date.getMilliseconds().toString().padStart(3, '0');
      let now = new Date();
      let diffMs =  now - date;
      let text = `Today ${hour}:${min}:${sec}.${ms}`; 
      if (diffMs < 5000) {
         return text + ' (just now)';
      }
      if (diffMs < 60 * 1000) { // less then a minute ago
         let diffSecs = diffMs / 1000;
         return text + ' (about '+ diffSecs.toFixed(0) + ' seconds ago)';
      }
      if (diffMs < 60 * 60 * 1000) { // less then an hour ago
         let diffMins = diffMs / (60*1000);
         return text + ' (about '+ diffMins.toFixed(0) + ' minutes ago)';  
      }
      let dayOfMonthNow = now.getDate();
      if (dayOfMonth == dayOfMonthNow) {
         return text;
      }
      if (dayOfMonthNow - 1 == dayOfMonth) {
         return `Yesterday ${hour}:${min}:${sec}.${ms}`; 
      }
      return `${dayOfMonth}.${month}.${year} ${hour}:${min}:${sec}.${ms}`; 
   }

   /**
    * Public API below:
    */
   return {
      /**
       * @param {function} createHtmlTooltip - a function that given dataPoints (see Chartjs docs) returns the tooltip HTML jQuery object
       */
      createCustomTooltipFunction: (createHtmlTooltip) => createCustomTooltipFunction(createHtmlTooltip),
      formatDate: (date) => formatDate(date),
   };

})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Adapter to line charts of Chart.js
 */ 
MonitoringConsole.Chart.Line = (function() {
	
  const Units = MonitoringConsole.View.Units;
  const Colors = MonitoringConsole.View.Colors;
  const Theme = MonitoringConsole.Model.Theme;

  function timeLable(secondsAgo, index, lastIndex, secondsInterval) {
    if (index == lastIndex && secondsAgo == 0)
      return 'now';
    if (index == 0 || index == lastIndex && secondsAgo > 0) {
      if (Math.abs(secondsAgo - 60) <= secondsInterval * 2)
        return '60s ago'; // this corrects off by 1 which is technically inaccurate but still 'more readable' for the user
      if (Math.abs((secondsAgo % 60) - 60) <= secondsInterval)
        return Math.round(secondsAgo / 60) + 'mins ago';
      if (secondsAgo <= 60)
        return secondsAgo +'s ago';
      return Math.floor(secondsAgo / 60) + 'mins ' + (secondsAgo % 60) + 's ago';
    }
    return undefined;
  }

  /**
   * This is like a constant but it needs to yield new objects for each chart.
   */
  function onCreation(widget) {
    let options = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        xAxes: [{
          display: true,
          type: 'time',
          gridLines: {
            color: 'rgba(0, 127, 255,0.5)',
            lineWidth: 0.5,
          },
          time: {
            minUnit: 'second',
            round: 'second',
          },
          ticks: {
            minRotation: 0,
            maxRotation: 0,
            callback: function(value, index, values) {
              if (values.length == 0)
                return value;
              let lastIndex = values.length - 1;
              let reference = new Date(values[lastIndex].value);
              let now = new Date();
              let isLive = now - reference < 5000; // is within the last 5 secs
              if (values.length == 1)
                return isLive ? 'now' : Units.formatTime(new Date(reference));
              let secondsInterval = (values[1].value - values[0].value) / 1000;
              let secondsAgo = (values[lastIndex].value - values[index].value) / 1000;
              if (isLive) {
                return timeLable(secondsAgo, index, lastIndex, secondsInterval);
              }
              let reference2 = new Date(values[lastIndex-1].value);
              let isRecent = now - reference < (5000 + (reference - reference2));
              if (isRecent) {
                return timeLable(secondsAgo, index, lastIndex, secondsInterval);
              }
              if (index != 0 && index != lastIndex)
                return undefined;
              return Units.formatTime(new Date(values[index].value));
            },
          }
        }],
        yAxes: [{
          display: true,
          gridLines: {
            color: 'rgba(0, 127, 255,0.5)',
            lineWidth: 0.5,
          },
          ticks: {
            beginAtZero: true,
            precision:0, // no decimal places in labels
          },
        }],
      },
      legend: {
          display: false,
      }
    };
    let thresholdsPlugin = {
      beforeDraw: function (chart) {
        let yAxis = chart.chart.scales["y-axis-0"];
        let areas = chart.chart.data.areas;
        if (!Array.isArray(areas) || areas.length === 0)
          return;
        let ctx = chart.chart.ctx;
        ctx.save();
        let xAxis = chart.chart.scales["x-axis-0"];
        function yOffset(y) {
          let yMax = yAxis.ticksAsNumbers[0];
          if (y === undefined)
            y = yMax;
          let yMin = yAxis.ticksAsNumbers[yAxis.ticksAsNumbers.length - 1];
          let yVisible = y - yMin;
          let yRange = yMax - yMin;
          return yAxis.bottom - Math.max(0, (yAxis.height * yVisible / yRange));
        }
        let offsetRight = 0;
        let barWidth = areas.length < 3 ? 5 : 3;
        for (let i = 0; i < areas.length; i++) {
          let group = areas[i];
          let offsetBar = false;
          for (let j = 0; j < group.length; j++) {
            const area = group[j];
            let yAxisMin = yOffset(area.min);
            let yAxisMax = yOffset(area.max);
            let barLeft = xAxis.right + 1 + offsetRight;
            // solid fill
            if (area.min != area.max) {
              offsetBar = true;
              let barHeight = yAxisMax - yAxisMin;
              if (area.style != 'outline') {
                ctx.fillStyle = area.color;
                ctx.fillRect(barLeft, yAxisMin, barWidth, barHeight);                
              } else {
                ctx.strokeStyle = area.color;
                ctx.lineWidth = 1;
                ctx.setLineDash([]);
                ctx.beginPath();
                ctx.rect(barLeft, yAxisMin, barWidth, barHeight);
                ctx.stroke();
              }
            }
            // and the line
            let yLine = area.type == 'lower' ? yAxisMax : yAxisMin;
            ctx.setLineDash([5, 3]);
            ctx.strokeStyle = area.color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(xAxis.left, yLine);
            ctx.lineTo(barLeft, yLine);
            ctx.stroke();
          }
          // gradients between colors
          for (let j = 0; j < group.length; j++) {
            let area = group[j];
            if (area.style != 'outline') {
              let yAxisMin = yOffset(area.min);
              let yAxisMax = yOffset(area.max);
              let barLeft = xAxis.right + 1 + offsetRight;
              if (area.min != area.max) {
                let barHeight = yAxisMax - yAxisMin;
                let colors = [];
                if (j + 1 < group.length && group[j+1].max == area.min) {
                  colors = [area.color, group[j+1].color];
                } else if (j > 0 && group[j-1].max == area.min) {
                  colors = [area.color, group[j-1].color];
                }
                if (colors.length == 2) {
                  let yTop = area.type == 'lower' ? yAxisMin - 6 : yAxisMin;
                  let gradient = ctx.createLinearGradient(0, yTop, 0, yTop+6);
                  gradient.addColorStop(0, colors[0]);
                  gradient.addColorStop(1, colors[1]);
                  ctx.fillStyle = gradient;
                  ctx.fillRect(barLeft, yTop, barWidth, 6);                
                }
              }
            }          
          }
          if (offsetBar)
            offsetRight += barWidth + 1;
        }
        ctx.restore();
      }
    };
    return new Chart(widget.target, {
      type: 'line',
      data: { datasets: [], },
      options: options,
      plugins: [ thresholdsPlugin ],       
    });
  }

  /**
   * Convertes a array of points given as one dimensional array with alternativ time value elements 
   * to a 2-dimensional array of points with t and y attribute.
   */
  function points1Dto2D(points1d) {
    if (!points1d)
      return [];
    let points2d = new Array(points1d.length / 2);
    for (let i = 0; i < points2d.length; i++)
      points2d[i] = { t: new Date(points1d[i*2]), y: points1d[i*2+1] };
    return points2d;      
  }
	
  function createMinimumLineDataset(seriesData, points, lineColor) {
		return createHorizontalLineDataset(' min ', points, seriesData.observedMin, lineColor, [3, 3]);
  }
    
  function createMaximumLineDataset(seriesData, points, lineColor) {
  	return createHorizontalLineDataset(' max ', points, seriesData.observedMax, lineColor, [15, 3]);
  }
    
  function createAverageLineDataset(seriesData, points, lineColor) {
		return createHorizontalLineDataset(' avg ', points, seriesData.observedSum / seriesData.observedValues, lineColor, [9, 3]);
  }

  function createHorizontalLineDataset(label, points, y, lineColor, dash) {
    let line = {
      data: [{t:points[0].t, y:y}, {t:points[points.length-1].t, y:y}],
      label: label,
      fill:  false,
      borderColor: lineColor,
      borderWidth: 1,
      pointRadius: 0
    };
    if (dash)
      line.borderDash = dash;
    return line;
  }  
    
  function createCurrentLineDataset(widget, seriesData, points, lineColor, bgColor) {
		let pointRadius = widget.options.drawPoints ? 2 : 0;
    let label = seriesData.instance;
    if (widget.series.indexOf('*') > 0)
      label += ': '+ (seriesData.series.replace(new RegExp(widget.series.replace('*', '(.*)')), '$1'));
    let lineWidth = Theme.option('line-width', 3) / 2;
    return {
			data: points,
			label: label,
      fill: widget.options.noFill !== true,
			backgroundColor: bgColor,
			borderColor: lineColor,
			borderWidth: lineWidth,
      pointRadius: pointRadius,
		};
  }
    
  /**
   * Creates one or more lines for a single series dataset related to the widget.
   * A widget might display multiple series in the same graph generating one or more dataset for each of them.
   */
  function createSeriesDatasets(widget, seriesData, watches) {
    let lineColor = seriesData.legend.color;
    let bgColor = seriesData.legend.background;
  	let points = points1Dto2D(seriesData.points);
  	let datasets = [];
  	datasets.push(createCurrentLineDataset(widget, seriesData, points, lineColor, bgColor));
  	if (points.length > 0 && widget.options.drawAvgLine) {
			datasets.push(createAverageLineDataset(seriesData, points, lineColor));
		}
		if (points.length > 0 && widget.options.drawMinLine && seriesData.observedMin > 0) {
			datasets.push(createMinimumLineDataset(seriesData, points, lineColor));
		}
		if (points.length > 0 && widget.options.drawMaxLine) {
			datasets.push(createMaximumLineDataset(seriesData, points, lineColor));
		}
	  return datasets;
  }

  function createBackgroundAreas(widget, watches) {    
    let areas = [];
    let decoAreas = createDecorationBackgroundAreas(widget);
    if (decoAreas.length > 0) {
      areas.push(decoAreas);
    }
    if (Array.isArray(watches) && watches.length > 0) {
      for (let i = 0; i < watches.length; i++) {
        areas.push(createWatchBackgroundAreas(watches[0]));
      }
    }
    return areas;
  }

  function createDecorationBackgroundAreas(widget) {
    let areas = [];
    let decorations = widget.decorations;
    let critical = decorations.thresholds.critical.value;
    let alarming = decorations.thresholds.alarming.value;
    if (decorations.thresholds.critical.display && critical !== undefined) {
      let color = decorations.thresholds.critical.color || Theme.color('critical');        
      if (alarming > critical) {
        areas.push({ color: color, min: 0, max: critical, type: 'lower' });
      } else {
        areas.push({ color: color, min: critical, type: 'upper' });
      }
    }
    if (decorations.thresholds.alarming.display && alarming !== undefined) {
      let color = decorations.thresholds.alarming.color || Theme.color('alarming');
      if (alarming > critical) {
        areas.push({ color: color, min: critical, max: alarming, type: 'lower' });
      } else {
        areas.push({ color: color, min: alarming, max: critical, type: 'upper' });
      }
    }
    if (decorations.waterline && decorations.waterline.value) {
      let color = decorations.waterline.color || Theme.color('waterline');
      let value = decorations.waterline.value;
      areas.push({ color: color, min: value, max: value });
    }
    return areas;    
  }

  function createWatchBackgroundAreas(watch) { 
    let areas = [];
    let enabled = !watch.disabled;
    if (watch.red)
      areas.push(createBackgroundArea(watch.red, [watch.amber, watch.green], enabled));
    if (watch.amber)
      areas.push(createBackgroundArea(watch.amber, [watch.red, watch.green], enabled)); 
    if (watch.green)
      areas.push(createBackgroundArea(watch.green, [watch.amber, watch.red], enabled));
    return areas;
  }   

  function createBackgroundArea(level, levels, enabled) {
    let color = Theme.color(level.level);
    let min = 0;
    let max;
    let type = 'upper';
    if (level.start.operator == '>' || level.start.operator == '>=') {
      min = level.start.threshold;
      for (let i = 0; i < levels.length; i++) {
        let other = levels[i];
        if (other !== undefined && other.start.threshold > min) {
          max = max === undefined ? other.start.threshold : Math.min(max, other.start.threshold);
        }
      }
    } else if (level.start.operator == '<' || level.start.operator == '<=') {
      max = level.start.threshold;
      type = 'lower';
      for (let i = 0; i < levels.length; i++) {
        let other = levels[i];
        if (other !== undefined && other.start.threshold < max) {
          min = Math.max(min, other.start.threshold);
        }
      }
    }
    return { color: color, min: min, max: max, type: type, style: enabled ? 'fill' : 'outline' };
  }

  /**
   * Should be called whenever the configuration of the widget changes in way that needs to be transfered to the chart options.
   * Basically translates the MC level configuration options to Chart.js options
   */
  function onConfigUpdate(widget, chart) {
    let options = chart.options;
    options.elements.line.tension = widget.options.drawCurves ? 0.4 : 0;
    let time = 0; //widget.options.drawAnimations ? 1000 : 0;
    options.animation.duration = time;
    options.responsiveAnimationDuration = time;
    let yAxis = options.scales.yAxes[0];
    let converter = Units.converter(widget.unit);
    yAxis.ticks.callback = function(value, index, values) {
      let text = converter.format(value, widget.unit === 'bytes');
      return widget.options.perSec ? text + ' /s' : text;
    };
    yAxis.ticks.suggestedMin = widget.axis.min;
    yAxis.ticks.suggestedMax = widget.axis.max;
    let xAxis = options.scales.xAxes[0];
    xAxis.ticks.source = 'data'; // 'auto' does not allow to put labels at first and last point
    xAxis.ticks.display = widget.options.noTimeLabels !== true;
    options.elements.line.fill = widget.options.noFill !== true;
    return chart;
  }

  function onDataUpdate(update) {
    let data = update.data;
    let widget = update.widget;
    let chart = update.chart();
    let datasets = [];
    for (let j = 0; j < data.length; j++) {
      const seriesData = data[j];
      if (seriesData.legend.hidden !== true)
        datasets = datasets.concat(createSeriesDatasets(widget, seriesData, update.watches));
    }
    chart.data.datasets = datasets;
    chart.data.areas = createBackgroundAreas(widget, update.watches);
    chart.update(0);  
  }
  
  /**
   * Public API if this chart type (same for all types).
   */
	return {
    onCreation: (widget) => onConfigUpdate(widget, onCreation(widget)),
    onConfigUpdate: (widget, chart) => onConfigUpdate(widget, chart),
    onDataUpdate: (update) => onDataUpdate(update),
	};
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Adapter to horizontal bar charts of Chart.js
 */ 
MonitoringConsole.Chart.Bar = (function() {

  const Units = MonitoringConsole.View.Units;

   function createData(widget, response) {
      let series = [];
      let labels = [];
      let zeroToMinValues = [];
      let observedMinToMinValues = [];
      let minToMaxValues = [];
      let maxToObservedMaxValues = [];
      let showObservedMin = widget.options.drawMinLine;
      let lineColors = [];
      let bgColors = [];
      for (let i = 0; i < response.length; i++) {
        let seriesData = response[i];
        let points = seriesData.points;
        let min = points[1];
        let max = points[1];
        for (let j = 0; j < points.length; j+=2) {
              let value = points[j+1];
              min = Math.min(min, value);
              max = Math.max(max, value);
        }
        labels.push(seriesData.series);
        series.push(seriesData.series);          
        zeroToMinValues.push(showObservedMin ? seriesData.observedMin : min);
        observedMinToMinValues.push(min - seriesData.observedMin);
        minToMaxValues.push(max - min);
        maxToObservedMaxValues.push(seriesData.observedMax - max);
        lineColors.push(seriesData.legend.color);
        bgColors.push(seriesData.legend.background);
      }
      let datasets = [];
      let offset = {
        data: zeroToMinValues,
        backgroundColor: 'transparent',
        borderWidth: {right: 1},
        borderColor: lineColors,
      };
      datasets.push(offset);
      if (showObservedMin) {
         datasets.push({
            data: observedMinToMinValues,
            backgroundColor: bgColors,
            borderWidth: 0,
         });       
      }
      datasets.push({
         data: minToMaxValues,
         backgroundColor: bgColors,
         borderColor: lineColors,
         borderWidth: 1,
         borderSkipped: false,
      });
      if (widget.options.drawMaxLine) {
         datasets.push({
           data: maxToObservedMaxValues,
           backgroundColor: bgColors,
           borderWidth: 0,
         }); 
      }
      return {
        labels: labels,
        series: series,
        datasets: datasets,
      };
   }

   function onCreation(widget) {
      return new Chart(widget.target, {
         type: 'horizontalBar',
         data: { datasets: [] },
         options: {
            maintainAspectRatio: false,
            scales: {
               xAxes: [{
                  stacked: true,
                  gridLines: {
                    color: 'rgba(0, 127, 255,0.3)',
                    lineWidth: 0.5,
                  },                  
                  ticks: {
                    callback: function(value, index, values) {
                      let converter = Units.converter(widget.unit);
                      return converter.format(converter.parse(value));
                    },
                  },                
               }],
               yAxes: [{
                  maxBarThickness: 15, //px
                  barPercentage: 1.0,
                  categoryPercentage: 1.0,
                  borderSkipped: false,
                  stacked: true,
                  ticks: {
                     display: false,
                  },
                  gridLines: {
                    color: 'rgba(0, 127, 255,0.7)',
                    lineWidth: 0.5,
                  },
               }]
            },
            legend: {
               display: false,
            },
            onClick: function (event) {
               let bar = this.getElementsAtEventForMode(event, "y", 1)[0];
               let series = bar._chart.config.data.series[bar._index]; 
               if (series.startsWith('ns:trace ') && series.endsWith(' Duration')) {
                  MonitoringConsole.View.onTracePopup(series);
               }
            }
         }
      });
   }

   function onConfigUpdate(widget, chart) {
      let options = chart.options; 
      return chart;
   }

   function onDataUpdate(update) {
      let data = update.data;
      let widget = update.widget;
      let chart = update.chart();
      chart.data = createData(widget, data);
      chart.update(0);
   }

  /**
   * Public API if this chart type (same for all types).
   */
   return {
      onCreation: (widget) => onConfigUpdate(widget, onCreation(widget)),
      onConfigUpdate: (widget, chart) => onConfigUpdate(widget, chart),
      onDataUpdate: (update) => onDataUpdate(update),
   };
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Horizontal bar charts of Chart.js as used for the gantt chart like trace details view
 */ 
MonitoringConsole.Chart.Trace = (function() {

   const Controller = MonitoringConsole.Controller;
   const Components = MonitoringConsole.View.Components;
   const Colors = MonitoringConsole.View.Colors;
   const Common = MonitoringConsole.Chart.Common;
   const Theme = MonitoringConsole.Model.Theme;

   var model = {};
   var chart;

   function onDataUpdate(data) {
      model.data = data;
      onSortByDuration();
   }

   function updateChart() {
      let data = model.data;
      let zeroToMinValues = [];
      let minToMaxValues = [];
      let spans = [];
      let labels = [];
      let operations = {};
      let colorCounter = 0;
      let colors = [];
      let bgColors = [];
      let alpha = Theme.option('opacity') / 100;
      let palette = Theme.palette();
      data.sort(model.sortBy);
      for (let i = 0; i < data.length; i++) {
         let trace = data[i]; 
         let startTime = trace.startTime;
         for (let j = 0; j < trace.spans.length; j++) {
            let span = trace.spans[j];
            spans.push(span);
            zeroToMinValues.push(span.startTime - startTime);
            minToMaxValues.push(span.endTime - span.startTime);
            labels.push(span.operation);
            if (!operations[span.operation]) {
               let color = Colors.lookup('index', 'line-' + colorCounter, palette);
               colorCounter++;
               operations[span.operation] = {
                  color: color,
                  bgColor: Colors.hex2rgba(color, alpha),
                  count: 1,
                  duration: span.endTime - span.startTime,
               };
            } else {
               let op = operations[span.operation];
               op.count += 1;
               op.duration += span.endTime - span.startTime;
            }
            colors.push(operations[span.operation].color);
            bgColors.push(operations[span.operation].bgColor);
         }
         spans.push(null);
         zeroToMinValues.push(0);
         minToMaxValues.push(0);
         labels.push('');
         colors.push('transparent');
         bgColors.push('transparent');
      }
      let datasets = [ {
            data: zeroToMinValues,
            backgroundColor: 'transparent',
         }, {
            data: minToMaxValues,
            backgroundColor: bgColors, //'rgba(153, 153, 153, 0.2)',
            borderColor: colors,
            borderWidth: {top: 1, right: 1},
         }
      ];
      if (!chart) {
         chart = onCreation();
      }
      let legend = [];
      for (let [label, operationData] of Object.entries(operations)) {
         legend.push({label: label, value: (operationData.duration / operationData.count).toFixed(2) + 'ms (avg)', color: operationData.color});
      }
      $('#trace-legend').empty().append(Components.createLegend(legend));
      $('#trace-chart-box').height(10 * spans.length + 30);
      chart.data = { 
         datasets: datasets,
         spans: spans,
         labels: labels,
      };
      chart.options.onClick = function(event)  {
        updateDomSpanDetails(data, spans[this.getElementsAtEventForMode(event, "y", 1)[0]._index]); 
      };
      addCustomTooltip(chart, spans);
      chart.update(0);
   }

   function autoLink(text) {
      if (text.startsWith('http://') || text.startsWith('https://'))
         return $('<a/>', { href: text, text: text});
      return $('<span/>', { text: text });
   }

   function addCustomTooltip(chart, spans) {
      chart.options.tooltips.custom = Common.createCustomTooltipFunction(function(dataPoints) {
         let index = dataPoints[0].index;
         let span = spans[index];
         let body = $('<div/>', {'class': 'Tooltip'});
         body
            .append($('<div/>').text("ID: "+span.id))
            .append($('<div/>').text("Start: "+Common.formatDate(span.startTime)))
            .append($('<div/>').text("End: "+Common.formatDate(span.endTime)));
         return body;
      });      
   }

   function onCreation() {
      return new Chart('trace-chart', {
         type: 'horizontalBar',
         data: { datasets: [] },
         options: {
            maintainAspectRatio: false,
            scales: {
               xAxes: [{
                  stacked: true,
                  position: 'top',
                  ticks: {
                     callback: function(value, index, values) {
                        if (value > 1000) {
                           return (value / 1000).toFixed(1)+"s";
                        }
                        return value+"ms";
                     }
                  },
                  scaleLabel: {
                     display: true,
                     labelString: 'Relative Timeline'
                  }
               }],
               yAxes: [{
                  maxBarThickness: 15, //px
                  barPercentage: 1.0,
                  categoryPercentage: 1.0,
                  borderSkipped: false,
                  stacked: true,
                  gridLines: {
                     display:false
                  },
                  ticks: {
                     display: false,
                  },
               }]
            },
            legend: {
               display: false,
            },
            tooltips: {
               enabled: false,
               position: 'nearest',
               filter: (tooltipItem) => tooltipItem.datasetIndex > 0, // remove offsets (not considered data, just necessary to offset the visible bars)
            },
         }
      });
   }

   function updateDomSpanDetails(data, span) {
      if (!span)
         return;
      let tags = { id: 'settings-tags', caption: 'Tags' , entries: []};
      let groups = [
         { id: 'settings-span', caption: 'Span' , entries: [
            { label: 'ID', input: span.id},
            { label: 'Operation', input: span.operation},
            { label: 'Start', input: Common.formatDate(new Date(span.startTime))},
            { label: 'End', input:  Common.formatDate(new Date(span.endTime))},
            { label: 'Duration', input: (span.duration / 1000000) + 'ms'},
         ]},
         tags,
      ];
      for (let [key, value] of Object.entries(span.tags)) {
         if (value.startsWith('[') && value.endsWith(']')) {
            value = value.slice(1,-1);
         }
         tags.entries.push({ label: key, input: autoLink(value)});
      }
      $('#trace-properties').replaceWith(Components.createSettings({id: 'trace-properties', groups: groups }));
   }


   function onDataRefresh() {
      Controller.requestListOfRequestTraces(model.series, onDataUpdate);
   }

   function createPopup(series) {
      model.series = series;
      const dialog = $('<div/>', { id: 'panel-trace' });
      const widget = $('<div/>', { id: 'trace-widget' });
      widget.append($('<div/>', { id: 'trace-chart-box' }).append($('<canvas/>', { id: 'trace-chart'})));
      widget.append($('<div/>', { id: 'trace-legend' }));
      dialog.append(widget);
      const sidebar = $('<div/>');
      sidebar.append($('<button/>').text('Sort By Wall Time (past to present)').click(onSortByWallTime));
      sidebar.append($('<button/>').text('Sort By Duration (slower to faster)').click(onSortByDuration));
      sidebar.append($('<div/>', { id: 'trace-properties' }));
      dialog.append(sidebar);
      onDataRefresh();
      return [ dialog, $('<div/>', { id: 'chartjs-tooltip' })];
   }

   function onClosePopup() {
      if (chart) {
         chart.destroy();
         chart = undefined;
      }
   }

   function onSortByWallTime() {
      model.sortBy = (a,b) => a.startTime - b.startTime; // past to recent
      updateChart();
   }

   function onSortByDuration() {
      model.sortBy = (a,b) => b.elapsedTime - a.elapsedTime; // slow to fast
      updateChart();
   }

   /**
    * Public API below:
    */
   return {
      createPopup: (series) => createPopup(series),
      onClosePopup: () => onClosePopup(),
      onDataRefresh: () => onDataRefresh(),
      onSortByWallTime: () => onSortByWallTime(),
      onSortByDuration: () => onSortByDuration(),
   };
})();
/*
   DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS HEADER.
  
   Copyright (c) 2019-2020 Payara Foundation and/or its affiliates. All rights reserved.
  
   The contents of this file are subject to the terms of either the GNU
   General Public License Version 2 only ("GPL") or the Common Development
   and Distribution License("CDDL") (collectively, the "License").  You
   may not use this file except in compliance with the License.  You can
   obtain a copy of the License at
   https://github.com/payara/Payara/blob/master/LICENSE.txt
   See the License for the specific
   language governing permissions and limitations under the License.
  
   When distributing the software, include this License Header Notice in each
   file and include the License file at glassfish/legal/LICENSE.txt.
  
   GPL Classpath Exception:
   The Payara Foundation designates this particular file as subject to the "Classpath"
   exception as provided by the Payara Foundation in the GPL Version 2 section of the License
   file that accompanied this code.
  
   Modifications:
   If applicable, add the following below the License Header, with the fields
   enclosed by brackets [] replaced by your own identifying information:
   "Portions Copyright [year] [name of copyright owner]"
  
   Contributor(s):
   If you wish your version of this file to be governed by only the CDDL or
   only the GPL Version 2, indicate your decision by adding "[Contributor]
   elects to include this software in this distribution under the [CDDL or GPL
   Version 2] license."  If you don't indicate a single choice of license, a
   recipient has the option to distribute your version of this file under
   either the CDDL, the GPL Version 2 or to extend the choice of license to
   its licensees as provided above.  However, if you add GPL Version 2 code
   and therefore, elected the GPL Version 2 license, then the option applies
   only if the new code is made subject to such option by the copyright
   holder.
*/

/*jshint esversion: 8 */

/**
 * Main API to update or manipulate the view of the generic page.
 **/
MonitoringConsole.View = (function() {

    const Controller = MonitoringConsole.Controller;
    const Components = MonitoringConsole.View.Components;
    const Units = MonitoringConsole.View.Units;
    const Colors = MonitoringConsole.View.Colors;
    const Theme = MonitoringConsole.Model.Theme;

    const WIDGET_TYPE_OPTIONS = { line: 'Time Curve', bar: 'Range Indicator', alert: 'Alerts', annotation: 'Annotations', rag: 'RAG Status', top: 'Top N' };
    const WIDGET_TYPE_FILTER_OPTIONS = { _: '(Any)', line: 'Time Curve', bar: 'Range Indicator', alert: 'Alerts', annotation: 'Annotations', rag: 'RAG Status' };

    function isFunction(obj) {
        return typeof obj === 'function';
    }

    /**
     * Updates the DOM with the page navigation tabs so it reflects current model state
     */ 
    function updatePageNavigation() {
        const Navigation = MonitoringConsole.Model.Settings.Navigation;
        let panelConsole = $('#console');
        if (Navigation.isCollapsed()) {
            panelConsole.removeClass('state-show-nav');
        } else {
            if (!panelConsole.hasClass('state-show-nav')) {
                panelConsole.addClass('state-show-nav');                
            }
        }
        $('#NavSidebar').replaceWith(Components.createNavSidebar(createNavSidebarModel()));
    }

    /**
     * Updates the DOM with the page and selection settings so it reflects current model state
     */ 
    function updateSettings() {
        const panelConsole = $('#console');
        const collapsed = !MonitoringConsole.Model.Settings.isDispayed();
        let groups = [];
        if (collapsed) {
            panelConsole.removeClass('state-show-settings');
        } else {
            if (!panelConsole.hasClass('state-show-settings')) {
                panelConsole.addClass('state-show-settings');                
            }
            groups = groups.concat(createAppSettings());
            groups.push(createColorSettings());
            groups.push(createPageSettings());
            if (MonitoringConsole.Model.Page.Widgets.Selection.isSingle())
                groups = groups.concat(createWidgetSettings(MonitoringConsole.Model.Page.Widgets.Selection.first()));
        }
        $('#Settings').replaceWith(Components.createSettings({
            id: 'Settings', 
            collapsed: collapsed,            
            groups: groups,
            onSidebarToggle: () => {
                MonitoringConsole.Model.Settings.toggle();
                updateSettings();
            },
            onWidgetAdd: showAddWidgetModalDialog,
        }));
    }

    /**
     * Each chart needs to be in a relative positioned box to allow responsive sizing.
     * This fuction creates this box including the canvas element the chart is drawn upon.
     */
    function createChartContainer(widget) {
        return $('<div/>', { id: widget.target + '-box', class: 'Chart' })
            .append($('<canvas/>',{ id: widget.target }));
    }

    function createWidgetHeaderModel(widget) {
        function toWords(str) {
            // camel case to words
            let res = str.replace(/([A-Z]+)/g, " $1").replace(/([A-Z][a-z])/g, " $1");
            if (res.indexOf('.') > 0) {
                // dots to words with upper casing each word
                return res.replace(/\.([a-z])/g, " $1").split(' ').map((s) => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
            }
            return res;
        }

        function metricName(series) {
            let start = series.indexOf(' ') + 1;
            let groupStart = series.indexOf('@:') + 1;
            if (groupStart > start)
                start = groupStart + 1;
            return series.substring(start);
        }

        const Widgets = MonitoringConsole.Model.Page.Widgets;
        const series = widget.series;
        let title = widget.displayName;
        if (title == '' || title === undefined) {
            if (Array.isArray(series)) {
                title = series.map(e => toWords(metricName(e))).join(', ');
            } else {
                title = toWords(metricName(series));        
            }
        } 
        let description = widget.description;
        if (description == '' || description === undefined) {
            if (Array.isArray(series)) {
                description = series.join(', ');
            } else {
                description = series;
            }
        }
        return {
            id: 'WidgetHeader-' + widget.target,
            title: title,
            description:  description,
            selected: () => MonitoringConsole.Model.Page.Widgets.Selection.listSeries().indexOf(widget.id) >= 0,
            onClick: () => {
                Widgets.Selection.toggle(widget.id, true);
                updateSettings();
            },

        };
    }

    function createAppSettings() {
        const pushAvailable = MonitoringConsole.Model.Role.isAdmin();
        const pullAvailable = !MonitoringConsole.Model.Role.isGuest();
        const collapsed = MonitoringConsole.Model.Page.Widgets.Selection.isSingle();
        return [
            { id: 'settings-general', type: 'app', caption: 'General', collapsed: collapsed, entries: [
                { label: 'Data Refresh', input: [
                    { type: 'value', unit: 'sec', value: MonitoringConsole.Model.Refresh.interval(), onChange: (val) => MonitoringConsole.Model.Refresh.interval(val) },
                    { type: 'toggle', options: { false: 'Pause', true: 'Play'}, value: !MonitoringConsole.Model.Refresh.isPaused(), onChange: (checked) => MonitoringConsole.Model.Refresh.paused(!checked) },
                ]},
                { label: 'Page Rotation', input: [
                    { type: 'value', unit: 'sec', value: MonitoringConsole.Model.Settings.Rotation.interval(), onChange: (val) => MonitoringConsole.Model.Settings.Rotation.interval(val) },
                    { type: 'toggle', options: { false: 'Off', true: 'On' }, value: MonitoringConsole.Model.Settings.Rotation.isEnabled(), onChange: (checked) => MonitoringConsole.Model.Settings.Rotation.enabled(checked) },
                ]},
                { label: 'Role', input: [
                    { label: MonitoringConsole.Model.Role.name() },
                    { input: () => Components.createIconButton({
                        class: 'btn-icon',
                        icon: 'icon-pencil',
                        alt: 'Change User Role...'
                    }).click(showRoleSelectionModalDialog) },
                ]},
                { label: 'Watches', input: $('<button/>').text('Go to Watch Settings').click(showWatchConfigModalDialog) },
            ]},
            { id: 'settings-pages', available: pushAvailable || pullAvailable, type: 'app', caption: 'Pages', entries: [
                { label: 'Server Sync', input: [
                    { available: pushAvailable, input: () => $('<button />', { text: 'Update Server...', title: 'Push local state of all know remote pages to server'}).click(showPagePushModalDialog) },
                    { available: pullAvailable, input: () => $('<button/>', { text: 'Update Local...', title: 'Open page synchronisation dialogue'}).click(showPageSyncModalDialog) }, 
                ]},
                { label: 'Manual Sync', input: [
                    { input: () => $('<button />', { text: 'Import...'}).click(showImportPagesModalDialog) },
                    { input: () => $('<button />', { text: 'Export...'}).click(showExportPagesModalDialog) },
                ]},
            ]},
            { id: 'settings-alerts', type: 'app', caption: 'Alerts', entries: [
                { label: 'Popups', type: 'toggle', options: { false: 'Off', true: 'On' }, value: MonitoringConsole.Model.Settings.Alerts.showPopup(), onChange: (checked) => MonitoringConsole.Model.Settings.Alerts.showPopup(checked)},
            ]},
        ];
    }

    function createColorSettings() {
        function createChangeColorDefaultFn(name) {
            return (color) => { Theme.configure(theme => theme.colors[name] = color); };
        }
        function createChangeOptionFn(name) {
            return (value) => { Theme.configure(theme => theme.options[name] = value); };
        }    
        function createColorDefaultSettingMapper(name) {
            let label = Units.Alerts.name(name);
            if (label === undefined)
                label = name[0].toUpperCase() + name.slice(1);
            return { label: label, type: 'color', value: Theme.color(name), onChange: createChangeColorDefaultFn(name) };
        }
        return { id: 'settings-appearance', type: 'app', caption: 'Appearance', entries: [
            { label: 'Scheme', input: $('<button/>').text('Switch Theme').click(showThemeSelectionModalDialog) },
            { label: 'Data #', type: 'color', value: Theme.palette(), onChange: (colors) => Theme.configure(theme => theme.palette = colors) },
            { label: 'Defaults', input: [
                ['error', 'missing'].map(createColorDefaultSettingMapper),
                ['alarming', 'critical', 'waterline'].map(createColorDefaultSettingMapper),
                ['white', 'green', 'amber', 'red'].map(createColorDefaultSettingMapper)]},
            { label: 'Opacity', description: 'Fill transparency 0-100%', input: [
                { type: 'value', unit: 'percent', value: Theme.option('opacity'), onChange: createChangeOptionFn('opacity') },
            ]},
            { label: 'Thickness', description: 'Line thickness 1-8 (each step is equivalent to 0.5px)', input: [
                { type: 'range', min: 1, max: 8, value: Theme.option('line-width'), onChange: createChangeOptionFn('line-width') },
            ]},
        ]};
    }

    function showThemeSelectionModalDialog() {
        const options = Colors.schemes();
        const results = { selected: options[0] };
        showModalDialog({
            title: 'Select Color Theme',
            content: () => [
                $('<p/>').text('Switching the color theme will override current default colors.'),
                Components.createSettings({id: 'theme-properties', groups: [
                    { id: 'settings-appearance' , entries: [
                        { label: 'Scheme', type: 'dropdown', options: options, value: undefined, onChange: (name) => { results.selected = name; } }
                    ]}
                ]})
            ],
            buttons: [
                { property: 'cancel', label: 'Cancel', secondary: true },
                { property: 'selected', label: 'Switch' },
            ],
            closeProperty: 'cancel',
            results: results,
            onExit: name => {
                if (name) {
                    Colors.scheme(name); 
                    updateSettings();
                    showFeedback({ type: 'success', message: `Switched to color theme <em>${name}</em>` });
                }
            }
        });
    }

    function createWidgetSettings(widget) {
        function changeSeries(series) {
            if (series !== undefined && series.length > 0)
                onPageChange(MonitoringConsole.Model.Page.Widgets.configure(widget.id, 
                    widget => widget.series = series.length == 1 ? series[0] : series));
        }
        function changeType(widget, type) {
            widget.type = type;
            if (type == 'top') {
                widget.limit = 5;
                widget.ordering = 'dec';
            } else {
                widget.limit = undefined;
                widget.ordering = undefined;
            }
        }
        let seriesInput = $('<span/>');
        if (Array.isArray(widget.series)) {
            seriesInput.append(widget.series.join(', ')).append(' ');                    
        } else {
            seriesInput.append(widget.series).append(' ');
        }
        seriesInput.append($('<br/>')).append(Components.createIconButton({
            class: 'btn-icon',
            icon: 'icon-pencil',
            alt: 'Change metric(s)...'
        }).click(() => showModalDialog(createWizardModalDialogModel({
            title: 'Edit Widget Metric Series', 
            submit: 'Apply',
            series: widget.series, 
            onExit: changeSeries
        }))));
        let options = widget.options;
        let unit = widget.unit;
        let thresholds = widget.decorations.thresholds;
        let settings = [];
        
        let modeOptions = widget.type == 'annotation' ? { table: 'Table', list: 'List' } : { list: '(Default)' };
        settings.push({ id: 'settings-widget', caption: 'General', collapsed: false, entries: [
            { label: 'Display Name', type: 'text', value: widget.displayName, placeholder: '(derived from series)', onChange: (widget, value) => widget.displayName = value},
            { label: 'Column', type: 'range', min: 1, max: 4, value: 1 + (widget.grid.column || 0), onChange: (widget, value) => widget.grid.column = value - 1},
            { label: 'Rank', type: 'range', min: 1, max: 8, value: 1 + (widget.grid.item || 0), onChange: (widget, value) => widget.grid.item = value - 1, 
                description: 'Columns are filled by rank, lowest rank is added first to the column' },
            { label: 'Size', input: [
                { label: '&nbsp;x', type: 'range', min: 1, max: 4, value: widget.grid.colspan || 1, onChange: (widget, value) => widget.grid.colspan = value},
                { type: 'range', min: 1, max: 4, value: widget.grid.rowspan || 1, onChange: (widget, value) => widget.grid.rowspan = value},
            ]},
            { input: Components.createIconButton({
                icon: 'icon-delete',
                text: 'Remove Widget'
            }).click(() => onWidgetDelete(widget)) },
        ]});
        settings.push({ id: 'settings-data', caption: 'Data', entries: [
            { label: 'Type', type: 'dropdown', options: WIDGET_TYPE_OPTIONS, value: widget.type, onChange: changeType },
            { label: 'Mode', type: 'dropdown', options: modeOptions, value: widget.mode || 'list', onChange: (widget, selected) => widget.mode = selected},
            { label: 'Series', input: seriesInput },
            { label: 'Unit', input: [
                { type: 'dropdown', options: Units.names(), value: widget.unit, onChange: function(widget, selected) { widget.unit = selected; updateSettings(); }},
                { label: '1/sec', type: 'checkbox', value: options.perSec, onChange: (widget, checked) => widget.options.perSec = checked},
            ]},
            { label: 'Upscaling', description: 'Upscaling is sometimes needed to convert the original value range to a more user friendly display value range', input: [
                { type: 'range', min: 1, value: widget.scaleFactor, onChange: (widget, value) => widget.scaleFactor = value, 
                    description: 'A factor multiplied with each value to upscale original values in a graph, e.g. to move a range 0-1 to 0-100%'},
                { label: 'decimal value', type: 'checkbox', value: options.decimalMetric, onChange: (widget, checked) => widget.options.decimalMetric = checked,
                    description: 'Values that are collected as decimal are converted to a integer with 4 fix decimal places. By checking this option this conversion is reversed to get back the original decimal range.'},
            ]},
            { label: 'Line Style', input: [
                { label: 'Points', type: 'checkbox', value: options.drawPoints, onChange: (widget, checked) => widget.options.drawPoints = checked},
                { label: 'Curvy', type: 'checkbox', value: options.drawCurves, onChange: (widget, checked) => widget.options.drawCurves = checked},
            ]},
            { label: 'Background', input: [
                { label: 'Fill', type: 'checkbox', value: !options.noFill, onChange: (widget, checked) => widget.options.noFill = !checked},
            ]},
            { label: 'X-Axis', input: [
                { label: 'Labels', type: 'checkbox', value: !options.noTimeLabels, onChange: (widget, checked) => widget.options.noTimeLabels = !checked},
            ]},            
            { label: 'Y-Axis', input: [
                { label: 'Min', type: 'value', unit: unit, value: widget.axis.min, onChange: (widget, value) => widget.axis.min = value},
                { label: 'Max', type: 'value', unit: unit, value: widget.axis.max, onChange: (widget, value) => widget.axis.max = value},
            ]},
            { label: 'Legend', type: 'dropdown', options: { none: 'None', label: 'Alphabetically', inc: 'Increasing Value', dec: 'Decreasing Value' }, value: widget.ordering || 'label', onChange: (widget, selected) => widget.ordering = selected },
            { label: 'Limit', input: [
                { type: 'value', unit: 'count', value: widget.limit, onChange: (widget, value) => widget.limit = value,
                    description: 'Limits the number of items shown to the top most N items (useful with legend ordering)' },
                { label: 'Hide Constant Zero', type: 'checkbox', value: options.noConstantZero, onChange: (widget, checked) => widget.options.noConstantZero = checked,
                    description: 'Hides series that have been zero for some amount of time' },
            ]},
            { label: 'Coloring', input:[
                { type: 'dropdown', options: { instance: 'Instance Name', series: 'Series Name', index: 'Result Set Index', 'instance-series': 'Instance and Series Name' }, value: widget.coloring, onChange: (widget, value) => widget.coloring = value,
                    description: 'What value is used to select the index from the color palette' },
                { type: 'textarea', value: widget.colors, onChange: (widget, value) => widget.colors = value,
                    placeholder: 'Label:color', description: 'A space separated list of label to colour name mappings, e.g. AmberAck:amber RedAck:red' },
            ]},                
        ]});
        const lineExtrasAvailable = widget.type == 'line';
        settings.push({ id: 'settings-decorations', caption: 'Extras', collapsed: true, entries: [
            { label: 'History', type: 'dropdown', options: { _: 'None', hour: '1 Hour', day: '1 Day', month: '1 Month'}, value: widget.options.drawAggregates || '_', onChange: (widget, checked) => widget.options.drawAggregates = checked,
                description: 'What period of aggregated history to show in the graph' },
            { label: 'Annotations', input: [
                { label: 'show', type: 'checkbox', value: !options.noAnnotations, onChange: (widget, checked) => widget.options.noAnnotations = !checked},
            ]},
            { type: 'textarea', value: (widget.fields || []).join(' '), placeholder: '(fields: auto)', onChange: (widget, value) => widget.fields = value == undefined || value == '' ? undefined : value.split(/[ ,]+/),
                description: 'Selection and order of annotation fields to display, empty for auto selection and default order' },
            { label: 'Aggregates', available: lineExtrasAvailable, input: [
                { label: 'Min', type: 'checkbox', value: options.drawMinLine, onChange: (widget, checked) => widget.options.drawMinLine = checked},
                { label: 'Max', type: 'checkbox', value: options.drawMaxLine, onChange: (widget, checked) => widget.options.drawMaxLine = checked},
                { label: 'Avg', type: 'checkbox', value: options.drawAvgLine, onChange: (widget, checked) => widget.options.drawAvgLine = checked},            
            ]},
            { label: 'Waterline', available: lineExtrasAvailable, input: [
                { type: 'value', unit: unit, value: widget.decorations.waterline.value, onChange: (widget, value) => widget.decorations.waterline.value = value },
                { type: 'color', value: widget.decorations.waterline.color, defaultValue: Theme.color('waterline'), onChange: (widget, value) => widget.decorations.waterline.color = value },
            ]},
            { label: 'Visual Thresholds', available: lineExtrasAvailable, input: [
                { type: 'dropdown', options: { off: 'Off', now: 'Most Recent Value', min: 'Minimum Value', max: 'Maximum Value', avg: 'Average Value'}, value: thresholds.reference, onChange: (widget, selected) => widget.decorations.thresholds.reference = selected},
                [
                    { label: 'alarming', type: 'value', unit: unit, value: thresholds.alarming.value, onChange: (widget, value) => widget.decorations.thresholds.alarming.value = value },
                    { type: 'color', value: thresholds.alarming.color, defaultValue: Theme.color('alarming'), onChange: (widget, value) => thresholds.alarming.color = value },
                    { label: 'Line', type: 'checkbox', value: thresholds.alarming.display, onChange: (widget, checked) => thresholds.alarming.display = checked },
                ],
                [
                    { label: 'critical', type: 'value', unit: unit, value: thresholds.critical.value, onChange: (widget, value) => widget.decorations.thresholds.critical.value = value },
                    { type: 'color', value: thresholds.critical.color, defaultValue: Theme.color('critical'), onChange: (widget, value) => widget.decorations.thresholds.critical.color = value },
                    { label: 'Line', type: 'checkbox', value: thresholds.critical.display, onChange: (widget, checked) => widget.decorations.thresholds.critical.display = checked },
                ]
            ]},                
            
        ]});
        settings.push({ id: 'settings-status', caption: 'Status', collapsed: true, description: 'Set a text for an assessment status', entries: [
            { label: '"No Data"', type: 'textarea', value: widget.status.missing.hint, onChange: (widget, text) => widget.status.missing.hint = text},
            { label: '"Alarming"', type: 'textarea', value: widget.status.alarming.hint, onChange: (widget, text) => widget.status.alarming.hint = text},
            { label: '"Critical"', type: 'textarea', value: widget.status.critical.hint, onChange: (widget, text) => widget.status.critical.hint = text},
        ]});
        let alerts = widget.decorations.alerts;
        settings.push({ id: 'settings-alerts', caption: 'Alerts', collapsed: true, entries: [
            { label: 'Filter', input: [
                [
                    { label: 'Ambers', type: 'checkbox', value: alerts.noAmber, onChange: (widget, checked) => widget.decorations.alerts.noAmber = checked},
                    { label: 'Reds', type: 'checkbox', value: alerts.noRed, onChange: (widget, checked) => widget.decorations.alerts.noRed = checked},
                ],            
                [
                    { label: 'Ongoing', type: 'checkbox', value: alerts.noOngoing, onChange: (widget, checked) => widget.decorations.alerts.noOngoing = checked},
                    { label: 'Stopped', type: 'checkbox', value: alerts.noStopped, onChange: (widget, checked) => widget.decorations.alerts.noStopped = checked},
                ],
                [
                    { label: 'Acknowledged', type: 'checkbox', value: alerts.noAcknowledged, onChange: (widget, checked) => widget.decorations.alerts.noAcknowledged = checked},
                    { label: 'Unacknowledged', type: 'checkbox', value: alerts.noUnacknowledged, onChange: (widget, checked) => widget.decorations.alerts.noUnacknowledged = checked},
                ],
            ], description: 'Properties of alerts to show. Graphs hide stopped or acknowledged alerts automatically.' },
        ]});
        return settings;       
    }

    function createPageSettings() {

        function showIfRemotePageExists(jQuery) {
            Controller.requestListOfRemotePageNames((pageIds) => { // OBS: this asynchronously makes the button visible
                if (pageIds.indexOf(MonitoringConsole.Model.Page.id()) >= 0) {
                    jQuery.show();
                }
            });                        
            return jQuery;
        }

        const Page = MonitoringConsole.Model.Page;
        const Role = MonitoringConsole.Model.Role;
        let collapsed = Page.Widgets.Selection.isSingle();
        let pushAvailable = !Role.isGuest() && Page.Sync.isLocallyChanged() && Role.isAdmin();
        let pullAvailable = !Role.isGuest();
        let autoAvailable = Role.isAdmin();
        let renameAvailable = !Page.hasPreset();
        let page = Page.current();
        let queryAvailable = page.type === 'query';
        const configure =  Page.configure;
        const name = $('<input/>', { type: 'text', value: Page.name() });
        const rename = $('<button/>').text('Rename').click(() => {
          Page.rename(name.val());  
          updatePageNavigation();
        } );

        return { id: 'settings-page', type: 'page', caption: 'Page Settings', collapsed: collapsed, entries: [
            { label: 'Name', input: [
                { available: renameAvailable, input: [ name, rename ] },
                { available: !renameAvailable, input: $('<span/>').text(Page.name()) },
            ]},
            { label: 'Type', type: 'dropdown', options: {manual: 'Manual', query: 'Query'}, value: page.type, onChange: (type) => { onPageUpdate(configure(page => page.type = type)); updateSettings(); } },            
            { label: 'Number of Columns', type: 'range', min: 1, max: 8, value: page.numberOfColumns, onChange: columns =>  { onPageUpdate(Page.arrange(columns)); updatePageNavigation(); }},
            { label: 'Include in Rotation', type: 'toggle', options: { false: 'No', true: 'Yes' }, value: Page.rotate(), onChange: (checked) => Page.rotate(checked) },
            { label: 'Fill Empty Cells', type: 'toggle', options: { false: 'No', true: 'Yes' }, value: page.options.fillEmptyCells === true, onChange: (checked) => configure(page => page.options.fillEmptyCells = checked) },
            { label: 'Max Size', available: queryAvailable, type: 'value', min: 1, unit: 'count', value: page.content.maxSize,  onChange: (value) => configure(page => page.content.maxSize = value) },
            { label: 'Query Series', available: queryAvailable, type: 'text', value: page.content.series, onChange: (value) => configure(page => page.content.series = value) },
            { label: 'Query Interval', available: queryAvailable, input: [
                { type: 'value', min: 1, unit: 'sec', value: page.content.ttl, onChange: (value) => configure(page => page.content.ttl = value) },
                { input: $('<button/>', {text: 'Update Now'}).click(() => configure(page => page.content.expires = undefined)) },
            ]},
            { label: 'Filter Type', available: queryAvailable, type: 'dropdown', options: WIDGET_TYPE_FILTER_OPTIONS, value: page.content.filter, onChange: filter => onPageUpdate(configure(page => page.content.filter = filter)) },
            { label: 'Server Sync', available: pushAvailable || pullAvailable, input: [
                { available: autoAvailable, label: 'Auto', type: 'checkbox', value: Page.Sync.auto(), onChange: (checked) => Page.Sync.auto(checked),
                    description: 'When checked changes to the page are automatically pushed to the remote server (shared with others)' },
                { available: pushAvailable, input: () => $('<button />', { text: 'Push', title: 'Push local page to server (update remote)' }).click(showPushPageConfirmModalDialog) },
                { available: pullAvailable, input: () => showIfRemotePageExists($('<button />', { text: 'Pull', title: 'Pull remote page from server (update local)', style: 'display: none'}).click(showPullPageConfirmModalDialog)) },
            ]},
        ]};
    }

    /**
     * Model: { title, question, yes, no, onYes, dangerzone }
     */
    function createYesNoModualDialog(model) {
        return {
            style: model.dangerzone ? 'danger-zone' : undefined,
            icon: model.dangerzone ? 'icon-alert' : undefined,
            title: model.title,
            content: () => model.question.split('\n').map(par => $('<p/>').html(par)),
            buttons: [
                { property: 'no', label: model.no, secondary: true },
                { property: 'yes', label: model.yes },
            ],
            results: { yes: true, no: false },
            onExit: result => {
                if (result)
                    model.onYes();
            }
        };
    }

    function showAddWidgetModalDialog(grid) {
        function addNewWidget(series, matches) {
            if (series.length > 0) {
                const factory = series.length != 1 ? undefined : id => {
                    const widget = MonitoringConsole.Model.Page.Widgets.infer(matches[series[0]]);
                    widget.id = id;
                    return widget;
                };
                onPageChange(MonitoringConsole.Model.Page.Widgets.add(series, grid, factory));
            }
        }

        showModalDialog(createWizardModalDialogModel({
            title: 'Add New Widget',
            submit: 'Add',
            series: [], 
            onExit: addNewWidget,
        }));
    }

    function showModalDialog(model) {
        const id = model.id || 'ModalDialog';
        const dialog = Components.createModalDialog(model);
        $('#' + id).replaceWith(dialog);
        return dialog;
    }

    function showFeedback(model) {
        const banner = Components.createFeedbackBanner(model);
        $('#FeedbackBannerContainer').append(banner);
        banner.delay(3000).fadeOut();
    }

    //~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~[ Event Handlers ]~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

    function onWidgetDelete(widget) {
        let description = widget.displayName;
        if (description === undefined || description == '')
            description = Array.isArray(widget.series)
                ? widget.series.join(', ')
                : widget.series;
        showModalDialog(createYesNoModualDialog({ 
            dangerzone: true,
            title: 'Remove Widget?',
            question: `Do you really want to remove the widget with metric series <em>${description}</em> from the page?`,
            yes: 'Remove', 
            no: 'Cancel', 
            onYes: () =>  {
                onPageChange(MonitoringConsole.Model.Page.Widgets.remove(widget.id));
                showFeedback({ type: 'success', message: `Widget ${description} removed.`});
            }
        }));
    }

    function showImportPagesModalDialog() {
        function readTextFile(file) {
            return new Promise(function(resolve, reject) {
                let reader = new FileReader();
                reader.onload = function(evt){
                  resolve(evt.target.result);
                };
                reader.onerror = function(err) {
                  reject(err);
                };
                reader.readAsText(file);
            });
        }

        const btn = $('#cfgImport');
        btn.on('input', async function() {
            const files = this.files;
            if (files instanceof FileList) {
                let file = files[0];
                if (file) {
                    let json = await readTextFile(file);
                    let pages = JSON.parse(json);
                    if (!Array.isArray(pages)) {
                        showFeedback({ type: 'error', message: 'File did not contain a list of pages.'});
                    } else {
                        showSelectPagesModalDialog({
                            dangerzone: true,
                            title: 'Import Pages',
                            description: 'Please select the pages to import. Note that existing pages with same name are overridden.',
                            submit: 'Import',
                            pages: pages.filter(p => p.name != "" && p.name !== undefined),
                            onExit: selected => {
                                if (selected.length > 0) {
                                    MonitoringConsole.Model.importPages(selected,
                                        page => showFeedback({ type: 'success', message: `Successfully imported page <em>${page.name}</em>.`}),
                                        page => showFeedback({ type: 'error', message: `Failed to import page <em>${page.name}</em>.`}),
                                    );
                                    updatePageNavigation();
                                }
                            }
                        });
                    }
                }
            }

        });
        btn.click();
    }

    function showExportPagesModalDialog() {
        function download(text) {
            let pom = document.createElement('a');
            pom.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
            pom.setAttribute('download', 'monitoring-console-pages.json');

            if (document.createEvent) {
                let event = document.createEvent('MouseEvents');
                event.initEvent('click', true, true);
                pom.dispatchEvent(event);
            } else {
                pom.click();
            }
        }

        const pages = MonitoringConsole.Model.exportPages();
        showSelectPagesModalDialog({
            title: 'Export Pages',
            description: 'Please select the pages that should be exported.',
            submit: 'Export',
            pages: pages,
            onExit: selected => {
                if (selected.length > 0) {
                    download(JSON.stringify(selected, null, 2));
                    const names = selected.map(p => p.name).join(', ');
                    showFeedback({ type: 'success', message: `Exported page(s) <em>${names}</em>.`});
                }
            }
        });
    }
    
    /**
     * Model: { title, description, submit, pages, onExit, dangerzone }
     */
    function showSelectPagesModalDialog(model) {
        const pages = model.pages;
        const results = { empty: [], selected: [] };
        const list = $('<ul/>');
        const createInput = (id, page) => $('<input/>', { type: 'checkbox', id: id, checked: false })
            .change(function() {
                const include = this.checked;
                const contained = results.selected.find(p => p.name == page.name) !== undefined;
                if (include && !contained) {
                    results.selected.push(page);
                } else if (!include && contained) {
                    results.selected = results.selected.filter(p => p.name != page.name);
                }
            });
        const inputs = [];
        for (let page of pages) {
            const id = 'page-' + page.name;
            const input = createInput(id, page);
            inputs.push(input);
            list.append($('<li/>')
                .append(input)
                .append(' ')
                .append($('<label/>', { for: id }).text(page.name))
                );
        }
        list.prepend($('<li/>').html('&nbsp;')).prepend($('<li/>').append($('<input/>', { type: 'checkbox', id: 'pages-all', checked: false }).change(function() {
            inputs.forEach(i => i.prop('checked', this.checked).change());
        })).append($('<label/>', { for: 'pages-all' }).append($('<i/>').text('All'))));
        const content = [];
        if (model.description)
            content.push($('<p/>').text(model.description));
        content.push(list);
        showModalDialog({
            style: model.dangerzone ? 'danger-zone' : undefined,
            icon: model.dangerzone ? 'icon-alert' : undefined,
            title: model.title,
            content: content,
            buttons: [
                { property: 'empty', label: 'Cancel', secondary: true },
                { property: 'selected', label: model.submit },
            ],
            results: results,
            onExit: model.onExit,
        });
    }

    function createLegendModel(widget, data, alerts, annotations) {
        if (!data)
            return [{ label: 'Connection Lost', value: '?', color: 'red', assessments: { status: 'error' } }];
        if (widget.type == 'alert')
            return createLegendModelFromAlerts(widget, alerts);
        if (widget.type == 'annotation')
            return createLegendModelFromAnnotations(widget, annotations);
        if (Array.isArray(data) && data.length == 0)
            return [{ label: 'No Data', value: '?', color: '#0096D6', assessments: {status: 'missing' }}];
        let legend = [];
        let format = Units.converter(widget.unit).format;
        let palette = Theme.palette();
        let alpha = Theme.option('opacity') / 100;
        const instances = data
            .map(e => e.instance)
            .filter((value, index, self) => self.indexOf(value) === index);
        const series = widget.series;
        const isMultiSeries = Array.isArray(series) && series.length > 1;
        const showInstance = instances.length > 1 || (data.length == 1 && !isMultiSeries);
        const colors = {};
        if (widget.colors) {
            for (let mapping of widget.colors.split(' ')) {
                const keyValue = mapping.split(':');
                colors[keyValue[0]] = keyValue[1];
            }
        }
        for (let j = 0; j < data.length; j++) {
            const seriesData = data[j];
            const instance = seriesData.instance;
            let label;
            if (isMultiSeries) {
                label = seriesData.series.split(" ").pop();
            } else if (series.includes('*') && !series.includes('?')) {
                label = seriesData.series.replace(new RegExp(series.replace('*', '(.*)')), '$1').replace('_', ' ');                
            }
            let points = seriesData.points;
            let avgOffN = widget.options.perSec ? Math.min(points.length / 2, 4) : 1;
            let avg = 0;
            for (let n = 0; n < avgOffN; n++)
                avg += points[points.length - 1 - (n * 2)];
            avg /= avgOffN;
            let value = format(avg, widget.unit === 'bytes' || widget.unit === 'ns');
            if (widget.options.perSec)
                value += ' /s';
            let coloring = widget.coloring || 'instance';
            let color = Colors.lookup(coloring, getColorKey(widget, seriesData.series, instance, j), palette);
            if (label !== undefined && colors[label]) {
                color = Theme.color(colors[label]) || color;
            }
            let background = Colors.hex2rgba(color, alpha);
            if (Array.isArray(alerts) && alerts.length > 0) {
                let level;
                for (let i = 0; i < alerts.length; i++) {
                    let alert = alerts[i];
                    if (alert.instance == instance && alert.series == seriesData.series && !alert.stopped) {
                        level = Units.Alerts.maxLevel(level, alert.level);
                    }
                }
                if (level == 'red' || level == 'amber') {
                    background = Colors.hex2rgba(Theme.color(level), Math.min(1, alpha * 2));
                }
            }
            let status = seriesData.assessments.status;
            let highlight = status === undefined ? undefined : Theme.color(status);
            let item = {
                instance: instance,
                showInstance: showInstance,
                item: coloring != 'instance' ? Colors.lookup('instance', instance, palette) : undefined,
                label: label, 
                value: value,
                cmp: avg, // not part of the model but used for value based sort later
                color: color,
                background: background,
                status: status,
                since: seriesData.assessments.since,
                highlight: highlight,
            };
            const isConstantZero = points[points.length-1] == 0 && seriesData.stableCount > 10;
            if (widget.options.noConstantZero !== true || !isConstantZero)
                legend.push(item);
            seriesData.legend = item;
        }
        if (widget.ordering === undefined || widget.ordering == 'label') {
            legend.sort((a,b) => {
                let res = 0;
                if (a.instance && b.instance)
                  res = a.instance.localeCompare(b.instance);
                if (res == 0 && a.label && b.label)
                  res = a.label.localeCompare(b.label);
                return res;
            });            
        } else if (widget.ordering == 'inc') {
            legend.sort((a, b) => a.cmp - b.cmp);
        } else if (widget.ordering == 'dec') {
            legend.sort((a, b) => b.cmp - a.cmp);
        }
        if (widget.limit > 0)
            legend.slice(widget.limit).forEach(item => item.hidden = true);
        return { compact: true, items: legend };
    }

    function createLegendModelFromAlerts(widget, alerts) {
        if (!Array.isArray(alerts))
            return []; //TODO use white, green, amber and red to describe the watch in case of single watch
        let palette = Theme.palette();
        let alpha = Theme.option('opacity') / 100;
        let instances = {};
        for (let alert of alerts) {
            instances[alert.instance] = Units.Alerts.maxLevel(alert.level, instances[alert.instance]);
        }
        
        return Object.entries(instances).map(function([instance, level]) {
            let color = Colors.lookup('instance', instance, palette);
            return {
                instance: instance,
                showInstance: true,
                value: Units.Alerts.name(level),
                color: color,
                background: Colors.hex2rgba(color, alpha),
                status: level, 
                highlight: Theme.color(level),                
            };
        });
    }

    function createLegendModelFromAnnotations(widget, annotations) {
        let coloring = widget.coloring || 'instance';
        if (!Array.isArray(annotations) || coloring === 'index')
            return [];
        let palette = Theme.palette();
        let entries = {};
        let index = 1;
        for (let annotation of annotations) {
            const series = annotation.series;
            const instance = annotation.instance;
            const key = series;
            const entry = entries[key];
            if (entry === undefined) {
                let colorKey = getColorKey(widget, series, instance, index);
                entries[key] = { 
                    instance: instance,
                    label: coloring === 'instance' ? undefined : series, 
                    count: 1,
                    color: Colors.lookup(coloring, colorKey, palette) 
                };
            } else {
                entry.count += 1;
            }
            index++;
        }
        return { compact: true, items: Object.values(entries).map(function(entry) {
            return {
                instance: entry.instance,
                showInstance: true,
                label: entry.label,
                value: entry.count + 'x',
                color: entry.color,                
            };
        })};
    }

    function getColorKey(widget, series, instance, index) {
        switch (widget.coloring) {
            case 'index': return 'line-' + index;
            case 'series': return series;
            case 'instance-series': return instance + ' ' + series;
            case 'instance': 
            default: return instance;
        }
    } 

    function createIndicatorModel(widget, data) {
        if (!data)
            return { status: 'error', color: Theme.color('error') };
        if (Array.isArray(data) && data.length == 0)
            return { status: 'missing', color: Theme.color('missing'), text: widget.status.missing.hint };
        let status = 'normal';
        for (let seriesData of data)
            status = Units.Alerts.maxLevel(status, seriesData.assessments.status);
        const infoKey = status == 'red' ? 'critical' : status == 'amber' ? 'alarming' : status;
        let statusInfo = widget.status[infoKey] || {};
        return { status: status, color: Theme.color(status), text: statusInfo.hint };
    }

    function createRAGIndicatorModel(widget, legend) {
        const items = [];
        const src = Array.isArray(legend) ? legend : legend.items;
        for (let item of src) {
            items.push({
                label: item.label,
                status: item.status,
                since: item.since,
                value: item.value,
                color: item.color,
                background: item.highlight,
            });
        }
        return { items: items };
    }

    function createAlertTableModel(widget, alerts, annotations) {
        function createAlertAnnotationsFilter(alert) {
          return (annotation) => widget.options.noAnnotations !== true
                && annotation.series == alert.series 
                && annotation.instance == alert.instance
                && Math.round(annotation.time / 1000) >= Math.round(alert.since / 1000) // only same second needed
                && annotation.time <= (alert.until || new Date().getTime());  
        }
        if (widget.type === 'annotation')
            return {};
        let items = [];
        if (Array.isArray(alerts)) {
            let fields = widget.fields;
            for (let alert of alerts) {
                let autoInclude = widget.type === 'alert' || ((alert.level === 'red' || alert.level === 'amber') && !alert.acknowledged);
                let filters = widget.decorations.alerts;
                let lastAlertLevel = alert.frames[alert.frames.length - 1].level;
                if (lastAlertLevel == 'green' || lastAlertLevel == 'white')
                    lastAlertLevel = alert.frames[alert.frames.length - 2].level;
                let visible = (alert.acknowledged && filters.noAcknowledged !== true || !alert.acknowledged && filters.noUnacknowledged !== true)
                           && (alert.stopped && filters.noStopped !== true || !alert.stopped && filters.noOngoing !== true)
                           && (lastAlertLevel == 'red' && filters.noRed !== true || lastAlertLevel == 'amber' && filters.noAmber !== true);                  
                if (autoInclude && visible) {
                    items.push(createAlertTableItemModel(alert, widget, annotations
                    .filter(createAlertAnnotationsFilter(alert))
                    .map(function(annotation) {
                        return {
                            time: annotation.time,
                            value: annotation.value,
                            attrs: annotation.attrs,
                            fields: fields,
                        };
                    })));
                }
            }
        }
        return { id: widget.target + '_alerts', verbose: widget.type === 'alert', items: items };
    }

    function createPopupAlertTableModel(alerts) {
        return { verbose: true, items: alerts.map(alert => createAlertTableItemModel(alert)) };
    }

    function createAlertTableItemModel(alert, widget, annotations) {
        const palette = Theme.palette();
        const instanceColoring = widget === undefined || widget.coloring === 'instance' || widget.coloring === undefined;
        const series = widget !== undefined && alert.series == widget.series ? undefined : alert.series;
        const frames = alert.frames.map(function(frame) {
            return {
                level: frame.level,
                since: frame.start,
                until: frame.end,
                color: Theme.color(frame.level),
            };
        });
        return {
            serial: alert.serial,
            name: alert.initiator.name,
            unit: alert.initiator.unit,
            acknowledged: alert.acknowledged,
            confirmed: alert.confirmed,
            series: series,
            instance: alert.instance,
            color: instanceColoring ? Colors.lookup('instance', alert.instance, palette) : undefined,
            frames: frames,
            watch: alert.initiator,
            annotations: annotations === undefined ? [] : annotations,
        };
    }

    function createAnnotationTableModel(widget, annotations) {
        if (widget.type !== 'annotation')
            return {};
        let items = [];
        if (Array.isArray(annotations)) {
            let palette = Theme.palette();
            let index = 1;
            for (let annotation of annotations) {
                let colorKey = getColorKey(widget, annotation.series, annotation.instance, index);
                items.push({
                    color: Colors.lookup(widget.coloring, colorKey, palette),
                    series: annotation.series,
                    instance: annotation.instance,
                    unit: widget.unit,
                    time: annotation.time,
                    value: annotation.value,
                    attrs: annotation.attrs,
                    fields: widget.fields,
                });
                index++;
            }
        }
        return { id: widget.target + '_annotations', mode: widget.mode, sort: widget.sort, items: items };
    }

    function showAddPageModalDialog() {
        const results = {};
        const input = $('<input/>', { type: 'text'});
        input.change(() => results.input = input.val());
        input.keyup(event => {
            if(event.key !== "Enter") return;
            $('#ModalDialog-input').click();
            event.preventDefault();    
        });
        showModalDialog({
            title: 'Add Page',
            content: () => $('<form/>')
                .append($('<label/>').text('Page Name')).append(' ')
                .append(input),
            buttons: [
                { property: 'cancel', label: 'Cancel', secondary: true },
                { property: 'input', label: 'Add Page' }
            ],
            results: results,
            closeProperty: 'cancel',
            onExit: name => {
                if (name != '' && name !== undefined) {
                    MonitoringConsole.View.onPageChange(MonitoringConsole.Model.Page.create(name));
                    showFeedback({ type: 'success', message: `Your page <em>${name}</em> has been added.`});
                }
            }
        });
        input.focus();
    }

    function showRoleSelectionModalDialog(onExitCall) {
        const Role = MonitoringConsole.Model.Role;
        const currentRole = Role.isDefined() ? Role.get() : 'guest';
        showModalDialog({
            style: 'ModalDialogUserRole',
            title: 'User Role Selection',
            content: () => $('<dl/>')
                .append($('<dt/>').append($('<b/>').text('Guest')))
                .append($('<dd/>').text('Automatically uses latest server page configuration. Existing local changes are overridden. Local changes during the session do not affect the remote configuration.'))
                .append($('<dt/>').append($('<b/>').text('User')))
                .append($('<dd/>').text('Can select for each individual page if server configuration replaces local page. Can manually update local page with server page configuration during the session.'))
                .append($('<dt/>').append($('<b/>').text('Administrator')))
                .append($('<dd/>').text('Can select for each individual page if server configuration replaces local page. Can manually update local pages with server page configuration or update server configuration with local changes. For pages with automatic synchronisation local changes do affect server page configurations.')),
            buttons: [
                { property: 'guest', label: 'Guest', secondary: true },
                { property: 'user', label: 'User' },
                { property: 'admin', label: 'Administrator', secondary: true },
            ],
            results: { admin: 'admin' , user: 'user', guest: 'guest', current: currentRole },
            closeProperty: 'current',
            onExit: role =>  {
                let confirm = !Role.isDefined() || Role.get() != role;
                Role.set(role);
                updateSettings();
                if (Role.get() != role) {
                    showFeedback({ type: 'error', message: 'Failed to update user role. Please report an issue.'});
                } else if (confirm)
                    showFeedback({ type: 'success', message: `User Role changed to <em>${Role.name()}</em>` });
                if (isFunction(onExitCall))
                    onExitCall();
            }
        });
    }

    function createNavSidebarModel() {
        const Navigation = MonitoringConsole.Model.Settings.Navigation;
        const Rotation = MonitoringConsole.Model.Settings.Rotation;
        const Refresh = MonitoringConsole.Model.Refresh;
        const Page = MonitoringConsole.Model.Page;
        const pages = [];
        function createNavItem(page) {
            const selected = page.active;
            const hasPreset = Page.hasPreset(page.id);
            return {
                id: page.id,
                label: page.name,
                selected: selected,
                onSwitch: selected ? undefined : () => MonitoringConsole.View.onPageChange(Page.changeTo(page.id)),
                onDelete: hasPreset ? undefined : () => MonitoringConsole.View.onPageDelete(page),
                onReset: selected && hasPreset ? () => MonitoringConsole.View.onPageReset(page) : undefined,
            };
        }
        for (let page of MonitoringConsole.Model.listPages()) {
            pages.push(createNavItem(page));
        }
        let collapsed = Navigation.isCollapsed();
        return { 
            id: 'NavSidebar', 
            collapsed: collapsed, 
            rotationEnabled: Rotation.isEnabled(),
            refreshEnabled: !Refresh.isPaused(),
            refreshSpeed: Refresh.interval(),
            layoutColumns: Page.numberOfColumns(),
            logo: collapsed ? 'images/fish.svg' : 'images/logo.svg',
            pages: pages,
            onLogoClick: () => MonitoringConsole.View.onPageChange(Page.changeTo('core')),
            onSidebarToggle: () => {
                Navigation.toggle();
                updatePageNavigation();
            },
            onRotationToggle: () => {
                Rotation.enabled(!Rotation.isEnabled());
                updateSettings();
                updatePageNavigation();
            },
            onRefreshToggle: () => {
                Refresh.paused(!Refresh.isPaused());
                updateSettings();
                updatePageNavigation();
            },
            onPageAdd: () => {
                showAddPageModalDialog();
            },
            onLayoutChange: numberOfColumns => {
                MonitoringConsole.View.onPageLayoutChange(numberOfColumns);
                updateSettings();
                updatePageNavigation();  
            },
            onRefreshSpeedChange: duration => { 
                Refresh.resume(duration);
                updateSettings();
                updatePageNavigation();
            }
        };
    }

    /**
      * Model: { id, title, submit, series, onExit }
      */
    function createWizardModalDialogModel(model) {
        let initiallySelectedSeries = model.series;
        if (initiallySelectedSeries !== undefined && !Array.isArray(initiallySelectedSeries))
            initiallySelectedSeries = [ initiallySelectedSeries ];
        function objectToOptions(obj) {
            const options = [];
            for (const [key, value] of Object.entries(obj))
                options.push({ label: value, filter: key });
            return options;
        }

        function loadSeries() {
            return new Promise(function(resolve, reject) {
                Controller.requestListOfSeriesData({ groupBySeries: true, queries: [{
                    widgetId: 'auto', 
                    series: '?:* *',
                    truncate: ['ALERTS', 'POINTS'],
                    exclude: [],
                    history: false,
                }]}, 
                (response) => resolve(response.matches),
                () => reject(undefined));
            });
        }

        function metadata(match, attr) {
            const metadata = match.annotations.filter(a => a.permanent)[0];
            return metadata === undefined ? undefined : metadata.attrs[attr];
        }

        function matchesText(value, input) {
            return value.toLowerCase().includes(input.toLowerCase());
        }

        const results = {
            ok: initiallySelectedSeries,
            cancel: initiallySelectedSeries,
        };

        const wizard = { 
            key: 'series', 
            entry: ['series', 'displayName', 'description', 'unit'],
            selection: initiallySelectedSeries,
            render: entry => {
                const span = $('<span/>', { title: entry.description || '' });
                if (entry.displayName)
                    span.append($('<b/>').text(entry.displayName)).append(' ');
                span.append($('<code/>').text(entry.series));
                if (entry.unit)
                    span.append(' ').append($('<em/>').text('[' + entry.unit + ']'));
                if (entry.describe && entry.description)
                    span.append($('<p/>').text(entry.description));
                return span;
            },
            // the function that produces match entries
            onSearch: loadSeries,
            // these are the how to get a filter property from a match entry
            properties: {
                ns: match => match.series.startsWith('ns:') ? match.series.substring(3, match.series.indexOf(' ')) : undefined,
                series: match => match.series,
                app: match => metadata(match, 'App'),
                name: match => metadata(match, 'Name'),
                displayName: match => metadata(match, 'DisplayName'),
                description: match => metadata(match, 'Description'),
                type: match => metadata(match, 'Type'),
                property: match => metadata(match, 'Property'),
                unit: match => metadata(match, 'Unit'),
                group: match =>  {
                    let groupIndex = match.series.indexOf(' @:');
                    return groupIndex < 0 ? undefined : match.series.substring(groupIndex + 3, match.series.indexOf(' ', groupIndex + 3));
                },
                metric: match => match.series.substring(match.series.lastIndexOf(' ') + 1),
            },            
            // filters link to the above properties to extract match data
            filters: [
                { label: 'Source', property: 'ns', options: [
                    { label: 'Server Metrics', filter: ns => ns != 'metric' },
                    { label: 'MicroProfile Metrics', filter: 'metric' }
                ]},
                { label: 'MicroProfile Application', property: 'app', requires: { ns: 'metric' }},
                { label: 'MicroProfile Type', property: 'type', requires: { ns: 'metric' }, options: [ // values are as used by MP metrics type
                    { label: 'Counter', filter: 'counter' },
                    { label: 'Timer', filter: 'timer' },
                    { label: 'Gauge', filter: 'gauge' },
                    { label: 'Concurrent Gauge', filter: 'concurrent gauage' },
                    { label: 'Meter', filter: 'meter' },
                    { label: 'Histogram', filter: 'histogram' },
                    { label: 'Simple Timer', filter: 'simple timer' }
                ]},
                { label: 'MicroProfile Unit', property: 'unit', requires: { ns: 'metric' }},
                { label: 'Namespace', property: 'ns', requires: { ns: ns => ns != 'metric' }, 
                    options: () => objectToOptions(MonitoringConsole.Data.NAMESPACES)
                        .filter(option => option.filter != 'metric' && option.filter != 'other') },
                { label: 'MicroProfile Property', property: 'property', requires: { ns: 'metric'} },
                { label: 'MicroProfile Name', property: 'name', requires: { ns: 'metric' }, 
                    filter: matchesText },                
                { label: 'MicroProfile Display Name', property: 'displayName', requires: { ns: 'metric' }, 
                    filter: matchesText },                
                { label: 'MicroProfile Description', property: 'description', requires: { ns: 'metric' }, 
                    filter: matchesText },                
                { label: 'Group', property: 'group' },
                { label: 'Metric', property: 'metric' },
                { label: 'Series', property: 'series', filter: matchesText },
            ],
            // what should happen if the selection made by the user changes
            onChange: (selectedSeries, selectedMatches) => results.ok = selectedMatches,
        };

        return {
            id: model.id,
            title: model.title,
            content: () => Components.createSelectionWizard(wizard),
            buttons: [
                { property: 'cancel', label: 'Cancel', secondary: true },
                { property: 'ok', label: model.submit },
            ],
            results: results,
            closeProperty: 'cancel',
            onExit: seriesOrMatches => {
                if (Array.isArray(seriesOrMatches)) {
                    model.onExit(seriesOrMatches); 
                } else if (typeof seriesOrMatches === 'object') {
                    model.onExit(Object.keys(seriesOrMatches), seriesOrMatches);
                }
            },
        };
    }

    function showPagePushModalDialog() {
        showModalDialog(createYesNoModualDialog({
            dangerzone: true,
            title: 'Push Local to Remote',
            question: 'Are you sure you want to override all <b>shared</b> pages with the current local state?',
            yes: 'Push All',
            no: 'Cancel',
            onYes: () => {
                MonitoringConsole.Model.Page.Sync.pushAllLocal(
                    page => showFeedback({ type: 'success', message: `Remote page <em>${page.name}</em> updated successfully.` }),
                    page => showFeedback({ type: 'error', message: `Failed to update remote page <em>${page.name}</em>.` }));
            } 
        }));
    }

    function wrapOnSuccess(onSuccess, message) {
        return () => {
            if (isFunction(onSuccess))
                onSuccess();
            if (message)
                showFeedback({ type: 'success', message: message});
            showWatchConfigModalDialog();
        };
    }

    function wrapOnError(onError, message) {
        return () => {
            if (isFunction(onError))
                onError();
            if (message)
                showFeedback({ type: 'error', message: message});
            showWatchConfigModalDialog();
        };
    }

    /**
     * This function is called when the watch details settings should be opened
     */
    function showWatchConfigModalDialog() {

        const Role = MonitoringConsole.Model.Role;
        const actions = {};
        if (Role.isAdmin()) {
            actions.onDelete = (name, onSuccess, onError) => {
                showModalDialog(createYesNoModualDialog({
                    dangerzone: true,
                    title: 'Delete Watch',
                    question: `Are you sure you want to delete watch <em>${name}</em>?`,
                    yes: 'Delete',
                    no: 'Cancel',
                    onYes: () => Controller.requestDeleteWatch(name, 
                        wrapOnSuccess(onSuccess, `Successfully deleted watch <em>${name}</em>.`), 
                        wrapOnError(onError, `Failed to deleted watch <em>${name}</em>.`))
                }));
            };
            actions.onDisable = (name, onSuccess, onError) => Controller.requestDisableWatch(name, 
                wrapOnSuccess(onSuccess, `Successfully disabled watch <em>${name}</em>.`), 
                wrapOnError(onError), `Failed to disable watch <em>${name}</em>.`);
            actions.onEnable = (name, onSuccess, onError) => Controller.requestEnableWatch(name, 
                wrapOnSuccess(onSuccess, `Successfully enabled watch <em>${name}</em>.`), 
                wrapOnError(onError, `Failed to enable watch <em>${name}</em>.`));            
        }
        if (!Role.isGuest()) {
            actions.onCreate = (watch, onSuccess, onError) => showWatchBuilderModalDialog(createEditableWatch(watch), 
                    watch === undefined || watch.programmatic, onSuccess, onError);
            actions.onEdit = actions.onCreate;
        }
        Controller.requestListOfWatches((watches) => {
            const manager = { 
                id: 'WatchManager', 
                items: watches, 
                colors: { red: Theme.color('red'), amber: Theme.color('amber'), green: Theme.color('green') },
                actions: actions,
            };
            showModalDialog({
                id: 'WatchSettingsModalDialog',
                title: 'Manage Watches',
                content: () => Components.createWatchManager(manager),
                buttons: [{ property: 'close', label: 'Close' }],
                results: { close: true },                
                closeProperty: 'close',
            });
        });
    }

    function createEditableWatch(watch) {
        if (watch === undefined)
            return { unit: 'count', name: 'New Watch' };
        if (watch.programmatic) {
            const editedWatch = JSON.parse(JSON.stringify(watch));
            editedWatch.name = 'Copy of ' + watch.name;
            editedWatch.programmatic = false;
            return editedWatch;
        }
        return watch;
    }

    function showWatchBuilderModalDialog(watch, isAdd, onSuccess, onError) {
        const builder = {
            watch: watch,
            colors: { red: Theme.color('red'), amber: Theme.color('amber'), green: Theme.color('green') },
            onSelect: !isAdd ? undefined : (id, series, onSelection) => showModalDialog(createWizardModalDialogModel({
                id: id,
                title: 'Select Watch Metric Series', 
                submit: 'Select',
                series: series, 
                onExit: series => onSelection(series[0]),
            })),
        };
        const watchID = watch.name;
        showModalDialog({
            id: 'WatchBuilder',
            style: !isAdd ? 'danger-zone' : undefined,
            title: isAdd ? 'Add New Watch' : 'Edit Watch',
            content: () => Components.createWatchBuilder(builder),
            buttons: [
                { property: 'cancel', label: 'Cancel', secondary: true },
                { property: 'save', label: isAdd ? 'Save' : 'Update' }
            ],
            results: { save: watch },
            closeProperty: 'cancel',
            onExit: watch => {
                if (watch) {
                    const extendedOnSuccess = isAdd || watchID == watch.name ? onSuccess : () => {
                        Controller.requestDeleteWatch(watchID, 
                        wrapOnSuccess(onSuccess, `Successfully removed watch with old name <em>${watchID}</em>.`), 
                        wrapOnError(onError, `Failed to remove watch with old name <em>${watchID}</em>.`));
                    };
                    Controller.requestCreateWatch(watch, 
                        wrapOnSuccess(extendedOnSuccess, `Successfully saved watch <em>${watch.name}</em>.`), 
                        wrapOnError(onError, `Failed to saved watch <em>${watch.name}</em>.`));
                }
            },
        });
    }

    /**
     * This function is called when data was received or was failed to receive so the new data can be applied to the page.
     *
     * Depending on the update different content is rendered within a chart box.
     */
    function onDataUpdate(update) {
        function replaceKeepYScroll(replaced, replacement) {
            const top = replaced.scrollTop();
            replaced.replaceWith(replacement);
            replacement.scrollTop(top);                
        }
        if (update.widget === undefined) {
            onGlobalUpdate(update);
            return;
        }
        const widget = update.widget;
        const data = update.data;
        const alerts = update.alerts;
        const annotations = update.annotations;
        const widgetNode = $('#widget-' + widget.target);
        if (widgetNode.length == 0)
            return; // can't update, widget is not in page
        if (widget.selected) {
            widgetNode.addClass('chart-selected');
        } else {
            widgetNode.removeClass('chart-selected');
        }
        const contentNode = widgetNode.find('.WidgetContent').first();
        if (widget.type == 'top') {
            contentNode.addClass('WidgetContentTop');
        } else {
            contentNode.removeClass('WidgetContentTop');
        }
        let headerNode = widgetNode.find('.WidgetHeader').first();
        let legendNode = widgetNode.find('.Legend').first();
        let indicatorNode = widgetNode.find('.Indicator').first();
            if (indicatorNode.length == 0)
                indicatorNode = widgetNode.find('.RAGIndicator').first();
        let alertsNode = widgetNode.find('.AlertTable').first();
        let annotationsNode = widgetNode.find('.AnnotationTable').first();
        let legend = createLegendModel(widget, data, alerts, annotations); // OBS this has side effect of setting .legend attribute in series data
        if (data !== undefined && (widget.type === 'line' || widget.type === 'bar')) {
            MonitoringConsole.Chart.getAPI(widget).onDataUpdate(update);
        }
        replaceKeepYScroll(headerNode, Components.createWidgetHeader(createWidgetHeaderModel(widget)));
        if (widget.type == 'rag') {
            alertsNode.hide();
            legendNode.hide();
            replaceKeepYScroll(indicatorNode, Components.createRAGIndicator(createRAGIndicatorModel(widget, legend)));
            annotationsNode.hide();
        } else {
            replaceKeepYScroll(alertsNode, Components.createAlertTable(createAlertTableModel(widget, alerts, annotations)));
            replaceKeepYScroll(legendNode, Components.createLegend(legend));
            replaceKeepYScroll(indicatorNode, Components.createIndicator(createIndicatorModel(widget, data)));
            replaceKeepYScroll(annotationsNode, Components.createAnnotationTable(createAnnotationTableModel(widget, annotations)));            
        }
    }

    /**
     * This function is called once per server polling to update the global page state
     * (not widget specific state) 
     */
    async function onGlobalUpdate(update) {
        const alertsIndicatorNode = $('#AlertIndicator');
        const alerts = update.alerts;
        alertsIndicatorNode.replaceWith(Components.createAlertIndicator({
            id: 'AlertIndicator',
            redAlerts: { 
                acknowledgedCount: alerts.acknowledgedRedAlerts, 
                unacknowledgedCount: alerts.unacknowledgedRedAlerts,
                color: Theme.color('red'),
            },
            amberAlerts: { 
                acknowledgedCount: alerts.acknowledgedAmberAlerts, 
                unacknowledgedCount: alerts.unacknowledgedAmberAlerts,
                color: Theme.color('amber'),
            },
            changeCount: alerts.changeCount,
        }));
        const hasRedAlerts = alerts.unacknowledgedRedAlerts > 0;
        const hasAmberAlerts = alerts.unacknowledgedAmberAlerts > 0;
        const lastConfirmed = MonitoringConsole.Model.Settings.Alerts.confirmedChangeCount();
        const isConfirmed = lastConfirmed >= alerts.changeCount;
        const showPopup = MonitoringConsole.Model.Settings.Alerts.showPopup();
        const confirm = () => MonitoringConsole.Model.Settings.Alerts.confirm(alerts.changeCount, alerts.ongoingRedAlerts, alerts.ongoingAmberAlerts);
        if (showPopup && !isConfirmed) {
            // test: is there already a popup for the current change-count? => done
            const shownDialog = $('#AlertDialog');
            if (shownDialog.attr('data-change-count') == alerts.changeCount)
                return; // we already show the proper popup - do not change it (save potential server requests to fetch alert data)
            const content = await createGlobalAlertContent(alerts);
            const dialog = showModalDialog({
                id: 'AlertDialog',
                title: 'Alert Status Change',
                content: content,
                buttons: [
                    { property: 'confirm', label: 'OK' },
                    { property: 'show', label: 'Show', secondary: true },
                ],
                results: { confirm: false, show: true },
                closeProperty: 'confirm',
                onExit: show => {
                    confirm();
                    if (show) {
                        MonitoringConsole.Model.Settings.Rotation.enabled(false);
                        onPageChange(MonitoringConsole.Model.Page.changeTo('alerts'));
                    }
                }                
            });
            dialog.attr('data-change-count', alerts.changeCount);
        } else {
            $('#AlertDialog').hide();
            if (!showPopup || alerts.changeCount + 1000 < lastConfirmed) // most likely a server restart after new year 
                confirm();
        }
    }

    async function createGlobalAlertContent(alerts) {
        async function createList(serials) {
            async function requestAll(serials) {
                return Promise.all(serials.map(serial => {
                    let alert = alerts.byIdOnPage[serial];
                    if (alert !== undefined)
                        return alert;
                    return new Promise(function(resolve, reject) {
                        Controller.requestAlertDetails(serial, response => resolve(response.alerts[0]), () => reject());
                    });
                }));
            }
            const list = await requestAll(serials);
            return Components.createAlertTable(createPopupAlertTableModel(list.filter(e => e !== undefined)));
        }
        function difference(left, right) {
            return left.filter(e => !right.includes(e));
        }
        function intersection(left, right) {
            return left.filter(e => right.includes(e));
        }
        function union(left, right) {
            return left.concat(right);
        }
        // basis sets
        const redConfirmed = MonitoringConsole.Model.Settings.Alerts.confirmedRedAlerts();
        const amberConfirmed = MonitoringConsole.Model.Settings.Alerts.confirmedAmberAlerts();
        const redCurrent = alerts.ongoingRedAlerts || [];
        const amberCurrent = alerts.ongoingAmberAlerts || [];
        const allConfirmed = union(redConfirmed, amberConfirmed);
        const allCurrent = union(redCurrent, amberCurrent);
        // transition sets
        const red2green = difference(redConfirmed, allCurrent);
        const amber2green = difference(amberConfirmed, allCurrent);
        const red2amber = intersection(redConfirmed, amberCurrent);
        const amber2red = intersection(amberConfirmed, redCurrent);
        const green2amber = difference(amberCurrent, allConfirmed);
        const green2red = difference(redCurrent, allConfirmed);
        
        const content = [];
        const list = async (set, from, to) => {
            if (set.length > 0) {
                content.push($('<h3/>')
                    .append($('<span/>', {style: `color:${Theme.color(from)};`}).text(Units.Alerts.name(from)))
                    .append(' => ')
                    .append($('<span/>', {style: `color:${Theme.color(to)};`}).text(Units.Alerts.name(to)))
                    );
                content.push(await createList(set));
            }
        };
        await list(green2red, 'green', 'red');
        await list(amber2red, 'amber', 'red');
        await list(red2amber, 'red', 'amber');
        await list(green2amber, 'green', 'amber');
        await list(red2green, 'red', 'green');
        await list(amber2green, 'amber', 'green');
        return content;
    }


    /**
     * This function refleshes the page with the given layout.
     */
    function onPageUpdate(layout) {

        function createPlusButton(row, col) {
            return $('<button/>', { text: '+', 'class': 'big-plus', title: 'Add a widget to the page...' })
                .click(() => showAddWidgetModalDialog({ column: col, item: row })); 
        }              
        let numberOfColumns = layout.length;
        if (layout[0].length == 0) {
            for (let i = 0; i < layout.length; i++)
                layout[i] = [null];
        }
        let maxRows = layout[0].length;
        let table = $("<table/>", { id: 'chart-grid' });
        let padding = 32;
        let headerHeight = 48;
        let minRowHeight = 160;
        let rowsPerScreen = maxRows;
        let windowHeight = $(window).height();
        let rowHeight = 0;
        while (rowsPerScreen > 0 && rowHeight < minRowHeight) {
            rowHeight = Math.round((windowHeight - headerHeight) / rowsPerScreen) - padding; // padding is subtracted
            rowsPerScreen--; // in case we do another round try one less per screen
        }
        if (rowHeight == 0) {
            rowHeight = windowHeight - headerHeight - padding;
        }
        for (let row = 0; row < maxRows; row++) {
            let tr = $("<tr/>");
            for (let col = 0; col < numberOfColumns; col++) {
                let cell = layout[col][row];
                if (cell) {
                    let rowspan = cell.rowspan;
                    let height = (rowspan * rowHeight);
                    let td = $("<td/>", { colspan: cell.colspan, rowspan: rowspan, style: 'height: '+height+"px;"});
                    const widget = cell.widget;
                    const widgetTarget = 'widget-' + widget.target;
                    let existingWidget = $('#' + widgetTarget);
                    if (existingWidget.length > 0) {
                        existingWidget.appendTo(td); // recycle the widget already rendered into the page
                    } else {
                        // add a blank widget box, filled during data update
                        td.append($('<div/>', { id : widgetTarget, class: 'Widget' })
                            .append(Components.createWidgetHeader(createWidgetHeaderModel(widget)))
                            .append($('<div/>', { class: 'WidgetContent' })
                                .append(createChartContainer(widget))
                                .append(Components.createAlertTable({}))
                                .append(Components.createAnnotationTable({}))
                                .append(Components.createIndicator({})))
                            .append(Components.createLegend([])));        
                    }
                    tr.append(td);
                } else if (cell === null) {
                    tr.append($("<td/>", { style: 'height: '+rowHeight+'px;'})
                        .append($('<div/>', { class: 'Widget empty'}).append(createPlusButton(row, col))));                  
                }
            }
            table.append(tr);
        }
        $('#chart-container').empty();
        $('#chart-container').append(table);
    }

    function showPushPageConfirmModalDialog() {
        showModalDialog(createYesNoModualDialog({
            dangerzone: true,
            title: 'Share Local Page', 
            question: 'Are you sure you want update the server configuration of this page with the local configuration?\n<b>Warning:</b> Current server configuration will be overridden.', 
            yes: 'Update Server Configuration', 
            no: 'Cancel', 
            onYes: () => {
                MonitoringConsole.Model.Page.Sync.pushLocal(
                    page => {
                        showFeedback({ type: 'success', message: `Successfully updated server page <em>${page.name}</em> with local configuration.`});
                        onPageRefresh();
                    },
                    page => showFeedback({ type: 'error', message: `Failed to update server page <em>${page.name}</em>.`}));
            }
        }));
    }

    function showPullPageConfirmModalDialog() {
        showModalDialog(createYesNoModualDialog({
            dangerzone: true,
            title: 'Update Local Page', 
            question: 'Are you sure you want to update this page with the server configuration?\n<b>Warning:</b> Current local configuration will be overridden.', 
            yes: 'Update Local Configuration', 
            no: 'Cancel', 
            onYes: async () => {
                await MonitoringConsole.Model.Page.Sync.pullRemote(undefined,
                    page => {
                        showFeedback({ type: 'success', message: `Successfully updated local page <em>${page.name}</em> with server configuration.`});
                        onPageRefresh();
                    },
                    page => showFeedback({ type: 'error', message: `Failed to update local page <em>${page.name}</em>.`}));
            }
        }));
    }

    function showPageSyncModalDialog(autosync) {
        MonitoringConsole.Model.Page.Sync.providePullRemoteModel(model => {
            if (model.pages.length == 0)
                return;
            // abses the object properties as a set of ids
            const onExit = async function(pageIds) {
                if (pageIds.length > 0) {
                    await model.onUpdate(pageIds, 
                        page => showFeedback({type: 'success', message: `Updated local page <em>${page.name}</em> with server configuration.`}),
                        page => showFeedback({type: 'error', message: `Failed to update local page <em>${page.name}</em> with server configuration.`})
                    );
                    onPageRefresh(); 
                }
            };
            if (autosync === true) {
                onExit(model.pages.map(p => p.id));
                return;
            }

            const results = { empty: {}, selected: {} };
            model.onSelection = pageId => results.selected[pageId] = true;
            model.onDeselection = pageId => delete results.selected[pageId];

            showModalDialog({
                style: 'ModalDialogPageSync',
                title: 'Page Synchronisation',
                content: () => Components.createPageManager(model),
                buttons: [
                    { property: 'empty', label: 'Cancel', secondary: true },
                    { property: 'selected', label: 'Update Selected', tooltip: 'Updates checked pages locally with the remote configuration for these pages' },
                ],
                closeProperty: 'empty',
                results: results,
                onExit: pageIdMap => onExit(Object.keys(pageIdMap)),
            });
        });
    }    

    function onPageRefresh() {
        onPageChange(MonitoringConsole.Model.Page.changeTo(MonitoringConsole.Model.Page.id()));
    }

    /**
     * Method to call when page changes to update UI elements accordingly
     */
    function onPageChange(layout) {
        onPageUpdate(layout);
        updatePageNavigation();
        updateSettings();
    }

    /**
     * Public API of the View object:
     */
    return {
        Units: Units,
        Colors: Colors,
        Components: Components,
        onPageReady: function() {
            let hash = window.location.hash;
            let targetPageId = hash.length <= 1 ? undefined : hash.substring(1);
            // connect the view to the model by passing the 'onDataUpdate' function to the model
            // which will call it when data is received
            let layout = MonitoringConsole.Model.init(onDataUpdate, onPageChange);
            if (targetPageId === undefined)
                onPageChange(layout);
            Colors.scheme('Payara', false);
            if (targetPageId)
                onPageChange(MonitoringConsole.Model.Page.changeTo(targetPageId));
            $(window).on('hashchange', function(e) {
                let pageId = window.location.hash.substring(1);
                if (pageId != MonitoringConsole.Model.Page.id()) {
                    onPageChange(MonitoringConsole.Model.Page.changeTo(pageId));
                }
            });
            const pageSync = () => showPageSyncModalDialog(MonitoringConsole.Model.Role.isGuest());
            if (!MonitoringConsole.Model.Role.isDefined()) {
                showRoleSelectionModalDialog(pageSync);
            } else {
                pageSync();
            }
        },
        onPageChange: (layout) => onPageChange(layout),
        onPageUpdate: (layout) => onPageUpdate(layout),
        onPageReset: page => {
            const name = page.name;
            showModalDialog(createYesNoModualDialog({
                dangerzone: true,
                title: 'Reset Page?',
                question: `Are you sure you want to reset the page <em>${name}</em> to its preset?`,
                yes: 'Reset',
                no: 'Cancel',
                onYes: () => { 
                    if (MonitoringConsole.Model.Page.reset(page.id)) {
                        showFeedback({ type: 'success', message: `Page <em>${name}</em> reset successfully.` });
                        onPageChange(MonitoringConsole.Model.Page.arrange());
                    } else {
                        showFeedback({ type: 'error', message: `Failed to reset page <em>${name}</em>. The page has no preset.` });
                    }
                }
            }));
        },
        onPageMenu: function() { MonitoringConsole.Model.Settings.toggle(); updateSettings(); },
        onPageLayoutChange: (numberOfColumns) => onPageUpdate(MonitoringConsole.Model.Page.arrange(numberOfColumns)),
        onPageDelete: page => {
            const name = page.name;
            showModalDialog(createYesNoModualDialog({
                dangerzone: true,
                title: 'Delete Page?',
                question: `Are you sure you want to delete the page <em>${name}</em>?`, 
                yes: 'Delete', 
                no: 'Cancel', 
                onYes: () => {
                    MonitoringConsole.Model.Page.erase(page.id, () => {
                        onPageUpdate(MonitoringConsole.Model.Page.arrange());    
                        showFeedback({ type: 'success', message: `Your page <em>${name}</em> has been deleted.` });             
                        updatePageNavigation();
                        updateSettings();                 
                    }, 
                    msg => showFeedback({ type: 'error', message: `Failed to delete page <em>${name}</em>. ${msg}`}));
                }
            }));
        },
        onTracePopup: series => {
            showModalDialog({
                title: 'Request Tracing Details',
                content: () => MonitoringConsole.Chart.Trace.createPopup(series),
                buttons: [
                    { label: 'Close', property: 'close' }
                ],
                closeProperty: 'close',
                results: { close: [] },
                onExit: () => MonitoringConsole.Chart.Trace.onClosePopup()
            });
            
        },
    };
})();
