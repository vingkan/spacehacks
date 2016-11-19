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

	// CALLBACKS
	alphaCallback: false,
	betaCallback: false,
	gammaCallback: false,
	deltaCallback: false,

	// STATES
	past: {
		alpha: Infinity,
		beta: Infinity,
		gamma: Infinity,
		delta: Infinity
	},

	refs: {
		alpha: false,
		beta: false,
		gamma: false,
		delta: false
	},

	readoutMode: 'normal',

	// INTERNAL METHODS
	_syncButton: function(p){
		var _this = this;
		db.ref('buttons/' + p).on('child_added', function(snap){
			var val = snap.val();
			if(val.timestamp > _this.past[p]){
				_this.past[p] = val.timestamp;
				var callback = _this[p + 'Callback'];
				if(callback){
					callback(val);
				}
			}
		});
	},

	_unsyncButton: function(p){
		db.ref('buttons/' + p).off();
	},

	_pushButton: function(id){
		db.ref('buttons/' + id).push({timestamp: Date.now()});
	},

	// EXTERNAL METHODS
	sync: function(){
		var _this = this;
		this.past = {
			alpha: Date.now(),
			beta: Date.now(),
			gamma: Date.now(),
			delta: Date.now()
		}
		for(var p in this.refs){
			this.refs[p] = this._syncButton(p);
		}
		db.ref('readout').on('value', function(r){
			_this.readoutMode = r.val();
		});
	},

	unsync: function(){
		for(var r in this.refs){
			this._unsyncButton(r);
		}
		db.ref('readout').off();
	},

	sendMessage: function(msg){
		db.ref('messages').push({
			message: msg,
			timestamp: Date.now()
		});
	},

	getReadoutMode: function(){
		return this.readoutMode;
	},

	setReadoutMode: function(newMode){
		db.ref('readout').set(newMode);
	}

}