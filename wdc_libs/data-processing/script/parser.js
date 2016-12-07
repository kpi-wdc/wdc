// data processing implementation
// 

var keywords = require("./keywords")
var util = require("util");
var logger = require("../../wdc-log").global;

var lookup = function(o){
	if (util.isDate(o)){
		return o;
	}

	if(util.isString(o)){
		return ((keywords[o.toLowerCase()])? keywords[o.toLowerCase()] : o)
	}

	if(util.isArray(o)){
		var res = [];
		o.forEach(function(item){
			res.push(lookup(item))
		})
		return res;
	}

	if(util.isObject(o)){
		var res = {};
		for (key in o){
			res[lookup(key)] = lookup(o[key])
		}
		return res;
	} 

	return o;
}

var   valuesRE = 			/'((?:\\\\[\'bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\'\\\\])*)'|\"((?:\\\\[\"bfnrt/\\\\]|\\\\u[a-fA-F0-9]{4}|[^\"\\\\])*)\"/gim
	, lineCommentRE = 		/\/\/[\w\S\ .\t\:\,;\'\"\(\)\{\}\[\]0-9-_]*(?:[\n\r]*)/gi
	, lineRE = 				/[\r\n\t\s]*/gim
	, inlineCommentRE = 	/\/\*[\w\W\b\.\t\:\,;\'\"\(\)\{\}\[\]\*0-9-_]*(?:\*\/)/gim
	, commandSplitRE = 		/(\))([a-zA-Z])/gim
	, nonbrackedParamsRE = 	/\(([\w\b\.\t\:\,\'\"0-9-_]+[\w\b\.\t\:\,\'\"\[\]\^0-9-_]*)\)/gi
	, propertyNameRE = 		/([a-zA-Z-]+(?=[\(\)\{\}\:\[\]\s]+))/gim
	, emptyPropsListRE = 	/\(\s*\)/gi

module.exports = {
	parse : function(str){

		var values =[];
		var matches = str.match(valuesRE);
		if(matches && matches.forEach){
			matches.forEach(function(tag){
				values.push(tag.substring(1,tag.length-1))
			})
		}

		function varIndex(tag){
			var key = tag.substring(1,tag.length-1)
			return  "^"+values.indexOf(key)
		}


		function varValue(tag){
			var key = tag.substring(1);
			return "\""+
				   values[Number(key)].replace(/\"/gi, "'")
					+"\""
		}
		
		var p = str.replace(valuesRE, varIndex)
		
		p = p.replace(lineCommentRE,"")
			.replace(lineRE,"")
			.replace(inlineCommentRE,"")
			.replace(commandSplitRE,"$1;$2")
			.replace(nonbrackedParamsRE,"({$1})")
			.replace(propertyNameRE,"\"$1\"")
			.replace(/\'/gim,"\"")
			.replace(emptyPropsListRE,"({})")
			.replace(/\(/gim,":")
			.replace(/\)/gim,"")
			.replace(/\^[0-9]+/gim,varValue)

		var script = [];
		var cmd = p.split(";")
		cmd.forEach(function(cm){
			// if(c!=""){
				logger.debug("parser process "+cm)
				var t = lookup(JSON.parse("{"+cm+"}"));
				script.push(t)
			// }	
		})
		
		var result = script.map(function(c){
						return {
							processId : Object.keys(c)[0],
							settings : c[Object.keys(c)[0]]
						} 
					})
		return result;
	},

	stringify: function(script){
		return script.map(function(c){
			return c.processId+"("+JSON.stringify(c.settings)+")"
		}).join(";")
	},

	applyContext: function(template, context){
      var getContextValue = function(){
          var tags =arguments[1].split(".")
          var value = context;
          tags.forEach(function(tag){
            tag = tag.trim();
            value = value[tag] 
          })

          return value
      }
      return template.replace(/(?:\{\{\s*)([a-zA-Z0-9_\.]*)(?:\s*\}\})/gim, getContextValue)
    }

}//eof