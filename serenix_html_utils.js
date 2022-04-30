function toHtml(v, fmt, o) {
	function join(html, list) {
		return list ? "<span>" + html + "</span>" + list : html;
	}
	var html, items;
	var list = "";
	var args = Array.prototype.slice.call(arguments, 1);
	o = o||{};
	if (v instanceof String || v instanceof Number || v instanceof Boolean) {
		v = v.valueOf();
	}
	if (typeof fmt === 'function') {
		return escapeHTML(fmt(v, o));
	}
	if (['number', 'boolean'].indexOf(typeof v) >= 0) {
		return "" + v;
	}
	if (v == undefined) return "";
	if (typeof v === 'string') return escapeHTML(v);
	if (v instanceof Date) {
		if (!fmt) {
			fmt = "yyyy-MM-dd HH:mm:ss";
		}
		
		if (isPlainObj(o.dataProcessor)) {
			return escapeHTML(o.dataProcessor.format(v, fmt));
		}
		if (typeof o.formatDate === 'function') {
			return escapeHTML(o.formatDate(v, fmt));
		}
		if (typeof dataProcessor === 'function') {
			return escapeHTML(dataProcessor(v, fmt));
		}
		if (isPlainObj(dataProcessor)) {
			return escapeHTML(dataProcessor.format(v, fmt));
		}
		if (typeof formatDate === 'function') {
			return escapeHTML(formatDate(v, fmt));
		}
		return escapeHTML(v.toString());
	}
	if (isArray(v)) {
		var x, 
			itemTag = o.itemTag||"span",
			open = "<" + itemTag + ">", 
			close = "</" + itemTag + ">";
		html = "<ul" + ((x = o.className||o["class"]||"") ? " " + x : "") + ">";
		v.forEach(function(i) {
			html += "<li>" + open
				+ toHtml(i, fmt, o);
				+ close + "</li>";
		});
		html += "</ul>";
		return html;
	}
	if (typeof v.toNodeHtml === 'function')
		return v.toNodeHtml.apply(v, args);
	if (typeof v.toHTMLString === 'function')
		return v.toHTMLString.apply(v, args);
	if (typeof v.toHtmlString === 'function')
		return v.toHtmlString.apply(v, args);
	
	if (typeof v.toHtml === 'function')
		return v.toHtml.apply(v, args);
	
	if (typeof v.html === 'string') {
		html = v.html;
	} else if (typeof v.html === 'function') {
		html = v.html();
	} else if (typeof v.htmlText == 'string') {
		html = v.htmlText;
	} else if (typeof v.htmlText == 'function') {
		html = v.htmlText();
	} else if (v.html) {
		if (typeof v.text === 'function') {
			html = v.text();
		} else {
			html = v.text||v.content||"";
		}
	} else {		
		if (isArray(items = o.childrenField != undefined ? v[o.childrenField] : v.items||v.children||v.options)) {
			list = toHtml(items);
		}
	}
	return html === undefined ? join(escapeHTML(
			typeof v.text === 'function' ? v.text() : 
			v.text||v.content||v.label||v.caption||v.fullName||v.name||""), list) : html;
}

if (typeof escapeHTML !== 'function') {
	function escapeHTML(s) {
		return s
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
	}
}

function unescapeHTML(str) {
  return str.replace(
    /&amp;|&lt;|&gt;|&#39;|&quot;/g,
    function(tag) {
      return {
        '&amp;': '&',
        '&lt;': '<',
        '&gt;': '>',
        '&#39;': "'",
		'&#039;': "'",
        '&quot;': '"'
      }[tag] || tag;
	}
  );
}

if (typeof BaseSurvey === 'function') {
	BaseSurvey.toHtml = toHtml;
}

if (typeof Accents === 'function' && typeof Accents.escapeHTML === "function") {
	if ((function()  {
		var ua = navigator ? navigator.userAgent.toLowerCase() : "";
		return ua.indexOf("internet explorer") >= 0 || ua.indexOf("msie") >= 0 || ua.indexOf("; trident/") >=  0;
	})()) {
		escapeHTML = Accents.escapeHTML;
	}

	unescapeHTML = Accents.unescapeHTML;
	
}