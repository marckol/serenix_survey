function nthInt(nth, els) {
	if(nth instanceof Number || nth instanceof Number) {
		nth = nth.valueOf();
	}
	if (nth === 'first') nth = 1;
	else if (nth === 'last') nth = els.length;
	else if (typeof nth === 'string') {
		if (match = /([1-9]\d*)(?:st|nd|rd|th)?/.exec(nth)) nth = parseInt(nth);
		else throw new Error("Incorrect ordinal number: " + nth);
	} else if (!Number.isInteger(nth) || nth < 1) {
		throw new Error("Incorrect ordinal number: " + nth);
	}
	return nth;
}

var nthValue = nthInt;

var nthvalue = nthInt;

var nthVal = nthInt;

var nthval = nthInt;

var nth_val = nthInt;

var nth_int = nthInt;

var nth_value = nthInt;

(function(root, name, factory) {
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([name], factory);
	} else {
		root[name] = factory();
	}
	
})(this, 'Surveys', function() {	

	var Box, doc = document;11
	if (typeof CssBoxModel !== "undefined") {
		Box = CssBoxModel;
	} else {
		Box = {
			insets: function(el) {
				
			},
			fullHeight: function(el, h) {
				
			},
			fullWidth: function(el, w) {
				
			}
		}
	}
	
	function $el(tag) {
		return document.createElement(tag);
	}

	function setValues(values, self) {
		values.forEach(function(v) {
			if (isPlainObj(v)) {
				v.label = v.label||v.caption||v.title||v.name;
			} else if (['string', 'number', 'boolean'].indexOf(typeof v) >= 0) {
				v = { value: v, name: "" + v, label: "" + v };
			} else {
				throw new Error("Incorrect value");
			}
		});
		self.__values_ = values;
	}
	function setShortcut(keys, opts, self) {
		var v, i, k, n, c;
		if (typeof keys === 'string' || keys instanceof String) keys = keys.split(/\s*(?:\||\+|,|;)\s*/);
		if (!keys) return;
		for(i=0, n = keys.length; i < n; i++) {
			k = keys[i].toLowerCase();
			v = opts[k + "Shortcut"];
			if (v instanceof String) {
				v = v.valueOf();
			}
			c = k[0];
			if (/prev|back/.test(k = k.length < 4 ? k : k.substring(0, 4))) {
				self.__prevLabel_ = self.__prevLabel_||(c === 'p' ? 'Previous' : 'Backward')
				k = 'previous';
			} else if (/next|for(?:w|e)?/.test(k)) {
				self.__nextLabel_ = self.__nextLabel_||(c === 'n' ? 'Next' : 'Forward')
				k = 'next';
			} else if (/subm|comp|end/.test(k)) {
				self.__completeLabel_ = self.__completeLabel_||(c === 's' ? 'Submit' : c === 'c' ? 'Complete' : 'End')
				k = 'complete';
			} else if (/canc|clos/.test(k)) {
				self.__cancelLabel_ = self.__cancelLabel_||(k[1] === 'a' ? 'Cancel' : 'Close')
				k = 'cancel';
				self.shortcutFuncs.cancel = cancel;
			} else if (/save/.test(k)) {
				self.__savelLabel_ = self.__savelLabel_||'Save';
				k = 'cancel';
				self.shortcutFuncs.save = save;
			}
			k += "Shortcut";
			if (v) {
				self[k] = v === true ? "Ctrl + " + c : v;
				return;
			} else {
				v = opts[k + "Char"];
				if (v) {
					if (/^[a-z]$/.test(v = v.toLowerCase())) {
						self[k] = "Ctrl + " + v;
						return;
					}
				}
			}
		} //end for loop
	}
	/**
	 * 
	 * @param {Object} [opts]
	 * @param {Boolean} [_build=true]
	 * @class Surveys
	 */
    function Surveys(opts, _build) {
		var v;
		if (!(this instanceof Surveys)) {
			if (arguments.length === 1) {
				return new Surveys(opts, _build);
			}
			if (arguments.length) {
				return new Surveys(opts);
			}
			return new Surveys();
		}
		if (isArray(opts)) {
			opts = { items: opts };
		}
		this.__disabled_ = false;
		this.__editable_ = true;
		if (opts) {
			v = opts.id||opts.Id||opts.ID;
			if (v) {
				if (typeof v !== 'string') {
					throw new Error("Incorrect arguments");
				}
				this.__id_ = v;
			}
			this.__title_ = opts.title||opts.head;
			this.__label_ = opts.label;
			this.__name_ = opts.name||"";
			this.__surveys_ = opts.surveys||opts.fields||opts.items||opts.groups;	
		    v = opts.steps;
			if (v === undefined) {
				v = opts.withSteps;
				if (v === undefined) {
					v = opts.multiSteps;
				}
			}
			this.__steps_ = v;
			
			this.__mainHeight_ = opts.mainHeight||opts.bodyHeight||opts.surveyHeight;
			
			this.__visibleSteps_ = opts.visibleSteps;
			this.setComplete(opts.complete||opts.onComplete||opts.oncomplete||opts.submit||opts.onSubmit||opts.onsubmit);
			
			this.__completeLabel_ = opts.completeLabel||opts.onCompleteLabel||opts.oncompleteLabel||opts.submitLabel||opts.onSubmitLabel||"Complete";
			this.__prevLabel_ = opts.previousLabel||opts.prevLabel||opts.backLabel||opts.backwardLabel;
			this.__nextLabel_ = opts.nextLabel||opts.forwardLabel||opts.forwardLabel;
			
						
			this.__cancelLabel_ = opts.cancelLabel||opts.closeLabel;
			this.__saveLabel_ = opts.saveLabel;
			
			
			this.setSave(opts.save||opts.onSave||opts.onsave);
			this.setCancel(opts.cancel||opts.onCancel||opts.oncancel||opts.close||opts.onClose||opts.onclose);
			this.shortcutFuncs = { next: next, previous: back};
			setShortcut("next|forward|foreward", opts, this);
			setShortcut("back|previous|backward", opts, this);
			setShortcut("complete|submit|end", opts, this);
			setShortcut("cancel|close", opts, this);
			setShortcut("save", opts, this);
			
			this.withSummary = toBool(opts.withSummary||opts.summarize||opts.summary);
			
			this.summaryTitle = opts.summaryTitle||opts.summaryLabel;
			
			var values = opts.values;
			if (values)
				setValues(values, this);
			if (_build || arguments.length === 1) {
				this.build();
			}
		}
	}
	
	if (typeof AField === 'function') {
		Surveys.prototype = new AField();
	}
	p = Surveys.prototype;
	Surveys.__CLASS__ = p.__CLASS__ = Surveys;
	
	Surveys.__CLASS_NAME__ = p.__CLASS_NAME__ = "Surveys";
	
	p.setSurveys = function(surveys) {
		var ss = this.__surveys_ = [];
		if (isArray(surveys)) {
			surveys.forEach(function(s) {
				if (s instanceof Survey || (typeof Component === 'function' && s instanceof Component)) {
					ss.push(s);
				} else if (isPlainObj(s)) {
					ss.push(new Survey(s));
				} else {
					throw new Error("Incorrect argument");
				}
			});
		}
		return this;
	};
	
	p.getSurveys = function() {
		return this.__surveys_;
	};
	
	p.getSurvey = function(i) {
		return this.__surveys_[i];
	};
	
	/**
	 * Sets the list of possible values that can be choosed/selected
	 * @return {Array}
	 */
	p.setValues = function(values) {
		setValues(values, this);
		return this;
	};
	
	p.getValues = function() {
		return this.__values_;
	};
	
	p.getComplete = function() {
		return this.__complete_;
	}
	
	p.setComplete = function(complete) {
		if (complete) {
			if (typeof complete !== 'function')
				throw new Error("Incorrect argument");
			this.__complete_ = complete;
		} else {
			this.__complete_ = undefined;
		}
		return this;
	}
	
	p.getSave = function() {
		return this.__save_;
	}
	
	p.setSave = function(save) {
		if (save) {
			if (typeof save !== 'function')
				throw new Error("Incorrect argument");
			this.__save_ = save;
		} else {
			this.__save_ = undefined;
		}
		return this;
	}
	
	p.getCancel = function() {
		return this.__cancel_;
	}
	
	p.setCancel = function(cancel) {
		if (cancel) {
			if (typeof cancel !== 'function')
				throw new Error("Incorrect argument");
			this.__cancel_ = cancel;
		} else {
			this.__cancel_ = undefined;
		}
		return this;
	}
	/**
	 * 
	 * Makes the current/active step visible 
	 * @private
	 */
	function toggle(surveys, e) {
		e.setAttribute('class', e.getAttribute("class").replace(/\bactive\b/, "inactive"));
		e = surveys.__currentStepElt__ = surveys.__stepElts__[surveys.__step__ - 1];
		e.setAttribute('class', e.getAttribute("class").replace(/\binactive\b/, "active"));
	}
	
	function cancel(surveys, ev) {
		preventDefault(ev = ev||window.event);
		surveys.cancel && surveys.cancel.call(surveys.cancelBtn, ev);
	}
	
	function save(surveys, ev) {
		preventDefault(ev = ev||window.event);
		surveys.save && surveys.save.call(surveys.saveBtn, ev);
	}
	
	function back(surveys, ev) {
		if (surveys.__step__ > 1) {
			if (surveys.__contentPane__.children.length === surveys.__step__) {
				surveys.nextBtn.innerHTML = surveys.__nextLabel_;
				removeClass(surveys.nextBtn, "submit");
			}
			surveys.__contentPane__.children[--surveys.__step__].style.display ="none";
			surveys.__contentPane__.children[surveys.__step__ - 1].style.display ="block";
			var survey = surveys.__surveys_[surveys.__step__ - 1]
			if (surveys.__contentPane__.children.length > 1 && surveys.__step__ === 1) {
				surveys.prevBtn.style.visibility = "hidden";
			}
			var e = surveys.__currentStepElt__;
			if (e) {
				toggle(surveys, e);
			}
			focus(survey.__$$focusableInputs$$__||survey.inputs, 'last');
		}
	}
	
	function next(surveys, ev) {
		var children = surveys.__contentPane__.children;
		var len = children.length, 
			target = surveys.nextBtn,
			step = surveys.__step__, 
			withSummary = surveys.withSummary,
			survey = surveys.getSurvey(step - 1);
			
		if (survey && survey.validate && !survey.validate()) {
			return;
		}
		if (step < len) {												
			children[step - 1].style.display ="none";
			children[step].style.display ="block";						
			step++;
			surveys.__step__ = step;
			if (step === len) {
				target.innerHTML = surveys.__completeLabel_||surveys.__nextLabel_;
				addCssClass(target, "submit");
			} else {
				target.innerHTML = surveys.__nextLabel_;
				removeClass(target, "submit");
			}
			var s;
			if (withSummary && step === len) {
				surveys.__surveys_.forEach(function(p) {
					p.summary(false);
				});
			} else {
				s = surveys.getSurvey(step -1);
				focus(s.__$$focusableInputs$$__||s.inputs, 1);
			}
			if (len > 1) {
				surveys.prevBtn.style.visibility = "visible";
			}
			var e = surveys.__currentStepElt__;
			if (e) {
				toggle(surveys, e);
			}
		} else if (surveys.complete) {
			surveys.complete.call(surveys.nextBtn);
		}
	}
	/**
	 * 
	 * @return {HtmlElement}
	 */
	p.summary = function() {
		function addHead(o, container, cls) {
			label = (typeof o.getLabel === 'function' ? o.getLabel() : o.label||o.caption||o.title)||"";
			caption = $el("div");
			caption.setAttribute("class", cls||"SereniX-survey-label");
			if (typeof label === 'string') {
				caption.innerHTML = escapeHTML(label);
			} else if (typeof (label.htmlText||label.html) === 'string') {
				caption.innerHTML = abel.htmlText||label.html;
			}
			container.appendChild(caption);
		}
		var pane = $el("div");
		var head = $el("div"), body, foot, caption, label;
		
		addHead(this, head, this.titleClass||'title');
		body = $el("div");
		this.__surveys_.forEach(function(s, i) {
			addHead(s, body);
			body.appendChild(s.summary(false));
		});
		pane.appendChild(head);
		pane.appendChild(body);	
		
		return pane;
	};
	
	p.print = function() {
		throw new Error("Not yet supported");
	};
	
	p.toPdf = function() {
		throw new Error("Not yet supported");
	};
	p.build = function() {
		var self = this, el, c, cp, nav, buttons, stepsPane, cmd;
		var maxHeight;
		var titleDiv, captions, ul, li, e, es, count;
		var getContainer = this.__steps_ ? function(i) {
			var pane = $el("div");
			pane.style.display = i ? "none": "block";
			cp.appendChild(pane);
			return pane;
		}:function (i) {
			return el;
		};
		function createBtn(name, caption, fn) {
			var btn;
			if (arguments.length === 2) {
				fn = caption;
				caption = name;
				name = "";
			}
			btn = $el("span");
			if (name) {
				btn.name = name;
			}
			btn.setAttribute("tabindex", "0");
			btn.tabIndex = 0;
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
			btn.contentPane = cp;
			btn.surveys = self;
			addEvt('click', btn, fn);
			function onKey(ev) {
				var which, surveys;
				ev = ev||window.event;
				which = ev.which;
				if (which == undefined) {
					which = ev.keyCode;
				}
				surveys = this.surveys;
				if (which === 13) {
					onKey.fn.call(this, ev);
					preventDefault(ev);
				}
			}
			onKey.fn = fn;
			addEvt('keydown', btn, onKey);
			return btn;
		}
		
		function toHtml(v) {
			if (v == undefined) return "";
			if (typeof v.html === 'boolean') {
				return v.html ? v.text||v.htmlText : escapeHTML(v.text);
			}
			if (typeof v.htmlText === 'string') return v.htmlText;
			if (typeof v.text === 'string') return escapeHTML(v.text);
			return escapeHTML("" + v);
		};
		
		function addBlock(label, content, i) {
			var caption = doc.createElement("div");
			caption.setAttribute("class", "SereniX-survey-label");
			caption.innerHTML = toHtml(label);
			if (captions) {
				captions.appendChild(caption);
				caption.style.display = i ? "none" : "block";
				c = content;
			} else {
				c = getContainer(i);
				c.appendChild(caption);
				c.appendChild(content);
			}
			c.style.display = "block";
			maxHeight = Math.max(maxHeight, content.offsetHeight);
			c.style.display = i ? "none" :"block";
		}
		
		function focus(els, nth) {
			var i, n = els.length, match;			
			if (!Number.isInteger(els.length)) {
				if (typeof els.getInputs === 'function') {
					els = els.getInputs();
				} else if (typeof els.getFields === 'function') {
					els = els.getFields();
				} else if (isArray(els.inputs)) {
					els = els.inputs;
				}
			};
			els[nthInt(nth, els)-1].focus();
		}
		if (!this._element__ || !this.__built__) {
			if (this.__id_) {
				el = doc.getElementById(this.__id_);
				if (el) {
					el.innerHTML = "";
				} else {
					el = doc.createElement("div");
					el.id = this.__id_;
					(self.container||(self.container=doc.getElementsByTagName('body')[0])).appendChild(el);
				}
			} else {
				el = doc.createElement("div");
				(self.container||(self.container=doc.getElementsByTagName('body')[0])).appendChild(el);
			}
			addCssClass(el, 'SereniX-surveys');
			if (this.__steps_) {
				this.__step__ = 1;
				if (this.__visibleSteps_) {
					if (typeof this.__visibleSteps_ === 'string' && /inline|(?:in-?)?title/.test(this.__visibleSteps_)) {
						titleDiv = $el('div');
						el.appendChild(titleDiv);
						captions = $el('div');
						el.titleDiv = titleDiv;
						el.captions = captions;
					}
					stepsPane = $el("div");
					stepsPane.setAttribute("class", "SereniX-steps");
					stepsPane.style.position = "relative";
					stepsPane.style.display = "block";
					ul = $el("ul");
					es = [];
					count = this.__surveys_.length;
					stepsPane.appendChild(ul);
					for (var k=0; k < count; k++) {
						li = $el("li");
						e = $el("a");
						e.href = "#";
						e.innerHTML = "" + (e.step = k + 1);
						e.setAttribute('class', "survey-step " + (k ? 'inactive' : 'active'));	
						if (k === 0) {
							this.__currentStepElt__ = e;
						}
						li.appendChild(e);
						ul.appendChild(li);
						es.push(e);
					}
					if (this.withSummary) {
						li = $el("li");
						e = $el("a");
						e.href = "#";
						e.innerHTML = "" + (e.step = k + 1);
						e.setAttribute('class', "survey-step " + (k ? 'inactive' : 'active'));	
						if (k === 0) {
							this.__currentStepElt__ = e;
						}
						li.appendChild(e);
						ul.appendChild(li);
						es.push(e);
					}
					el.appendChild(titleDiv||stepsPane);
					this.__stepsPane__ = stepsPane;
					this.__stepElts__ = es;
				}
				cp = $el("div");
				cp.setAttribute("class", "SereniX-surveys-main");
				this.__contentPane__ = cp;
				nav = $el("div");
				nav.setAttribute("class", "SereniX-surveys-nav");
				nav.style.position = "block";
				this.__prevLabel_ = this.__prevLabel_||"Previous";
				var prevBtn, nextBtn, cancelBtn, saveBtn;
				
				if (typeof this.cancel === 'function') {
					nav.appendChild(cancelBtn = createBtn("Cancel", this.__cancelLabel_||"Cancel", function(ev) {
						//this represents the target button 
						var surveys = this.surveys;
						preventDefault(ev = ev||window.event);
						surveys.cancel.call(this, ev);
					}));
					this.cancelBtn = cancelBtn;
				}
				if (typeof this.save === 'function') {
					nav.appendChild(saveBtn = createBtn("Save", this.__saveLabel_||"Save", function(ev) {
						//this represents the target button 
						var surveys = this.surveys;
						preventDefault(ev = ev||window.event);
						surveys.save.call(this, ev);
					}));
					this.saveBtn = saveBtn;
				}
				nav.appendChild(prevBtn = createBtn("Previous", this.__prevLabel_, function(ev) {
					//this represents the target button 
					back(this.surveys);
					preventDefault(ev = ev||window.event);
				}));
				this.prevBtn = prevBtn;
				this.__nextLabel_ = this.__nextLabel_||"Next";
				this.__completeLabel_ = this.__completeLabel_||"Complete";
				nav.appendChild(nextBtn = createBtn("Next", this.__nextLabel_, function(ev) {
					//this represents the target button 
					next(this.surveys);
					preventDefault(ev = ev||window.event);
				}));
				this.nextBtn = nextBtn;
				
				el.appendChild(cp);
				el.appendChild(nav);
			}
			var surveys = this.__surveys_||[], caption, label;
			labelOnTop = this.labelOnTop;
			if (labelOnTop == undefined) {
				labelOnTop = true;
			}
			maxHeight = 0;
			if (labelOnTop) {
				surveys.forEach(function(s, i) {
					if (!(s instanceof Survey ||  (typeof Component === 'function' && s instanceof Component))) {
						surveys[i] = s = new Survey(s, false);
					}
					s.__surveys_ = self;
					addBlock(typeof s.getLabel === 'function' ? s.getLabel() : s.label||s.caption||s.title, s.getElement(), i);
				});	
				if (this.withSummary) {
					addBlock(this.summaryTitle||this.summaryLabel||this.summaryCaption||"Summary", this.summary(), surveys.length);
				}
			} else {
				surveys.forEach(function(s) {
					if (!(s instanceof Survey)) {
						s = new Survey(s);
					}
				});
			}
			if (titleDiv) {
				titleDiv.style.position = "relative";
				captions.style.display = stepsPane.style.display = "inline-block";
				if (this.__captionsBeforeSteps__ || this.__captionsBeforeSteps__ == undefined) {
					titleDiv.appendChild(captions);
					titleDiv.appendChild(stepsPane);
				} else {
					titleDiv.appendChild(stepsPane);
					titleDiv.appendChild(captions);
				}
			}
			
			var h = this.__mainHeight_||this.__bodyHeight_;
			if (['same', 'max', 'same-height', 'max-height'].indexOf(h) >= 0) {
				surveys.forEach(function(s) {
					Box.fullHeight(s.getElement(), maxHeight);
				});
			} else if (typeof h === 'number') {
				h = h + 'px';
				surveys.forEach(function(s) {
					Box.fullHeight(s.getElement(), h);
				});
			} else if (typeof h === 'string') {
				surveys.forEach(function(s) {
					
				});
			}
			this._element__ = el;
			
			if (surveys.length > 1) {
				prevBtn.style.visibility = "hidden";
			}
			var s = surveys[0], _fields;
			if (s instanceof Survey) {
				focus(s.__$$focusableInputs$$__||s.inputs, 1);
			} else if (isArray(_fields = typeof s.getInputFields === 'function' ? s.getInputFields() : typeof s.getInputs === 'function' ? s.getInputs() : s.inputs) && _fields.length) {
				if (typeof (s = _fields[0]).focus === 'function') {
					s.focus();
				} else if (typeof s.getElement === 'function') {
					if (s = s.getElement()) s.focus();					
				}
			}
		}
		this._element__.surveys = this;
		
		function onShortcut(ev) {
			var which, surveys, shortcutFuncs;
			ev = ev||window.event;
			which = ev.which;
			if (which == undefined) {
				which = ev.keyCode;
			}
			surveys = onShortcut.surveys;
			shortcutFuncs = surveys.shortcutFuncs;
			for (var key in shortcutFuncs) {
				if (KeyboardEvents.is(surveys[key + "Shortcut"], ev)) {
					shortcutFuncs[key](surveys, ev);
					preventDefault(ev);
					KeyboardEvents.clear();
				}
			};
		}
		onShortcut.surveys = this;
		onShortcut.element = this._element__;
		addEvt('keydown', document, onShortcut);
		addEvt('keyup', document, function(ev) {
			KeyboardEvents.clear();
		});
		this.__built__ = true;
		return this;
	};
	
	p.setFieldFactory = function(factory) {
		if (!arguments.length) {
			throw new Error("Field factory expected");
		}
		if (typeof factory !== 'function'
				&& factory != undefined
				&& factory.create !== 'function') {
			throw new Error("Incorrect argument");
		}
		this.__fieldFactory_ = factory;
		return this;
	};
	
	p.getFieldFactory = function() {
		return this.__fieldFactory_;
	};
	
	p.getElement = function() {
		if (!this._element__) this.build();
		return this._element__;
	}
	
	p.getStates = function() {
		var surveys = this.__surveys_||[];
		var states = { };
		surveys.forEach(function(s) {
			states[s.name||(typeof s.getLabel === 'function' ? s.getLabel() : s.label||s.caption||s.title)] = s.getStates();
		});
		return states;
	};
	
	p.setStates = function(states) {
		for (var key in states) {
			
		}
	};
	
	p.getValue = p.getStates;
	
	p.setValue = p.setStates;
	
	p.getId = function() {
		return this.__id_;
	};
	
	p.setId = function(id) {
		this.__id_ = id;
		return id;
	};
	
	p.isEditable = function() {
		this.__editable_;
	};
	
	p.setEditable = function(editable) {
		if (arguments.length === 0) editable = true;
		this.__editable_ = editable;
		(this.__surveys_||[]).forEach(function(s) {
			s.setEditable(editable);
		});
		
	};
	
	p.isReadOnly = function() {
		return !this.isEditable();
	};
	
	p.setReadOnly = function(readOnly) {
		if (arguments.length === 0) readOnly = true;
		return this.setEditable(!readOnly);
	};
	
	p.isDisabled = function() {
		this.__disabled_;
	};
	
	p.setDisabled = function(disabled) {
		if (arguments.length === 0) disabled = true;
		this.__disabled_ = disabled;
		(this.__surveys_||[]).forEach(function(s) {
			s.setDisabled(disabled);
		});
		
	};
	
	p.setObject = function(obj) {
		var self = this, key;
		function getSurvey(key) {
			var ss = self.__surveys_, s, i, n = ss.length;
			for (i = 0; i < n; i++) {
				s = ss[i];
				if (key === s.name || key === s.label)
					return s;
			};
		}
		if (isArray(obj)) {
			if (obj.length && Object.keys(obj[0]).indexOf("survey")) {
				obj.forEach(function(o, i) {
					getSurvey(obj.survey).setObject(obj.data||obj.value||obj.object);
				});
			} else {
				obj.forEach(function(o, i) {
					self.__surveys_[i].setObject(o);
				});
			}
		} else {
			for (key in obj) {
				getSurvey(key).setObject(obj[key]);
			}
		}
		return this;
	};
	
	p.setSaveLabel = function(label) {
		if (arguments.length === 0) {
			throw new Error("Argument expected");
		}
		if (label instanceof String) label = label.valueOf();
		if (typeof label !== 'string') {
			throw new Error("Incorrect argument");
		}
		this.__saveLabel_ = label;
		return this;
	};
	
	p.getSaveLabel = function() {
		return this.__label_||"Save";
	};
	
	p.setCancelLabel = function(label) {
		if (arguments.length === 0) {
			throw new Error("Argument expected");
		}
		if (label instanceof String) label = label.valueOf();
		if (typeof label !== 'string') {
			throw new Error("Incorrect argument");
		}
		this.__cancelLabel_ = label;
		return this;
	};
	
	p.getCancelLabel = function() {
		return this.__label_||"Cancel";
	};
	
	setObjProps(p,
		"id",
		"states",
		"value",
		{
			name: 'valueObj',
			get: p.getValue,
			set: p.setValue
		},
		{
			name: "element",
			get: p.getElement,
			set: function() { throw new Error("Read only property");}
		},
		"editable",
		{	
			name: "readonly",
			get: p.isReadOnly,
			set: p.setReadOnly
		},
		{
			name: "readOnly",
			get: p.isReadOnly,
			set: p.setReadOnly
		},		
		"disabled",
		"complete",
		"save",
		"cancel",
		"saveLabel",
		"cancelLabel",
		"fieldFactory"		
	);
	
	return Surveys;

});