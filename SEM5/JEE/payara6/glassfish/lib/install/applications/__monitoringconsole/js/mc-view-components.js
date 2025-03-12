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
