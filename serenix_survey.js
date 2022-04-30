

(function(root, name, factory) {
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([name], factory);
	} else {
		root[name] = factory();
	}
	
})(this, 'Survey', function() {	

	var Box, doc = document;
	var $el = function(tag) {
		return doc.createElement(tag);
	};
	if (typeof CssBoxModel !== "undefined") {
		Box = CssBoxModel;
	}
	
	function indexOf(values, v, field) {
		if (typeof field === 'string') {
			field = [field];
		}
		var j = 0, n = values.length, k, count = field.length;
		for (;j<n;j++) {
			for (k = 0;k< count;k++) {
				if (values[j][field[k]] === v) return j;
			}
		}
		return -1;
	}

	/**
	 * 
	 * @param {Object} [opts]
	 * @param {Boolean} [_build=true]
	 * @class Survey
	 */
	function Survey(opts, _build) {
		if (!(this instanceof Survey)) {
			if (arguments.length === 1) {
				return new Survey(o, _build);
			}
			if (arguments.length) {
				return new Survey(o);
			}
			return new Survey();
		}
		var self = this;
		this.__editable_ = true;
		this.__disabled_ = false;
		this.__valueType_ = "object";
		this.__optionsType_ = "radios";
		if (arguments.length) {
			if (arguments.length === 1) _build = true;
			
			this.set(opts);
			
			if (_build) {
				this.build();
			}
		}
	}
	
	
	var p = Survey.prototype = new BaseSurvey();
	
	Survey.__CLASS__ = p.__CLASS__ = Survey;
	
	Survey.__CLASS_NAME__ = p.__CLASS_NAME__ = "Survey";
	/**
	 *
	 */
	p.set = function(opts) {
		var self = this;
		var values = opts.values||opts.choices;
		var data = opts.questions||opts.data||opts.items, answers;
		if (isPlainObj(values)) {
			if (opts.optionsType !== 'fields') {
				throw new Error("Incorrect values");
			}
		} else if (values && !isArray(values)) {				
			throw new Error("Incorrect values");
		}		
		if (values) setValues(values, this);
		if (isArray(data)) {
			this.__data_ = new QuestionsList(data);
			this.__questions_ = data;
		} else if (data instanceof Questions) {
			this.__data_ = data;
		} else if (isPlainObj(data)) {
			var items = data.questions||data.items;
			if (isArray(items)) {
				this.__data_ = new QuestionsList(items);	
				this.__questions_ = this.__data_.getItems();
			} else {
				this.__data_ = new QuestionsData(data);	
			}		
		}
		this.__multiSelectDelim_ = opts.multiSelectDelim||opts.multiselectDelim;
		this.__answers_ = opts.answers||opts.object||opts.properties;
		this.__name_ = opts.name;
		this.__label_ = opts.label||opts.caption||opts.title;
		this.__id_ = opts.id;
		this.__itemLabelField_ = opts.itemLabelField||opts.itemCaptionField||opts.itemTextField;
		this.__itemNameField_ = opts.itemNameField;
		this.__entryNameField_ = opts.entryNameField;
		this.__entryValueField_ = opts.entryValueField;
		this.__defaultValue_ = opts.defaultValue;
		this.__headNameLabel_ = opts.headNameLabel||opts.headLabel;
		this.__headValueLabel_ = opts.headValueLabel;
		this.__help_ = opts.help||opts.explanation||opts.explain||opts.description;
		if (opts.chooseText == undefined) {
			this.setChooseText(opts.selectText);
		} else this.setChooseText(opts.chooseText);
		
		var v = opts.type||"", match, prop;
		
		if ((match = /(matrix|grid)[ -]?dynamic/.exec(v))) {
			this.dynamic = true;
			this.__bodyLayout_ = "grid";
		} else if (/matrix|grid/.exec(v)) {
			this.dynamic = false;
			this.__bodyLayout_ = opts.bodyLayout||"grid";
		} else if (v === 'dynamic') {
			this.dynamic = true;
			this.__bodyLayout_ = opts.bodyLayout||"grid";
		}
		
		v = opts.requiredQuestions||opts.requiredItems||opts.requiredChoices;
		
		if (isArray(v)) {
			this.__requiredQuestions__ = v;
		}
		
		this.__addRowText_ = opts.addRowText||opts.addRowLabel||opts.addRowCaption;
		
		this.__removeRowText_ = opts.removeRowText||opts.deleteRowText||opts.delRowText;
		
		this.__removeRowsText_ = opts.removeRowsText||opts.deleteRowsText||opts.delRowsText;
		
		v = opts.valueType;
		if (v) {
			this.setValueType(v);
		} else if (opts.entryNameField||opts.entryValueField) {
			this.__valueType_ = "entries";
		}
		this.__indexedValue_ = toBool(opts.indexedValue);
		v = (opts.optionsType||opts.optionsUIType||"radios").replace(/[ \t_-]/g, "").toLowerCase();
		if (/combo|select/.test(v)) {
			this.__optionsType_ = "combo";
		} else if (/check/.test(v)) {
			this.__optionsType_ = "checklist";
		} else if (/rating|star/.test(v)) {
			this.__optionsType_ = "checklist";
		} else if (/multiselect/.test(v)) {
			this.__optionsType_ = "multiselect";
		} else if (/fields/.test(v)) {
			this.__optionsType_ = "fields";
		} else if (v) {
			this.__optionsType_ = v;
		} //, "rating", "stars", "checklist"
		
		this.setMaxQuestions(opts.maxQuestions||opts.maxRows||opts.maxItems);
		this.setMinQuestions(opts.minQuestions||opts.minRows||opts.minItems);
		
		this.__withNumber_ = opts.withNumber == undefined ? opts.numbering === undefined ? opts.numbered : opts.numbering : opts.withNumber;
		
		
		
		v = opts.selectionType||opts.selection;
		if (v instanceof String) v = v.valueOf();
		if (v == undefined) {
			
		} else if ( v && typeof v === 'string') {
			if (/multi(?:[ -]?select|ple)/.test(v = v.toLowerCase())) {
				this.__selectionMode_ = "multiple";
			} else if (/^no(?:ne)?$/.test(v)) {
				this.__selectionMode_ = "none";
			} else if (/check/.test(v)) {
				this.__selectionMode_ = opts.selectionMode||"multiple";
				this.__selectionType_ = "ckeckbox";
			} else if (/radio/.test(v)) {
				this.__selectionMode_ = "single";
				this.__selectionType_ = "radio";
			} else {
				this.__selectionMode_ = opts.selectionMode||"single";
				this.__selectionType_ = "row";
			}
		} else if (v) {
			this.__selectionMode_ = opts.selectionMode||"single";
			this.__selectionType_ = "row";
		} else if (!v) {
			this.__selectionMode_ = "none";
			this.__selectionType_ = "row";
		}
		
		v = opts.columns;
		var values, reqs;
		if (isArray(v)) {
			if (v.length == 2) {
				v.forEach(function(col, i) {
					if (i) { //i > 0
						prop = col.cellType||col.fieldType||col.inputType||col.optionsType||col.optionsUIType||col.optionsUiType||col.cellsType;
						if (prop != undefined) {
							self.__optionsType_ = prop;
						}
						prop = col.label||col.caption||col.title;
						self.__headValueLabel_ = prop||col.name;
						values = col.choices||col.values||col.dataList||col.enum;
						if (isArray(values)) {
							
						}
						self.__values_ = values;
						prop = col.isRequired;
						if (prop == undefined) {
							prop = col.required;
							if (prop == undefined) {
								prop = col.valueRequired;
							}
						}
						if (prop == undefined) {
							required = true;
						} else {
							required = !!prop;
						}
						self.__valueRequired_ = required;
						self.__valueField_ = col.fieldName||col.field;
					} else  {
						values = col.choices||col.questions||col.items;
						if (isArray(values)) {
							if (typeof values[0] === 'string') {
								values.forEach(function(q, i) {
									values[i] = { name: q, label: q};
								});
							}
							self.__data_ = new QuestionsList(self.__questions_ = values);
						} else if (isPlainObj(prop)) {
							throw new Error("Not yet supported");
						}
						prop = reqs = col.requiredChoices||col.requiredQuestions||col.requiredItems;
						if (isArray(prop)) {
							if (typeof prop[0] === 'string') {
								if (isPlainObj(values[0])) {
									reqs = [];
									prop.forEach(function(r) {
										i = indexOf(values, r, ['name', 'label']);
										if (i >= 0) {
											values[i].required = true;
											reqs.push(values[i]);
										}
									});
								}
							}
						} else if (isPlainObj(prop)) {
							throw new Error("Not yet supported");
						} else if (reqs) {
							throw new Error("Incorrect required choices/questions");
						}
						self.__requiredQuestions__ = reqs;
						
						
						
						prop = col.cellType;
						
						prop = col.label||col.caption||col.title;
						self.__headNameLabel_ = prop||col.name;
						self.__nameField_ = col.fieldName||col.field;
					}
				});
			} else {
				v.forEach(function(col, i) {
					if (i) { //i > 0
						
					} else  {
						
					}
				});
			}
		}
		this.__built__ = false;
		return this;
	};

	function strVal(item) {
		var v = item.value;
		if (v === undefined) v = item;
		if (['string', 'number', 'boolean'].indexOf(typeof v) >= 0)
			return "" + v;
		if (typeof v.stringValue === 'function')
			return v.stringValue();
		return v.toString();
	}
	
	function set(el, label) {
		el.innerHTML = typeof label === 'string' ? escapeHTML(label) : 
			label == undefined ? "" : 
			typeof label.html === 'string' ? label.html : 
			typeof label.html === 'boolean' ? (label.html ? label.text : escapeHTML(label.text)) :
			typeof label.htmlText === 'string' ? label.htmlText : 
			escapeHTML(label.text);
	}
	
	function buildHead(label, values, self) {
		var thead = $el("thead");
		var tr = $el("tr");
		var th = $el("th");	
		
		set(th, label);
		addCssClass(th, "");
		tr.appendChild(th);
		if (["combo", "dropdown", "multiselect", "rating", "starts"].indexOf(self.__optionsType_) >= 0) {
			label = self.__headValueLabel_||"Value";
			th = $el("th");
			set(th, label);
		} else {
			if (isPlainObj(values)) {
				var fields = values.fields||values.inputs||values.options||values.elements||values.components;
				var choices = values.choices||values.values||values.dataList||values.enumeration||values.enum;
				var _fields = [];
				var type, fld;
				fields.forEach(function(field, j) {				
					if (typeof field === 'string') {
						fld = {
							name: field,
							type: choices ? 'select' : 'text',
							choices: choices
						};
					} else if (isArray(field)) {
						type = field[1] ? field[1] : choices ? 'select' : 'text';
						if (type === 'combo' || type === 'combobox') {
							type = 'select';
						}
						fld = {
							name: field[0],
							type: type,
							defaultValue: field[2],
							choices: type === 'select' ? field[3]||choices : undefined
						};
					} else if (isPlainObj(field)) {
						fld = field;
					} else {
						throw new Error("Incorrect field metadata");
					}
					_fields.push(fld);
				});
				self.__fields__ = values = _fields;
			}
			values.forEach(function(v) {
				label = v.label||v.caption||v.caption||v.name||("" + v.value)
				th = $el("th");
				set(th, label);
				th.setAttribute("class", "option-value");
				tr.appendChild(th);
			});		
		}
		tr.appendChild(th);
		if (self.dynamic) {
			label = self.actionLabel||self.actionCaption||self.actionTitle||"Action";
			th = $el("th");
			set(th, label);
			th.setAttribute("class", "action");
			tr.appendChild(th);
		}
		thead.appendChild(tr);
		
		return thead;
	}
	/**
	 * <h3>Radio group virtual component</h3>
	 * <p>This radio group virtual component helps to manage focus of the radio input cell elements of a table/grid row.</p>
	 * @class Survey.Radios
	 */
	function Radios() {
		this.options = this.radios = [];
	}
	
	Survey.Radios = Radios;
	
	Radios.__CLASS__ = Radios.prototype.__CLASS__ = Radios;
	Radios.__CLASS_NAME__ = Radios.prototype.__CLASS_NAME__ = "Radios";
	/**
	 * 
	 * Gives the focus to the checked radio if there is a checked radio buttob. Otherwise, gives the focus to the first radio button.
	 * @return {Survey.Radios}
	 */
	Radios.prototype.focus = function() {
		this.options.forEach(function(o) {
			if (o.checked) {
				o.focus();
				return this;
			}
		});
		if (this.options.length) this.options[0].focus();
		return this;
	};
	
	Radios.prototype.getCheckedButton = function() {
		this.options.forEach(function(o) {
			if (o.checked) {
				return o;
			}
		});
	};
	
	Radios.prototype.getCheckedOption = Radios.prototype.getCheckedButton;
	
	var addValueRadioCells = Survey.addValueRadioCells||(Survey.addValueRadioCells = function (q, values, tr, self, answers, nameField, compare) {
		//create the radio buttons group virtual component
		var rg = new Radios();
		var defaultVal = q.defaultValue === undefined ? self.defaultValue : q.defaultValue;
		var td, n = values.length;
		var group = q.groupName||q.name;
		var inputs = self.__inputs__||(self.__inputs__ = []);
		if (!group) {
			groupKey = groupKey||("" + (self.name||self.id||"__question" + new Date().getTime() + "-"));
			group = groupKey + (i + 1);
		}
		
		for (j=0; j< n; j++) {
			td = $el("td");
			td.question = q;
			td.setAttribute("class", "question-option fixed-width");
			inputs.push(input = $el("input"));
			input.type = "radio";
			//append the radio button to the radio buttons group virtual component
			rg.options.push(input);
			val = values[j];
			v = answers[nameField ? q[nameField] : q.name];
			if (v == undefined && defaultVal != undefined) {
				v = typeof defaultVal !== 'string' ? strVal(defaultVal) : defaultVal;
			}
			input.checked = compare(['string', 'number', 'booleans'].indexOf(typeof val) >= 0 ? val : val.value, v) === 0;
			input.value = strVal(val);
			input.valueObj = val;
			input.survey = self;
			input.name = group;
			input.radioGroup = rg;
			td.appendChild(input);
			tr.appendChild(td);
		}
		self.__$$focusableInputs$$__.push(rg);
		if (tr.__$$focusableInputs$$__) tr.__$$focusableInputs$$__.push(rg);
	});
	
	var addMultiSelect = Survey.addMultiSelect||(Survey.addMultiSelect = function (q, values, listItem, self, answers, nameField, compare) {
		var MS, el;
		if (typeof SereniX === 'undefined' || !((MS = SereniX.MultiSelect) || (typeof SereniX.ui !== 'undefined' || (MS=SereniX.ui.MultiSelect)))) {
			if (typeof MultiSelect === 'undefined') {
				throw new Error("Not yet supported");
			} else {
				MS = MultiSelect;
			}
		}
		var ms = {
			items: values,
			selections: answers[nameField ? q[nameField] : q.name]
		}
		ms.options = ms.items;
		ms.value = ms.selections;
		ms = new MS(ms);
		el = ms.getElement();
		ms.question = el.question = q;
		if ((listItem.tagName||listItem.nodeName).toLowerCase() === 'tr') {
			td = $el("td");
			td.setAttribute("class", "question-option fixed-width");
			td.question = q;
			td.appendChild(el);
			el = td;
		}
		listItem.appendChild(el);
	})
	
	var addCombo = Survey.addCombo||(Survey.addCombo=function(q, values, listItem, self, answers, nameField, compare) {
		var defaultVal = q.defaultValue === undefined ? self.defaultValue : q.defaultValue;
		var el, td, j, cmb, opt, sval, n = values.length, textField = self.__itemLabelField_||"label";
		cmb = $el("select");
		cmb.question = q;
		if ((listItem.tagName||listItem.nodeName).toLowerCase() === 'tr') {
			el = td = $el("td");
			td.setAttribute("class", "question-option fixed-width");
			td.question = q;
		} else {
			el = cmb;
		}
		opt = $el("option");
		opt.innerHTML = "Choose ...";
		opt.undefinedValue = true;
		cmb.appendChild(opt);
		cmb.question = q;
		td.appendChild(cmb);
		for (j=0; j< n; j++) {			
			opt = $el("option");
			val = values[j];
			v = answers[nameField ? q[nameField] : q.name];
			if (v == undefined && defaultVal != undefined) {
				v = typeof defaultVal !== 'string' ? strVal(defaultVal) : defaultVal;
			}
			opt.selected = compare(['string', 'number', 'booleans'].indexOf(typeof val) >= 0 ? val : val.value, v) === 0;
			sval=strVal(val);
			set(opt, typeof val === 'string' ? val : val[textField]);
			opt.value = sval;
			opt.valueObj = val;
			cmb.appendChild(opt);			
		}
		listItem.appendChild(el);
		self.__$$focusableInputs$$__.push(cmb);
		if (listItem.__$$focusableInputs$$__) listItem.__$$focusableInputs$$__.push(cmb);
	});
	
	function setChecked(input, v, booleans) {
		if (booleans.isTrueValue && booleans.isFalseValue) {
			input.checked = equals(booleans.trueValue, v) ? true : 
				equals(booleans.falseValue, v) ? false : (function() { throw new Error("Incorrect value"); })();
		} else if (booleans.isTrueValue) {
			input.checked = equals(booleans.trueValue, v);
		} else if (booleans.isFalseValue) {
			input.checked = !equals(booleans.falseValue, v);
		} else {
			input.checked = toBool(v);
		}
	}
	
	var addDropdown = Survey.addDropdown||(Survey.addDropdown = addCombo);
	
	var addCheckList = Survey.addCheckList||(Survey.addCheckList = function (q, values, tr, self, answers, nameField, compare) {
		var td, n = values.length;
		var qa = v = answers[nameField ? q[nameField] : q.name];
		var inputs = self.__inputs__||(self.__inputs__ = []);
		var focusables = self.__$$focusableInputs$$__;
		var rFocusables = tr.__$$focusableInputs$$__;
		var booleans = {};
		setBooleans(q, booleans, self);
		for (j=0; j< n; j++) {
			td = $el("td");
			td.setAttribute("class", "question-option fixed-width");
			td.question = q;
			inputs.push(input = $el("input"));
			input.type = "checkbox";
			input.td = td;
			focusables.push(input);
			rFocusables.push(input);
			val = values[j];
			v = qa ? qa[val.fieldName||val.field||val.name||val.value] : booleans.falseValue;
			setChecked(input, v, booleans);
			input.value = strVal(v);
			input.valueObj =  v;
			td.appendChild(input);
			tr.appendChild(td);
		}
	});
	function setInput(input, field, qa, self) {
		var opt, opts, i, n, v, 
			b, 
			//object with fields 'trueValue' and 'falseValue'
			//useful for checkbox input
			booleans 
			;
		var fieldName = typeof field === 'string' ? field : field.fieldName||field.field||field.name||field.property;
		if (qa instanceof Survey) {
			v = qa;
			qa = self;
			self = v;
		}
		input.type = type = field.inputType||field.type||"text";
		if (/checkbox/.test(type)) {
			v = qa ? qa[fieldName] : false;
			if (field.booleans) booleans = field.booleans;
			else setBooleans(field, booleans = {}, self);			
			setChecked(input, v, booleans);
			input.valueObj = input.checked ? booleans.trueValue : booleans.falseValue;
		} else if (type === 'radio') {
			//TODO
		} else if (type === 'combo' || type === 'combobox' || type === 'select') {
			if (qa) {
				v = qa[fieldName];
				opts = input.children;
				for (i=0, n = opts.length; i < n; i++) {
					opt = opts[i];
					if (opt.valueObj === v) {
						opt.selected = true;
					}
				}
			}
		} else if (type === 'rating' || type === 'stars') {
			//TODO
		} else if (type === 'multiselect') {
			//TODO
		} else if (type === 'toogle') {
			//TODO
		} else {
			v = qa ? qa[fieldName] : "";
			input.value = strVal(v);					
		}
		
		if (field.step) {
			input.step = field.step;
		}
		if (field.min != undefined) {
			input.min = field.min;
		}
		
		if (field.max != undefined) {
			input.max = field.max;
		}
		
		if (field.pattern) {
			input.pattern = pattern;
		}
		return input;
	}
	
	
	var addFields = Survey.addFields||(Survey.addFields = function (q, values, tr, self, answers, nameField, compare) {
		function addField(field) {
			td = $el('td');
			td.setAttribute("class", "question-option fixed-width");
			td.question = q;
			v = answers[nameField ? q[nameField] : q.name];
			if (v != undefined) {
				v = v[field.name];
			} else {
				v = undefined;
			}
			focusables.push(input = createFieldInput(field, v));
			tr.__$$focusableInputs$$__.push(input);
			td.appendChild(input);
			qInputs.push(td.fieldInput = input);
			inputs.push(input);
			tr.appendChild(td);
			tr.inputs = qInputs;
		}
		var fieldFactory = self.fieldFactory;
		var focusables = self.__$$focusableInputs$$__;
		var createFieldInput = typeof fieldFactory === 'object' ? function(field, val) {
			return fieldFactory.create(field);
		}	: typeof fieldFactory === 'function' ? function (field, val) {
			return fieldFactory(field, val) 
		} : typeof AField === 'function' ? function(field, val) {
			var f = field instanceof AField ? f : AField.getInstance(field);
			var e = f.getElement();
			if (val !== undefined) f.setValue(val);
			return e;
		} : function(field) {
			var type = field.inputType||field.type||'text';
			var el, values, opt, labelField = self.labelField||"label", valueField = self.valueField||"value";
			if (type === 'combo' || type === 'combobox' || type === 'select' || type === 'dropdown') {
				values = field.values||field.options||field.choices||field.enum||field.enumeration||field.dataList||field.datalist;
				el = $el("select");
				opt = $el("option");
				opt.undefinedValue = true;
				opt.placeholder = true;
				opt.innerHTML = field.chooseText === "" || field.chooseText === false ? "" : 
					(field.chooseText||field.placeholder||(self.chooseText === "" ? "" : 
					self.chooseText === "" ? "" : self.chooseText||"Choose ..."));
				el.appendChild(opt);
				values.forEach(function(v) {
					opt = $el("option");
					if (["string", "number", "boolean"].indexOf(typeof v) >= 0) {
						opt.value = "" + v;
						opt.innerHTML = escapeHTML("" + v);
					} else if(isPlainObj(v)){
						opt.value = "" + v[valueField];
						opt.innerHTML = escapeHTML("" + (v[labelField]||v[valueField]));
					} else if(isArray(v)){
						opt.innerHTML = escapeHTML("" + (v[0]||v[1]));
					} else {
						throw new Error("Incorrect select option value");
					}
					opt.valueObj = v;
					el.appendChild(opt);
				});
			} else if(/textarea/i.test(type)) {
				el = $el('textarea');
			} else {
				el = $el('input');
				if (/number|numeric|decimal/.test(type)) {
					el.type = "number";
				} else if (/integer|int/.test(type)) {
					el.type = "number"
				} else if (/check(?:box)?/i.test(type)) {
					el.type = field.type = "checkbox";
				} else if (/bool(?:ean)?/i.test(type)) {
					
				} else {
					el.type = type;
				}
			}
			setInput(el, field, self);
			el.md = field;
			return el;
		}
		var td, type;
		var v, input;
		var inputs = self.__inputs__||(self.__inputs__=[]);
		var qInputs = []
		if (isArray(values)) {
			values.forEach(function(field, j) {		
				addField(field);
			});
		} else {
			self.__fields__.forEach(function(field, j) {				
				addField(field);
			});
		}
	});
	
	function getQHtml(qs, textField) {
		var s = '<select><option value=""></option>';
		qs.forEach(function(q) {
			s += '<option value="">';
			label = textField ? q[textField] : q.text||q.question||q.label||q.caption||q.caption||q.name;
			s += typeof label.html == 'string' ? label.html : typeof label.htmlText == 'string' ? label.htmlText : label;
			s += '</option>';
		});
		s += "</select>";
		
		return s;
	}
	
	function setElt(el, q, label, cls) {
		el.innerHTML = typeof label.html == 'string' ? label.html : typeof label.htmlText == 'string' ? label.htmlText : label;
		el.setAttribute("class", cls||"question-text");
		el.question = q;
	}
	
	function populate(sel, qs, current) {
		var eq = typeof current === 'string' ? function(o1, o2) {
			return o1.name === o2 || o1.label === o2;
		} : function(o1, o2) {
			return o1 === o2;
		};
		sel.innerHTML = "";
		var el = $el('option'), textField;
		el.innerHTML = "Choose ...";
		el.undefinedValue = true;
		el.placeholder = true;
		sel.appendChild(el);
		delete sel.question;
		qs.forEach(function(o) {
			el = $el('option');
			el.question = o;
			setElt(el, o, textField ? o[textField] : o.text||o.question||o.label||o.caption||o.caption||o.name);
			if (eq(o, current)) {
				el.selected = true;
				sel.question = o;
			}
			sel.appendChild(el);
		});
	}
	function qIndexOf(quests, q) {
		var i, n = quests.length, x;
		if (typeof quests[0] === 'string') {
			for (i=0; i < n; i++) {
				x = quests[i];
				if (typeof q === 'string') {
					if (q === x) return i;
				} else {
					
				}
			}
		} else {
			for (i=0; i < n; i++) {
				x = quests[i];
				if (typeof q === 'string') {
					if (q === x.name || q === (x.label||x.text)) return i;
				} else {
					if (q.name === x.name || (q.label||q.text) === (x.label||x.text)) return i;
				}
			}
		}
		return -1;
	}
	function populateQuestCombo(cmb, survey, qText) {
		var start = (survey.getRequiredQuestions()||[]).length;
		var quests = Array.prototype.slice.call(survey.getOptionalQuestions()), quest,
			count = quests.length,
			k, ndx;
		var rows = Array.prototype.slice.call(survey.__$$rows$$__.children), tr, el, td, 
			n = rows.length, i, q, sVal;
		for (i=0;i<count;i++) {
			quest = quests[i];
			for (k=start;k<n;k++) {
				tr = rows[k];
				td = tr.children[0];
				el = td.childNodes[0];
				if ((el.tagName||el.nodeName).toLowerCase() === 'select') {
					if (q = getQuestion(el)) {
						if (el === cmb) {
							sVal = q;
						} else  {
							ndx = qIndexOf(quests, q);
							if (ndx >= 0) {
								quests.splice(ndx, 1);
								i--;
								count--;
							}
							
						}
					}							
				}
			}
		}
		populate(cmb, quests, sVal||qText);
	}
	function getQuestion(sel) {
		var opts = sel.children, n = opts.length, i;
		for (i=0; i < n; i++) {
			if (opts[i].selected) {
				return opts[i].question;
			}
		}
	}
	
	function addQ(q, i, values, textField, tbody, self, answers, nameField, compare, addValueCells, remove) {		
		var tr = $el("tr"), td, label, sel, el;
		tr.setAttribute("class", "question " + (i % 2 ? "even" : "odd"));
		tr.__$$focusableInputs$$__ = [];
		td = $el("td");
		if (isArray(q)) {
			addCssClass(td, 'question-text-combo');
			sel = $el('select');
			sel.survey = self;
			td.appendChild(sel);
			populate(sel, q);
			self.__$$focusableInputs$$__.push(sel);
			tr.__$$focusableInputs$$__.push(sel);
			addEvt('change', sel, function(ev) {
				var survey = this.survey;
				ev = ev||window.event;
				//this.parentNode.parentNode.question = 
			});
			addEvt('focus', sel, function(ev) {
				var survey = this.survey,
					sel = this;
				ev = ev||window.event;
				populateQuestCombo(sel, survey);			
			});
		} else {
			setElt(td, q, textField ? q[textField] : q.text||q.question||q.label||q.caption||q.caption||q.name||("Question " + (i + 1)));
			tr.question = q;
		}
		tr.appendChild(td);									
		addValueCells(q, values, tr, self, answers, nameField, compare);
		if (remove instanceof String || remove instanceof Boolean) remove = remove.valueOf();
		if (remove) {
			var btn;
			if (remove === true || remove === 'true' || remove === 1) {
				remove = {
					label: 'Remove'
				}
			} else if (typeof remove === 'string') {
				remove = {
					label: remove
				}
			} else {
				remove.label = remove.label||remove.caption||remove.title||remove.text||remove.name||"Remove";
			}
			btn = $el("span");
			btn.setAttribute("tabindex", "0");
			btn.tabIndex = 0;
			addCssClass(btn, "SereniX-button quest-remove");
			btn.innerHTML = escapeHTML(remove.label);
			btn.row = tr;
			btn.survey = self;
			function rm(ev) {
				var row = this.row, focusables;	
				var i, children = row.parentElement.children, n = children.length;
				var btn = this, ndx;
				var min = btn.survey.getMinQuestions(), sFocusables;
				if (typeof min !== 'number' || min < 0 || n > min) {
					for (i=0; i < n; i++) {
						if (children[i] === row) {
							break;
						}
					}
					
					focusables = btn.survey.__$$focusableInputs$$__;
					(row.__$$focusableInputs$$__||[]).forEach(function(e) {
						ndx = focusables.indexOf(e);
						if (ndx >= 0) focusables.splice(ndx, 1);
					});
					delete row.__$$focusableInputs$$__;
					
					row.parentElement.removeChild(row);
					n--;
					for (; i < n; i++) {
						if (i%2) {
							removeClass(children[i], "odd");
							addCssClass(children[i], "even");
						} else {
							removeClass(children[i], "even");
							addCssClass(children[i], "odd");
						}
					}
					removeEvt('click', btn, btn.removeOnClick);
					removeEvt('keydown', btn, btn.removeOnKey);
				} else {
					var plural = (min > 1 ? "s" : "");
					alert("Deletion impossible: at least " + min + " row" + plural + "/question" + plural + " expected");
				}
			}
			btn.removeOnClick = rm;
			addEvt('click', btn, rm);
			function onKey(ev) {
				var which;
				ev = ev||window.event;
				which = ev.which;
				if (which == undefined) {
					which = ev.keyCode;
				}
				if (which === 13) {
					preventDefault(ev);
					btn.removeOnClick.call(this, ev);
				}
			}
			btn.removeOnKey;
			addEvt('keydown', btn, onKey);
			td = $el("td");
			addCssClass(td, 'question-remove');
			td.appendChild(btn);
			tr.appendChild(td);
		} else if (self.dynamic) {
			td = $el("td");
			addCssClass(td, 'question-remove');
			tr.appendChild(td);
		}
		tbody.appendChild(tr);
	}
	
	function addStars(q, values, tr) {
		throw new Error("Not yet supported");
	}
	
	function getAddInlineValuesFunc(q, oTyp, inline) {
		
		oTyp = q.__optionsType_||q.__uiType_||q.optionsType||q.uiType||oTyp||"";
		if (arguments.length < 3) inline = true;
		var values = typeof q.getValues === 'function' ? q.getValues() : q.values;
		if (!oTyp && isArray(values)) {
			oTyp = "combo";
		}
		if (/^radio/i.test(oTyp)) {
			if (inline) {
				if (Survey.addInlineRadios) return Survey.addInlineRadios;
				return (Survey.addInlineRadios = function(q, values, tr, self, answers, nameField, compare) {
					
				});
			} else {
				if (Survey.addRadios) return Survey.addRadios;
				return (Survey.addRadios = function(q, values, tr, self, answers, nameField, compare) {
					
				});
			}
		} else if (/^check/i.test(oTyp)) {
			if (inline) {
				if (Survey.addInlineChecks) return Survey.addInlineChecks;
			} else {
				if (Survey.addChecks) return Survey.addChecks;
			}
			var addCheckList;
			function addChecks(q, values, tr, self, answers, nameField, compare) {
				var ul = $el('ul'), li, n = values.length, label, span;
				var qa = v = answers[nameField ? q[nameField] : q.name];
				var inputs = self.__inputs__||(self.__inputs__ = []);
				var booleans = {};
				setBooleans(q, booleans, self);
				ul.style.listStyleType = "none";
				if (addChecks.inline) addCssClass(ul, "inline-checklist");
				for (j=0; j< n; j++) {
					li = $el("li");
					li.setAttribute("class", "question-option fixed-width");
					li.question = q;
					span = $el("span");
					inputs.push(input = $el("input"));
					input.type = "checkbox";
					val = values[j];
					v = qa ? qa[val.fieldName||val.field||val.name||val.value] : false;
					setChecked(input, v, booleans);
					input.value = strVal(v);
					input.valueObj = v;
					span.appendChild(input);
					li.appendChild(span);
					ul.appendChild(li);
				}
				return ul;
			}
			addChecks.inline = inline;
			return inline ? (Survey.addInlineChecks = addChecks) : (Survey.addChecks = addChecks);
		} else if (/^(?:combo|select)/i.test(oTyp)) {
			return Survey.addCombo;
		} else if (/^(?:starts|rating)/i.test(oTyp)) {
			return Survey.addStars;
		} else if (/^dropdown/i.test(oTyp)) {
			return Survey.addDropdown;
		} else if (/^multi[ -]?select/i.test(oTyp)) {
			return Survey.addMultiSelect;
		} else if (/^fields/i.test(oTyp)) {
			
		}
	}
	

	function build(questions, self) {
		self.__$$focusableInputs$$__ = [];
		var _build = { 
			grid: function(el) {
				tbl = $el("table");
			
			
				tbl.appendChild(buildHead(label, values, self));
				
				var selected, input, group, j, n, v, sel, 
					textField = self.__itemLabelField_, 
					nameField = self.__itemNameField_;
				self.__$$rows$$__ = tbody = $el("tbody");
				n = values.length;
				//var inputs = self.__inputs__ = []; 
				var oTyp = self.__optionsType_||"radios";
				var addValueCells = oTyp === "radios" ? addValueRadioCells : 
						oTyp === "stars" || oTyp === "star" ? addStars : 
						oTyp === "checklist" ? addCheckList : 
						oTyp === "fields" ? addFields : 
						oTyp === "multiselect" || oTyp === "multi-select" ? addMultiSelect : 
						oTyp ===  "dropdown" ? addDropdown :
						addCombo;
						
				questions.forEach(function(q, i) {
					addQ(q, i, values, textField, tbody, self, answers, nameField, compare, addValueCells);				
				});
				tbl.appendChild(tbody);		
				el.appendChild(tbl);
				var rows = self.__$$rows$$__.children, n = rows.length, j, row, cells, k, len;
				for (j=0; j < n; j++) {
					row = rows[j];
					cells = row.children;
					len = cells.length;
					sel = false;
					for (k=1; k < len; k++) {
						w = cells[k].offsetWidth;
						cells[k].style.width = w + "px";				
					}
				}
				tbl.style.width = "100%";
			},
		
			'inline-list': function(el) {
				var item, nameEl, addInlineValues;	
                var list = document.createElement('div');	
				list.__$$focusableInputs$$__ = [];
				questions.forEach(function(q, i) {
					item = document.createElement('div');
					item.__$$focusableInputs$$__ = [];
					nameEl = document.createElement('span');
					item.appendChild(nameEl);
					getAddInlineValuesFunc(q, self.__optionsType_)(q, i, values, textField, list, self, answers, nameField, compare, addValueCells, item);				
				});
				el.appendChild(list);
			},
			
			list: function (el) {
				var list = document.createElement('div');
				var item, vEl, nameEl, addInlineValues;
				questions.forEach(function(q, i) {
					item = document.createElement('div');
					item.__$$focusableInputs$$__ = [];
					nameEl = document.createElement('div');
					item.appendChild(nameEl);
					vEl = document.createElement('div');
					getAddInlineValuesFunc(q, self.__optionsType_)(q, i, values, textField, list, self, answers, nameField, compare, addValueCells, vEl);
				    item.appendChild(vEl);
				});
				el.appendChild(list);
			}
		};
		_build.table = _build.grid;
		_build.inlineList = _build.inlinelist = _build.inline = _build['inline-list'];
		var compare = self.compare||(self.compare = function(a,b) { 
		    if (a === undefined) return b === undefined ? 0 : -1;
			if (b == undefined) return 1;
			if (a === null) return b === null ? 0 : -1;
			if (b == undefined) return 1;
			return a > b ? 1 : a < b ? -1 : 0;
		});
		var el, columns = [], col, tbl, tbody, tr, td, th;
		var values = self.getValues(),
			label = self.__headNameLabel_||(self.__optionsType_ === 'combo' ? "Name": ""), 
			answers = self.answers||self.object||{};
		if (el = self._element__) {
			el.innerHTML = "";
		} else if (this.__id_) {
			el = doc.getElementById(this.__id_);
			if (el) {
				el.innerHTML = "";
				if (self.container) self.container.appendChild(el);
				else self.container = el.parentElement;
			} else {
				self._element__ = el = $el("div");		
				(self.container||(self.container=doc.getElementsByTagName('body')[0])).appendChild(el);
				el.id = this.__id_;
			}
		} else {
			self._element__ = el = $el("div");		
			(self.container||(self.container=doc.getElementsByTagName('body')[0])).appendChild(el);		
		}
		addCssClass(el, "SereniX-survey");
		el.style.position = "relative";
		el.component = el.survey = self;
		
		var help = self.help||self.explanation||self.explain||self.description, helpDiv;
		if (help) {
			helpDiv = $el('div');
			helpDiv.setAttribute("class", "SereniX-survey-help");
			set(helpDiv, help);
			el.appendChild(helpDiv);
		}
		
		_build[this.__bodyLayout_||'grid'](el);
		if (self.dynamic) {
			var addBtn = createBtn("Add", self.__addRowText_||(self.__surveys_ ? self.__surveys_.__addRowText_ : "Add"), function(ev) {
				var survey = this.survey;
				addRow(survey);
			});
			addBtn.survey = self;
			self.addBtn = addBtn;
			addCssClass(addBtn, "SereniX-button");
			cmd = $el('div');
			cmd.style.position = "relative";
			cmd.appendChild(addBtn);
			addCssClass(cmd, "SereniX-command");
			el.appendChild(cmd);
		}
	}
	function addRow(survey, ignoreFocus, qText) {
		var surveys = survey.surveys||survey.__surveys_, remove, row, cmb, i, n, o, opt, opts;
		var rows = survey.__$$rows$$__;
		if (typeof survey.maxQuestions !== 'number' || rows.children.length < survey.maxQuestions || survey.maxQuestions < 0) {
			remove = survey.remove;
			if (remove == undefined) {
				remove = survey.__removeRowText_||survey.removeRow;
			}
			if (remove == undefined && surveys) {
				remove = surveys.remove;
				if (remove == undefined) {
					remove = surveys.__removeRowText_||surveys.removeRow;
				}
			}
			survey.addQ([], rows.children.length, remove||true);
		}
		row = rows.children[rows.children.length - 1];
		if (ignoreFocus) {
			cmb = row.children[0].children[0];
			populateQuestCombo(/*combo box */cmb, survey, qText);
			opts = cmb.children;
			n = opts.length;
			for (i = 0; i < n; i++) {
				opt = opts[i];
				o = opt.valueObj;
				if (typeof o === 'string' ? qText === o : o && (o.name === qText || o.label === qText)) {
					opt.selected = true;
				}
			}
			return row;
		}
		row.__$$focusableInputs$$__[0].focus();
	}
	function createBtn(name, caption, fn) {
		var btn;
		if (arguments.length === 2) {
			fn = caption;
			caption = name;
			name = "";
		}
		btn = $el("span");
		btn.setAttribute("tabindex", "0");
		btn.tabIndex = 0;
		if (name) {
			btn.name = name;
		}
		btn.setAttribute('class', 'SereniX-button');
		
		caption = caption||name;
		if (typeof caption === 'string') {
			btn.innerHTML = escapeHTML(caption);
		} else if (isPlainObj(caption)) {
			if (typeof caption.html === 'string') {
				btn.innerHTML = caption.html;
			} else if (typeof caption.html === 'boolean') {
				
			} else if (typeof caption.html === 'function') {
				btn.innerHTML = caption.html();
			} else {
				btn.innerHTML = caption.htmlText();
			}
		}
		addEvt('click', btn, fn);
		function onKey(ev) {
			var which;
			ev = ev||window.event;
			which = ev.which;
			if (which == undefined) {
				which = ev.keyCode;
			}
			if (which === 13) {
				onKey.fn.call(this, ev);
				preventDefault(ev);
			}
		}
		onKey.fn = fn;
		addEvt('keydown', btn, onKey);
		return btn;
	}
	
	p.getName = function() {
		return this.__name_;
	};
	
	p.setName = function(name) {
		this.__name_ = name;
		return this;
	};
	
	p.getLabel = function() {
		return this.__label_;
	};
	
	p.setLabel = function(label) {
		this.__label_ = label;
		return this;
	};
	
	p.getChooseText = function() {
		return this.__chooseText_;
	};
	
	p.setChooseText = function(text) {
		if (arguments.length === 0) {
			throw new Error("Text argument expected");
		}
		if (text instanceof String) {
			text = text.valueOf();
		}
		if (typeof text !== 'string' && (text || text != undefined)) {
			throw new Error("Incorrect argument");
		}
		this.__chooseText_ = text;
		return this;
	}
	
	p.getMaxQuestions = function() {
		return this.__maxQuestions_;
	};
	
	p.getMaxRows = p.getMaxQuestions;
	
	p.getMaxItems = p.getMaxQuestions;
	
	p.setMaxQuestions = function(max) {
		this.__maxQuestions_ = max;
		return this;
	};
	
	p.setMaxRows = p.setMaxQuestions;
	
	p.setMaxItems = p.setMaxQuestions;
	
	p.getMinQuestions = function() {
		return this.__minQuestions_;
	};
	
	p.getMinRows = p.getMinQuestions;
	
	p.getMinItems = p.getMinQuestions;
	
	p.setMinQuestions = function(min) {
		this.__minQuestions_ = min;
		return this;
	};
	
	p.setMinRows = p.setMinQuestions;
	
	p.setMinItems = p.setMinQuestions;
	
	p.getRequiredQuestions = function() {
		if (isArray(this.__requiredQuestions__)) {
			return this.__requiredQuestions__;
		}
		if (this.dynamic) {
			var reqs = this.__requiredQuestions__ = [];
			(this.__data_.getItems()||[]).forEach(function(q) {
				if (q.requiredItem) {
					reqs.push(q);
				}
			});
			return reqs;
		} else {
			return this.__data_.getItems();
		}
	};
	
	p.getRequiredItems = p.getRequiredQuestions;
	
	p.getOptionalQuestions = function() {
		if (isArray(this.__optionalQuestions__)) {
			return this.__optionalQuestions__;
		}
		if (this.dynamic) {
			var qs = this.__optionalQuestions__ = [];
			var reqs =  this.__requiredQuestions__;
			if (isArray(reqs)) {
				(this.__data_.getItems()||[]).forEach(function(q) {
					if (reqs.indexOf(q) < 0) {
						qs.push(q);
					}
				});
			} else {
				(this.__data_.getItems()||[]).forEach(function(q) {
					if (!q.requiredItem) {
						qs.push(q);
					}
				});
			}
			return qs;
		} else {
			return this.__optionalQuestions__ = [];
		}
	};
	
	p.addQ = p.addQuestion = p.addItem = function(q, i, remove) {
		var compare = this.compare||(this.compare = function(a,b) { 
		    if (a === undefined) return b === undefined ? 0 : -1;
			if (b == undefined) return 1;
			if (a === null) return b === null ? 0 : -1;
			if (b == undefined) return 1;
			return a > b ? 1 : a < b ? -1 : 0;
		});
		var oTyp = this.__optionsType_;
		var addValueCells = oTyp === "radios" ? Survey.addValueRadioCells : 
				oTyp === "stars" || oTyp === "star" ? Survey.addStars : 
				oTyp === "checklist" || oTyp === "checks"? Survey.addCheckList : 
				oTyp === "fields" ? Survey.addFields: 
				oTyp === "dropdown" ? Survey.addDropdown : 
				oTyp === "combo" ? Survey.addCombo : (function() {throw new Error();})();
		addQ(q, i, this.getValues(), this.__itemLabelField_, this.__$$rows$$__, this, this.answers||this.object||{}, this.__itemNameField_, compare, addValueCells, remove);
		return this;
	}
	
	p.getEntryNameField = function() {
		return this.__entryNameField_;
	};
	
	p.setEntryNameField = function(field) {
		this.__entryNameField_ = field;
		return this;
	};
	
	p.getEntryValueField = function() {
		return this.__entryValueField_;
	};
	
	p.setEntryValueField = function(field) {
		this.__entryValueField_ = field;
		return this;
	};
	
	p.getLabel = function() {
		return this.__label_;
	};
	
	p.setLabel = function(label) {
		this.__label_ = label;
		return this;
	};
	
	p.getHelp = function() {
		return this.__help_;
	};
	
	p.setHelp = function(help) {
		this.__help_ = help;
		return this;
	};
	
	p.getValueType = function() {
		return this.__valueType_||"object";
	};
	
	p.setValueType=function(type) {
		if (["object", "array", "entries"].indexOf(type) >= 0) {
			this.__valueType_ = type;
		} else {
			throw new Error("Incorrect argument");
		}
		return this;
	};
	
	p.isIndexedValue = function() {
		return this.__indexedValue_;
	};
	
	p.setIndexedValue = function(v) {
		this.__indexedValue_ = toBool(v);
		return this;
	};
	p.setNameField = function(nameField) {
		this.__nameField_ = nameField;
		return this;
	}
	
	p.getNameField = function() {
		return this.__nameField_;
	}
	
	p.setValueField = function(field) {
		this.__valueField_ = field;
		return this;
	}
	
	p.getValueField = function() {
		return this.__valueField_;
	}
	
	p.setLabelField = function(field) {
		this.__labelField_ = field;
		return this;
	}
	
	p.getLabelField = function() {
		return this.__labelField_;
	}
	
	p.getDefaultValue = function() {
		return this.__defaultValue_;
	};
	
	p.setDefaultValue = function(defaultValue) {
		this.__defaultValue_ = defaultValue;
	};
	
	p.setAnswers = function(answers) {
		this.__answers_ = answers;
		return this;
	}
	
	p.getAnswers = function() {
		return this.__answers_;
	}
	
	/**
	 * Sets the list of possible values that can be choosed/selected
	 * @return {Array}
	 */
	p.setValues = function(values) {
		setValues(values, this);
		return this;
	};
	/**
	 * Returns the list of possible values that can be choosed/selected
	 * @return {Array}
	 */
	p.getValues = function() {
		if (this.__values_)
			return this.__values_;
		var surveys = this.__surveys_||this.__owner_;
		if (surveys) {
			if (surveys.getValues) return surveys.getValues();
			return surveys.values;
		}
	};
	
	p.getChoices = p.getValues;
	
	p.setChoices = p.setValues;
	/**
	 *
	 * @return {QuestionsData}
	 */
	p.getData = function() {
		return this.__data_;
	};
	/**
	 *
	 * @param {QuestionsData|Array|Object} questions
	 * @return {Survey}
	 */
	p.setData = function(data) {
		if (isArray(data)) {
			this.__data_ = new QuestionsList(data);
			this.__questions_ = data;
		} else if (data instanceof Questions) {
			this.__data_ = data;
		} else if (data instanceof QuestionsList) {
			this.__data_ = data;
			this.__questions_ = this.__data_.getItems();
		} else if (isPlainObj(data)) {
			var items = data.questions||data.items;
			if (isArray(items)) {
				this.__data_ = new QuestionsList(items);	
				this.__questions_ = this.__data_.getItems();
			} else {
				this.__data_ = new QuestionsData(data);	
			}		
		}
		return this;
	};
	/**
	 *
	 * @return {Array}
	 */
	p.getQuestions = function() {
		return this.__questions_;
	};
	/**
	 *
	 * @param {QuestionsData|Array|Object} questions
	 * @return {Survey}
	 */
	p.setQuestions = function(questions) {
		if (questions instanceof QuestionsList) {
			this.__data_ = questions;	
			this.__questions_ = this.__data_.getItems();
		} else if (questions instanceof Questions) {
			this.__data_ = questions;
			this.__questions_ = undefined;
		} else if (isArray(questions)) {
			this.__data_ = new QuestionsList(questions);
			this.__questions_ = this.__data_.getItems();
		} else if (isPlainObj(questions)) {
			var items = questions.questions||questions.items||questions.list;
			if (isArray(items)) {
				this.__data_ = new QuestionsList(items);	
				this.__questions_ = this.__data_.getItems();
			} else {
				this.__data_ = new QuestionsData(questions);	
			}
		}
		return this;
	};
	/**
	 * 
	 * param {Function|Object} factory
	 * @return {Survey}
	 */
	p.setFieldFactory = function(factory) {
		if (!arguments.length) {
			throw new Errro("Field factory expected");
		}
		if (typeof factory === 'function') {
			//TODO
		} else if (typeof factory.create === 'function') {
			//TODO
		} else if (factory != undefined) {
			throw new Error("Incorrect argument");
		}
		this.__fieldFactory_ = factory;
		return this;
	};
	/**
	 * 
	 * @return {Function|Object}
	 */
	p.getFieldFactory = function() {
		if (this.__fieldFactory_ != undefined) {
			return this.__fieldFactory_;
		}
		var surveys = this.__surveys_||this.__owner_;
		if (surveys) {
			return surveys.getFieldFactory();
		}
	};
	function setBooleans(values, b, self) {
		var bkeys = Object.keys(values);
		if (bkeys.indexOf("trueValue") >= 0) {
			b.trueValue = values.trueValue;
			b.isTrueValue = true;
		}
		if (bkeys.indexOf("falseValue") >= 0) {
			b.falseValue = values.falseValue;
			b.isFalseValue = true;
		}
		if (self && (!b.isTrueValue  || !b.isFalseValue)) {
			bkeys = Object.keys(values);
			if (!b.isTrueValue && bkeys.indexOf("trueValue") >= 0) {
				b.trueValue = values.trueValue;
				b.isTrueValue = true;
			}
			if (!b.isFalseValue && bkeys.indexOf("falseValue") >= 0) {
				b.falseValue = values.falseValue;
				b.isFalseValue = true;
			}
		} 
		if (!b.isTrueValue) {
			b.trueValue = true;
		}
		
		if (!b.isFalseValue) {
			b.falseValue = false;
		}
	}
	/**
	 * Returns the object or array reflecting the selections or the setted values.
	 * @param  {Object|Array} [val]
	 * @return  {Object|Array}
	 */
	p.getObject = function(val) {
		var self = this;
		function setQ(r) {
			q = qs[r];
			val[r] = o = {};
			nameField = self.__nameField_||values.questionFieldName||values.keyFieldName||"question";
			o[nameField] = q.name||q.text;
		}
		var booleans = {};
		var funcs = this.__indexedValue_ ? { 
			'checklist':function() {
				var o = {};
				for (k=1; k < len; k++) {
					opt = values[k-1];
					o[opt.name||opt.value] = getCheckVal(cells[k].children[0].checked);
				}
				return o;
			},
			'combo': function() {
				_sel = cells[1].children[0];
				len = _sel.children.length;
				q = qs[r];
				for (k=0; k < len; k++) {
					opt = _sel.children[k];
					if (opt.selected) {
						if (!opt.undefinedValue) {								
							return opt.valueObj;
						}
					}
				}
			},
			'multiselect': function() {
				_sel = cells[1].children[0];
				return typeof _sel.getObject === 'function' ?_sel.getObject() : 
					typeof _sel.getValue === 'function' ?_sel.getValue() : 
					sel.component && typeof _sel.component.getObject === 'function' ? _sel.component.getObject() :
					sel.component && typeof _sel.component.getValue === 'function' ? _sel.component.getValue() :
					Object.keys().indexOf('valueObj') >= 0 ? _sel.valueObj : _sel.value;
			},
			'fields': function() {
				o = {};
				setFieldsObj(o);
				return o;
			},
			'rating': function() {
				//TODO
			},
			'radios': function() {
				for (k=1; k < len; k++) {
					if (cells[k].children[0].checked) {
						return getVal(values[k - 1]);
					}
				}
			}
		} : { 
			'checklist':function() {
				for (k=1; k < len; k++) {
					opt = values[k-1];
					o[opt.name||opt.value] = getCheckVal(cells[k].children[0].checked);
				}
			},
			'combo': function() {
				_sel = cells[1].children[0];
				len = _sel.children.length;
				q = qs[r];
				for (k=0; k < len; k++) {
					opt = _sel.children[k];
					if (opt.selected) {
						if (!opt.undefinedValue) {								
							setQ(r);
							o[valueField()] = opt.valueObj;
						}
					}
				}
			},
			'multiselect': function() {
				_sel = cells[1].children[0];
				o[valueField()] = typeof _sel.getObject === 'function' ?_sel.getObject() : 
					typeof _sel.getValue === 'function' ?_sel.getValue() : 
					sel.component && typeof _sel.component.getObject === 'function' ? _sel.component.getObject() :
					sel.component && typeof _sel.component.getValue === 'function' ? _sel.component.getValue() :
					Object.keys().indexOf('valueObj') >= 0 ? _sel.valueObj : _sel.value;
			},
			'fields': function() {
				setFieldsObj(o);
			},
			'rating': function() {
				//TODO
			},
			'radios': function() {
				for (k=1; k < len; k++) {
					if (cells[k].children[0].checked) {
						setQ(r);
						o[valueField()] = getVal(values[k - 1]);
						break;
					}
				}
			}
		};

		funcs['dropdown'] = funcs['combo'];
		funcs['stars'] = funcs['rating'] = funcs["multiselect"];
		funcs[''] = funcs['default'] = funcs['others'] = funcs["multiselect"];
		/**
		 * 
		 * @private
		 * @param {Object} o
		 */
		function setFieldsObj(o) {
			var fields = values.fields||values.inputFields;
			var vField = values.valueField;
			var field, tag, options, olen;
			for (var j =0, len = fields.length; j < len; j++) {
				opt = cells[j + 1].children[0];
				field = fields[j];
				if (isPlainObj(field)) {
					field = field.name;
				} else if (isArray(field)) {
					field = field[0];
				}
				if (opt.component && opt.component.getValue) {
					o[field] = opt.component.getValue();
				} else if (opt.getValue) {
					o[field] = opt.getValue();
				} else if ((tag = (opt.nodeName||opt.tagName).toLowerCase()) === 'select') {
					options = opt.children;
					olen = options.length;
					if (vField) {
						for (k=1; k < olen; k++) {
							opt = options[k];	
							if (opt.selected) {
								o[field] = opt.valueObj[vField];
								break;
							}
						}
					} else {
						for (k=1; k < olen; k++) {
							opt = options[k];	
							if (opt.selected) {
								o[field] = opt.valueObj;
								break;
							}
						}
					}
				} else if (tag === 'input') {
					if (field.type === 'checkbox') {
						setBooleans(field, booleans = {}, self);
						o[field] = getCheckVal(opt.checked);
					} else if (['number', 'range'].indexOf(field.type) >= 0) {
						if (typeof opt.valueObj === 'number') {
							o[field] = opt.valueObj;
						} else if (opt.value) {
							o[field] = parseFloat(opt.value);
						}
					} else {
						o[field] = Object.keys('valueObj') >= 0 ? opt.valueObj : opt.value;
					}
				} else if (tag === 'textarea') {
					o[field] = opt.value;
				}
			}
		}
			
		function getVal(v) {
			if (['string', 'number', 'boolean', 'undefined'].indexOf(typeof v) >= 0) {
				return v;
			}
			return v.value;
		}
		
		function getCheckVal(checked) {
			return checked ? booleans.trueValue : booleans.falseValue;
		}
		var qs, rows, rowCount, r, n, i, row, k, len, values, cells, cell, entries, keys,
			nameField, valueField, o, oval, optionsType = this.__optionsType_;
		
		var booleans, opt, _sel, fn;
		var _set;
		
		if (arguments.length === 0) {
			val = this.getValueType();
		}
		qs = this.__questions_;
		values = this.getValues();
		rows = this.__$$rows$$__.children;
		rowCount = n = rows.length;
		if (val === "array" || (entries = (val === "entries"))) val = [];
		else if (val === "object") val = {};
		else if (!val) val = {};
		if (entries) {
			nameField = this.__entryNameField_||"name";
			valueField = this.__entryValueField_||"value";
			for (r=0; r < rowCount; r++) {
				row = rows[r];
				cells = row.children;
				len = cells.length;
				if ((cells[0].tagName||cells[0].nodeName).toLowerCase() === 'select') {
					q = getQuestion(cells[0]);
					if (!q) {
						throw new Error("No question text");
					}
				} else {
					q = row.question;
				}
				if (!q) {
					//TODO
				} else if (optionsType === 'checklist') {
					booleans = {};
					if (isPlainObj(values)) {
						setBooleans(values, booleans, self);
						values = values.values;
					} else {
						setBooleans(self, booleans);
					}
					val[r] = o = {};
					o[nameField] = q.name||q.text;
					o[valueField] = oval = {}
					for (k=1; k < len; k++) {
						opt = values[k-1];						
						oval[opt.name||opt.value] = getCheckVal(cells[k].children[0].checked);
					}
				} else if (optionsType === 'fields') {
					q = qs[r];
					val[r] = o = {};
					o[nameField] = q.name||q.text;
					o[valueField] = oval = {};
					setFieldsObj(oval);
				} else if (optionsType === 'combo' || optionsType === 'dropdown') {
					_sel = cells[1].children[0];
					len = _sel.children.length;
					for (k=0; k < len; k++) {
						opt = _sel.children[k];
						if (opt.selected) {
							if (!opt.undefinedValue) {								
								val[r] = o = { };
								o[nameField] = q.name||q.text;
								o[valueField] = opt.valueObj;
							}
						}
					}
				} else {
					for (k=1; k < len; k++) {
						if (cells[k].children[0].checked) {
							val[r] = o = { };
							o[nameField] = q.name||q.text;
							o[valueField] = getVal(values[k - 1])
							break;
						}
					}
				}
			}
		} else if (isArray(val)) {
			valueField = function() {
				return self.__valueField_||"answer";
			}
			if (this.__indexedValue_) {
				for (r=0; r < rowCount; r++) {
					row = rows[r];
					cells = row.children;
					len = cells.length;
					val[r] = funcs[optionsType]();
				}
			} else {
				_set = ['radios', 'combo', 'dropdown'].indexOf(optionsType) < 0;
				for (r=0; r < rowCount; r++) {
					row = rows[r];
					cells = row.children;
					len = cells.length;
					//if options element/component is not a combobox and not a
					//dropdown and not radios , createb an item and set the 
					//question of the item.
					_set && setQ(r);
					funcs[optionsType](); //set the answer of the question
				}
			}
		} else {
			var opt, fld;
			for (r=0; r < rowCount; r++) {
				row = rows[r];
				cells = row.children;
				len = cells.length;
				if (optionsType === 'checklist') {
					q = qs[r];
					val[q.name] = o = {};
					for (k=1; k < len; k++) {
						opt = values[k-1];						
						o[opt.name||opt.value] = getCheckVal(cells[k].children[0].checked);
					}
				} else if ((opt = cells[1].children[0]) && len === 2 && (fld = opt.component||opt.field) &&  typeof fld.getValue === 'function') {
					val[q.name||q.text] = fld.getValue();
				} else if (optionsType === 'combo' || optionsType === 'dropdown') {
					_sel = opt;
					len = _sel.children.length;
					nameField = nameField||"name";
					valueField = valueField||"value";
					for (k=0; k < len; k++) {
						opt = _sel.children[k];
						if (opt.selected) {
							if (!opt.undefinedValue) {
								q = qs[r];
								val[q.name||q.text] = Object.keys(opt).indexOf("valueObj") ? opt.valueObj : opt.value;
							}
							break;
						}
					}
				} else if (optionsType === 'rating' || optionsType === 'stars' ) {
					val[q.name||q.text] = (opt.component||opt.__component__||opt._component_||opt.field).getValue();
				} else if (optionsType === 'multiselect' ) {
					opt = cells[1].children[0];
					o = (opt.component||opt.field||opt.multiSelect||opt.multiselect);
					val[q.name||q.text] = typeof opt.getValue === 'function' ? opt.getValue() : opt.value;
				} else  if (/radios?/.test(optionsType) ) {
					for (k=1; k < len; k++) {
						if (cells[k].children[0].checked) {
							q = qs[r];
							val[q.name] = getVal(values[k - 1]);
							break;
						}
					}
				} else if (optionsType === 'fields') {
					q = qs[r];
					val[q.name] = o = {};
					setFieldsObj(o);
				} else {
					
				}
			}
		}
		return val;
	}
	function getRow(s, rows, qField, i, self) {
		var j, n = rows.length, row, cells, cell, content, k, count;
		var q, x;
		if (i instanceof Survey) {
			x = i;
			i = self;
			self = x;
		}
		if (this.entryFieldName) {
			
		} else {
			q = typeof s === 'string' ? s : qField ? s[qField] : s.question||s.name||s.text;
			for (j=0; j < n; j++) {
				row = rows[j];
				cells = row.children;
				cell = cells[0];
				content = cell.childNodes[0];
				if ((content.nodeName||content.tagName).toLowerCase() === 'select') {
					var options = content.children;
					for (k=0, count= options.length; k < count; k++) {
						if (options[k].selected) {
							if (options[k].question.name === q) {
								return row;
							}
						}
					}
				} else {
					if (cell.question.name === q || cell.question.label === q) {
						return row;
					}
				}
			}
		}
		
		if (self.dynamic) {
			//TODO : manage max questions
			//add a new question row with question combobox
			return addRow(self, /* do not set focus */true, q);
		}
		throw new Error("Does not match any question");
	}
	/**
	 * 
	 * @private
	 * @param {String} qText The question/option text
	 * @param {Object|String|Number|Boolean|Array} a  The object that get the answer/value of the question/option
	 * @param {Array} rows
	 * @param {Survey} self
	 * @parma {Number} [i]
	 */
	function setValue(qText, a, rows, self, i) {
		function equals(o1, o2) {
			var keys;
			if (o1 === o2) return true;
			if (typeof o1 === 'string' && isPlainObj(o2)) {
				keys = o1;
				o1 = o2;
				o2 = keys;
			}
			if (isPlainObj(o1)) {
				keys = Object.keys(o1);
				if (isPlainObj(o2)) {
					for (var key in o1) {
						if (!equals(o1[key], o2[key]))
							return false;
					}
					return true;
				} else if (typeof o2 === 'string') {
					if (o1.value === o2 || o1.code === o2 || o1.name === o2 || o1.label === o2) {
						return true;
					}
				}
			}
			return false;
		}
		var optionsType = self.__optionsType_;
		var values, c, booleans;
		function _val(a, v) {
			var keys = Object.keys(v), i, n = keys.length;
			var keys2 = Object.keys(a), k;
			for (i=0; i < n; i++) {
				k = v[keys[i]];
				if (keys2.indexOf(k) >= 0) {
					return a[k];
				}
			}
		}
		row = getRow(qText, rows, i, self);
		cells = row.children;
		len = cells.length;
		if (optionsType === 'checklist') {
			values = self.getValues();
			booleans = {};
			if (isPlainObj(values)) {
				setBooleans(values, booleans, self);
			} else {
				setBooleans(self, booleans);
			}
			for (k=1; k < len; k++) {
				opt = cells[k].children[0];
				c = _val(a, values[k-1]);
				opt.checked = equals(c , booleans.trueValue);
				opt.valueObj = opt.checked ? booleans.trueValue : booleans.falseValue;
			}
		} else if (optionsType === 'fields') {
			k = 1;
			self.getValues().fields.forEach(function(field) {
				cell = cells[k++];
				setInput(cell.children[0], field, a);						
			});
		} else if (optionsType === 'combo' || optionsType === 'dropdown') {
			cmb = cells[1].children[0];
			len = cmb.children.length;
			for (k=0;k<len;k++) {
				opt = cmb.children[k];
				if (equals(a, opt.valueObj)) {
					opt.selected = true;
					break;
				}
			}
		} else if (optionsType === 'radios') {
			for (k=1; k < len; k++) {
				cell = cells[k];
				if (cell) {
					opt = cell.children[0];
					if (equals(a, opt.valueObj)) {
						opt.checked = true;
						break;
					}
				}
			}
		} else {
			
		}
	}
	/**
	 * 
	 * @param {Object|Array} obj
	 * @returns {Survey}
	 */
	p.setObject = function(obj) {
		function getVal(v) {
			if (['string', 'number', 'boolean', 'undefined'].indexOf(typeof v) >= 0) {
				return v;
			}
			return v.value;
		}
		var self = this;
		var getQuestionText;
		var nameField, valueField;
		var rows = self.__$$rows$$__.children, n = rows.length, j, row, cells, k, len, cell, cmb, 
			opt,
			questions = self.__questions_, 
			q,
			optionsType = self.__optionsType_,
			values = self.__values_,
			valueType = self.__valueType_;
		if (valueType === "entries") {
			nameField = self.__entryNameField_||"name";
			valueField = self.__entryValueField_||"value";
			if (isArray(obj)) {
				obj.forEach(function(s, i) {
					setValue(s[nameField], s[valueField], rows, self, i);
				});	
			} else {
				for (var key in obj) {
					setValue(key, obj[key], rows, self, i);
				}
			}
		} else if (isArray(obj)) {	
			nameField = self.__nameField_||values.questionFieldName||values.keyFieldName||"question";
			getQuestionText = (obj.length && isPlainObj(obj[0])) && Object.keys(obj[0]).indexOf(nameField) >= 0 ? //non indexed value case
				function(s) {
					return s[nameField]
				} : function(s, i) {
					var q = self.__questions_[i];
					return q.text||q.label||q.name;
				};
			
			if (/^(?:fields|checks?list)$/.test(optionsType)) {
				obj.forEach(function(s, i) {
					setValue(getQuestionText(s, i), s, rows, self, i);
				});
			} else {
				valueField = self.__valueField_||"answer";
				obj.forEach(function(s, i) {
					setValue(getQuestionText(s, i), ['string', 'number', 'boolean'].indexOf(typeof s) >= 0 ? s: s[valueField], rows, self, i);
				});
			}
		} else if (isPlainObj(obj)) {
			var _val;
			for (var key in obj) {
				setValue(key, obj[key], rows, self);
			}
		}
		return this;
	}
	/**
	 * Returns the object or array reflecting the selections or the setted values.
	 * @param  {Object|Array} [val]
	 * @return  {Object|Array}
	 */
	p.getStates = p.getObject;
	/**
	 * 
	 * @param {Object|Array} sels
	 * @returns {Survey}
	 */
	p.setStates = p.setObject;
	
	/**
	 * Returns the object or array reflecting the selections or the setted values.
	 * @param  {Object|Array} [val]
	 * @return  {Object|Array}
	 */
	p.getSelections = p.getObject;
	/**
	 * 
	 * @param {Object|Array} sels
	 * @returns {Survey}
	 */
	p.setStates = p.setObject;
	
	/**
	 * Returns the object or array reflecting the selections or the setted values.
	 * @param  {Object|Array} [val]
	 * @return  {Object|Array}
	 */
	p.getValue = p.getObject;
	/**
	 * 
	 * @param {Object|Array} sels
	 * @returns {Survey}
	 */
	p.setValue = p.setObject;
	
	p.getOptionsType = function() {
		return this.__optionsType_;
	};
	
	p.setOptionsType = function(optionsType) {
		if (arguments.length === 0) {
			throw new Eroor("Argument expected");
		} else if (!optionsType || typeof optionsType !== 'string') {
			throw new Eroor("Incorrect argument");
		}
		this.__optionsType_ = optionsType;
		return this;
	};
	var toHtml = Survey.toHtml = BaseSurvey.toHtml;
    /**
	 * 
	 * @returns {Boolean}
	 */
	p.validate = function() {
		var self = this;
		function text(q) {
			var textField = self.__itemLabelField_, html;
			var label;
			if (q instanceof String) {
				q = q.valueOf();
			}
			label = typeof q === 'string' ? q: textField ? q[textField] : q.text||q.question||q.label||q.caption||q.caption||q.name||("Question " + (i + 1));
			if (typeof label === 'string') return label;
			if (typeof label.html === 'string') {
				html = label.html;
			} else if (typeof label.htmlText == 'string') {
				html = label.htmlText;
			} else if (label.html) {
				html = label.text||label.content||"";
			}
			return label.text||label.content||"";
		}
		if (!this._element__) return undefined;	
        function checkQuest(q) {
			var opts, i, n;
			if ((q.nodeName||q.tagName).toLowerCase() === 'select') {
				opts = q.children;
				n = opts.length;
				for (i=0; i < n; i++) {
					if (opts[i].selected) {
						if (opts[i].undefinedValue) {
							alert("Select " + ("question for the current row"));
							q.focus();
							delete row.question;
							return false;
						} else {
							row.question = opts[i].question;
							return true;
						}
					}
				}
				return false;
			}
			return true;
		}
		var error, j, k, len;
		function validateField(input) {
			var field = input.component||input.field, tag, ok, j, k, len;
			error = undefined;
			if (field) {
				if (typeof field.validate === 'function') {
					try {
						ok = field.validate();
						error = { cause: "invalid value" };
						return ok === undefined ? true : !!ok;
					} catch(err) {
						error = { cause: err.message, exception: err };
						return false;
					}
				}
			}
			tag = (input.nodeName||input.tagName).toLowerCase();
			if (tag === 'select') {
				
				//get the combobox of the table cell
				sel = input;
				len = sel.children.length;
				for (k=0; k < len; k++) {
					cell = sel.children[k]
					if (cell.selected && cell.undefinedValue) {
						error = { cause : "not filled"};
						return false;
					}
				}
			} else if (tag === 'input') {
				
			}
			return true;
		}
		var sel = false, field;
		var rows = this.__$$rows$$__.children, n = rows.length, j, row, cells, k, len;
		if (this.dynamic) {
			var v = this.getMinQuestions();
			if (typeof v === 'number' && v >= 0 && v > n) {
				alert(text("At least " + v + " items required"));
				this.addBtn.focus();
				return false;
			}
			 v = this.getMaxQuestions();
			if (typeof v === 'number' && v >= 0 && v < n) {
				alert(text("Too many items"));
				return false;
			}
		}
		switch(this.__optionsType_||"") {
			case "radios":
				for (j=0; j < n; j++) {
					row = rows[j];
					cells = row.children;
					len = cells.length;
					sel = false;
					if (!checkQuest(cells[0].childNodes[0])) {
						return false;
					}
					for (k=1; k < len; k++) {
						if (cells[k].children[0].checked) {
							sel = true;
							break;
						}
					}
					if (!sel) {
						alert(text(cells[0].question) + " not filled: no option checked");
						cells[1].children[0].focus();
						return false;
					}
				}
				break;
			case "combo":
			case "dropdown":
				for (j=0; j < n; j++) {
					row = rows[j];
					cells = row.children;
					if (!checkQuest(cells[0].childNodes[0])) {
						return false;
					}
					//get the combobox of the table cell
					sel = cells[1].children[0];
					len = sel.children.length;
					for (k=0; k < len; k++) {
						cell = sel.children[k]
						if (cell.selected && cell.undefinedValue) {
							alert(text(row.question) + " not filled no option selected");
							sel.focus();
							return false;
						}
					}
				}				
				break;
			case "fields":				
				for (j=0; j < n; j++) {
					row = rows[j];
					cells = row.children;
					len = cells.length;
					sel = false;
					if (!checkQuest(cells[0].childNodes[0])) {
						return false;
					}
					for (k=1; k < len; k++) {
						if (!validateField(field = cells[k].children[0])) {
							if (!error || error.cause === 'not filled') {
								alert("The cell field identfied by " + text(cells[0].question) + " and " + toHtml(field.md.label||field.md.name) + " is  not filled: no option checked");
							} else {
								alter("[Error]: cell field identfied by " + text(cells[0].question) + " and " + toHtml(field.md.label||field.md.name) + ": " + error.message||"invalid value");
							}
							field.focus();
							error = undefined;
							return false;
						}
					}
				}
				break;
			default: 
				for (j=0; j < n; j++) {
					row = rows[j];
					cells = row.children;
					if (!checkQuest(cells[0].childNodes[0])) {
						return false;
					}
				}
		}
		return true;
	}
	/**
	 * <p>Builds the survey.</p>
	 * @param {Boolean} [force=false]
	 * @returns {Survey}
	 */
	p.build = function(force) {
		if (this.__built__ && !force) return this;		
		if (this.__data_ instanceof QuestionsList) {
			if (this.dynamic) {
				quests = this.getRequiredQuestions()||[];
			} else {
				quests = this.__data_.getItems();
			}
			build(quests, this);
		} else {
			function onSuccess(response) {
				if (response.response) {
					response = response.response
				} else if (response.responseXML) {
					response = xml2json(response.responseXML);
				} else if (Object.keys(response).indexOf("responseText") >= 0){
					response = JSON.stringify(response.responseText);
				}
				build(response, this);
			}
			onSuccess.survey = this;
			function onFail(response) {
				
			}
			onFail.survey = this;
			
			var data = this.__data_;
			opts = { responseType: this.__responseType_||'json'};
			for (var name in data) {
				opts[name] = data[name];
			}
			
			opts.onSuccess = onSuccess;
			opts.onFail = onFail;
			opts.httpMethod = this.__httpMethod_||'GET';
			
			var ajx = new Ajax(opts);
			
			ajx.send();
		}
		return this;
	};

	p.refresh = function() {
		return this.build(true);
	}
	/**
	 * 
	 * @returns {HTMLElement}
	 */
	p.getElement = function() {
		if (!this._element__ || !this.__built__) this.build();
		return this._element__;
	};
	
	p.setElement = function(elt) {
		throw new Error("Read only property");
	};
	
	p.setWidth=function(w) {
		var el = this.getElement();
		if (Box) {
			Box.width(el, w);
		} else {
			if (typeof w === 'number') {
				w = w + "px";
			}
			el.style.width = w;
		}
		return this;
	}
	
	p.setHeight=function(h) {
		var el = this.getElement();
		if (Box) {
			Box.height(el, w);
		} else {
			if (typeof h === 'number') {
				h = h + "px";
			}
			el.style.height = h;
		}
		return this;
	}
	
	p.setFullWidth=function(w) {
		
		return this;
	}
	
	p.setFullHeight=function(h) {
		
		return this;
	}
	
	p.setEditable = function(editable) {
		if (arguments.length === 0) editable = true;
		this.__editable_ = editable;
		var readOnly = !editable;
		if (typeof readonly === 'function') {
			(this.__inputs__||[]).forEach(function(i) {
				readonly(i, readOnly);
			});
		} else {
			(this.__inputs__||[]).forEach(function(i) {
				i.readonly = readOnly;
			});
		}
		return this;
	}
	
	p.isEditable = function() {
		return this.__editable_;
	}
	
	p.setReadOnly = function(readOnly) {
		if (arguments.length === 0) readOnly = true;
		return this.setEditable(!readOnly);
	}
	
	p.isReadOnly = function() {
		return !this.isEditable();
	}
	
	p.setDisabled = function(disabled) {
		if (arguments.length === 0) disabled = true;
		this.__disabled_ = disabled;
		(this.__inputs__||[]).forEach(function(i) {
			i.disabled = disabled;
		});
	}
	
	p.isDisabled = function() {
		return this.__disabled_;
	}
	
	p.getFocusableInputs = function() {
		return this.__$$focusableInputs$$__;
	};
	
	p.setFocusableInputs = function() {
		throw new Error("Read only property");
	};
	
	p.toPdf = function() {
		throw new Error("Not yet supported");
	};
	
	p.print = function() {
		throw new Error("Not yet supported");
	};
	
	
	p.summary = function(withTitle, pane) {
		var survey = this;		
		function addCombo(_sel) {
			var k, opt, len = _sel.children.length;
			//q = qs[r];
			for (k=0; k < len; k++) {
				opt = _sel.children[k];
				if (opt.selected) {
					if (!opt.undefinedValue) {	
						td = $el("td");
						td.innerHTML = _delim + opt.innerHTML;
						tr.appendChild(td);
						break;
					}
				}
			}
		}
		function addCheck(input) {
			var v = input.valueObj;
			if (v instanceof String || v instanceof Number || v instanceof Boolean) {
				v = v.valueOf();
			}
			td = $el("td");
			td.innerHTML = toHtml(v);
			tr.appendChild(td);
		}
		var quests = Array.prototype.slice.call(survey.getOptionalQuestions()), quest,
			count = quests.length,
			k, ndx;
		var rows = Array.prototype.slice.call(survey.__$$rows$$__.children), tr, el, td, 
			n = rows.length, i, q, j, sVal, cells;
		var values = this.getValues(), len,
			optsType = this.__optionsType_,
			add;
		var tbl = $el("table");
		var tbody = $el('tbody');
		var _sel, o, delim = this.__multiSelectDelim_||", ";
		var qs = this.__questions_;
		var _delim = "";
		var funcs = { 
			'checklist':function() {
				var o = {}, y, len = values.length + 1;
				for (y=1; y < len; y++) {
					addCheck(cells[y].children[0]);
				}
			},
			'combo': function() {
				addCombo(cells[1].children[0]);
			},
			'multiselect': function() {
				var s = "";
				_sel = cells[1].children[0];
				var items = typeof _sel.getObject === 'function' ?_sel.getObject() : 
					typeof _sel.getValue === 'function' ?_sel.getValue() : 
					sel.component && typeof _sel.component.getObject === 'function' ? _sel.component.getObject() :
					sel.component && typeof _sel.component.getValue === 'function' ? _sel.component.getValue() :
					Object.keys().indexOf('valueObj') >= 0 ? _sel.valueObj : _sel.value;
				items.forEach(function(it, i) {
					if (i) s += delim;
					s += toHtml(it);
				});
				td = $el('td');
				td.innerHTML = _delim + s;
				tr.appendChild(td);
			},
			'fields': function() {
				var input, tag, y, len = values.fields.length, field;
				for (y=1; y <= len; y++) {
					input = cells[y].children[0];
					tag = (input.tagName||input.nodeName).toLowerCase();
					if (tag === 'select') {
						addCombo(input);
					} else if (input.type === 'checkbox') {
						addCheck(input);
					} else {
						td = $el('td');
						field = input.field||input.component;
						td.innerHTML = toHtml(
							field && field.getValue ? 
								field.getValue() : input.getValue ? 
								input.getValue() : input.value, 
							field ? field.format : undefined, 
							survey
						);
						tr.appendChild(td);
					}					
				}
			},
			'rating': function() {
				//TODO
			},
			'radios': function() {
				var val, j, len = values.length;
				for (j=1; j <= len; j++) {
					if (cells[j].children[0].checked) {
						td = $el('td');
						td.innerHTML = _delim + toHtml(values[j - 1]);
						tr.appendChild(td);
						break;
					}
				}
			},
			toggle: function() {
				throw new Error("Not yet supported");
			},
			text: function() {
				td = $el('td');
				td.innerHTML = _delim + escapeHTML(cells[1].children[0].value);
				tr.appendChild(td);
			}
		};
		funcs.number = funcs["int"] = funcs.integer = funcs.text;
		funcs[""] = funcs.text;
		
		add = funcs[optsType];
		if (!add && (optsType === 'dropdown' || optsType === 'combobox')) {
			add = funcs["combo"]
		}
		if (isPlainObj(withTitle)) {
			x = withTitle;
			withTitle = pane;
			pane = x;
		}
		withTitle = toBool(withTitle);
		pane = pane||this.__summaryPane__;
		if (pane)
			pane.innerHTML = "";
		else {
			this.__summaryPane__ = pane = $el("div");
			return pane;
		}
		this.__summaryPane__ = pane;
		if (optsType === 'fields' || optsType === 'checklist') {
			tr = $el('tr');
			td = $el('th');
			td.innerHTML = "";
			tr.appendChild(td);
			var vals = optsType === 'fields' ? values.fields : values;
			len = vals.length;
			for (k = 0; k < len; k++) {
				td = $el('th');
				td.innerHTML = toHtml(vals[k]);
				tr.appendChild(td);
			}
			tbody.appendChild(tr);
		} else {
			_delim = "&nbsp;:&nbsp;";
		}
		for (j=0;j<n;j++) {
			tr = rows[j];
			cells = tr.children;
			td = tr.children[0];
			el = td.childNodes[0];
			if ((el.tagName||el.nodeName).toLowerCase() === 'select') {
				q = getQuestion(el)							
			} else {
				q = tr.question;
			}
			td = $el('td');
			td.innerHTML = toHtml(q);
			tr = $el('tr');
			tr.appendChild(td);
			add();
			tbody.appendChild(tr);
		}
		tbl.appendChild(tbody);
		var tDiv = $el("div");		
		tDiv.appendChild(tbl);
		pane.appendChild(tDiv);
		return pane;
	};
	
	setObjProps(p, [
		"name",
		"label",
		"answers",
		"data",
		"questions",
		"values",
		"editable",
		{
			name: "readonly",
			get: p.isReadOnly,
			set: p.setReadOnly
		},
		"readOnly",		
		"disabled",
		"states",
		"value",
		"valueType",
		"indexedValue",
		"nameField",
		"labelField",
		"valueField",
		"entryNameField",
		"entryValueField",
		"defaultValue",
		"help",
		"fieldFactory",
		"minQuestions",
		"minItems",
		"minRows",
		"maxQuestions",
		"maxItems",
		"maxRows",
		"focusableInputs",
		"chooseText",
		"fieldFactory",
		"valueRequired",
		"arrowText",
		"removeRowText",
		"element"
	]);
	
	
	
	
	function Questions() {
	}
	
	Questions.__CLASS__ = Questions.prototype.__CLASS__ = Questions;
	
	Questions.__CLASS_NAME__ = Questions.prototype.__CLASS_NAME__ = "Questions";



	function QuestionsList(s) {
		var len = arguments.length, items;
		if (len > 1) {
			items = Array.prototype.slice.call(arguments);
		} else {		
			var qs = s.questions||s.items||s;		
			if (isArray(qs)) {
				items = [];
				qs.forEach(function(q) {
					if (isPlainObj(q)) {
						q.label = q.label||q.caption||q.title||q.name;
					} else if ('string' === typeof q) {
						q = { value: q, name: "" + q, label: "" + q };
					} else {
						throw new Error("Incorrect value");
					}
					items.push(q);
				});
			} else if (len) {
				throw new Error("Incorrect arguments");
			}
		}
		this.__questions_ = items;
	}

	QuestionsList.prototype = new Questions();
	
	QuestionsList.__CLASS__ = QuestionsList.prototype.__CLASS__ =  QuestionsList;
	
	QuestionsList.__CLASS_NAME__ = QuestionsList.prototype.__CLASS_NAME__ =  "QuestionsList";

	QuestionsList.prototype.getItems = function() {
		return this.__questions_;
	}
	
	QuestionsList.prototype.getQuestions = function() {
		return this.__questions_;
	}

	QuestionsList.prototype.forEach = function(fn) {
		var self = this;
		this.__items_.forEach(function(it, i) {
			fn(it, i, self.__items_);
		});
	}

	function QuestionsData(opts) {
		var url;
		if (opts instanceof String) {
			opts = opts.valueOf();
		}
		if (typeof opts === 'string' && opts) {
			this.__url_ = opts;
			this.__httpMethod_ = 'GET';
			this.__reponseType_ = 'json';
		} else if (opts) {
			url = opts.url;
			if (url instanceof String) {
				url = url.valueOf();
			}
			if (typeof url === 'string') {
				this.__url_ = url;
				this.__params_ = opts.params||opts.parameters||opts.parms;
				this.__reponseType_ = opts.responseType||'json';
				this.__httpMethod_ = opts.httpMethod||opts.method||'GET';
			}
		}
	}

	QuestionsData.prototype = new Questions();
	
	QuestionsData.__CLASS__ = QuestionsData.prototype.__CLASS__ =  QuestionsData;
	
	QuestionsData.__CLASS_NAME__ = QuestionsData.prototype.__CLASS_NAME__ =  "QuestionsData";

	function setValues(values, self) {
		if (isArray(values)) {
			values.forEach(function(v) {
				if (isPlainObj(v)) {
					v.label = v.label||v.caption||v.title||v.name;
				} else if (['string', 'number', 'boolean'].indexOf(typeof v) >= 0) {
					v = { value: v, name: "" + v, label: "" + v };
				} else {
					throw new Error("Incorrect value");
				}
			});
		}
		self.__values_ = values;
	}
	
	Survey.Questions = Questions;
	
	Survey.QuestionsData = QuestionsData;
	
	Survey.QuestionsList = QuestionsList;

	return Survey;
});


