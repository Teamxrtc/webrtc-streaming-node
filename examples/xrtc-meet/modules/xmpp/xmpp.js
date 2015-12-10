/* global $, APP, config, Strophe*/


var logger = require("jitsi-meet-logger").getLogger(__filename);
var EventEmitter = require("events");
var Pako = require("pako");
var StreamEventTypes = require("../../service/RTC/StreamEventTypes");
var RTCEvents = require("../../service/RTC/RTCEvents");
var XMPPEvents = require("../../service/xmpp/XMPPEvents");
var JitsiConnectionErrors = require("../../JitsiConnectionErrors");
var JitsiConnectionEvents = require("../../JitsiConnectionEvents");
var RTC = require("../RTC/RTC");

var authenticatedUser = false;

function createConnection(bosh) {
    bosh = bosh || '/http-bind';
	var StroConn = new Strophe.Connection(bosh);
    return StroConn;
};



//!!!!!!!!!! FIXME: ...
function initStrophePlugins(XMPP)
{
    require("./strophe.emuc")(XMPP);
    require("./strophe.jingle")(XMPP, XMPP.eventEmitter);
//    require("./strophe.moderate")(XMPP, eventEmitter);
//    require("./strophe.util")();
    require("./strophe.ping")(XMPP, XMPP.eventEmitter);
    require("./strophe.rayo")();
    require("./strophe.logger")();
}

//!!!!!!!!!! FIXME: ...
///**
// * If given <tt>localStream</tt> is video one this method will advertise it's
// * video type in MUC presence.
// * @param localStream new or modified <tt>LocalStream</tt>.
// */
//function broadcastLocalVideoType(localStream) {
//    if (localStream.videoType)
//        XMPP.addToPresence('videoType', localStream.videoType);
//}
//
//function registerListeners() {
//    RTC.addStreamListener(
//        broadcastLocalVideoType,
//        StreamEventTypes.EVENT_TYPE_LOCAL_CHANGED
//    );
//    RTC.addListener(RTCEvents.AVAILABLE_DEVICES_CHANGED, function (devices) {
//        XMPP.addToPresence("devices", devices);
//    });
//}

function XMPP(options) {
    this.eventEmitter = new EventEmitter.EventEmitter();
    this.connection = null;
    this.disconnectInProgress = false;

    this.forceMuted = false;
    this.options = options;
    initStrophePlugins(this);
//    registerListeners();

    this.connection = createConnection(options.bosh);
    this.connection.rawInput = function(data){ console.log('RECV:',data);};
    this.connection.rawOutput = function(data){ console.log('SEND:',data);};
}


XMPP.prototype.getConnection = function(){ return connection; };

XMPP.prototype._connect = function (jid, password) {
    var self = this;
    // connection.connect() starts the connection process.
    //
    // As the connection process proceeds, the user supplied callback will
    // be triggered multiple times with status updates. The callback should
    // take two arguments - the status code and the error condition.
    //
    // The status code will be one of the values in the Strophe.Status
    // constants. The error condition will be one of the conditions defined
    // in RFC 3920 or the condition ‘strophe-parsererror’.
    //
    // The Parameters wait, hold and route are optional and only relevant
    // for BOSH connections. Please see XEP 124 for a more detailed
    // explanation of the optional parameters.
    //
    // Connection status constants for use by the connection handler
    // callback.
    //
    //  Status.ERROR - An error has occurred (websockets specific)
    //  Status.CONNECTING - The connection is currently being made
    //  Status.CONNFAIL - The connection attempt failed
    //  Status.AUTHENTICATING - The connection is authenticating
    //  Status.AUTHFAIL - The authentication attempt failed
    //  Status.CONNECTED - The connection has succeeded
    //  Status.DISCONNECTED - The connection has been terminated
    //  Status.DISCONNECTING - The connection is currently being terminated
    //  Status.ATTACHED - The connection has been attached

    var anonymousConnectionFailed = false;
    var connectionFailed = false;
    var lastErrorMsg;
    this.connection.connect(jid, password, function (status, msg) {
    
    	console.log("INSIDE CONNECTION CONNECT status msg", status, msg);
        //logger.log("(TIME) Strophe " + Strophe.getStatusString(status) +
        //    (msg ? "[" + msg + "]" : "") + "\t:" + window.performance.now());
        if (status === Strophe.Status.CONNECTED) {
        	console.log("STROPHE CONNECTED-----------");
            if (self.options.useStunTurn) {
                self.connection.jingle.getStunAndTurnCredentials();
            }


            //logger.info("My Jabber ID: " , self.connection.jid);
            console.log("My Jabber ID: " + self.connection.jid);

            // Schedule ping ?
            var pingJid = self.connection.domain;
            console.log("pingJid",pingJid);
            /*self.connection.ping.hasPingSupport(
                pingJid,
                function (hasPing) {
                    if (hasPing) {
                    	console.log("Pinging!!");
                        self.connection.ping.startInterval(pingJid);
                    } else
                        //logger.warn("Ping NOT supported by " + pingJid);
                        console.log("Ping NOT supported by " + pingJid);
                }
            );*/ //Aruna---check it later
            
            if (password)
                authenticatedUser = true;
            //console.log("self.connection && self.connection.connected && Strophe.getResourceFromJid(self.connection.jid)",self.connection, self.connection.connected, Strophe.getResourceFromJid(self.connection.jid));
            if (self.connection && self.connection.connected &&
                Strophe.getResourceFromJid(self.connection.jid)) {
                // .connected is true while connecting?
//                self.connection.send($pres());
                self.eventEmitter.emit(JitsiConnectionEvents.CONNECTION_ESTABLISHED,
                    Strophe.getResourceFromJid(self.connection.jid));
            }
        } else if (status === Strophe.Status.CONNFAIL) {
            if (msg === 'x-strophe-bad-non-anon-jid') {
                anonymousConnectionFailed = true;
            }
            else
            {
                connectionFailed = true;
            }
            lastErrorMsg = msg;
        } else if (status === Strophe.Status.DISCONNECTED) {
            // Stop ping interval
            self.connection.ping.stopInterval();
            self.disconnectInProgress = false;
            if (anonymousConnectionFailed) {
                // prompt user for username and password
                self.eventEmitter.emit(JitsiConnectionEvents.CONNECTION_FAILED,
                    JitsiConnectionErrors.PASSWORD_REQUIRED);
            } else if(connectionFailed) {
                self.eventEmitter.emit(JitsiConnectionEvents.CONNECTION_FAILED,
                    JitsiConnectionErrors.OTHER_ERROR,
                    msg ? msg : lastErrorMsg);
            } else {
                self.eventEmitter.emit(JitsiConnectionEvents.CONNECTION_DISCONNECTED,
                    msg ? msg : lastErrorMsg);
            }
        } else if (status === Strophe.Status.AUTHFAIL) {
            // wrong password or username, prompt user
            self.eventEmitter.emit(JitsiConnectionEvents.CONNECTION_FAILED,
                JitsiConnectionErrors.PASSWORD_REQUIRED);

        }
    });
}

XMPP.prototype.connect = function (jid, password) {
    if(!jid) {
        var configDomain = this.options.hosts.anonymousdomain || this.options.hosts.domain;
        // Force authenticated domain if room is appended with '?login=true'
        if (this.options.hosts.anonymousdomain &&
            window.location.search.indexOf("login=true") !== -1) {
            configDomain = this.options.hosts.domain;
        }
       // jid = configDomain || window.location.hostname;
          jid = configDomain ;
       // console.log("pi hostname ", window.location.hostname);
    }
    return this._connect(jid, password);
};

XMPP.prototype.createRoom = function (roomName, options, useNicks, nick) {
    var roomjid = roomName  + '@' + this.options.hosts.muc;

    if (useNicks) {
        if (nick) {
            roomjid += '/' + nick;
        } else {
            roomjid += '/' + Strophe.getNodeFromJid(this.connection.jid);
        }
    } else {
        var tmpJid = Strophe.getNodeFromJid(this.connection.jid);

        if(!authenticatedUser)
            tmpJid = tmpJid.substr(0, 8);

        roomjid += '/' + tmpJid;
    }
    return this.connection.emuc.createRoom(roomjid, null, options);
}

XMPP.prototype.addListener = function(type, listener) {
    this.eventEmitter.on(type, listener);
};

XMPP.prototype.removeListener = function (type, listener) {
    this.eventEmitter.removeListener(type, listener);
};

//FIXME: this should work with the room
XMPP.prototype.leaveRoom = function (jid) {
    var handler = this.connection.jingle.jid2session[jid];
    if (handler && handler.peerconnection) {
        // FIXME: probably removing streams is not required and close() should
        // be enough
        if (RTC.localAudio) {
            handler.peerconnection.removeStream(
                RTC.localAudio.getOriginalStream(), true);
        }
        if (RTC.localVideo) {
            handler.peerconnection.removeStream(
                RTC.localVideo.getOriginalStream(), true);
        }
        handler.peerconnection.close();
    }
    this.eventEmitter.emit(XMPPEvents.DISPOSE_CONFERENCE);
    this.connection.emuc.doLeave(jid);
};

/**
 * Sends 'data' as a log message to the focus. Returns true iff a message
 * was sent.
 * @param data
 * @returns {boolean} true iff a message was sent.
 */
XMPP.prototype.sendLogs = function (data) {
    if(!this.connection.emuc.focusMucJid)
        return false;

    var deflate = true;

    var content = JSON.stringify(data);
    if (deflate) {
        content = String.fromCharCode.apply(null, Pako.deflateRaw(content));
    }
    content = Base64.encode(content);
    // XEP-0337-ish
    var message = $msg({to: this.connection.emuc.focusMucJid, type: 'normal'});
    message.c('log', { xmlns: 'urn:xmpp:eventlog',
        id: 'PeerConnectionStats'});
    message.c('message').t(content).up();
    if (deflate) {
        message.c('tag', {name: "deflated", value: "true"}).up();
    }
    message.up();

    this.connection.send(message);
    return true;
};

// Gets the logs from strophe.jingle.
XMPP.prototype.getJingleLog = function () {
    return this.connection.jingle ? this.connection.jingle.getLog() : {};
};

// Gets the logs from strophe.
XMPP.prototype.getXmppLog = function () {
    return this.connection.logger ? this.connection.logger.log : null;
};


XMPP.prototype.dial = function (to, from, roomName,roomPass) {
    this.connection.rayo.dial(to, from, roomName,roomPass);
};

XMPP.prototype.setMute = function (jid, mute) {
    this.connection.moderate.setMute(jid, mute);
};

XMPP.prototype.eject = function (jid) {
    this.connection.moderate.eject(jid);
};

XMPP.prototype.getSessions = function () {
    return this.connection.jingle.sessions;
};

XMPP.prototype.disconnect = function () {
    if (this.disconnectInProgress || !this.connection || !this.connection.connected)
    {
        this.eventEmitter.emit(JitsiConnectionEvents.WRONG_STATE);
        return;
    }

    this.disconnectInProgress = true;

    this.connection.disconnect();
};


module.exports = XMPP;
