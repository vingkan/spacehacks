var TRANSFORMERS = {
	var pronouns = ["I", "me", "we", "us", "you", "she"
									"her", "he", "him", "it", "they", "them",
									"that", "which", "who", "whom", "whichever",
									"whoever", "whomever", "this", "these",
									"that", "those", "anybody", "anyone", "anything",
									"each", "either", "everybody", "everyone",
									"everything", "neither", "nobody", "no one",
									"somebody", "someone", "something", "few", "many",
									"several", "all", "any", "most", "none", "some",
									"myself", "ourselves", "yourself", "yourselves",
									"himself", "herself", "itself", "themselves",
									"my", "your", "his", "her", "its", "our", "their",
									"mine", "yours", "hers", "ours", "theirs"];

// not exhaustive, certain words removed just in case of usability

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

	reverseWords: function(msg) {
		msg.split("").reverse().join("").split(" ").reverse().join(" ");
		return msg;
	}

	removePronouns: function(msg) {
		var words = msg.split(" ");
		for (var i = 0; i < words.length; i++) {
			for (var j = 0; j < pronouns.length; j++) {
				if (words[i] == pronouns[j]) {
					words[i] == "";
				}
			}
		}
		return words.join(" ");
	}
}
