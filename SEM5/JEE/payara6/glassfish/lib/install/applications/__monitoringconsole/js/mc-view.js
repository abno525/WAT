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
