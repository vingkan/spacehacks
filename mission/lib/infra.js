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
	roomKey: false,
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
		db.ref(_this.roomKey + '/buttons/' + p).on('child_added', function(snap){
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
		var _this = this;
		db.ref(_this.roomKey + '/buttons/' + p).off();
	},

	_pushButton: function(id){
		var _this = this;
		db.ref(_this.roomKey + '/buttons/' + id).push({timestamp: Date.now()});
	},

	// EXTERNAL METHODS
	sync: function(roomKey){
		var _this = this;
		_this.roomKey = roomKey;
		_this.past = {
			alpha: Date.now(),
			beta: Date.now(),
			gamma: Date.now(),
			delta: Date.now()
		}
		for(var p in this.refs){
			this.refs[p] = this._syncButton(p);
		}
		db.ref(_this.roomKey + '/readout').on('value', function(r){
			_this.readoutMode = r.val();
		});
	},

	unsync: function(){
		var _this = this;
		for(var r in _this.refs){
			_this._unsyncButton(r);
		}
		db.ref(_this.roomKey + '/readout').off();
	},

	getRoomKey: function(){
		return this.roomKey;
	},

	sendMessage: function(msg){
		var _this = this;
		db.ref(_this.roomKey + '/messages').push({
			message: msg,
			timestamp: Date.now()
		});
	},

	getReadoutMode: function(){
		return this.readoutMode;
	},

	setReadoutMode: function(newMode){
		var _this = this;
		db.ref(_this.roomKey + '/readout').set(newMode);
	}

}