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
