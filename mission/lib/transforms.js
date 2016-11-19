var TRANSFORMERS = {

	normal: function(msg){
		return msg;
	},

	no_vowels: function(msg){
		var nMsg = '';
		var vowels = {a: 0, e: 0, i: 0, o: 0, u: 0};
		for(var i = 0; i < msg.length; i++){
			var c = msg[i].toLowerCase();
			if(!(c in vowels)){
				nMsg += c.toUpperCase();
			}
		}
		return nMsg;
	}

}