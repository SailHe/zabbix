/*
** Zabbix
** Copyright (C) 2001-2014 Zabbix SIA
**
** This program is free software; you can redistribute it and/or modify
** it under the terms of the GNU General Public License as published by
** the Free Software Foundation; either version 2 of the License, or
** (at your option) any later version.
**
** This program is distributed in the hope that it will be useful,
** but WITHOUT ANY WARRANTY; without even the implied warranty of
** MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
** GNU General Public License for more details.
**
** You should have received a copy of the GNU General Public License
** along with this program; if not, write to the Free Software
** Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
**/

// trigger log expression
var logexpr_count = 0;
var key_count = 0;

function nextObject(n) {
	var t = n.parentNode.tagName;
	do {
		n = n.nextSibling;
	} while (n && n.nodeType != 1 && n.parentNode.tagName == t);

	return n;
}

function previousObject(p) {
	var t = p.parentNode.tagName;
	do {
		p = p.previousSibling;
	} while (p && p.nodeType != 1 && p.parentNode.tagName == t);

	return p;
}

function add_logexpr() {
	var REGEXP_EXCLUDE = 1;
	try {
		var expr = document.getElementById('logexpr');
		var expr_t = document.getElementById('expr_type');
		var bt_and = document.getElementById('add_key_and');
		var bt_or = document.getElementById('add_key_or');
		var iregexp = document.getElementById('iregexp');
	}
	catch(e) {
		throw('Error: ' + (IE ? e.description : e));
	}

	var ex = bt_and.disabled ? '|' : '&';
	var ex_v = bt_and.disabled ? ' OR ' : ' AND ';
	if (expr_t.value == REGEXP_EXCLUDE) {
		ex = bt_and.disabled ? '&' : '|';
	}

	var expression = '';
	var expr_v = '';
	var lp;
	for (lp = 0; lp < key_count; lp++) {
		var key = document.getElementsByName('keys[' + lp + '][value]')[0];
		var typ = document.getElementsByName('keys[' + lp + '][type]')[0];
		if (typeof(key) != 'undefined' && typeof(typ) != 'undefined') {
			if (expression != '') {
				expression += ex;
				expr_v += ex_v;
			}
			expression += typ.value + '(' + key.value + ')';
			expr_v += typ.value + '(' + key.value + ')';
			remove_keyword('keytr' + lp);
		}
	}

	if (typeof(expr.value) != 'undefined' && expr.value != '') {
		if (expression != '') {
			expression += ex;
			expr_v += ex_v;
		}
		expression += iregexp.checked ? 'iregexp' : 'regexp';
		expression += '(' + expr.value + ')';
		expr_v += iregexp.checked ? 'iregexp' : 'regexp';
		expr_v += '(' + expr.value + ')';
	}

	if (expression == '') {
		return false;
	}

	var classattr = IE ? 'className' : 'class';

	var tr = document.createElement('tr');
	document.getElementById('exp_list').firstChild.appendChild(tr);

	tr.setAttribute(classattr, 'even_row');
	tr.setAttribute('id', 'logtr' + logexpr_count);

	var td = document.createElement('td');
	tr.appendChild(td);
	td.appendChild(document.createTextNode(expr_v));

	jQuery(td).append(jQuery('<input>', {
		name: 'expressions[' + logexpr_count + '][value]',
		type: 'hidden',
		value: expression
	}));

	jQuery(td).append(jQuery('<input>', {
		name: 'expressions[' + logexpr_count + '][view]',
		type: 'hidden',
		value: expr_v
	}));

	var td = document.createElement('td');
	tr.appendChild(td);

	td.appendChild(document.createTextNode(expr_t.options[expr_t.selectedIndex].text));

	jQuery(td).append(jQuery('<input>', {
		name: 'expressions[' + logexpr_count + '][type]',
		type: 'hidden',
		value: expr_t.value
	}));

	// optional
	var td = document.createElement('td');
	tr.appendChild(td);

	td.setAttribute(IE ? 'cssText' : 'style', 'white-space: nowrap;');

	var img = document.createElement('img');
	img.setAttribute('src', 'images/general/arrow_up.png');
	img.setAttribute('border', '0');
	img.setAttribute('alt', 'up');

	var url = document.createElement('a');
	url.setAttribute('href', 'javascript: element_up("logtr' + logexpr_count + '");');
	url.setAttribute(classattr, 'action');
	url.appendChild(img);

	td.appendChild(url);
	td.appendChild(document.createTextNode(' '));

	var img = document.createElement('img');
	img.setAttribute('src', 'images/general/arrow_down.png');
	img.setAttribute('border', '0');
	img.setAttribute('alt', 'down');

	var url = document.createElement('a');
	url.setAttribute('href', 'javascript: element_down("logtr' + logexpr_count + '");');
	url.setAttribute(classattr, 'action');
	url.appendChild(img);

	td.appendChild(url);

	var td = document.createElement('td');
	tr.appendChild(td);

	var url = document.createElement('a');
	url.setAttribute('href', 'javascript: if (confirm("' + locale['S_DELETE_EXPRESSION_Q'] + '")) { remove_expression("logtr' + logexpr_count + '"); }');
	url.setAttribute(classattr, 'action');
	url.appendChild(document.createTextNode(locale['S_DELETE']));

	td.appendChild(url);

	logexpr_count++;
	expr.value = '';
	expr_t.selectedIndex=0;
	bt_and.disabled = false;
	bt_or.disabled = false;
}

function remove_expression(expr_id) {
	var expr_tr = document.getElementById(expr_id);
	var id = getIdFromNodeId(expr_id);
	if (is_number(id)) {
		var elm_v = document.getElementsByName('expressions[' + id + '][value]')[0];
		var elm_t = document.getElementsByName('expressions[' + id + '][type]')[0];
		var elm_s = document.getElementsByName('expressions[' + id + '][view]')[0];

		if (typeof(elm_v) != 'undefined') {
			elm_v.parentNode.removeChild(elm_v);
		}
		if (typeof(elm_t) != 'undefined') {
			elm_t.parentNode.removeChild(elm_t);
		}
		if (typeof(elm_s) != 'undefined') {
			elm_s.parentNode.removeChild(elm_s);
		}
	}
	if (typeof(expr_tr) != 'undefined') {
		expr_tr.parentNode.removeChild(expr_tr);
	}
}

function getIdFromNodeId(id) {
	if (typeof(id) == 'string') {
		var reg = /logtr([0-9])/i;
		id = parseInt(id.replace(reg, '$1'));
	}
	if (typeof(id) == 'number') {
		return id;
	}
	return null;
}

function element_up(elementid) {
	var c_obj = document.getElementById(elementid);
	var p_obj = c_obj.parentNode;

	if (typeof(p_obj) == 'undefined') {
		return null;
	}

	var c2_obj = previousObject(c_obj);
	if (c2_obj && c2_obj.id.length > 0) {
		swapNodes(c2_obj, c_obj);
		swapNodesNames(c2_obj, c_obj);
	}
}

function element_down(elementid) {
	var c_obj = document.getElementById(elementid);
	var p_obj = c_obj.parentNode;

	if (typeof(p_obj) == 'undefined') {
		return null;
	}

	var c2_obj = nextObject(c_obj);
	if (c2_obj && c2_obj.id.length > 0) {
		swapNodes(c_obj, c2_obj);
		swapNodesNames(c_obj, c2_obj);
	}
}

function swapNodes(n1, n2) {
	var p1, p2, b;

	if ((p1 = n1.parentNode) && (p2 = n2.parentNode)) {
		b = nextObject(n2);
		if (n1 == b) {
			return;
		}

		p1.replaceChild(n2, n1); // new, old
		if (b) {
			// n1 - the node which we insert
			// b - the node before which we insert
			p2.insertBefore(n1, b);
		}
		else {
			p2.appendChild(n1);
		}
	}
}

function swapNodesNames(n1, n2) {
	var id1 = n1.id;
	var id2 = n2.id;
	if (is_string(id1) && is_string(id2)) {
		var reg = /logtr([0-9])/i;
		id1 = parseInt(id1.replace(reg, '$1'));
		id2 = parseInt(id2.replace(reg, '$1'));
	}

	if (is_number(id1) && is_number(id2)) {
		var elm = [];
		elm[0] = document.getElementsByName('expressions[' + id1 + '][value]')[0];
		elm[1] = document.getElementsByName('expressions[' + id1 + '][type]')[0];
		elm[2] = document.getElementsByName('expressions[' + id1 + '][view]')[0];
		elm[3] = document.getElementsByName('expressions[' + id2 + '][value]')[0];
		elm[4] = document.getElementsByName('expressions[' + id2 + '][type]')[0];
		elm[5] = document.getElementsByName('expressions[' + id2 + '][view]')[0];

		swapNodes(elm[0], elm[3]);
		swapNodes(elm[1], elm[4]);
		swapNodes(elm[2], elm[5]);

		return true;
	}
	return false;
}

function closeForm(page) {
	try {
		// set header confirmation message to opener
		var msg = IE ? document.getElementById('page_msg').innerText : document.getElementById('page_msg').textContent;
		window.opener.location.replace(page + '?msg=' + encodeURI(msg));
	}
	catch (e) {
		throw(e);
	}

	if (IE) {
		// close current popup after 1s, wait when opener window is refreshed (IE7 issue)
		window.setTimeout(function() { window.self.close(); }, 1000);
	}
	else {
		window.self.close();
	}
}

function add_keyword(bt_type) {
	try {
		var expr = document.getElementById('logexpr');
		var iregexp = document.getElementById('iregexp');
		var cb = document.getElementById(bt_type == 'and' ? 'add_key_or' : 'add_key_and');
	}
	catch(e) {
		throw('Error: ' + (IE ? e.description : e));
	}

	if (typeof(expr.value) == 'undefined' || expr.value == '') {
		return false;
	}

	cb.disabled = true;

	var classattr = IE ? 'className' : 'class';

	var tr = document.createElement('tr');
	document.getElementById('key_list').firstChild.appendChild(tr);

	tr.setAttribute(classattr, 'even_row');
	tr.setAttribute('id', 'keytr' + key_count);

	// keyword
	var td = document.createElement('td');
	tr.appendChild(td);

	td.appendChild(document.createTextNode(expr.value));

	var input = IE ? document.createElement('<input name="keys[' + key_count + '][value]" />') : document.createElement('input');
	input.setAttribute('type', 'hidden');
	input.setAttribute('value', expr.value);
	!IE ? input.setAttribute('name', 'keys[' + key_count + '][value]') : '';

	td.appendChild(input);

	// type
	var td = document.createElement('td');
	tr.appendChild(td);

	td.appendChild(document.createTextNode(iregexp.checked ? 'iregexp' : 'regexp'));

	var input = IE ? document.createElement('<input name="keys[' + key_count + '][type]" />') : document.createElement('input');
	input.setAttribute('type', 'hidden');
	input.setAttribute('value', iregexp.checked ? 'iregexp' : 'regexp');
	!IE ? input.setAttribute('name', 'keys[' + key_count + '][type]') : '';

	td.appendChild(input);

	// delete
	var td = document.createElement('td');
	tr.appendChild(td);

	var url = document.createElement('a');
	url.setAttribute('href', 'javascript: if(confirm("' + locale['S_DELETE_KEYWORD_Q'] + '")) remove_keyword("keytr' + key_count + '");');
	url.setAttribute(classattr, 'action');
	url.appendChild(document.createTextNode(locale['S_DELETE']));

	td.appendChild(url);

	key_count++;
	expr.value = '';
}

function add_keyword_and() {
	add_keyword('and');
}

function add_keyword_or() {
	add_keyword('or');
}

function getIdFromNodeKeyId(id) {
	if (typeof(id) == 'string') {
		var reg = /keytr([0-9])/i;
		id = parseInt(id.replace(reg, '$1'));
	}
	if (typeof(id) == 'number') {
		return id;
	}
	return null;
}

function remove_keyword(key_id) {
	var key_tr = document.getElementById(key_id);
	var id = getIdFromNodeKeyId(key_id);
	if (is_number(id)) {
		var elm_v = document.getElementsByName('keys[' + id + '][value]')[0];
		var elm_t = document.getElementsByName('keys[' + id + '][type]')[0];

		if (typeof(elm_v) == 'undefined') {
			elm_v.parentNode.removeChild(elm_v);
		}
		if (typeof(elm_t) == 'undefined') {
			elm_t.parentNode.removeChild(elm_t);
		}
	}
	if (typeof(key_tr) != 'undefined') {
		key_tr.parentNode.removeChild(key_tr);
	}

	var lp;
	var bData = false;
	for (lp = 0; lp < key_count; lp++) {
		var elm_v = document.getElementsByName('keys[' + lp + '][value]')[0];
		if (typeof(elm_v) != 'undefined') {
			bData = true;
		}
	}
	if (!bData) {
		var bt_and = document.getElementById('add_key_and');
		var bt_or = document.getElementById('add_key_or');
		if (typeof(bt_and) != 'undefined') {
			bt_and.disabled = false;
		}
		if (typeof(bt_or) != 'undefined') {
			bt_or.disabled = false;
		}
	}
}

function check_target(e) {
	var targets = document.getElementsByName('expr_target_single');
	for (var i = 0; i < targets.length; ++i) {
		targets[i].checked = targets[i] == e;
	}
}

function delete_expression(expr_id) {
	document.getElementsByName('remove_expression')[0].value = expr_id;
}

function copy_expression(id) {
	var expr_temp = document.getElementsByName('expr_temp')[0];
	if (expr_temp.value.length > 0 && !confirm(t('Do you wish to replace the conditional expression?'))) {
		return null;
	}

	var src = document.getElementById(id);
	if (typeof src.textContent != 'undefined') {
		expr_temp.value = src.textContent;
	}
	else {
		expr_temp.value = src.innerText;
	}
}

/*
 * Graph related stuff
 */
var graphs = {
	graphtype : 0,

	submit : function(obj) {
		if (obj.name == 'graphtype') {
			if ((obj.selectedIndex > 1 && this.graphtype < 2) || (obj.selectedIndex < 2 && this.graphtype > 1)) {
				var refr = document.getElementsByName('form_refresh');
				refr[0].value = 0;
			}
		}
		document.getElementsByName('frm_graph')[0].submit();
	}
};

function cloneRow(elementid, count) {
	if (typeof(cloneRow.count) == 'undefined') {
		cloneRow.count = count;
	}
	cloneRow.count++;

	var tpl = new Template($(elementid).cloneNode(true).wrap('div').innerHTML);

	var emptyEntry = tpl.evaluate({'id' : cloneRow.count});

	var newEntry = $(elementid).insert({'before' : emptyEntry}).previousSibling;

	$(newEntry).descendants().each(function(e) {
		e.removeAttribute('disabled');
	});
	newEntry.setAttribute('id', 'entry_' + cloneRow.count);
	newEntry.style.display = '';
}

function testUserSound(idx) {
	var sound = $(idx).options[$(idx).selectedIndex].value;
	var repeat = $('messages_sounds.repeat').options[$('messages_sounds.repeat').selectedIndex].value;

	if (repeat == 1) {
		AudioControl.playOnce(sound);
	}
	else if (repeat > 1) {
		AudioControl.playLoop(sound, repeat);
	}
	else {
		AudioControl.playLoop(sound, $('messages_timeout').value);
	}
}

function removeObjectById(id) {
	var obj = document.getElementById(id);
	if (obj != null && typeof(obj) == 'object') {
		obj.parentNode.removeChild(obj);
	}
}

/**
 * Converts all HTML entities into the corresponding symbols.
 */
jQuery.unescapeHtml = function(html) {
	return jQuery('<div />').html(html).text();
}

/**
 * Converts all HTML symbols into HTML entities.
 */
jQuery.escapeHtml = function(html) {
	return jQuery('<div />').text(html).html();
}

function validateNumericBox(obj, allowempty, allownegative) {
	if (obj != null) {
		if (allowempty) {
			if (obj.value.length == 0 || obj.value == null) {
				obj.value = '';
			}
			else {
				if (isNaN(parseInt(obj.value, 10))) {
					obj.value = 0;
				}
				else {
					obj.value = parseInt(obj.value, 10);
				}
			}
		}
		else {
			if (isNaN(parseInt(obj.value, 10))) {
				obj.value = 0;
			}
			else {
				obj.value = parseInt(obj.value, 10);
			}
		}
	}
	if (!allownegative) {
		if (obj.value < 0) {
			obj.value = obj.value * -1;
		}
	}
}

/**
 * Translates the given string.
 *
 * @param {String} str
 */
function t(str) {
	return (!!locale[str]) ? locale[str] : str;
}

/**
 * Generates unique id with prefix 'new'.
 * id starts from 0 in each JS session.
 *
 * @return string
 */
function getUniqueId() {
	if (typeof getUniqueId.id === 'undefined') {
		getUniqueId.id = 0;
	}

	return 'new' + (getUniqueId.id++).toString();
}

/**
 * Color palette, (implementation from PHP)
 */
var prevColor = {'color': 0, 'gradient': 0};

function incrementNextColor() {
	prevColor['color']++;
	if (prevColor['color'] == 7) {
		prevColor['color'] = 0;

		prevColor['gradient']++;
		if (prevColor['gradient'] == 3) {
			prevColor['gradient'] = 0;
		}
	}
}

function getNextColor(paletteType) {
	var palette, gradient, hexColor, r, g, b;

	switch (paletteType) {
		case 1:
			palette = [200, 150, 255, 100, 50, 0];
			break;
		case 2:
			palette = [100, 50, 200, 150, 250, 0];
			break;
		case 0:
		default:
			palette = [255, 200, 150, 100, 50, 0];
			break;
	}

	gradient = palette[prevColor['gradient']];
	r = (100 < gradient) ? 0 : 255;
	g = r;
	b = r;

	switch (prevColor['color']) {
		case 0:
			r = gradient;
			break;
		case 1:
			g = gradient;
			break;
		case 2:
			b = gradient;
			break;
		case 3:
			b = gradient;
			r = b;
			break;
		case 4:
			b = gradient;
			g = b;
			break;
		case 5:
			g = gradient;
			r = g;
			break;
		case 6:
			b = gradient;
			g = b;
			r = b;
			break;
	}

	incrementNextColor();

	hexColor = ('0' + parseInt(r, 10).toString(16)).slice(-2)
				+ ('0' + parseInt(g, 10).toString(16)).slice(-2)
				+ ('0' + parseInt(b, 10).toString(16)).slice(-2);

	return hexColor.toUpperCase();
}

/**
 * Used for php ctweenbox object.
 * Moves item from 'from' select to 'to' select and adds or removes hidden fields to 'formname' for posting data.
 * Moving perserves alphabetical order.
 *
 * @formname string	form name where hidden fields will be added
 * @objname string	unique name for hidden field naming
 * @from string		from select id
 * @to string		to select id
 * @action string	action to perform with hidden field
 *
 * @return true
 */
function moveListBoxSelectedItem(formname, objname, from, to, action) {
	to = jQuery('#' + to);

	jQuery('#' + from).find('option:selected').each(function(i, fromel) {
		var notApp = true;
		to.find('option').each(function(j, toel) {
			if (toel.innerHTML.toLowerCase() > fromel.innerHTML.toLowerCase()) {
				jQuery(toel).before(fromel);
				notApp = false;
				return false;
			}
		});
		if (notApp) {
			to.append(fromel);
		}
		fromel = jQuery(fromel);
		if (action.toLowerCase() == 'add') {
			jQuery(document.forms[formname]).append("<input name='" + objname + '[' + fromel.val() + ']'
				+ "' id='" + objname + '_' + fromel.val() + "' value='" + fromel.val() + "' type='hidden'>");
		}
		else if (action.toLowerCase() == 'rmv') {
			jQuery('#' + objname + '_' + fromel.val()).remove();
		}
	});

	return true;
}

/**
 * Returns the number of properties of an object.
 *
 * @param obj
 *
 * @return int
 */
function objectSize(obj) {
	var size = 0, key;

	for (key in obj) {
		if (obj.hasOwnProperty(key)) {
			size++;
		}
	}

	return size;
}

/**
 * Replace placeholders like %<number>$s with arguments.
 * Can be used like usual sprintf but only for %<number>$s placeholders.
 *
 * @param string
 *
 * @return string
 */
function sprintf(string) {
	var placeHolders,
		position,
		replace;

	if (typeof string !== 'string') {
		throw Error('Invalid input type. String required, got ' + typeof string);
	}

	placeHolders = string.match(/%\d\$s/g);
	for (var l = placeHolders.length - 1; l >= 0; l--) {
		position = placeHolders[l][1];
		replace = arguments[position];

		if (typeof replace === 'undefined') {
			throw Error('Placeholder for non-existing parameter');
		}

		string = string.replace(placeHolders[l], replace)
	}

	return string;
}

/**
 * Optimization:
 *
 * 86400 = 24 * 60 * 60
 * 31536000 = 365 * 86400
 * 2592000 = 30 * 86400
 * 604800 = 7 * 86400
 *
 * @param int  timestamp
 * @param bool isTsDouble
 * @param bool isExtend
 *
 * @return string
 */
function formatTimestamp(timestamp, isTsDouble, isExtend) {
	timestamp = timestamp || 0;

	var years = 0,
		months = 0;

	if (isExtend) {
		years = parseInt(timestamp / 31536000);
		months = parseInt((timestamp - years * 31536000) / 2592000);
	}

	var days = parseInt((timestamp - years * 31536000 - months * 2592000) / 86400),
		hours = parseInt((timestamp - years * 31536000 - months * 2592000 - days * 86400) / 3600);

	// due to imprecise calculations it is possible that the remainder contains 12 whole months but no whole years
	if (months == 12) {
		years++;
		months = 0;
	}

	if (isTsDouble) {
		if (months.toString().length == 1) {
			months = '0' + months;
		}
		if (days.toString().length == 1) {
			days = '0' + days;
		}
		if (hours.toString().length == 1) {
			hours = '0' + hours;
		}
	}

	var str = (years == 0) ? '' : years + locale['S_YEAR_SHORT'] + ' ';
	str += (months == 0) ? '' : months + locale['S_MONTH_SHORT'] + ' ';
	str += (isExtend && isTsDouble)
		? days + locale['S_DAY_SHORT'] + ' '
		: ((days == 0) ? '' : days + locale['S_DAY_SHORT'] + ' ');
	str += (hours == 0) ? '' : hours + locale['S_HOUR_SHORT'] + ' ';

	return str;
}

/**
 * Splitting string using slashes with escape backslash support.
 *
 * @param string $path
 *
 * @return array
 */
function splitPath(path) {
	var items = [],
		s = '',
		escapes = '';

	for (var i = 0, size = path.length; i < size; i++) {
		if (path[i] === '/') {
			if (escapes === '') {
				items[items.length] = s;
				s = '';
			}
			else {
				if (escapes.length % 2 == 0) {
					s += stripslashes(escapes);
					items[items.length] = s;
					s = escapes = '';
				}
				else {
					s += stripslashes(escapes) + path[i];
					escapes = '';
				}
			}
		}
		else if (path[i] === '\\') {
			escapes += path[i];
		}
		else {
			s += stripslashes(escapes) + path[i];
			escapes = '';
		}
	}

	if (escapes !== '') {
		s += stripslashes(escapes);
	}

	items[items.length] = s;

	return items;
}

/**
 * Removing unescaped backslashes from string.
 * Analog of PHP stripslashes().
 *
 * @param string str
 *
 * @return string
 */
function stripslashes(str) {
	return str.replace(/\\(.?)/g, function(s, chars) {
		if (chars == '\\') {
			return '\\';
		}
		else if (chars == '') {
			return '';
		}
		else {
			return chars;
		}
	});
}

/**
 * Execute script.
 *
 * @param string hostId			host id
 * @param string scriptId		script id
 * @param string confirmation	confirmation text
 */
function executeScript(hostId, scriptId, confirmation) {
	var execute = function() {
		if (!empty(hostId)) {
			openWinCentered('scripts_exec.php?hostid=' + hostId + '&scriptid=' + scriptId, 'Tools', 560, 470,
				'titlebar=no, resizable=yes, scrollbars=yes, dialog=no'
			);
		}
	};

	if (confirmation.length > 0) {
		var scriptDialog = jQuery('#scriptDialog');

		if (scriptDialog.length == 0) {
			scriptDialog = jQuery('<div>', {
				id: 'scriptDialog',
				css: {
					display: 'none',
					'white-space': 'normal',
					'z-index': 1000
				}
			});

			jQuery('body').append(scriptDialog);
		}

		scriptDialog
			.text(confirmation)
			.dialog({
				buttons: [
					{text: t('Execute'), click: function() {
						jQuery(this).dialog('destroy');
						execute();
					}},
					{text: t('Cancel'), click: function() {
						jQuery(this).dialog('destroy');
					}}
				],
				draggable: false,
				modal: true,
				width: (scriptDialog.outerWidth() + 20 > 600) ? 600 : 'inherit',
				resizable: false,
				minWidth: 200,
				minHeight: 100,
				title: t('Execution confirmation'),
				close: function() {
					jQuery(this).dialog('destroy');
				}
			});

		if (empty(hostId)) {
			jQuery('.ui-dialog-buttonset button:first').prop('disabled', true).addClass('ui-state-disabled');
			jQuery('.ui-dialog-buttonset button:last').addClass('main').focus();
		}
		else {
			jQuery('.ui-dialog-buttonset button:first').addClass('main');
		}
	}
	else {
		execute();
	}
}

/**
 * Makes all elements which are not supported for printing view to disappear by including css file.
 *
 * @param bool show
 */
function printLess(show) {
	if (!jQuery('#printLess').length) {
		jQuery('<link rel="stylesheet" type="text/css" id="printLess">')
			.appendTo('head')
			.attr('href', './styles/print.css');

		jQuery('.header_l.left, .header_r.right').each(function(i, obj) {
			if (jQuery(this).find('input, form, select, .menu_icon').length) {
				jQuery(this).addClass('hide-all-children');
			}
		});

		jQuery('body')
			.prepend('<div class="printless">&laquo;BACK</div>')
			.click(function() {
				printLess(false);
			});
	}

	jQuery('#printLess').prop('disabled', !show);
}

/**
 * Display jQuery model window.
 *
 * @param string title					modal window title
 * @param string text					window message
 * @param array  buttons				window buttons
 * @param array  buttons[]['text']		button text
 * @param object buttons[]['click']		button click action
 */
function showModalWindow(title, text, buttons) {
	var modalWindow = jQuery('#modalWindow');

	if (modalWindow.length == 0) {
		modalWindow = jQuery('<div>', {
			id: 'modalWindow',
			css: {
				padding: '10px',
				display: 'none',
				'white-space': 'normal',
				'z-index': 1000
			}
		});

		jQuery('body').append(modalWindow);
	}

	modalWindow
		.text(text)
		.dialog({
			title: title,
			buttons: buttons,
			draggable: true,
			modal: true,
			resizable: false,
			width: 'inherit',
			minWidth: 200,
			minHeight: 120,
			close: function() {
				jQuery(this).dialog('destroy');
			}
		});
}

/**
 * Disable setup step button.
 *
 * @param string buttonId
 */
function disableSetupStepButton(buttonId) {
	jQuery(buttonId)
		.addClass('ui-state-disabled')
		.addClass('ui-button-disabled')
		.attr('disabled', 'disabled')
		.attr('aria-disabled', 'true');

	jQuery('.info_bar .ok').remove();
}
