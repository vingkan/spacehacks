var config = {
	apiKey: "AIzaSyBRwFZhOh7Yt_kfKZVKRCHwvn92gX0EGew",
	authDomain: "spacehacks-58330.firebaseapp.com",
	databaseURL: "https://spacehacks-58330.firebaseio.com",
	storageBucket: "spacehacks-58330.appspot.com",
	messagingSenderId: "559373315205"
};

var SHFirebase = firebase.initializeApp(config);
var db = SHFirebase.database();

window.MissionLink = {
	alphaCallback: false,
	betaCallback: false,
	gammaCallback: false,
	deltaCallback: false
}

var PAST = {
	alpha: Date.now(),
	beta: Date.now(),
	gamma: Date.now(),
	delta: Date.now()
}

function syncButton(p){
	db.ref('buttons/' + p).on('child_added', function(snap){
		var val = snap.val();
		if(val.timestamp > PAST[p]){
			PAST[p] = val.timestamp;
			var callback = MissionLink[p + 'Callback'];
			if(callback){
				callback(val);
			}
		}
	});
}

for(var p in PAST){
	syncButton(p);
}

MissionLink.alphaCallback = function(data){
	console.log('Alpha: ', data);
}