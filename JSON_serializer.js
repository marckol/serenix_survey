function serializeToJSON(o, inline, indent, indentFirstLine) {
	indent = indent||0;
	
	var s = "", strIndent = "", v, index;
	for (var i = 0; i < indent; i++) {
		strIndent += "    ";
	}
	
	
	if (o === undefined) {
		return (indentFirstLine ? strIndent : "") + "undefined";
	} else if (o === null) {
		return (indentFirstLine ? strIndent : "") + "null";
	} else if (typeof o === 'string') {
		return (indentFirstLine ? strIndent : "") + '"' + o.replace(/"/g, '\\"') + '"';
	}
	
	if (inline) {
		return JSON.stringify(o);
	} else if (isArray(o)) {
		s += (indentFirstLine ? strIndent : "") + "[";
		for (var k = 0, n = o.length; k < n; k++) {
			v= o[k];
			s += (k ? "," : "") + '\n' + serializeToJSON(v, inline, indent + 1, true);
		}
		s += "\n" + strIndent + "]";
	} else if (isPlainObj(o)) {
		if (o.toJSONString) {
			return o.toJSONString(inline, indent, indentFirstLine);
		}
		s += (indentFirstLine ? strIndent : "") + "{";
		index = 0;
		for (var k in o) {			
			if (o[k] !== undefined) {
				s += (index ? "," : "") + "\n" + strIndent + '    "' + k + '": ' + serializeToJSON(o[k], inline, indent + 1, false);
				index++;
			}
		}
		s += "\n" + strIndent + "}";
	} else {
		return o.toString();
	}
	return s;
}