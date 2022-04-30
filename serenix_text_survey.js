(function(root, name, factory) {
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([name], factory);
	} else {
		root[name] = factory();
	}
	
})(this, 'TextSurvey', function() {
	
	
	/**
	 * <h3>TextSurvey class</h3>
	 * 
	 * @class TextSurvey
	 */
	function TextSurvey(o) {
		if (!(this instanceof TextSurvey)) {
			if (arguments.length) {
				return new TextSurvey(o);
			}
			return new TextSurvey();
		}
		this.__inputType_ = "textarea";
		if (isPlainObj(o)) {
			this.__inputType_ = o.inputType||o.type||"textarea";
			this.__title_ = o.title||o.text||"";
			this.__label_ = o.label||o.caption;
			this.__question_ = o.question||"";
			this.__inline_ = o.inline;
			var req = o.required == undefined ? o.mandatory : o.required;
			if (req === undefined) {
				req = !(o.optional == undefined ? (o.nullable === undefined ? o.isNull : o.nullable)  : o.optional);
			} else {
				req = !!req;
			}
			this.__required_ = req;
		}
	}

	TextSurvey.prototype = new BaseSurvey();

	TextSurvey.__CLASS__ = TextSurvey.prototype.__CLASS__ = TextSurvey;

	TextSurvey.__CLASS_NAME__ = TextSurvey.prototype.__CLASS_NAME__ = "TextSurvey";
	
	TextSurvey.toHtml = BaseSurvey.toHtml;
	
	TextSurvey.prototype.build = function() {
		var el,q, t, div;
		switch (this.__inputType_||"text") {
			case "text":
				el = document.createElement("input");
				break;
			case "textarea":
				el = document.createElement("textarea");
				break;
		}
		this.__textElement__ = el;
		if (el) this.__$$focusableInputs$$__ = [el];
		if (this.__question_) {
			q = document.createElement(this.__inline_ ? "span" : "div");
			q.innerHTML = escapeHTML(this.__question_);
			t = el;
			el = document.createElement("div");
			el.appendChild(q);
			el.appendChild(t);
		}
		this._element__ = el;
		
		if (this.__title_) {
			div = document.createElement("div");
			t = document.createElement("div");
			var txt = this.__title_;
			if (typeof txt === 'string') {
				t.innerHTML = escapeHTML(txt);
			} else if (isPlainObj(txt)) {
				if (typeof txt.html === "string") {
					t.innerHTML = txt.html;
				} else if (typeof txt.htmlText === "string") {
					t.innerHTML = txt.htmlText;
				} else if (typeof txt.html) {
					t.innerHTML = txt.content||txt.text||"";
				}
			}
			div.appendChild(t);
			div.appendChil(el);
			this._element__ = div;
		}
		
		this.__built__ = true;
		return this;
	};
	/**
	 * 
	 * @param {Boolean} withTitle
	 * @param {HtmlElement} [pane]
	 * @return {HtmlElement}
	 */
	TextSurvey.prototype.summary = function(withTitle, pane) {
		var survey = this;
		var el,q, tEl, div, lbl, b, tbl, tr, td, x;
		
		if (isPlainObj(withTitle)) {
			x = withTitle;
			withTitle = pane;
			pane = x;
		}
		withTitle = toBool(withTitle);
		
		if (!pane) {			
			pane = document.createElement("div");
			switch (this.__inputType_||"text") {
				case "text":
					tEl = document.createElement("span");
					break;
				case "textarea":
					tEl = document.createElement("div");
					break;
			}
			b = document.createElement("div");
			if (this.__inline_) {
				q = document.createElement("span");
				tbl= document.createElement("table");
				tr= document.createElement("tr");
				
				td= document.createElement("td");					
				td.appendChild(q);
				tr.appendChild(td);
				
				td= document.createElement("td");					
				td.appendChild(tEl);
				tr.appendChild(td);
				
				tbl.appendChild(tr);
				b.appendChild(tbl);
			} else {
				q = document.createElement("div");
				b.appendChild(q);
				b.appendChild(tEl);
			}
			q.innerHTML = toHtml(this.__question_||"");
			
			if (withTitle) {
				t = document.createElement("div");
				t.innerHTML= toHtml(this.__title_||"");
				pane.appendChild(t);
			}
			pane.appendChild(b);
			
			pane.textElement = tEl;
			return pane;
		}
		pane.textElement.innerHTML = (type=this.__inputType_||"text") === 'textarea' ? 
			this.__textElement__.innerHTML : escapeHTML(this.__textElement__.value||"");
		return pane;
	};
	
	TextSurvey.prototype.focus = function() {
		if (this.__textElement__) this.__textElement__.focus();
		return this;
	};
	
	TextSurvey.prototype.getElement = function() {
		if (!this._element__ || !this.__built__) {
			this.build();
		}
		return this._element__;
	}
	
	TextSurvey.prototype.validate = function() {
		if (this.__required_ && !this.getValue()) {
			return  { errorCode: 1, error: 1, message: 'not filled' };
		}
		return { errorCode : 0, error: 0 };
	};
	
	TextSurvey.prototype.getValue = function(value) {
		return this.__textElement__.value;
	};
	
	TextSurvey.prototype.setValue = function(value) {
		this.__textElement__.value = this._element__.valueObj = value;
		return this;
	};
	
	Object.defineProperty(TextSurvey.prototype, 'value', {
		get : TextSurvey.prototype.getValue,
		set : TextSurvey.prototype.setValue,
	});
	
	Object.defineProperty(TextSurvey.prototype, 'valueObj', {
		get : TextSurvey.prototype.getValue,
		set : TextSurvey.prototype.setValue,
	});
	
	return TextSurvey;

});
