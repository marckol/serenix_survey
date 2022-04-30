if (typeof addEvt === 'undefined') {
	function addEvt(evt, el, fn) {
		evt = evt.toLowerCase();
		if (el.addEventListener) {
			if (evt.startsWith('on')) {
				evt = evt.substring(2);
			}
			el.addEventListener(evt, fn);
		} else if (el.attachEvent) {
			if (!evt.startsWith('on')) {
				evt = 'on' + evt;
			}
			el.attachEvent(evt, fn);
		}
	}
}

if (typeof removeEvt === 'undefined') {
	function removeEvt(evt, el, fn) {
		evt = evt.toLowerCase();
		if (el.addEventListener) {
			if (evt.startsWith('on')) {
				evt = evt.substring(2);
			}
			el.removeEventListener(evt, fn);
		} else if (el.attachEvent) {
			if (!evt.startsWith('on')) {
				evt = 'on' + evt;
			}
			el.detachEvent(evt, fn);
		}
	}
}

if (typeof preventDefault === 'undefined') {
	preventDefault = function(ev) {
		if (ev.preventDefault) ev.preventDefault();
		else if (ev.stopPropagation) ev.stopPropagation();
	};
}


function fireEvent(el, evtType) {
	evtType = evtType.toLowerCase();
	if (el.fireEvent) {
		el.fireEvent((/^on/.test(evtType) ? '' : 'on') + evtType);
	} else {
		var ev = document.createEvent('Events');
		ev.initEvent(/^on/.test(evtType) ? evtType.substring(2) : evtType, true, false);
		el.dispatchEvent(ev);
	}
}

var dispatchEvent = fireEvent;

if (typeof toBool === 'undefined') {
	toBool = function(v) {
		if (!v) return false;
		var t = typeof v;
		if (t === 'string') {
			return ['no', 'off', 'n', '0', 'false', 'ko', 'non'].indexOf(v) >= 0;
		}
		return !!v;
	}
}

if (typeof String.prototype.startsWith === 'undefined') {
	String.prototype.startsWith = function(w, offset) {
		if (arguments.length > 1 && Number.isInteger(offset)) {
			w = w.substring(offset);
		}
		var re = new RegExp("^" + w.replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r"));
		return re.test(this);
	};
}

if (typeof String.prototype.endssWith === 'undefined') {
	String.prototype.endssWith = function(w) {
		var re = new RegExp(w.replace(/\t/g, "\\t").replace(/\n/g, "\\n").replace(/\r/g, "\\r") + "$");
		return re.test(this);
	};
}

if (typeof Number.isInteger === 'undefined') {
	Number.isInteger = function(v) {
		return typeof v === 'number' && Math.floor(v) === v;
	}
}

if (typeof Object.keys === 'undefined') {
	Object.keys = function(o) {		
		var k,
		    ks = [],
			i = 0;
		if (o  && isPlainObj(o)) {
			for (k in o) {
				if (k !== '_proto_') {
					ks[i++] = k;
				}
			}
		}		
		return ks;
	}
}

if (typeof addCssClass !== 'function') {
	function addCssClass(el, cls) {
		if (cls instanceof String) {
			cls = cls.valueOf();
		}
		if (typeof cls === 'string') {
			cls = cls.trim();
			if (cls)
				cls = cls.replace(/[ \t\n\r]+/g, ' ').split(/[ ]/g);
		} else if (isArray(cls)) {
			var cList = [], s;
			for (var i = 0, n = cls.length; i < cls.length; i++) {
				s = cls[i].trim().replace(/[ \t\n\r]+/g, ' ').split(/[ ]/g);
				for (var j = 0, l = s.length; j < l; j++) {
					cList.push(s[j]);
				}
			}
			cls = cList;
		}
		if (!cls.length) {
			return el;
		}
		var classList = el.classList;
		
		if (classList) {
			for (var i = 0, n = cls.length; i< n; i++) {
				classList.add(cls[i]);
			}
		} else {
			var c = el.className||"", p, ofs = 0, end, _cls;
			for (var i = 0, n = cls.length; i< n; i++) {
				ofs = 0;
				_cls = cls[i];
				for (;;) {
					p = c.indexOf(ofs, _cls);
					if (p < 0) {
						c += (c ? ' ' : '') + _cls;
						break
					}
					end = p + _cls.length;
					if ((ofs === 0 || " \t\b\0".indexOf(c.charAt(ofs - 1)) >= 0) &&
							(end === c.length || " \t\b\0".indexOf(c.charAt(end)) >= 0)) {
						break;
					}
					ofs = end;
				}
			}
		}
		return el;
	}
}

if (typeof escapeHTML !== 'function') {
	function escapeHTML(s) {
		return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
	}
}



function setObjProps(o, $1) {
	function nameKey(p) {
		return p[0].toUpperCase() + p.substring(1);
	}
	function getter(p, o) {
		var k = nameKey(p), n = 'get' + k, g = o[n];
		if (typeof g !== 'function') {
			n = 'is' + k;
			g = o[n];
		}
		return g;
	}
	function setter(p, o) {
		return o['set' + nameKey(p)];
	}
	var ps, propsList;
	if (arguments.length > 2) {
		propsList = Array.prototype.slice.call(arguments, 1);
	} else if (isArray($1)) {
		propsList = $1;
	} else {
		propsList = [$1];
	}
	propsList.forEach(function(props) {
		if (props instanceof String) {
			props = props.valueOf();
		}
		if (typeof props === 'string') {
			if (!props) {
				throw new Error("Incorrect arguments");
			}
			props = props.split(/\s*[|,;]\s*/);
		}
		if (isArray(props)) {
			ps = ps||{};
			props.forEach(function(p) {
				if (typeof p === 'string') {
					p = {
						name : p,
						get: getter(p, o),
						set: setter(p, o),
						configurable: true,
						enumerable: true
					};
				} else if (isArray(p)) {
					p = p.length === 2 || typeof p[2] === "boolean" ? {
						name : p[0],
						value: p[1],
						writable: p.length === 2 ? true : p[2]
					} :{
						name : p[0],
						get: p[1],
						set: p[2],
						configurable: true,
						enumerable: true
					}
				} else if (!isPlainObj(p)) {
					throw new TypeError("Incorrect arguments");
				}
				ps[p.name] = p;
			});
		} else if (isPlainObj(props)) {
			ps = ps||{};
			if (props.name == undefined || (typeof props.get !== 'function' && Object.keys(props).indexOf("value") < 0)) {
				for (var k in props) {
					ps[k] = props[k];
				}
			} else {				
				ps[props.name] = props;
			}
		} else {
			throw new Error("Incorrect arguments");
		}
	});
	Object.defineProperties(o, ps);
	return o;
};

var setObjectProps = setObjProps;

function isPlainObj(o) {
	return Object.prototype.toString.call(o) === '[object Object]';
}

function isArray(a) {
	return Array.isArray(a);
}

(function(root, name, factory) {
	if (typeof module !== 'undefined' && typeof module.exports !== 'undefined') {
		module.exports = factory();
	} else if (typeof define === 'function' && define.amd) {
		define([name], factory);
	} else {
		root[name] = factory();
	}
	
})(this, 'BaseSurvey', function() {
	
	

	function BaseSurvey() {

	}
	
	if (typeof AField === "function") {

		BaseSurvey.prototype = new AField();

	}

	BaseSurvey.__CLASS__ = BaseSurvey.prototype.__CLASS__ = BaseSurvey;

	BaseSurvey.__CLASS_NAME__ = BaseSurvey.prototype.__CLASS_NAME__ = "BaseSurvey";
	if (typeof toHtml === 'function') {	
		BaseSurvey.toHtml = toHtml;	
	}
	
	return BaseSurvey;

});

