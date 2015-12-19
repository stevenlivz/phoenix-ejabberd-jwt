(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var endsWith = function(str, suffix) {
    return str.indexOf(suffix, str.length - suffix.length) !== -1;
  };

  var _cmp = 'components/';
  var unalias = function(alias, loaderPath) {
    var start = 0;
    if (loaderPath) {
      if (loaderPath.indexOf(_cmp) === 0) {
        start = _cmp.length;
      }
      if (loaderPath.indexOf('/', start) > 0) {
        loaderPath = loaderPath.substring(start, loaderPath.indexOf('/', start));
      }
    }
    var result = aliases[alias + '/index.js'] || aliases[loaderPath + '/deps/' + alias + '/index.js'];
    if (result) {
      return _cmp + result.substring(0, result.length - '.js'.length);
    }
    return alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';
    path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("deps/phoenix/web/static/js/phoenix", function(exports, require, module) {
// Phoenix Channels JavaScript client
//
// ## Socket Connection
//
// A single connection is established to the server and
// channels are mulitplexed over the connection.
// Connect to the server using the `Socket` class:
//
//     let socket = new Socket("/ws", {params: {userToken: "123"}})
//     socket.connect()
//
// The `Socket` constructor takes the mount point of the socket,
// the authentication params, as well as options that can be found in
// the Socket docs, such as configuring the `LongPoll` transport, and
// heartbeat.
//
// ## Channels
//
// Channels are isolated, concurrent processes on the server that
// subscribe to topics and broker events between the client and server.
// To join a channel, you must provide the topic, and channel params for
// authorization. Here's an example chat room example where `"new_msg"`
// events are listened for, messages are pushed to the server, and
// the channel is joined with ok/error matches, and `after` hook:
//
//     let channel = socket.channel("rooms:123", {token: roomToken})
//     channel.on("new_msg", msg => console.log("Got message", msg) )
//     $input.onEnter( e => {
//       channel.push("new_msg", {body: e.target.val})
//        .receive("ok", (msg) => console.log("created message", msg) )
//        .receive("error", (reasons) => console.log("create failed", reasons) )
//        .after(10000, () => console.log("Networking issue. Still waiting...") )
//     })
//     channel.join()
//       .receive("ok", ({messages}) => console.log("catching up", messages) )
//       .receive("error", ({reason}) => console.log("failed join", reason) )
//       .after(10000, () => console.log("Networking issue. Still waiting...") )
//
//
// ## Joining
//
// Joining a channel with `channel.join(topic, params)`, binds the params to
// `channel.params`. Subsequent rejoins will send up the modified params for
// updating authorization params, or passing up last_message_id information.
// Successful joins receive an "ok" status, while unsuccessful joins
// receive "error".
//
//
// ## Pushing Messages
//
// From the previous example, we can see that pushing messages to the server
// can be done with `channel.push(eventName, payload)` and we can optionally
// receive responses from the push. Additionally, we can use
// `after(millsec, callback)` to abort waiting for our `receive` hooks and
// take action after some period of waiting.
//
//
// ## Socket Hooks
//
// Lifecycle events of the multiplexed connection can be hooked into via
// `socket.onError()` and `socket.onClose()` events, ie:
//
//     socket.onError( () => console.log("there was an error with the connection!") )
//     socket.onClose( () => console.log("the connection dropped") )
//
//
// ## Channel Hooks
//
// For each joined channel, you can bind to `onError` and `onClose` events
// to monitor the channel lifecycle, ie:
//
//     channel.onError( () => console.log("there was an error!") )
//     channel.onClose( () => console.log("the channel has gone away gracefully") )
//
// ### onError hooks
//
// `onError` hooks are invoked if the socket connection drops, or the channel
// crashes on the server. In either case, a channel rejoin is attemtped
// automatically in an exponential backoff manner.
//
// ### onClose hooks
//
// `onClose` hooks are invoked only in two cases. 1) the channel explicitly
// closed on the server, or 2). The client explicitly closed, by calling
// `channel.leave()`
//

"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var VSN = "1.0.0";
var SOCKET_STATES = { connecting: 0, open: 1, closing: 2, closed: 3 };
var CHANNEL_STATES = {
  closed: "closed",
  errored: "errored",
  joined: "joined",
  joining: "joining"
};
var CHANNEL_EVENTS = {
  close: "phx_close",
  error: "phx_error",
  join: "phx_join",
  reply: "phx_reply",
  leave: "phx_leave"
};
var TRANSPORTS = {
  longpoll: "longpoll",
  websocket: "websocket"
};

var Push = (function () {

  // Initializes the Push
  //
  // channel - The Channel
  // event - The event, for example `"phx_join"`
  // payload - The payload, for example `{user_id: 123}`
  //

  function Push(channel, event, payload) {
    _classCallCheck(this, Push);

    this.channel = channel;
    this.event = event;
    this.payload = payload || {};
    this.receivedResp = null;
    this.afterHook = null;
    this.recHooks = [];
    this.sent = false;
  }

  _createClass(Push, [{
    key: "send",
    value: function send() {
      var _this = this;

      var ref = this.channel.socket.makeRef();
      this.refEvent = this.channel.replyEventName(ref);
      this.receivedResp = null;
      this.sent = false;

      this.channel.on(this.refEvent, function (payload) {
        _this.receivedResp = payload;
        _this.matchReceive(payload);
        _this.cancelRefEvent();
        _this.cancelAfter();
      });

      this.startAfter();
      this.sent = true;
      this.channel.socket.push({
        topic: this.channel.topic,
        event: this.event,
        payload: this.payload,
        ref: ref
      });
    }
  }, {
    key: "receive",
    value: function receive(status, callback) {
      if (this.receivedResp && this.receivedResp.status === status) {
        callback(this.receivedResp.response);
      }

      this.recHooks.push({ status: status, callback: callback });
      return this;
    }
  }, {
    key: "after",
    value: function after(ms, callback) {
      if (this.afterHook) {
        throw "only a single after hook can be applied to a push";
      }
      var timer = null;
      if (this.sent) {
        timer = setTimeout(callback, ms);
      }
      this.afterHook = { ms: ms, callback: callback, timer: timer };
      return this;
    }

    // private

  }, {
    key: "matchReceive",
    value: function matchReceive(_ref) {
      var status = _ref.status;
      var response = _ref.response;
      var ref = _ref.ref;

      this.recHooks.filter(function (h) {
        return h.status === status;
      }).forEach(function (h) {
        return h.callback(response);
      });
    }
  }, {
    key: "cancelRefEvent",
    value: function cancelRefEvent() {
      this.channel.off(this.refEvent);
    }
  }, {
    key: "cancelAfter",
    value: function cancelAfter() {
      if (!this.afterHook) {
        return;
      }
      clearTimeout(this.afterHook.timer);
      this.afterHook.timer = null;
    }
  }, {
    key: "startAfter",
    value: function startAfter() {
      var _this2 = this;

      if (!this.afterHook) {
        return;
      }
      var callback = function callback() {
        _this2.cancelRefEvent();
        _this2.afterHook.callback();
      };
      this.afterHook.timer = setTimeout(callback, this.afterHook.ms);
    }
  }]);

  return Push;
})();

var Channel = (function () {
  function Channel(topic, params, socket) {
    var _this3 = this;

    _classCallCheck(this, Channel);

    this.state = CHANNEL_STATES.closed;
    this.topic = topic;
    this.params = params || {};
    this.socket = socket;
    this.bindings = [];
    this.joinedOnce = false;
    this.joinPush = new Push(this, CHANNEL_EVENTS.join, this.params);
    this.pushBuffer = [];
    this.rejoinTimer = new Timer(function () {
      return _this3.rejoinUntilConnected();
    }, this.socket.reconnectAfterMs);
    this.joinPush.receive("ok", function () {
      _this3.state = CHANNEL_STATES.joined;
      _this3.rejoinTimer.reset();
    });
    this.onClose(function () {
      _this3.socket.log("channel", "close " + _this3.topic);
      _this3.state = CHANNEL_STATES.closed;
      _this3.socket.remove(_this3);
    });
    this.onError(function (reason) {
      _this3.socket.log("channel", "error " + _this3.topic, reason);
      _this3.state = CHANNEL_STATES.errored;
      _this3.rejoinTimer.setTimeout();
    });
    this.on(CHANNEL_EVENTS.reply, function (payload, ref) {
      _this3.trigger(_this3.replyEventName(ref), payload);
    });
  }

  _createClass(Channel, [{
    key: "rejoinUntilConnected",
    value: function rejoinUntilConnected() {
      this.rejoinTimer.setTimeout();
      if (this.socket.isConnected()) {
        this.rejoin();
      }
    }
  }, {
    key: "join",
    value: function join() {
      if (this.joinedOnce) {
        throw "tried to join multiple times. 'join' can only be called a single time per channel instance";
      } else {
        this.joinedOnce = true;
      }
      this.sendJoin();
      return this.joinPush;
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.on(CHANNEL_EVENTS.close, callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.on(CHANNEL_EVENTS.error, function (reason) {
        return callback(reason);
      });
    }
  }, {
    key: "on",
    value: function on(event, callback) {
      this.bindings.push({ event: event, callback: callback });
    }
  }, {
    key: "off",
    value: function off(event) {
      this.bindings = this.bindings.filter(function (bind) {
        return bind.event !== event;
      });
    }
  }, {
    key: "canPush",
    value: function canPush() {
      return this.socket.isConnected() && this.state === CHANNEL_STATES.joined;
    }
  }, {
    key: "push",
    value: function push(event, payload) {
      if (!this.joinedOnce) {
        throw "tried to push '" + event + "' to '" + this.topic + "' before joining. Use channel.join() before pushing events";
      }
      var pushEvent = new Push(this, event, payload);
      if (this.canPush()) {
        pushEvent.send();
      } else {
        this.pushBuffer.push(pushEvent);
      }

      return pushEvent;
    }

    // Leaves the channel
    //
    // Unsubscribes from server events, and
    // instructs channel to terminate on server
    //
    // Triggers onClose() hooks
    //
    // To receive leave acknowledgements, use the a `receive`
    // hook to bind to the server ack, ie:
    //
    //     channel.leave().receive("ok", () => alert("left!") )
    //
  }, {
    key: "leave",
    value: function leave() {
      var _this4 = this;

      return this.push(CHANNEL_EVENTS.leave).receive("ok", function () {
        _this4.socket.log("channel", "leave " + _this4.topic);
        _this4.trigger(CHANNEL_EVENTS.close, "leave");
      });
    }

    // Overridable message hook
    //
    // Receives all events for specialized message handling
  }, {
    key: "onMessage",
    value: function onMessage(event, payload, ref) {}

    // private

  }, {
    key: "isMember",
    value: function isMember(topic) {
      return this.topic === topic;
    }
  }, {
    key: "sendJoin",
    value: function sendJoin() {
      this.state = CHANNEL_STATES.joining;
      this.joinPush.send();
    }
  }, {
    key: "rejoin",
    value: function rejoin() {
      this.sendJoin();
      this.pushBuffer.forEach(function (pushEvent) {
        return pushEvent.send();
      });
      this.pushBuffer = [];
    }
  }, {
    key: "trigger",
    value: function trigger(triggerEvent, payload, ref) {
      this.onMessage(triggerEvent, payload, ref);
      this.bindings.filter(function (bind) {
        return bind.event === triggerEvent;
      }).map(function (bind) {
        return bind.callback(payload, ref);
      });
    }
  }, {
    key: "replyEventName",
    value: function replyEventName(ref) {
      return "chan_reply_" + ref;
    }
  }]);

  return Channel;
})();

exports.Channel = Channel;

var Socket = (function () {

  // Initializes the Socket
  //
  // endPoint - The string WebSocket endpoint, ie, "ws://example.com/ws",
  //                                               "wss://example.com"
  //                                               "/ws" (inherited host & protocol)
  // opts - Optional configuration
  //   transport - The Websocket Transport, for example WebSocket or Phoenix.LongPoll.
  //               Defaults to WebSocket with automatic LongPoll fallback.
  //   heartbeatIntervalMs - The millisec interval to send a heartbeat message
  //   reconnectAfterMs - The optional function that returns the millsec
  //                      reconnect interval. Defaults to stepped backoff of:
  //
  //     function(tries){
  //       return [1000, 5000, 10000][tries - 1] || 10000
  //     }
  //
  //   logger - The optional function for specialized logging, ie:
  //     `logger: (kind, msg, data) => { console.log(`${kind}: ${msg}`, data) }
  //
  //   longpollerTimeout - The maximum timeout of a long poll AJAX request.
  //                        Defaults to 20s (double the server long poll timer).
  //
  //   params - The optional params to pass when connecting
  //
  // For IE8 support use an ES5-shim (https://github.com/es-shims/es5-shim)
  //

  function Socket(endPoint) {
    var _this5 = this;

    var opts = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

    _classCallCheck(this, Socket);

    this.stateChangeCallbacks = { open: [], close: [], error: [], message: [] };
    this.channels = [];
    this.sendBuffer = [];
    this.ref = 0;
    this.transport = opts.transport || window.WebSocket || LongPoll;
    this.heartbeatIntervalMs = opts.heartbeatIntervalMs || 30000;
    this.reconnectAfterMs = opts.reconnectAfterMs || function (tries) {
      return [1000, 5000, 10000][tries - 1] || 10000;
    };
    this.logger = opts.logger || function () {}; // noop
    this.longpollerTimeout = opts.longpollerTimeout || 20000;
    this.params = opts.params || {};
    this.endPoint = endPoint + "/" + TRANSPORTS.websocket;
    this.reconnectTimer = new Timer(function () {
      _this5.disconnect(function () {
        return _this5.connect();
      });
    }, this.reconnectAfterMs);
  }

  _createClass(Socket, [{
    key: "protocol",
    value: function protocol() {
      return location.protocol.match(/^https/) ? "wss" : "ws";
    }
  }, {
    key: "endPointURL",
    value: function endPointURL() {
      var uri = Ajax.appendParams(Ajax.appendParams(this.endPoint, this.params), { vsn: VSN });
      if (uri.charAt(0) !== "/") {
        return uri;
      }
      if (uri.charAt(1) === "/") {
        return this.protocol() + ":" + uri;
      }

      return this.protocol() + "://" + location.host + uri;
    }
  }, {
    key: "disconnect",
    value: function disconnect(callback, code, reason) {
      if (this.conn) {
        this.conn.onclose = function () {}; // noop
        if (code) {
          this.conn.close(code, reason || "");
        } else {
          this.conn.close();
        }
        this.conn = null;
      }
      callback && callback();
    }

    // params - The params to send when connecting, for example `{user_id: userToken}`
  }, {
    key: "connect",
    value: function connect(params) {
      var _this6 = this;

      if (params) {
        console && console.log("passing params to connect is deprecated. Instead pass :params to the Socket constructor");
        this.params = params;
      }
      if (this.conn) {
        return;
      }

      this.conn = new this.transport(this.endPointURL());
      this.conn.timeout = this.longpollerTimeout;
      this.conn.onopen = function () {
        return _this6.onConnOpen();
      };
      this.conn.onerror = function (error) {
        return _this6.onConnError(error);
      };
      this.conn.onmessage = function (event) {
        return _this6.onConnMessage(event);
      };
      this.conn.onclose = function (event) {
        return _this6.onConnClose(event);
      };
    }

    // Logs the message. Override `this.logger` for specialized logging. noops by default
  }, {
    key: "log",
    value: function log(kind, msg, data) {
      this.logger(kind, msg, data);
    }

    // Registers callbacks for connection state change events
    //
    // Examples
    //
    //    socket.onError(function(error){ alert("An error occurred") })
    //
  }, {
    key: "onOpen",
    value: function onOpen(callback) {
      this.stateChangeCallbacks.open.push(callback);
    }
  }, {
    key: "onClose",
    value: function onClose(callback) {
      this.stateChangeCallbacks.close.push(callback);
    }
  }, {
    key: "onError",
    value: function onError(callback) {
      this.stateChangeCallbacks.error.push(callback);
    }
  }, {
    key: "onMessage",
    value: function onMessage(callback) {
      this.stateChangeCallbacks.message.push(callback);
    }
  }, {
    key: "onConnOpen",
    value: function onConnOpen() {
      var _this7 = this;

      this.log("transport", "connected to " + this.endPointURL(), this.transport.prototype);
      this.flushSendBuffer();
      this.reconnectTimer.reset();
      if (!this.conn.skipHeartbeat) {
        clearInterval(this.heartbeatTimer);
        this.heartbeatTimer = setInterval(function () {
          return _this7.sendHeartbeat();
        }, this.heartbeatIntervalMs);
      }
      this.stateChangeCallbacks.open.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: "onConnClose",
    value: function onConnClose(event) {
      this.log("transport", "close", event);
      this.triggerChanError();
      clearInterval(this.heartbeatTimer);
      this.reconnectTimer.setTimeout();
      this.stateChangeCallbacks.close.forEach(function (callback) {
        return callback(event);
      });
    }
  }, {
    key: "onConnError",
    value: function onConnError(error) {
      this.log("transport", error);
      this.triggerChanError();
      this.stateChangeCallbacks.error.forEach(function (callback) {
        return callback(error);
      });
    }
  }, {
    key: "triggerChanError",
    value: function triggerChanError() {
      this.channels.forEach(function (channel) {
        return channel.trigger(CHANNEL_EVENTS.error);
      });
    }
  }, {
    key: "connectionState",
    value: function connectionState() {
      switch (this.conn && this.conn.readyState) {
        case SOCKET_STATES.connecting:
          return "connecting";
        case SOCKET_STATES.open:
          return "open";
        case SOCKET_STATES.closing:
          return "closing";
        default:
          return "closed";
      }
    }
  }, {
    key: "isConnected",
    value: function isConnected() {
      return this.connectionState() === "open";
    }
  }, {
    key: "remove",
    value: function remove(channel) {
      this.channels = this.channels.filter(function (c) {
        return !c.isMember(channel.topic);
      });
    }
  }, {
    key: "channel",
    value: function channel(topic) {
      var chanParams = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

      var channel = new Channel(topic, chanParams, this);
      this.channels.push(channel);
      return channel;
    }
  }, {
    key: "push",
    value: function push(data) {
      var _this8 = this;

      var topic = data.topic;
      var event = data.event;
      var payload = data.payload;
      var ref = data.ref;

      var callback = function callback() {
        return _this8.conn.send(JSON.stringify(data));
      };
      this.log("push", topic + " " + event + " (" + ref + ")", payload);
      if (this.isConnected()) {
        callback();
      } else {
        this.sendBuffer.push(callback);
      }
    }

    // Return the next message ref, accounting for overflows
  }, {
    key: "makeRef",
    value: function makeRef() {
      var newRef = this.ref + 1;
      if (newRef === this.ref) {
        this.ref = 0;
      } else {
        this.ref = newRef;
      }

      return this.ref.toString();
    }
  }, {
    key: "sendHeartbeat",
    value: function sendHeartbeat() {
      this.push({ topic: "phoenix", event: "heartbeat", payload: {}, ref: this.makeRef() });
    }
  }, {
    key: "flushSendBuffer",
    value: function flushSendBuffer() {
      if (this.isConnected() && this.sendBuffer.length > 0) {
        this.sendBuffer.forEach(function (callback) {
          return callback();
        });
        this.sendBuffer = [];
      }
    }
  }, {
    key: "onConnMessage",
    value: function onConnMessage(rawMessage) {
      var msg = JSON.parse(rawMessage.data);
      var topic = msg.topic;
      var event = msg.event;
      var payload = msg.payload;
      var ref = msg.ref;

      this.log("receive", (payload.status || "") + " " + topic + " " + event + " " + (ref && "(" + ref + ")" || ""), payload);
      this.channels.filter(function (channel) {
        return channel.isMember(topic);
      }).forEach(function (channel) {
        return channel.trigger(event, payload, ref);
      });
      this.stateChangeCallbacks.message.forEach(function (callback) {
        return callback(msg);
      });
    }
  }]);

  return Socket;
})();

exports.Socket = Socket;

var LongPoll = (function () {
  function LongPoll(endPoint) {
    _classCallCheck(this, LongPoll);

    this.endPoint = null;
    this.token = null;
    this.skipHeartbeat = true;
    this.onopen = function () {}; // noop
    this.onerror = function () {}; // noop
    this.onmessage = function () {}; // noop
    this.onclose = function () {}; // noop
    this.pollEndpoint = this.normalizeEndpoint(endPoint);
    this.readyState = SOCKET_STATES.connecting;

    this.poll();
  }

  _createClass(LongPoll, [{
    key: "normalizeEndpoint",
    value: function normalizeEndpoint(endPoint) {
      return endPoint.replace("ws://", "http://").replace("wss://", "https://").replace(new RegExp("(.*)\/" + TRANSPORTS.websocket), "$1/" + TRANSPORTS.longpoll);
    }
  }, {
    key: "endpointURL",
    value: function endpointURL() {
      return Ajax.appendParams(this.pollEndpoint, { token: this.token });
    }
  }, {
    key: "closeAndRetry",
    value: function closeAndRetry() {
      this.close();
      this.readyState = SOCKET_STATES.connecting;
    }
  }, {
    key: "ontimeout",
    value: function ontimeout() {
      this.onerror("timeout");
      this.closeAndRetry();
    }
  }, {
    key: "poll",
    value: function poll() {
      var _this9 = this;

      if (!(this.readyState === SOCKET_STATES.open || this.readyState === SOCKET_STATES.connecting)) {
        return;
      }

      Ajax.request("GET", this.endpointURL(), "application/json", null, this.timeout, this.ontimeout.bind(this), function (resp) {
        if (resp) {
          var status = resp.status;
          var token = resp.token;
          var messages = resp.messages;

          _this9.token = token;
        } else {
          var status = 0;
        }

        switch (status) {
          case 200:
            messages.forEach(function (msg) {
              return _this9.onmessage({ data: JSON.stringify(msg) });
            });
            _this9.poll();
            break;
          case 204:
            _this9.poll();
            break;
          case 410:
            _this9.readyState = SOCKET_STATES.open;
            _this9.onopen();
            _this9.poll();
            break;
          case 0:
          case 500:
            _this9.onerror();
            _this9.closeAndRetry();
            break;
          default:
            throw "unhandled poll status " + status;
        }
      });
    }
  }, {
    key: "send",
    value: function send(body) {
      var _this10 = this;

      Ajax.request("POST", this.endpointURL(), "application/json", body, this.timeout, this.onerror.bind(this, "timeout"), function (resp) {
        if (!resp || resp.status !== 200) {
          _this10.onerror(status);
          _this10.closeAndRetry();
        }
      });
    }
  }, {
    key: "close",
    value: function close(code, reason) {
      this.readyState = SOCKET_STATES.closed;
      this.onclose();
    }
  }]);

  return LongPoll;
})();

exports.LongPoll = LongPoll;

var Ajax = (function () {
  function Ajax() {
    _classCallCheck(this, Ajax);
  }

  _createClass(Ajax, null, [{
    key: "request",
    value: function request(method, endPoint, accept, body, timeout, ontimeout, callback) {
      if (window.XDomainRequest) {
        var req = new XDomainRequest(); // IE8, IE9
        this.xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback);
      } else {
        var req = window.XMLHttpRequest ? new XMLHttpRequest() : // IE7+, Firefox, Chrome, Opera, Safari
        new ActiveXObject("Microsoft.XMLHTTP"); // IE6, IE5
        this.xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback);
      }
    }
  }, {
    key: "xdomainRequest",
    value: function xdomainRequest(req, method, endPoint, body, timeout, ontimeout, callback) {
      var _this11 = this;

      req.timeout = timeout;
      req.open(method, endPoint);
      req.onload = function () {
        var response = _this11.parseJSON(req.responseText);
        callback && callback(response);
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      // Work around bug in IE9 that requires an attached onprogress handler
      req.onprogress = function () {};

      req.send(body);
    }
  }, {
    key: "xhrRequest",
    value: function xhrRequest(req, method, endPoint, accept, body, timeout, ontimeout, callback) {
      var _this12 = this;

      req.timeout = timeout;
      req.open(method, endPoint, true);
      req.setRequestHeader("Content-Type", accept);
      req.onerror = function () {
        callback && callback(null);
      };
      req.onreadystatechange = function () {
        if (req.readyState === _this12.states.complete && callback) {
          var response = _this12.parseJSON(req.responseText);
          callback(response);
        }
      };
      if (ontimeout) {
        req.ontimeout = ontimeout;
      }

      req.send(body);
    }
  }, {
    key: "parseJSON",
    value: function parseJSON(resp) {
      return resp && resp !== "" ? JSON.parse(resp) : null;
    }
  }, {
    key: "serialize",
    value: function serialize(obj, parentKey) {
      var queryStr = [];
      for (var key in obj) {
        if (!obj.hasOwnProperty(key)) {
          continue;
        }
        var paramKey = parentKey ? parentKey + "[" + key + "]" : key;
        var paramVal = obj[key];
        if (typeof paramVal === "object") {
          queryStr.push(this.serialize(paramVal, paramKey));
        } else {
          queryStr.push(encodeURIComponent(paramKey) + "=" + encodeURIComponent(paramVal));
        }
      }
      return queryStr.join("&");
    }
  }, {
    key: "appendParams",
    value: function appendParams(url, params) {
      if (Object.keys(params).length === 0) {
        return url;
      }

      var prefix = url.match(/\?/) ? "&" : "?";
      return "" + url + prefix + this.serialize(params);
    }
  }]);

  return Ajax;
})();

exports.Ajax = Ajax;

Ajax.states = { complete: 4 };

// Creates a timer that accepts a `timerCalc` function to perform
// calculated timeout retries, such as exponential backoff.
//
// ## Examples
//
//    let reconnectTimer = new Timer(() => this.connect(), function(tries){
//      return [1000, 5000, 10000][tries - 1] || 10000
//    })
//    reconnectTimer.setTimeout() // fires after 1000
//    reconnectTimer.setTimeout() // fires after 5000
//    reconnectTimer.reset()
//    reconnectTimer.setTimeout() // fires after 1000
//

var Timer = (function () {
  function Timer(callback, timerCalc) {
    _classCallCheck(this, Timer);

    this.callback = callback;
    this.timerCalc = timerCalc;
    this.timer = null;
    this.tries = 0;
  }

  _createClass(Timer, [{
    key: "reset",
    value: function reset() {
      this.tries = 0;
      clearTimeout(this.timer);
    }

    // Cancels any previous setTimeout and schedules callback
  }, {
    key: "setTimeout",
    value: (function (_setTimeout) {
      function setTimeout() {
        return _setTimeout.apply(this, arguments);
      }

      setTimeout.toString = function () {
        return _setTimeout.toString();
      };

      return setTimeout;
    })(function () {
      var _this13 = this;

      clearTimeout(this.timer);

      this.timer = setTimeout(function () {
        _this13.tries = _this13.tries + 1;
        _this13.callback();
      }, this.timerCalc(this.tries + 1));
    })
  }]);

  return Timer;
})();
});

;require.register("deps/phoenix_html/web/static/js/phoenix_html", function(exports, require, module) {
// Although ^=parent is not technically correct,
// we need to use it in order to get IE8 support.
'use strict';

var elements = document.querySelectorAll('[data-submit^=parent]');
var len = elements.length;

for (var i = 0; i < len; ++i) {
  elements[i].addEventListener('click', function (event) {
    var message = this.getAttribute("data-confirm");
    if (message === null || confirm(message)) {
      this.parentNode.submit();
    };
    event.preventDefault();
    return false;
  }, false);
}
});

;require.register("web/static/js/app", function(exports, require, module) {
// Brunch automatically concatenates all files in your
// watched paths. Those paths can be configured at
// config.paths.watched in "brunch-config.js".
//
// However, those files will only be executed if
// explicitly imported. The only exception are files
// in vendor, which are never wrapped in imports and
// therefore are always executed.

// Import dependencies
//
// If you no longer want to use a dependency, remember
// to also remove its path from "config.paths.watched".
"use strict";

require("deps/phoenix_html/web/static/js/phoenix_html");

// Import local files
//
// Local files can be imported directly using relative
// paths "./socket" or full ones "web/static/js/socket".

// import socket from "./socket"
});

;require.register("web/static/js/chat", function(exports, require, module) {
//var BOSH_SERVICE = 'http://xmpp.alchemy.local:5280/http-bind'
'use strict';

var BOSH_SERVICE = 'ws://xmpp.alchemy.local:5280/websocket';
var XMPP_DOMAIN = "alchemy.local";

var connection = null;

function log(msg) {
  $('#log').prepend('<div></div>').prepend(document.createTextNode(msg));
}

function getMessage(stanza) {
  log(stanza);
}

function rawInput(data) {
  log('RECV: ' + data);
}

function rawOutput(data) {
  log('SENT: ' + data);
}

function onConnect(status) {
  if (status == Strophe.Status.CONNECTING) {
    log('Strophe is connecting.');
  } else if (status == Strophe.Status.CONNFAIL) {
    log('Strophe failed to connect.');
    $('#connect').get(0).value = 'connect';
  } else if (status == Strophe.Status.DISCONNECTING) {
    log('Strophe is disconnecting.');
  } else if (status == Strophe.Status.DISCONNECTED) {
    log('Strophe is disconnected.');
    $('#connect').get(0).value = 'connect';
  } else if (status == Strophe.Status.CONNECTED) {
    log('Strophe is connected.');

    // initialise presence
    connection.send($pres());
  }
}
function sendMessage() {
  var message = $('#message').get(0).value;
  var to = $('#to').get(0).value;
  connection.send($msg({ to: to + '@' + XMPP_DOMAIN, from: USER, type: 'normal' }).c("body").t(message));
}

$(document).ready(function () {
  connection = new Strophe.Connection(BOSH_SERVICE);
  connection.rawInput = rawInput;
  connection.rawOutput = rawOutput;

  // connect using jwt token

  connection.connect(USER, JWT, onConnect);

  /*$('#connect').bind('click', function () {
   var button = $('#connect').get(0);
   if (button.value == 'connect') {
   button.value = 'disconnect';
    connection.connect($('#jid').get(0).value,
   $('#pass').get(0).value,
   onConnect);
   } else {
   button.value = 'connect';
   connection.disconnect();
   }
   });*/
});
});

require.register("web/static/js/socket", function(exports, require, module) {
// NOTE: The contents of this file will only be executed if
// you uncomment its entry in "web/static/js/app.js".

// To use Phoenix channels, the first step is to import Socket
// and connect at the socket path in "lib/my_app/endpoint.ex":
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _depsPhoenixWebStaticJsPhoenix = require("deps/phoenix/web/static/js/phoenix");

var socket = new _depsPhoenixWebStaticJsPhoenix.Socket("/socket", { params: { token: window.userToken } });

// When you connect, you'll often need to authenticate the client.
// For example, imagine you have an authentication plug, `MyAuth`,
// which authenticates the session and assigns a `:current_user`.
// If the current user exists you can assign the user's token in
// the connection for use in the layout.
//
// In your "web/router.ex":
//
//     pipeline :browser do
//       ...
//       plug MyAuth
//       plug :put_user_token
//     end
//
//     defp put_user_token(conn, _) do
//       if current_user = conn.assigns[:current_user] do
//         token = Phoenix.Token.sign(conn, "user socket", current_user.id)
//         assign(conn, :user_token, token)
//       else
//         conn
//       end
//     end
//
// Now you need to pass this token to JavaScript. You can do so
// inside a script tag in "web/templates/layout/app.html.eex":
//
//     <script>window.userToken = "<%= assigns[:user_token] %>";</script>
//
// You will need to verify the user token in the "connect/2" function
// in "web/channels/user_socket.ex":
//
//     def connect(%{"token" => token}, socket) do
//       # max_age: 1209600 is equivalent to two weeks in seconds
//       case Phoenix.Token.verify(socket, "user socket", token, max_age: 1209600) do
//         {:ok, user_id} ->
//           {:ok, assign(socket, :user, user_id)}
//         {:error, reason} ->
//           :error
//       end
//     end
//
// Finally, pass the token on connect as below. Or remove it
// from connect if you don't care about authentication.

socket.connect();

// Now that you are connected, you can join channels with a topic:
var channel = socket.channel("topic:subtopic", {});
channel.join().receive("ok", function (resp) {
  console.log("Joined successfully", resp);
}).receive("error", function (resp) {
  console.log("Unable to join", resp);
});

exports["default"] = socket;
module.exports = exports["default"];
});

;require.register("web/static/js/strophe.min", function(exports, require, module) {
/*! strophe.js v1.2.3 - built on 01-12-2015 */
"use strict";

!(function (a) {
    if (((function (a, b) {
        "function" == typeof define && define.amd ? define("strophe-base64", function () {
            return b();
        }) : a.Base64 = b();
    })(this, function () {
        var a = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",
            b = { encode: function encode(b) {
                var c,
                    d,
                    e,
                    f,
                    g,
                    h,
                    i,
                    j = "",
                    k = 0;do c = b.charCodeAt(k++), d = b.charCodeAt(k++), e = b.charCodeAt(k++), f = c >> 2, g = (3 & c) << 4 | d >> 4, h = (15 & d) << 2 | e >> 6, i = 63 & e, isNaN(d) ? (g = (3 & c) << 4, h = i = 64) : isNaN(e) && (i = 64), j = j + a.charAt(f) + a.charAt(g) + a.charAt(h) + a.charAt(i); while (k < b.length);return j;
            }, decode: function decode(b) {
                var c,
                    d,
                    e,
                    f,
                    g,
                    h,
                    i,
                    j = "",
                    k = 0;b = b.replace(/[^A-Za-z0-9\+\/\=]/g, "");do f = a.indexOf(b.charAt(k++)), g = a.indexOf(b.charAt(k++)), h = a.indexOf(b.charAt(k++)), i = a.indexOf(b.charAt(k++)), c = f << 2 | g >> 4, d = (15 & g) << 4 | h >> 2, e = (3 & h) << 6 | i, j += String.fromCharCode(c), 64 != h && (j += String.fromCharCode(d)), 64 != i && (j += String.fromCharCode(e)); while (k < b.length);return j;
            } };return b;
    }), (function (a, b) {
        "function" == typeof define && define.amd ? define("strophe-sha1", function () {
            return b();
        }) : a.SHA1 = b();
    })(this, function () {
        function a(a, d) {
            a[d >> 5] |= 128 << 24 - d % 32, a[(d + 64 >> 9 << 4) + 15] = d;var g,
                h,
                i,
                j,
                k,
                l,
                m,
                n,
                o = new Array(80),
                p = 1732584193,
                q = -271733879,
                r = -1732584194,
                s = 271733878,
                t = -1009589776;for (g = 0; g < a.length; g += 16) {
                for (j = p, k = q, l = r, m = s, n = t, h = 0; 80 > h; h++) 16 > h ? o[h] = a[g + h] : o[h] = f(o[h - 3] ^ o[h - 8] ^ o[h - 14] ^ o[h - 16], 1), i = e(e(f(p, 5), b(h, q, r, s)), e(e(t, o[h]), c(h))), t = s, s = r, r = f(q, 30), q = p, p = i;p = e(p, j), q = e(q, k), r = e(r, l), s = e(s, m), t = e(t, n);
            }return [p, q, r, s, t];
        }function b(a, b, c, d) {
            return 20 > a ? b & c | ~b & d : 40 > a ? b ^ c ^ d : 60 > a ? b & c | b & d | c & d : b ^ c ^ d;
        }function c(a) {
            return 20 > a ? 1518500249 : 40 > a ? 1859775393 : 60 > a ? -1894007588 : -899497514;
        }function d(b, c) {
            var d = g(b);d.length > 16 && (d = a(d, 8 * b.length));for (var e = new Array(16), f = new Array(16), h = 0; 16 > h; h++) e[h] = 909522486 ^ d[h], f[h] = 1549556828 ^ d[h];var i = a(e.concat(g(c)), 512 + 8 * c.length);return a(f.concat(i), 672);
        }function e(a, b) {
            var c = (65535 & a) + (65535 & b),
                d = (a >> 16) + (b >> 16) + (c >> 16);return d << 16 | 65535 & c;
        }function f(a, b) {
            return a << b | a >>> 32 - b;
        }function g(a) {
            for (var b = [], c = 255, d = 0; d < 8 * a.length; d += 8) b[d >> 5] |= (a.charCodeAt(d / 8) & c) << 24 - d % 32;return b;
        }function h(a) {
            for (var b = "", c = 255, d = 0; d < 32 * a.length; d += 8) b += String.fromCharCode(a[d >> 5] >>> 24 - d % 32 & c);return b;
        }function i(a) {
            for (var b, c, d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/", e = "", f = 0; f < 4 * a.length; f += 3) for (b = (a[f >> 2] >> 8 * (3 - f % 4) & 255) << 16 | (a[f + 1 >> 2] >> 8 * (3 - (f + 1) % 4) & 255) << 8 | a[f + 2 >> 2] >> 8 * (3 - (f + 2) % 4) & 255, c = 0; 4 > c; c++) e += 8 * f + 6 * c > 32 * a.length ? "=" : d.charAt(b >> 6 * (3 - c) & 63);return e;
        }return { b64_hmac_sha1: function b64_hmac_sha1(a, b) {
                return i(d(a, b));
            }, b64_sha1: function b64_sha1(b) {
                return i(a(g(b), 8 * b.length));
            }, binb2str: h, core_hmac_sha1: d, str_hmac_sha1: function str_hmac_sha1(a, b) {
                return h(d(a, b));
            }, str_sha1: function str_sha1(b) {
                return h(a(g(b), 8 * b.length));
            } };
    }), (function (a, b) {
        "function" == typeof define && define.amd ? define("strophe-md5", function () {
            return b();
        }) : a.MD5 = b();
    })(this, function (a) {
        var b = function b(a, _b) {
            var c = (65535 & a) + (65535 & _b),
                d = (a >> 16) + (_b >> 16) + (c >> 16);return d << 16 | 65535 & c;
        },
            c = function c(a, b) {
            return a << b | a >>> 32 - b;
        },
            d = function d(a) {
            for (var b = [], c = 0; c < 8 * a.length; c += 8) b[c >> 5] |= (255 & a.charCodeAt(c / 8)) << c % 32;return b;
        },
            e = function e(a) {
            for (var b = "", c = 0; c < 32 * a.length; c += 8) b += String.fromCharCode(a[c >> 5] >>> c % 32 & 255);return b;
        },
            f = function f(a) {
            for (var b = "0123456789abcdef", c = "", d = 0; d < 4 * a.length; d++) c += b.charAt(a[d >> 2] >> d % 4 * 8 + 4 & 15) + b.charAt(a[d >> 2] >> d % 4 * 8 & 15);return c;
        },
            g = function g(a, d, e, f, _g, h) {
            return b(c(b(b(d, a), b(f, h)), _g), e);
        },
            h = function h(a, b, c, d, e, f, _h) {
            return g(b & c | ~b & d, a, b, e, f, _h);
        },
            i = function i(a, b, c, d, e, f, h) {
            return g(b & d | c & ~d, a, b, e, f, h);
        },
            j = function j(a, b, c, d, e, f, h) {
            return g(b ^ c ^ d, a, b, e, f, h);
        },
            k = function k(a, b, c, d, e, f, h) {
            return g(c ^ (b | ~d), a, b, e, f, h);
        },
            l = function l(a, c) {
            a[c >> 5] |= 128 << c % 32, a[(c + 64 >>> 9 << 4) + 14] = c;for (var d, e, f, g, l = 1732584193, m = -271733879, n = -1732584194, o = 271733878, p = 0; p < a.length; p += 16) d = l, e = m, f = n, g = o, l = h(l, m, n, o, a[p + 0], 7, -680876936), o = h(o, l, m, n, a[p + 1], 12, -389564586), n = h(n, o, l, m, a[p + 2], 17, 606105819), m = h(m, n, o, l, a[p + 3], 22, -1044525330), l = h(l, m, n, o, a[p + 4], 7, -176418897), o = h(o, l, m, n, a[p + 5], 12, 1200080426), n = h(n, o, l, m, a[p + 6], 17, -1473231341), m = h(m, n, o, l, a[p + 7], 22, -45705983), l = h(l, m, n, o, a[p + 8], 7, 1770035416), o = h(o, l, m, n, a[p + 9], 12, -1958414417), n = h(n, o, l, m, a[p + 10], 17, -42063), m = h(m, n, o, l, a[p + 11], 22, -1990404162), l = h(l, m, n, o, a[p + 12], 7, 1804603682), o = h(o, l, m, n, a[p + 13], 12, -40341101), n = h(n, o, l, m, a[p + 14], 17, -1502002290), m = h(m, n, o, l, a[p + 15], 22, 1236535329), l = i(l, m, n, o, a[p + 1], 5, -165796510), o = i(o, l, m, n, a[p + 6], 9, -1069501632), n = i(n, o, l, m, a[p + 11], 14, 643717713), m = i(m, n, o, l, a[p + 0], 20, -373897302), l = i(l, m, n, o, a[p + 5], 5, -701558691), o = i(o, l, m, n, a[p + 10], 9, 38016083), n = i(n, o, l, m, a[p + 15], 14, -660478335), m = i(m, n, o, l, a[p + 4], 20, -405537848), l = i(l, m, n, o, a[p + 9], 5, 568446438), o = i(o, l, m, n, a[p + 14], 9, -1019803690), n = i(n, o, l, m, a[p + 3], 14, -187363961), m = i(m, n, o, l, a[p + 8], 20, 1163531501), l = i(l, m, n, o, a[p + 13], 5, -1444681467), o = i(o, l, m, n, a[p + 2], 9, -51403784), n = i(n, o, l, m, a[p + 7], 14, 1735328473), m = i(m, n, o, l, a[p + 12], 20, -1926607734), l = j(l, m, n, o, a[p + 5], 4, -378558), o = j(o, l, m, n, a[p + 8], 11, -2022574463), n = j(n, o, l, m, a[p + 11], 16, 1839030562), m = j(m, n, o, l, a[p + 14], 23, -35309556), l = j(l, m, n, o, a[p + 1], 4, -1530992060), o = j(o, l, m, n, a[p + 4], 11, 1272893353), n = j(n, o, l, m, a[p + 7], 16, -155497632), m = j(m, n, o, l, a[p + 10], 23, -1094730640), l = j(l, m, n, o, a[p + 13], 4, 681279174), o = j(o, l, m, n, a[p + 0], 11, -358537222), n = j(n, o, l, m, a[p + 3], 16, -722521979), m = j(m, n, o, l, a[p + 6], 23, 76029189), l = j(l, m, n, o, a[p + 9], 4, -640364487), o = j(o, l, m, n, a[p + 12], 11, -421815835), n = j(n, o, l, m, a[p + 15], 16, 530742520), m = j(m, n, o, l, a[p + 2], 23, -995338651), l = k(l, m, n, o, a[p + 0], 6, -198630844), o = k(o, l, m, n, a[p + 7], 10, 1126891415), n = k(n, o, l, m, a[p + 14], 15, -1416354905), m = k(m, n, o, l, a[p + 5], 21, -57434055), l = k(l, m, n, o, a[p + 12], 6, 1700485571), o = k(o, l, m, n, a[p + 3], 10, -1894986606), n = k(n, o, l, m, a[p + 10], 15, -1051523), m = k(m, n, o, l, a[p + 1], 21, -2054922799), l = k(l, m, n, o, a[p + 8], 6, 1873313359), o = k(o, l, m, n, a[p + 15], 10, -30611744), n = k(n, o, l, m, a[p + 6], 15, -1560198380), m = k(m, n, o, l, a[p + 13], 21, 1309151649), l = k(l, m, n, o, a[p + 4], 6, -145523070), o = k(o, l, m, n, a[p + 11], 10, -1120210379), n = k(n, o, l, m, a[p + 2], 15, 718787259), m = k(m, n, o, l, a[p + 9], 21, -343485551), l = b(l, d), m = b(m, e), n = b(n, f), o = b(o, g);return [l, m, n, o];
        },
            m = { hexdigest: function hexdigest(a) {
                return f(l(d(a), 8 * a.length));
            }, hash: function hash(a) {
                return e(l(d(a), 8 * a.length));
            } };return m;
    }), (function (a, b) {
        "function" == typeof define && define.amd ? define("strophe-utils", function () {
            return b();
        }) : a.stropheUtils = b();
    })(this, function () {
        var a = { utf16to8: function utf16to8(a) {
                var b,
                    c,
                    d = "",
                    e = a.length;for (b = 0; e > b; b++) c = a.charCodeAt(b), c >= 0 && 127 >= c ? d += a.charAt(b) : c > 2047 ? (d += String.fromCharCode(224 | c >> 12 & 15), d += String.fromCharCode(128 | c >> 6 & 63), d += String.fromCharCode(128 | c >> 0 & 63)) : (d += String.fromCharCode(192 | c >> 6 & 31), d += String.fromCharCode(128 | c >> 0 & 63));return d;
            } };return a;
    }), (function (a, b) {
        return "function" == typeof define && define.amd ? void define("strophe-polyfill", [], function () {
            return b();
        }) : b();
    })(this, function () {
        Function.prototype.bind || (Function.prototype.bind = function (a) {
            var b = this,
                c = Array.prototype.slice,
                d = Array.prototype.concat,
                e = c.call(arguments, 1);return function () {
                return b.apply(a ? a : this, d.call(e, c.call(arguments, 0)));
            };
        }), Array.isArray || (Array.isArray = function (a) {
            return "[object Array]" === Object.prototype.toString.call(a);
        }), Array.prototype.indexOf || (Array.prototype.indexOf = function (a) {
            var b = this.length,
                c = Number(arguments[1]) || 0;for (c = 0 > c ? Math.ceil(c) : Math.floor(c), 0 > c && (c += b); b > c; c++) if (c in this && this[c] === a) return c;return -1;
        });
    }), (function (a, b) {
        if ("function" == typeof define && define.amd) define("strophe-core", ["strophe-sha1", "strophe-base64", "strophe-md5", "strophe-utils", "strophe-polyfill"], function () {
            return b.apply(this, arguments);
        });else {
            var c = b(a.SHA1, a.Base64, a.MD5, a.stropheUtils);window.Strophe = c.Strophe, window.$build = c.$build, window.$iq = c.$iq, window.$msg = c.$msg, window.$pres = c.$pres, window.SHA1 = c.SHA1, window.Base64 = c.Base64, window.MD5 = c.MD5, window.b64_hmac_sha1 = c.SHA1.b64_hmac_sha1, window.b64_sha1 = c.SHA1.b64_sha1, window.str_hmac_sha1 = c.SHA1.str_hmac_sha1, window.str_sha1 = c.SHA1.str_sha1;
        }
    })(this, function (a, b, c, d) {
        function e(a, b) {
            return new i.Builder(a, b);
        }function f(a) {
            return new i.Builder("message", a);
        }function g(a) {
            return new i.Builder("iq", a);
        }function h(a) {
            return new i.Builder("presence", a);
        }var i;return i = { VERSION: "1.2.3", NS: { HTTPBIND: "http://jabber.org/protocol/httpbind", BOSH: "urn:xmpp:xbosh", CLIENT: "jabber:client", AUTH: "jabber:iq:auth", ROSTER: "jabber:iq:roster", PROFILE: "jabber:iq:profile", DISCO_INFO: "http://jabber.org/protocol/disco#info", DISCO_ITEMS: "http://jabber.org/protocol/disco#items", MUC: "http://jabber.org/protocol/muc", SASL: "urn:ietf:params:xml:ns:xmpp-sasl", STREAM: "http://etherx.jabber.org/streams", FRAMING: "urn:ietf:params:xml:ns:xmpp-framing", BIND: "urn:ietf:params:xml:ns:xmpp-bind", SESSION: "urn:ietf:params:xml:ns:xmpp-session", VERSION: "jabber:iq:version", STANZAS: "urn:ietf:params:xml:ns:xmpp-stanzas", XHTML_IM: "http://jabber.org/protocol/xhtml-im", XHTML: "http://www.w3.org/1999/xhtml" }, XHTML: { tags: ["a", "blockquote", "br", "cite", "em", "img", "li", "ol", "p", "span", "strong", "ul", "body"], attributes: { a: ["href"], blockquote: ["style"], br: [], cite: ["style"], em: [], img: ["src", "alt", "style", "height", "width"], li: ["style"], ol: ["style"], p: ["style"], span: ["style"], strong: [], ul: ["style"], body: [] }, css: ["background-color", "color", "font-family", "font-size", "font-style", "font-weight", "margin-left", "margin-right", "text-align", "text-decoration"], validTag: function validTag(a) {
                    for (var b = 0; b < i.XHTML.tags.length; b++) if (a == i.XHTML.tags[b]) return !0;return !1;
                }, validAttribute: function validAttribute(a, b) {
                    if ("undefined" != typeof i.XHTML.attributes[a] && i.XHTML.attributes[a].length > 0) for (var c = 0; c < i.XHTML.attributes[a].length; c++) if (b == i.XHTML.attributes[a][c]) return !0;return !1;
                }, validCSS: function validCSS(a) {
                    for (var b = 0; b < i.XHTML.css.length; b++) if (a == i.XHTML.css[b]) return !0;return !1;
                } }, Status: { ERROR: 0, CONNECTING: 1, CONNFAIL: 2, AUTHENTICATING: 3, AUTHFAIL: 4, CONNECTED: 5, DISCONNECTED: 6, DISCONNECTING: 7, ATTACHED: 8, REDIRECT: 9 }, LogLevel: { DEBUG: 0, INFO: 1, WARN: 2, ERROR: 3, FATAL: 4 }, ElementType: { NORMAL: 1, TEXT: 3, CDATA: 4, FRAGMENT: 11 }, TIMEOUT: 1.1, SECONDARY_TIMEOUT: .1, addNamespace: function addNamespace(a, b) {
                i.NS[a] = b;
            }, forEachChild: function forEachChild(a, b, c) {
                var d, e;for (d = 0; d < a.childNodes.length; d++) e = a.childNodes[d], e.nodeType != i.ElementType.NORMAL || b && !this.isTagEqual(e, b) || c(e);
            }, isTagEqual: function isTagEqual(a, b) {
                return a.tagName == b;
            }, _xmlGenerator: null, _makeGenerator: function _makeGenerator() {
                var a;return void 0 === document.implementation.createDocument || document.implementation.createDocument && document.documentMode && document.documentMode < 10 ? (a = this._getIEXmlDom(), a.appendChild(a.createElement("strophe"))) : a = document.implementation.createDocument("jabber:client", "strophe", null), a;
            }, xmlGenerator: function xmlGenerator() {
                return i._xmlGenerator || (i._xmlGenerator = i._makeGenerator()), i._xmlGenerator;
            }, _getIEXmlDom: function _getIEXmlDom() {
                for (var a = null, b = ["Msxml2.DOMDocument.6.0", "Msxml2.DOMDocument.5.0", "Msxml2.DOMDocument.4.0", "MSXML2.DOMDocument.3.0", "MSXML2.DOMDocument", "MSXML.DOMDocument", "Microsoft.XMLDOM"], c = 0; c < b.length && null === a; c++) try {
                    a = new ActiveXObject(b[c]);
                } catch (d) {
                    a = null;
                }return a;
            }, xmlElement: function xmlElement(a) {
                if (!a) return null;var b,
                    c,
                    d,
                    e = i.xmlGenerator().createElement(a);for (b = 1; b < arguments.length; b++) {
                    var f = arguments[b];if (f) if ("string" == typeof f || "number" == typeof f) e.appendChild(i.xmlTextNode(f));else if ("object" == typeof f && "function" == typeof f.sort) for (c = 0; c < f.length; c++) {
                        var g = f[c];"object" == typeof g && "function" == typeof g.sort && void 0 !== g[1] && null !== g[1] && e.setAttribute(g[0], g[1]);
                    } else if ("object" == typeof f) for (d in f) f.hasOwnProperty(d) && void 0 !== f[d] && null !== f[d] && e.setAttribute(d, f[d]);
                }return e;
            }, xmlescape: function xmlescape(a) {
                return a = a.replace(/\&/g, "&amp;"), a = a.replace(/</g, "&lt;"), a = a.replace(/>/g, "&gt;"), a = a.replace(/'/g, "&apos;"), a = a.replace(/"/g, "&quot;");
            }, xmlunescape: function xmlunescape(a) {
                return a = a.replace(/\&amp;/g, "&"), a = a.replace(/&lt;/g, "<"), a = a.replace(/&gt;/g, ">"), a = a.replace(/&apos;/g, "'"), a = a.replace(/&quot;/g, '"');
            }, xmlTextNode: function xmlTextNode(a) {
                return i.xmlGenerator().createTextNode(a);
            }, xmlHtmlNode: function xmlHtmlNode(a) {
                var b;if (window.DOMParser) {
                    var c = new DOMParser();b = c.parseFromString(a, "text/xml");
                } else b = new ActiveXObject("Microsoft.XMLDOM"), b.async = "false", b.loadXML(a);return b;
            }, getText: function getText(a) {
                if (!a) return null;var b = "";0 === a.childNodes.length && a.nodeType == i.ElementType.TEXT && (b += a.nodeValue);for (var c = 0; c < a.childNodes.length; c++) a.childNodes[c].nodeType == i.ElementType.TEXT && (b += a.childNodes[c].nodeValue);return i.xmlescape(b);
            }, copyElement: function copyElement(a) {
                var b, c;if (a.nodeType == i.ElementType.NORMAL) {
                    for (c = i.xmlElement(a.tagName), b = 0; b < a.attributes.length; b++) c.setAttribute(a.attributes[b].nodeName, a.attributes[b].value);for (b = 0; b < a.childNodes.length; b++) c.appendChild(i.copyElement(a.childNodes[b]));
                } else a.nodeType == i.ElementType.TEXT && (c = i.xmlGenerator().createTextNode(a.nodeValue));return c;
            }, createHtml: function createHtml(a) {
                var b, c, d, e, f, g, h, j, k, l, m;if (a.nodeType == i.ElementType.NORMAL) if ((e = a.nodeName.toLowerCase(), i.XHTML.validTag(e))) try {
                    for (c = i.xmlElement(e), b = 0; b < i.XHTML.attributes[e].length; b++) if ((f = i.XHTML.attributes[e][b], g = a.getAttribute(f), "undefined" != typeof g && null !== g && "" !== g && g !== !1 && 0 !== g)) if (("style" == f && "object" == typeof g && "undefined" != typeof g.cssText && (g = g.cssText), "style" == f)) {
                        for (h = [], j = g.split(";"), d = 0; d < j.length; d++) k = j[d].split(":"), l = k[0].replace(/^\s*/, "").replace(/\s*$/, "").toLowerCase(), i.XHTML.validCSS(l) && (m = k[1].replace(/^\s*/, "").replace(/\s*$/, ""), h.push(l + ": " + m));h.length > 0 && (g = h.join("; "), c.setAttribute(f, g));
                    } else c.setAttribute(f, g);for (b = 0; b < a.childNodes.length; b++) c.appendChild(i.createHtml(a.childNodes[b]));
                } catch (n) {
                    c = i.xmlTextNode("");
                } else for (c = i.xmlGenerator().createDocumentFragment(), b = 0; b < a.childNodes.length; b++) c.appendChild(i.createHtml(a.childNodes[b]));else if (a.nodeType == i.ElementType.FRAGMENT) for (c = i.xmlGenerator().createDocumentFragment(), b = 0; b < a.childNodes.length; b++) c.appendChild(i.createHtml(a.childNodes[b]));else a.nodeType == i.ElementType.TEXT && (c = i.xmlTextNode(a.nodeValue));return c;
            }, escapeNode: function escapeNode(a) {
                return "string" != typeof a ? a : a.replace(/^\s+|\s+$/g, "").replace(/\\/g, "\\5c").replace(/ /g, "\\20").replace(/\"/g, "\\22").replace(/\&/g, "\\26").replace(/\'/g, "\\27").replace(/\//g, "\\2f").replace(/:/g, "\\3a").replace(/</g, "\\3c").replace(/>/g, "\\3e").replace(/@/g, "\\40");
            }, unescapeNode: function unescapeNode(a) {
                return "string" != typeof a ? a : a.replace(/\\20/g, " ").replace(/\\22/g, '"').replace(/\\26/g, "&").replace(/\\27/g, "'").replace(/\\2f/g, "/").replace(/\\3a/g, ":").replace(/\\3c/g, "<").replace(/\\3e/g, ">").replace(/\\40/g, "@").replace(/\\5c/g, "\\");
            }, getNodeFromJid: function getNodeFromJid(a) {
                return a.indexOf("@") < 0 ? null : a.split("@")[0];
            }, getDomainFromJid: function getDomainFromJid(a) {
                var b = i.getBareJidFromJid(a);if (b.indexOf("@") < 0) return b;var c = b.split("@");return c.splice(0, 1), c.join("@");
            }, getResourceFromJid: function getResourceFromJid(a) {
                var b = a.split("/");return b.length < 2 ? null : (b.splice(0, 1), b.join("/"));
            }, getBareJidFromJid: function getBareJidFromJid(a) {
                return a ? a.split("/")[0] : null;
            }, log: function log(a, b) {}, debug: function debug(a) {
                this.log(this.LogLevel.DEBUG, a);
            }, info: function info(a) {
                this.log(this.LogLevel.INFO, a);
            }, warn: function warn(a) {
                this.log(this.LogLevel.WARN, a);
            }, error: function error(a) {
                this.log(this.LogLevel.ERROR, a);
            }, fatal: function fatal(a) {
                this.log(this.LogLevel.FATAL, a);
            }, serialize: function serialize(a) {
                var b;if (!a) return null;"function" == typeof a.tree && (a = a.tree());var c,
                    d,
                    e = a.nodeName;for (a.getAttribute("_realname") && (e = a.getAttribute("_realname")), b = "<" + e, c = 0; c < a.attributes.length; c++) "_realname" != a.attributes[c].nodeName && (b += " " + a.attributes[c].nodeName + "='" + a.attributes[c].value.replace(/&/g, "&amp;").replace(/\'/g, "&apos;").replace(/>/g, "&gt;").replace(/</g, "&lt;") + "'");if (a.childNodes.length > 0) {
                    for (b += ">", c = 0; c < a.childNodes.length; c++) switch ((d = a.childNodes[c], d.nodeType)) {case i.ElementType.NORMAL:
                            b += i.serialize(d);break;case i.ElementType.TEXT:
                            b += i.xmlescape(d.nodeValue);break;case i.ElementType.CDATA:
                            b += "<![CDATA[" + d.nodeValue + "]]>";}b += "</" + e + ">";
                } else b += "/>";return b;
            }, _requestId: 0, _connectionPlugins: {}, addConnectionPlugin: function addConnectionPlugin(a, b) {
                i._connectionPlugins[a] = b;
            } }, i.Builder = function (a, b) {
            ("presence" == a || "message" == a || "iq" == a) && (b && !b.xmlns ? b.xmlns = i.NS.CLIENT : b || (b = { xmlns: i.NS.CLIENT })), this.nodeTree = i.xmlElement(a, b), this.node = this.nodeTree;
        }, i.Builder.prototype = { tree: function tree() {
                return this.nodeTree;
            }, toString: function toString() {
                return i.serialize(this.nodeTree);
            }, up: function up() {
                return this.node = this.node.parentNode, this;
            }, attrs: function attrs(a) {
                for (var b in a) a.hasOwnProperty(b) && (void 0 === a[b] ? this.node.removeAttribute(b) : this.node.setAttribute(b, a[b]));return this;
            }, c: function c(a, b, _c) {
                var d = i.xmlElement(a, b, _c);return this.node.appendChild(d), "string" != typeof _c && (this.node = d), this;
            }, cnode: function cnode(a) {
                var b,
                    c = i.xmlGenerator();try {
                    b = void 0 !== c.importNode;
                } catch (d) {
                    b = !1;
                }var e = b ? c.importNode(a, !0) : i.copyElement(a);return this.node.appendChild(e), this.node = e, this;
            }, t: function t(a) {
                var b = i.xmlTextNode(a);return this.node.appendChild(b), this;
            }, h: function h(a) {
                var b = document.createElement("body");b.innerHTML = a;for (var c = i.createHtml(b); c.childNodes.length > 0;) this.node.appendChild(c.childNodes[0]);return this;
            } }, i.Handler = function (a, b, c, d, e, f, g) {
            this.handler = a, this.ns = b, this.name = c, this.type = d, this.id = e, this.options = g || { matchBare: !1 }, this.options.matchBare || (this.options.matchBare = !1), this.options.matchBare ? this.from = f ? i.getBareJidFromJid(f) : null : this.from = f, this.user = !0;
        }, i.Handler.prototype = { isMatch: function isMatch(a) {
                var b,
                    c = null;if ((c = this.options.matchBare ? i.getBareJidFromJid(a.getAttribute("from")) : a.getAttribute("from"), b = !1, this.ns)) {
                    var d = this;i.forEachChild(a, null, function (a) {
                        a.getAttribute("xmlns") == d.ns && (b = !0);
                    }), b = b || a.getAttribute("xmlns") == this.ns;
                } else b = !0;var e = a.getAttribute("type");return !b || this.name && !i.isTagEqual(a, this.name) || this.type && (Array.isArray(this.type) ? -1 == this.type.indexOf(e) : e != this.type) || this.id && a.getAttribute("id") != this.id || this.from && c != this.from ? !1 : !0;
            }, run: function run(a) {
                var b = null;try {
                    b = this.handler(a);
                } catch (c) {
                    throw (c.sourceURL ? i.fatal("error: " + this.handler + " " + c.sourceURL + ":" + c.line + " - " + c.name + ": " + c.message) : c.fileName ? ("undefined" != typeof console && (console.trace(), console.error(this.handler, " - error - ", c, c.message)), i.fatal("error: " + this.handler + " " + c.fileName + ":" + c.lineNumber + " - " + c.name + ": " + c.message)) : i.fatal("error: " + c.message + "\n" + c.stack), c);
                }return b;
            }, toString: function toString() {
                return "{Handler: " + this.handler + "(" + this.name + "," + this.id + "," + this.ns + ")}";
            } }, i.TimedHandler = function (a, b) {
            this.period = a, this.handler = b, this.lastCalled = new Date().getTime(), this.user = !0;
        }, i.TimedHandler.prototype = { run: function run() {
                return this.lastCalled = new Date().getTime(), this.handler();
            }, reset: function reset() {
                this.lastCalled = new Date().getTime();
            }, toString: function toString() {
                return "{TimedHandler: " + this.handler + "(" + this.period + ")}";
            } }, i.Connection = function (a, b) {
            this.service = a, this.options = b || {};var c = this.options.protocol || "";0 === a.indexOf("ws:") || 0 === a.indexOf("wss:") || 0 === c.indexOf("ws") ? this._proto = new i.Websocket(this) : this._proto = new i.Bosh(this), this.jid = "", this.domain = null, this.features = null, this._sasl_data = {}, this.do_session = !1, this.do_bind = !1, this.timedHandlers = [], this.handlers = [], this.removeTimeds = [], this.removeHandlers = [], this.addTimeds = [], this.addHandlers = [], this._authentication = {}, this._idleTimeout = null, this._disconnectTimeout = null, this.authenticated = !1, this.connected = !1, this.disconnecting = !1, this.do_authentication = !0, this.paused = !1, this.restored = !1, this._data = [], this._uniqueId = 0, this._sasl_success_handler = null, this._sasl_failure_handler = null, this._sasl_challenge_handler = null, this.maxRetries = 5, this._idleTimeout = setTimeout(this._onIdle.bind(this), 100);for (var d in i._connectionPlugins) if (i._connectionPlugins.hasOwnProperty(d)) {
                var e = i._connectionPlugins[d],
                    f = function f() {};f.prototype = e, this[d] = new f(), this[d].init(this);
            }
        }, i.Connection.prototype = { reset: function reset() {
                this._proto._reset(), this.do_session = !1, this.do_bind = !1, this.timedHandlers = [], this.handlers = [], this.removeTimeds = [], this.removeHandlers = [], this.addTimeds = [], this.addHandlers = [], this._authentication = {}, this.authenticated = !1, this.connected = !1, this.disconnecting = !1, this.restored = !1, this._data = [], this._requests = [], this._uniqueId = 0;
            }, pause: function pause() {
                this.paused = !0;
            }, resume: function resume() {
                this.paused = !1;
            }, getUniqueId: function getUniqueId(a) {
                var b = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (a) {
                    var b = 16 * Math.random() | 0,
                        c = "x" == a ? b : 3 & b | 8;return c.toString(16);
                });return "string" == typeof a || "number" == typeof a ? b + ":" + a : b + "";
            }, connect: function connect(a, b, c, d, e, f, g) {
                this.jid = a, this.authzid = i.getBareJidFromJid(this.jid), this.authcid = g || i.getNodeFromJid(this.jid), this.pass = b, this.servtype = "xmpp", this.connect_callback = c, this.disconnecting = !1, this.connected = !1, this.authenticated = !1, this.restored = !1, this.domain = i.getDomainFromJid(this.jid), this._changeConnectStatus(i.Status.CONNECTING, null), this._proto._connect(d, e, f);
            }, attach: function attach(a, b, c, d, e, f, g) {
                if (!(this._proto instanceof i.Bosh)) throw { name: "StropheSessionError", message: 'The "attach" method can only be used with a BOSH connection.' };this._proto._attach(a, b, c, d, e, f, g);
            }, restore: function restore(a, b, c, d, e) {
                if (!this._sessionCachingSupported()) throw { name: "StropheSessionError", message: 'The "restore" method can only be used with a BOSH connection.' };this._proto._restore(a, b, c, d, e);
            }, _sessionCachingSupported: function _sessionCachingSupported() {
                if (this._proto instanceof i.Bosh) {
                    if (!JSON) return !1;try {
                        window.sessionStorage.setItem("_strophe_", "_strophe_"), window.sessionStorage.removeItem("_strophe_");
                    } catch (a) {
                        return !1;
                    }return !0;
                }return !1;
            }, xmlInput: function xmlInput(a) {}, xmlOutput: function xmlOutput(a) {}, rawInput: function rawInput(a) {}, rawOutput: function rawOutput(a) {}, nextValidRid: function nextValidRid(a) {}, send: function send(a) {
                if (null !== a) {
                    if ("function" == typeof a.sort) for (var b = 0; b < a.length; b++) this._queueData(a[b]);else "function" == typeof a.tree ? this._queueData(a.tree()) : this._queueData(a);this._proto._send();
                }
            }, flush: function flush() {
                clearTimeout(this._idleTimeout), this._onIdle();
            }, sendIQ: function sendIQ(a, b, c, d) {
                var e = null,
                    f = this;"function" == typeof a.tree && (a = a.tree());var g = a.getAttribute("id");g || (g = this.getUniqueId("sendIQ"), a.setAttribute("id", g));var h = a.getAttribute("to"),
                    j = this.jid,
                    k = this.addHandler(function (a) {
                    e && f.deleteTimedHandler(e);var d = !1,
                        g = a.getAttribute("from");if ((g !== h && (h || g !== i.getBareJidFromJid(j) && g !== i.getDomainFromJid(j) && g !== j) || (d = !0), !d)) throw { name: "StropheError", message: "Got answer to IQ from wrong jid:" + g + "\nExpected jid: " + h };var k = a.getAttribute("type");if ("result" == k) b && b(a);else {
                        if ("error" != k) throw { name: "StropheError", message: "Got bad IQ type of " + k };c && c(a);
                    }
                }, null, "iq", ["error", "result"], g);return d && (e = this.addTimedHandler(d, function () {
                    return f.deleteHandler(k), c && c(null), !1;
                })), this.send(a), g;
            }, _queueData: function _queueData(a) {
                if (null === a || !a.tagName || !a.childNodes) throw { name: "StropheError", message: "Cannot queue non-DOMElement." };this._data.push(a);
            }, _sendRestart: function _sendRestart() {
                this._data.push("restart"), this._proto._sendRestart(), this._idleTimeout = setTimeout(this._onIdle.bind(this), 100);
            }, addTimedHandler: function addTimedHandler(a, b) {
                var c = new i.TimedHandler(a, b);return this.addTimeds.push(c), c;
            }, deleteTimedHandler: function deleteTimedHandler(a) {
                this.removeTimeds.push(a);
            }, addHandler: function addHandler(a, b, c, d, e, f, g) {
                var h = new i.Handler(a, b, c, d, e, f, g);return this.addHandlers.push(h), h;
            }, deleteHandler: function deleteHandler(a) {
                this.removeHandlers.push(a);var b = this.addHandlers.indexOf(a);b >= 0 && this.addHandlers.splice(b, 1);
            }, disconnect: function disconnect(a) {
                if ((this._changeConnectStatus(i.Status.DISCONNECTING, a), i.info("Disconnect was called because: " + a), this.connected)) {
                    var b = !1;this.disconnecting = !0, this.authenticated && (b = h({ xmlns: i.NS.CLIENT, type: "unavailable" })), this._disconnectTimeout = this._addSysTimedHandler(3e3, this._onDisconnectTimeout.bind(this)), this._proto._disconnect(b);
                } else i.info("Disconnect was called before Strophe connected to the server"), this._proto._abortAllRequests();
            }, _changeConnectStatus: function _changeConnectStatus(a, b) {
                for (var c in i._connectionPlugins) if (i._connectionPlugins.hasOwnProperty(c)) {
                    var d = this[c];if (d.statusChanged) try {
                        d.statusChanged(a, b);
                    } catch (e) {
                        i.error("" + c + " plugin caused an exception changing status: " + e);
                    }
                }if (this.connect_callback) try {
                    this.connect_callback(a, b);
                } catch (f) {
                    i.error("User connection callback caused an exception: " + f);
                }
            }, _doDisconnect: function _doDisconnect(a) {
                "number" == typeof this._idleTimeout && clearTimeout(this._idleTimeout), null !== this._disconnectTimeout && (this.deleteTimedHandler(this._disconnectTimeout), this._disconnectTimeout = null), i.info("_doDisconnect was called"), this._proto._doDisconnect(), this.authenticated = !1, this.disconnecting = !1, this.restored = !1, this.handlers = [], this.timedHandlers = [], this.removeTimeds = [], this.removeHandlers = [], this.addTimeds = [], this.addHandlers = [], this._changeConnectStatus(i.Status.DISCONNECTED, a), this.connected = !1;
            }, _dataRecv: function _dataRecv(a, b) {
                i.info("_dataRecv called");var c = this._proto._reqToData(a);if (null !== c) {
                    this.xmlInput !== i.Connection.prototype.xmlInput && (c.nodeName === this._proto.strip && c.childNodes.length ? this.xmlInput(c.childNodes[0]) : this.xmlInput(c)), this.rawInput !== i.Connection.prototype.rawInput && (b ? this.rawInput(b) : this.rawInput(i.serialize(c)));for (var d, e; this.removeHandlers.length > 0;) e = this.removeHandlers.pop(), d = this.handlers.indexOf(e), d >= 0 && this.handlers.splice(d, 1);for (; this.addHandlers.length > 0;) this.handlers.push(this.addHandlers.pop());if (this.disconnecting && this._proto._emptyQueue()) return void this._doDisconnect();var f,
                        g,
                        h = c.getAttribute("type");if (null !== h && "terminate" == h) {
                        if (this.disconnecting) return;return f = c.getAttribute("condition"), g = c.getElementsByTagName("conflict"), null !== f ? ("remote-stream-error" == f && g.length > 0 && (f = "conflict"), this._changeConnectStatus(i.Status.CONNFAIL, f)) : this._changeConnectStatus(i.Status.CONNFAIL, "unknown"), void this._doDisconnect(f);
                    }var j = this;i.forEachChild(c, null, function (a) {
                        var b, c;for (c = j.handlers, j.handlers = [], b = 0; b < c.length; b++) {
                            var d = c[b];try {
                                !d.isMatch(a) || !j.authenticated && d.user ? j.handlers.push(d) : d.run(a) && j.handlers.push(d);
                            } catch (e) {
                                i.warn("Removing Strophe handlers due to uncaught exception: " + e.message);
                            }
                        }
                    });
                }
            }, mechanisms: {}, _connect_cb: function _connect_cb(a, b, c) {
                i.info("_connect_cb was called"), this.connected = !0;var d = this._proto._reqToData(a);if (d) {
                    this.xmlInput !== i.Connection.prototype.xmlInput && (d.nodeName === this._proto.strip && d.childNodes.length ? this.xmlInput(d.childNodes[0]) : this.xmlInput(d)), this.rawInput !== i.Connection.prototype.rawInput && (c ? this.rawInput(c) : this.rawInput(i.serialize(d)));var e = this._proto._connect_cb(d);if (e !== i.Status.CONNFAIL) {
                        this._authentication.sasl_scram_sha1 = !1, this._authentication.sasl_plain = !1, this._authentication.sasl_digest_md5 = !1, this._authentication.sasl_anonymous = !1, this._authentication.legacy_auth = !1;var f;f = d.getElementsByTagNameNS ? d.getElementsByTagNameNS(i.NS.STREAM, "features").length > 0 : d.getElementsByTagName("stream:features").length > 0 || d.getElementsByTagName("features").length > 0;var g,
                            h,
                            j = d.getElementsByTagName("mechanism"),
                            k = [],
                            l = !1;if (!f) return void this._proto._no_auth_received(b);if (j.length > 0) for (g = 0; g < j.length; g++) h = i.getText(j[g]), this.mechanisms[h] && k.push(this.mechanisms[h]);return this._authentication.legacy_auth = d.getElementsByTagName("auth").length > 0, (l = this._authentication.legacy_auth || k.length > 0) ? void (this.do_authentication !== !1 && this.authenticate(k)) : void this._proto._no_auth_received(b);
                    }
                }
            }, authenticate: function authenticate(a) {
                var c;for (c = 0; c < a.length - 1; ++c) {
                    for (var d = c, f = c + 1; f < a.length; ++f) a[f].prototype.priority > a[d].prototype.priority && (d = f);if (d != c) {
                        var h = a[c];a[c] = a[d], a[d] = h;
                    }
                }var j = !1;for (c = 0; c < a.length; ++c) if (a[c].test(this)) {
                    this._sasl_success_handler = this._addSysHandler(this._sasl_success_cb.bind(this), null, "success", null, null), this._sasl_failure_handler = this._addSysHandler(this._sasl_failure_cb.bind(this), null, "failure", null, null), this._sasl_challenge_handler = this._addSysHandler(this._sasl_challenge_cb.bind(this), null, "challenge", null, null), this._sasl_mechanism = new a[c](), this._sasl_mechanism.onStart(this);var k = e("auth", { xmlns: i.NS.SASL, mechanism: this._sasl_mechanism.name });if (this._sasl_mechanism.isClientFirst) {
                        var l = this._sasl_mechanism.onChallenge(this, null);k.t(b.encode(l));
                    }this.send(k.tree()), j = !0;break;
                }j || (null === i.getNodeFromJid(this.jid) ? (this._changeConnectStatus(i.Status.CONNFAIL, "x-strophe-bad-non-anon-jid"), this.disconnect("x-strophe-bad-non-anon-jid")) : (this._changeConnectStatus(i.Status.AUTHENTICATING, null), this._addSysHandler(this._auth1_cb.bind(this), null, null, null, "_auth_1"), this.send(g({ type: "get", to: this.domain, id: "_auth_1" }).c("query", { xmlns: i.NS.AUTH }).c("username", {}).t(i.getNodeFromJid(this.jid)).tree())));
            }, _sasl_challenge_cb: function _sasl_challenge_cb(a) {
                var c = b.decode(i.getText(a)),
                    d = this._sasl_mechanism.onChallenge(this, c),
                    f = e("response", { xmlns: i.NS.SASL });return "" !== d && f.t(b.encode(d)), this.send(f.tree()), !0;
            }, _auth1_cb: function _auth1_cb(a) {
                var b = g({ type: "set", id: "_auth_2" }).c("query", { xmlns: i.NS.AUTH }).c("username", {}).t(i.getNodeFromJid(this.jid)).up().c("password").t(this.pass);return i.getResourceFromJid(this.jid) || (this.jid = i.getBareJidFromJid(this.jid) + "/strophe"), b.up().c("resource", {}).t(i.getResourceFromJid(this.jid)), this._addSysHandler(this._auth2_cb.bind(this), null, null, null, "_auth_2"), this.send(b.tree()), !1;
            }, _sasl_success_cb: function _sasl_success_cb(a) {
                if (this._sasl_data["server-signature"]) {
                    var c,
                        d = b.decode(i.getText(a)),
                        e = /([a-z]+)=([^,]+)(,|$)/,
                        f = d.match(e);if (("v" == f[1] && (c = f[2]), c != this._sasl_data["server-signature"])) return this.deleteHandler(this._sasl_failure_handler), this._sasl_failure_handler = null, this._sasl_challenge_handler && (this.deleteHandler(this._sasl_challenge_handler), this._sasl_challenge_handler = null), this._sasl_data = {}, this._sasl_failure_cb(null);
                }i.info("SASL authentication succeeded."), this._sasl_mechanism && this._sasl_mechanism.onSuccess(), this.deleteHandler(this._sasl_failure_handler), this._sasl_failure_handler = null, this._sasl_challenge_handler && (this.deleteHandler(this._sasl_challenge_handler), this._sasl_challenge_handler = null);var g = [],
                    h = function h(a, b) {
                    for (; a.length;) this.deleteHandler(a.pop());return this._sasl_auth1_cb.bind(this)(b), !1;
                };return g.push(this._addSysHandler((function (a) {
                    h.bind(this)(g, a);
                }).bind(this), null, "stream:features", null, null)), g.push(this._addSysHandler((function (a) {
                    h.bind(this)(g, a);
                }).bind(this), i.NS.STREAM, "features", null, null)), this._sendRestart(), !1;
            }, _sasl_auth1_cb: function _sasl_auth1_cb(a) {
                this.features = a;var b, c;for (b = 0; b < a.childNodes.length; b++) c = a.childNodes[b], "bind" == c.nodeName && (this.do_bind = !0), "session" == c.nodeName && (this.do_session = !0);if (!this.do_bind) return this._changeConnectStatus(i.Status.AUTHFAIL, null), !1;this._addSysHandler(this._sasl_bind_cb.bind(this), null, null, null, "_bind_auth_2");var d = i.getResourceFromJid(this.jid);return d ? this.send(g({ type: "set", id: "_bind_auth_2" }).c("bind", { xmlns: i.NS.BIND }).c("resource", {}).t(d).tree()) : this.send(g({ type: "set", id: "_bind_auth_2" }).c("bind", { xmlns: i.NS.BIND }).tree()), !1;
            }, _sasl_bind_cb: function _sasl_bind_cb(a) {
                if ("error" == a.getAttribute("type")) {
                    i.info("SASL binding failed.");var b,
                        c = a.getElementsByTagName("conflict");return c.length > 0 && (b = "conflict"), this._changeConnectStatus(i.Status.AUTHFAIL, b), !1;
                }var d,
                    e = a.getElementsByTagName("bind");return e.length > 0 ? (d = e[0].getElementsByTagName("jid"), void (d.length > 0 && (this.jid = i.getText(d[0]), this.do_session ? (this._addSysHandler(this._sasl_session_cb.bind(this), null, null, null, "_session_auth_2"), this.send(g({ type: "set", id: "_session_auth_2" }).c("session", { xmlns: i.NS.SESSION }).tree())) : (this.authenticated = !0, this._changeConnectStatus(i.Status.CONNECTED, null))))) : (i.info("SASL binding failed."), this._changeConnectStatus(i.Status.AUTHFAIL, null), !1);
            }, _sasl_session_cb: function _sasl_session_cb(a) {
                if ("result" == a.getAttribute("type")) this.authenticated = !0, this._changeConnectStatus(i.Status.CONNECTED, null);else if ("error" == a.getAttribute("type")) return i.info("Session creation failed."), this._changeConnectStatus(i.Status.AUTHFAIL, null), !1;return !1;
            }, _sasl_failure_cb: function _sasl_failure_cb(a) {
                return this._sasl_success_handler && (this.deleteHandler(this._sasl_success_handler), this._sasl_success_handler = null), this._sasl_challenge_handler && (this.deleteHandler(this._sasl_challenge_handler), this._sasl_challenge_handler = null), this._sasl_mechanism && this._sasl_mechanism.onFailure(), this._changeConnectStatus(i.Status.AUTHFAIL, null), !1;
            }, _auth2_cb: function _auth2_cb(a) {
                return "result" == a.getAttribute("type") ? (this.authenticated = !0, this._changeConnectStatus(i.Status.CONNECTED, null)) : "error" == a.getAttribute("type") && (this._changeConnectStatus(i.Status.AUTHFAIL, null), this.disconnect("authentication failed")), !1;
            }, _addSysTimedHandler: function _addSysTimedHandler(a, b) {
                var c = new i.TimedHandler(a, b);return c.user = !1, this.addTimeds.push(c), c;
            },
            _addSysHandler: function _addSysHandler(a, b, c, d, e) {
                var f = new i.Handler(a, b, c, d, e);return f.user = !1, this.addHandlers.push(f), f;
            }, _onDisconnectTimeout: function _onDisconnectTimeout() {
                return i.info("_onDisconnectTimeout was called"), this._proto._onDisconnectTimeout(), this._doDisconnect(), !1;
            }, _onIdle: function _onIdle() {
                for (var a, b, c, d; this.addTimeds.length > 0;) this.timedHandlers.push(this.addTimeds.pop());for (; this.removeTimeds.length > 0;) b = this.removeTimeds.pop(), a = this.timedHandlers.indexOf(b), a >= 0 && this.timedHandlers.splice(a, 1);var e = new Date().getTime();for (d = [], a = 0; a < this.timedHandlers.length; a++) b = this.timedHandlers[a], (this.authenticated || !b.user) && (c = b.lastCalled + b.period, 0 >= c - e ? b.run() && d.push(b) : d.push(b));this.timedHandlers = d, clearTimeout(this._idleTimeout), this._proto._onIdle(), this.connected && (this._idleTimeout = setTimeout(this._onIdle.bind(this), 100));
            } }, i.SASLMechanism = function (a, b, c) {
            this.name = a, this.isClientFirst = b, this.priority = c;
        }, i.SASLMechanism.prototype = { test: function test(a) {
                return !0;
            }, onStart: function onStart(a) {
                this._connection = a;
            }, onChallenge: function onChallenge(a, b) {
                throw new Error("You should implement challenge handling!");
            }, onFailure: function onFailure() {
                this._connection = null;
            }, onSuccess: function onSuccess() {
                this._connection = null;
            } }, i.SASLAnonymous = function () {}, i.SASLAnonymous.prototype = new i.SASLMechanism("ANONYMOUS", !1, 10), i.SASLAnonymous.test = function (a) {
            return null === a.authcid;
        }, i.Connection.prototype.mechanisms[i.SASLAnonymous.prototype.name] = i.SASLAnonymous, i.SASLPlain = function () {}, i.SASLPlain.prototype = new i.SASLMechanism("PLAIN", !0, 20), i.SASLPlain.test = function (a) {
            return null !== a.authcid;
        }, i.SASLPlain.prototype.onChallenge = function (a) {
            var b = a.authzid;return b += "\x00", b += a.authcid, b += "\x00", b += a.pass, d.utf16to8(b);
        }, i.Connection.prototype.mechanisms[i.SASLPlain.prototype.name] = i.SASLPlain, i.SASLSHA1 = function () {}, i.SASLSHA1.prototype = new i.SASLMechanism("SCRAM-SHA-1", !0, 40), i.SASLSHA1.test = function (a) {
            return null !== a.authcid;
        }, i.SASLSHA1.prototype.onChallenge = function (e, f, g) {
            var h = g || c.hexdigest(1234567890 * Math.random()),
                i = "n=" + d.utf16to8(e.authcid);return i += ",r=", i += h, e._sasl_data.cnonce = h, e._sasl_data["client-first-message-bare"] = i, i = "n,," + i, this.onChallenge = (function (c, e) {
                for (var f, g, h, i, j, k, l, m, n, o, p, q, r = "c=biws,", s = c._sasl_data["client-first-message-bare"] + "," + e + ",", t = c._sasl_data.cnonce, u = /([a-z]+)=([^,]+)(,|$)/; e.match(u);) {
                    var v = e.match(u);switch ((e = e.replace(v[0], ""), v[1])) {case "r":
                            f = v[2];break;case "s":
                            g = v[2];break;case "i":
                            h = v[2];}
                }if (f.substr(0, t.length) !== t) return c._sasl_data = {}, c._sasl_failure_cb();for (r += "r=" + f, s += r, g = b.decode(g), g += "\x00\x00\x00", n = d.utf16to8(c.pass), i = k = a.core_hmac_sha1(n, g), l = 1; h > l; l++) {
                    for (j = a.core_hmac_sha1(n, a.binb2str(k)), m = 0; 5 > m; m++) i[m] ^= j[m];k = j;
                }for (i = a.binb2str(i), o = a.core_hmac_sha1(i, "Client Key"), p = a.str_hmac_sha1(i, "Server Key"), q = a.core_hmac_sha1(a.str_sha1(a.binb2str(o)), s), c._sasl_data["server-signature"] = a.b64_hmac_sha1(p, s), m = 0; 5 > m; m++) o[m] ^= q[m];return r += ",p=" + b.encode(a.binb2str(o));
            }).bind(this), i;
        }, i.Connection.prototype.mechanisms[i.SASLSHA1.prototype.name] = i.SASLSHA1, i.SASLMD5 = function () {}, i.SASLMD5.prototype = new i.SASLMechanism("DIGEST-MD5", !1, 30), i.SASLMD5.test = function (a) {
            return null !== a.authcid;
        }, i.SASLMD5.prototype._quote = function (a) {
            return '"' + a.replace(/\\/g, "\\\\").replace(/"/g, '\\"') + '"';
        }, i.SASLMD5.prototype.onChallenge = function (a, b, e) {
            for (var f, g = /([a-z]+)=("[^"]+"|[^,"]+)(?:,|$)/, h = e || c.hexdigest("" + 1234567890 * Math.random()), i = "", j = null, k = "", l = ""; b.match(g);) switch ((f = b.match(g), b = b.replace(f[0], ""), f[2] = f[2].replace(/^"(.+)"$/, "$1"), f[1])) {case "realm":
                    i = f[2];break;case "nonce":
                    k = f[2];break;case "qop":
                    l = f[2];break;case "host":
                    j = f[2];}var m = a.servtype + "/" + a.domain;null !== j && (m = m + "/" + j);var n = d.utf16to8(a.authcid + ":" + i + ":" + this._connection.pass),
                o = c.hash(n) + ":" + k + ":" + h,
                p = "AUTHENTICATE:" + m,
                q = "";return q += "charset=utf-8,", q += "username=" + this._quote(d.utf16to8(a.authcid)) + ",", q += "realm=" + this._quote(i) + ",", q += "nonce=" + this._quote(k) + ",", q += "nc=00000001,", q += "cnonce=" + this._quote(h) + ",", q += "digest-uri=" + this._quote(m) + ",", q += "response=" + c.hexdigest(c.hexdigest(o) + ":" + k + ":00000001:" + h + ":auth:" + c.hexdigest(p)) + ",", q += "qop=auth", this.onChallenge = (function () {
                return "";
            }).bind(this), q;
        }, i.Connection.prototype.mechanisms[i.SASLMD5.prototype.name] = i.SASLMD5, { Strophe: i, $build: e, $msg: f, $iq: g, $pres: h, SHA1: a, Base64: b, MD5: c };
    }), (function (a, b) {
        return "function" == typeof define && define.amd ? void define("strophe-bosh", ["strophe-core"], function (a) {
            return b(a.Strophe, a.$build);
        }) : b(Strophe, $build);
    })(this, function (a, b) {
        return a.Request = function (b, c, d, e) {
            this.id = ++a._requestId, this.xmlData = b, this.data = a.serialize(b), this.origFunc = c, this.func = c, this.rid = d, this.date = NaN, this.sends = e || 0, this.abort = !1, this.dead = null, this.age = function () {
                if (!this.date) return 0;var a = new Date();return (a - this.date) / 1e3;
            }, this.timeDead = function () {
                if (!this.dead) return 0;var a = new Date();return (a - this.dead) / 1e3;
            }, this.xhr = this._newXHR();
        }, a.Request.prototype = { getResponse: function getResponse() {
                var b = null;if (this.xhr.responseXML && this.xhr.responseXML.documentElement) {
                    if ((b = this.xhr.responseXML.documentElement, "parsererror" == b.tagName)) throw (a.error("invalid response received"), a.error("responseText: " + this.xhr.responseText), a.error("responseXML: " + a.serialize(this.xhr.responseXML)), "parsererror");
                } else this.xhr.responseText && (a.error("invalid response received"), a.error("responseText: " + this.xhr.responseText), a.error("responseXML: " + a.serialize(this.xhr.responseXML)));return b;
            }, _newXHR: function _newXHR() {
                var a = null;return window.XMLHttpRequest ? (a = new XMLHttpRequest(), a.overrideMimeType && a.overrideMimeType("text/xml; charset=utf-8")) : window.ActiveXObject && (a = new ActiveXObject("Microsoft.XMLHTTP")), a.onreadystatechange = this.func.bind(null, this), a;
            } }, a.Bosh = function (a) {
            this._conn = a, this.rid = Math.floor(4294967295 * Math.random()), this.sid = null, this.hold = 1, this.wait = 60, this.window = 5, this.errors = 0, this._requests = [];
        }, a.Bosh.prototype = { strip: null, _buildBody: function _buildBody() {
                var c = b("body", { rid: this.rid++, xmlns: a.NS.HTTPBIND });return null !== this.sid && c.attrs({ sid: this.sid }), this._conn.options.keepalive && this._cacheSession(), c;
            }, _reset: function _reset() {
                this.rid = Math.floor(4294967295 * Math.random()), this.sid = null, this.errors = 0, window.sessionStorage.removeItem("strophe-bosh-session"), this._conn.nextValidRid(this.rid);
            }, _connect: function _connect(b, c, d) {
                this.wait = b || this.wait, this.hold = c || this.hold, this.errors = 0;var e = this._buildBody().attrs({ to: this._conn.domain, "xml:lang": "en", wait: this.wait, hold: this.hold, content: "text/xml; charset=utf-8", ver: "1.6", "xmpp:version": "1.0", "xmlns:xmpp": a.NS.BOSH });d && e.attrs({ route: d });var f = this._conn._connect_cb;this._requests.push(new a.Request(e.tree(), this._onRequestStateChange.bind(this, f.bind(this._conn)), e.tree().getAttribute("rid"))), this._throttledRequestHandler();
            }, _attach: function _attach(b, c, d, e, f, g, h) {
                this._conn.jid = b, this.sid = c, this.rid = d, this._conn.connect_callback = e, this._conn.domain = a.getDomainFromJid(this._conn.jid), this._conn.authenticated = !0, this._conn.connected = !0, this.wait = f || this.wait, this.hold = g || this.hold, this.window = h || this.window, this._conn._changeConnectStatus(a.Status.ATTACHED, null);
            }, _restore: function _restore(b, c, d, e, f) {
                var g = JSON.parse(window.sessionStorage.getItem("strophe-bosh-session"));if (!("undefined" != typeof g && null !== g && g.rid && g.sid && g.jid) || "undefined" != typeof b && "null" !== b && a.getBareJidFromJid(g.jid) != a.getBareJidFromJid(b)) throw { name: "StropheSessionError", message: "_restore: no restoreable session." };this._conn.restored = !0, this._attach(g.jid, g.sid, g.rid, c, d, e, f);
            }, _cacheSession: function _cacheSession() {
                this._conn.authenticated ? this._conn.jid && this.rid && this.sid && window.sessionStorage.setItem("strophe-bosh-session", JSON.stringify({ jid: this._conn.jid, rid: this.rid, sid: this.sid })) : window.sessionStorage.removeItem("strophe-bosh-session");
            }, _connect_cb: function _connect_cb(b) {
                var c,
                    d,
                    e = b.getAttribute("type");if (null !== e && "terminate" == e) return c = b.getAttribute("condition"), a.error("BOSH-Connection failed: " + c), d = b.getElementsByTagName("conflict"), null !== c ? ("remote-stream-error" == c && d.length > 0 && (c = "conflict"), this._conn._changeConnectStatus(a.Status.CONNFAIL, c)) : this._conn._changeConnectStatus(a.Status.CONNFAIL, "unknown"), this._conn._doDisconnect(c), a.Status.CONNFAIL;this.sid || (this.sid = b.getAttribute("sid"));var f = b.getAttribute("requests");f && (this.window = parseInt(f, 10));var g = b.getAttribute("hold");g && (this.hold = parseInt(g, 10));var h = b.getAttribute("wait");h && (this.wait = parseInt(h, 10));
            }, _disconnect: function _disconnect(a) {
                this._sendTerminate(a);
            }, _doDisconnect: function _doDisconnect() {
                this.sid = null, this.rid = Math.floor(4294967295 * Math.random()), window.sessionStorage.removeItem("strophe-bosh-session"), this._conn.nextValidRid(this.rid);
            }, _emptyQueue: function _emptyQueue() {
                return 0 === this._requests.length;
            }, _hitError: function _hitError(b) {
                this.errors++, a.warn("request errored, status: " + b + ", number of errors: " + this.errors), this.errors > 4 && this._conn._onDisconnectTimeout();
            }, _no_auth_received: function _no_auth_received(b) {
                b = b ? b.bind(this._conn) : this._conn._connect_cb.bind(this._conn);var c = this._buildBody();this._requests.push(new a.Request(c.tree(), this._onRequestStateChange.bind(this, b.bind(this._conn)), c.tree().getAttribute("rid"))), this._throttledRequestHandler();
            }, _onDisconnectTimeout: function _onDisconnectTimeout() {
                this._abortAllRequests();
            }, _abortAllRequests: function _abortAllRequests() {
                for (var a; this._requests.length > 0;) a = this._requests.pop(), a.abort = !0, a.xhr.abort(), a.xhr.onreadystatechange = function () {};
            }, _onIdle: function _onIdle() {
                var b = this._conn._data;if ((this._conn.authenticated && 0 === this._requests.length && 0 === b.length && !this._conn.disconnecting && (a.info("no requests during idle cycle, sending blank request"), b.push(null)), !this._conn.paused)) {
                    if (this._requests.length < 2 && b.length > 0) {
                        for (var c = this._buildBody(), d = 0; d < b.length; d++) null !== b[d] && ("restart" === b[d] ? c.attrs({ to: this._conn.domain, "xml:lang": "en", "xmpp:restart": "true", "xmlns:xmpp": a.NS.BOSH }) : c.cnode(b[d]).up());delete this._conn._data, this._conn._data = [], this._requests.push(new a.Request(c.tree(), this._onRequestStateChange.bind(this, this._conn._dataRecv.bind(this._conn)), c.tree().getAttribute("rid"))), this._throttledRequestHandler();
                    }if (this._requests.length > 0) {
                        var e = this._requests[0].age();null !== this._requests[0].dead && this._requests[0].timeDead() > Math.floor(a.SECONDARY_TIMEOUT * this.wait) && this._throttledRequestHandler(), e > Math.floor(a.TIMEOUT * this.wait) && (a.warn("Request " + this._requests[0].id + " timed out, over " + Math.floor(a.TIMEOUT * this.wait) + " seconds since last activity"), this._throttledRequestHandler());
                    }
                }
            }, _onRequestStateChange: function _onRequestStateChange(b, c) {
                if ((a.debug("request id " + c.id + "." + c.sends + " state changed to " + c.xhr.readyState), c.abort)) return void (c.abort = !1);var d;if (4 == c.xhr.readyState) {
                    d = 0;try {
                        d = c.xhr.status;
                    } catch (e) {}if (("undefined" == typeof d && (d = 0), this.disconnecting && d >= 400)) return void this._hitError(d);var f = this._requests[0] == c,
                        g = this._requests[1] == c;(d > 0 && 500 > d || c.sends > 5) && (this._removeRequest(c), a.debug("request id " + c.id + " should now be removed")), 200 == d ? ((g || f && this._requests.length > 0 && this._requests[0].age() > Math.floor(a.SECONDARY_TIMEOUT * this.wait)) && this._restartRequest(0), this._conn.nextValidRid(Number(c.rid) + 1), a.debug("request id " + c.id + "." + c.sends + " got 200"), b(c), this.errors = 0) : (a.error("request id " + c.id + "." + c.sends + " error " + d + " happened"), (0 === d || d >= 400 && 600 > d || d >= 12e3) && (this._hitError(d), d >= 400 && 500 > d && (this._conn._changeConnectStatus(a.Status.DISCONNECTING, null), this._conn._doDisconnect()))), d > 0 && 500 > d || c.sends > 5 || this._throttledRequestHandler();
                }
            }, _processRequest: function _processRequest(b) {
                var c = this,
                    d = this._requests[b],
                    e = -1;try {
                    4 == d.xhr.readyState && (e = d.xhr.status);
                } catch (f) {
                    a.error("caught an error in _requests[" + b + "], reqStatus: " + e);
                }if (("undefined" == typeof e && (e = -1), d.sends > this._conn.maxRetries)) return void this._conn._onDisconnectTimeout();var g = d.age(),
                    h = !isNaN(g) && g > Math.floor(a.TIMEOUT * this.wait),
                    i = null !== d.dead && d.timeDead() > Math.floor(a.SECONDARY_TIMEOUT * this.wait),
                    j = 4 == d.xhr.readyState && (1 > e || e >= 500);if (((h || i || j) && (i && a.error("Request " + this._requests[b].id + " timed out (secondary), restarting"), d.abort = !0, d.xhr.abort(), d.xhr.onreadystatechange = function () {}, this._requests[b] = new a.Request(d.xmlData, d.origFunc, d.rid, d.sends), d = this._requests[b]), 0 === d.xhr.readyState)) {
                    a.debug("request id " + d.id + "." + d.sends + " posting");try {
                        d.xhr.open("POST", this._conn.service, this._conn.options.sync ? !1 : !0), d.xhr.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
                    } catch (k) {
                        return a.error("XHR open failed."), this._conn.connected || this._conn._changeConnectStatus(a.Status.CONNFAIL, "bad-service"), void this._conn.disconnect();
                    }var l = function l() {
                        if ((d.date = new Date(), c._conn.options.customHeaders)) {
                            var a = c._conn.options.customHeaders;for (var b in a) a.hasOwnProperty(b) && d.xhr.setRequestHeader(b, a[b]);
                        }d.xhr.send(d.data);
                    };if (d.sends > 1) {
                        var m = 1e3 * Math.min(Math.floor(a.TIMEOUT * this.wait), Math.pow(d.sends, 3));setTimeout(l, m);
                    } else l();d.sends++, this._conn.xmlOutput !== a.Connection.prototype.xmlOutput && (d.xmlData.nodeName === this.strip && d.xmlData.childNodes.length ? this._conn.xmlOutput(d.xmlData.childNodes[0]) : this._conn.xmlOutput(d.xmlData)), this._conn.rawOutput !== a.Connection.prototype.rawOutput && this._conn.rawOutput(d.data);
                } else a.debug("_processRequest: " + (0 === b ? "first" : "second") + " request has readyState of " + d.xhr.readyState);
            }, _removeRequest: function _removeRequest(b) {
                a.debug("removing request");var c;for (c = this._requests.length - 1; c >= 0; c--) b == this._requests[c] && this._requests.splice(c, 1);b.xhr.onreadystatechange = function () {}, this._throttledRequestHandler();
            }, _restartRequest: function _restartRequest(a) {
                var b = this._requests[a];null === b.dead && (b.dead = new Date()), this._processRequest(a);
            }, _reqToData: function _reqToData(a) {
                try {
                    return a.getResponse();
                } catch (b) {
                    if ("parsererror" != b) throw b;this._conn.disconnect("strophe-parsererror");
                }
            }, _sendTerminate: function _sendTerminate(b) {
                a.info("_sendTerminate was called");var c = this._buildBody().attrs({ type: "terminate" });b && c.cnode(b.tree());var d = new a.Request(c.tree(), this._onRequestStateChange.bind(this, this._conn._dataRecv.bind(this._conn)), c.tree().getAttribute("rid"));this._requests.push(d), this._throttledRequestHandler();
            }, _send: function _send() {
                clearTimeout(this._conn._idleTimeout), this._throttledRequestHandler(), this._conn._idleTimeout = setTimeout(this._conn._onIdle.bind(this._conn), 100);
            }, _sendRestart: function _sendRestart() {
                this._throttledRequestHandler(), clearTimeout(this._conn._idleTimeout);
            }, _throttledRequestHandler: function _throttledRequestHandler() {
                this._requests ? a.debug("_throttledRequestHandler called with " + this._requests.length + " requests") : a.debug("_throttledRequestHandler called with undefined requests"), this._requests && 0 !== this._requests.length && (this._requests.length > 0 && this._processRequest(0), this._requests.length > 1 && Math.abs(this._requests[0].rid - this._requests[1].rid) < this.window && this._processRequest(1));
            } }, a;
    }), (function (a, b) {
        return "function" == typeof define && define.amd ? void define("strophe-websocket", ["strophe-core"], function (a) {
            return b(a.Strophe, a.$build);
        }) : b(Strophe, $build);
    })(this, function (a, b) {
        return a.Websocket = function (a) {
            this._conn = a, this.strip = "wrapper";var b = a.service;if (0 !== b.indexOf("ws:") && 0 !== b.indexOf("wss:")) {
                var c = "";c += "ws" === a.options.protocol && "https:" !== window.location.protocol ? "ws" : "wss", c += "://" + window.location.host, c += 0 !== b.indexOf("/") ? window.location.pathname + b : b, a.service = c;
            }
        }, a.Websocket.prototype = { _buildStream: function _buildStream() {
                return b("open", { xmlns: a.NS.FRAMING, to: this._conn.domain, version: "1.0" });
            }, _check_streamerror: function _check_streamerror(b, c) {
                var d;if ((d = b.getElementsByTagNameNS ? b.getElementsByTagNameNS(a.NS.STREAM, "error") : b.getElementsByTagName("stream:error"), 0 === d.length)) return !1;for (var e = d[0], f = "", g = "", h = "urn:ietf:params:xml:ns:xmpp-streams", i = 0; i < e.childNodes.length; i++) {
                    var j = e.childNodes[i];if (j.getAttribute("xmlns") !== h) break;"text" === j.nodeName ? g = j.textContent : f = j.nodeName;
                }var k = "WebSocket stream error: ";return k += f ? f : "unknown", g && (k += " - " + f), a.error(k), this._conn._changeConnectStatus(c, f), this._conn._doDisconnect(), !0;
            }, _reset: function _reset() {}, _connect: function _connect() {
                this._closeSocket(), this.socket = new WebSocket(this._conn.service, "xmpp"), this.socket.onopen = this._onOpen.bind(this), this.socket.onerror = this._onError.bind(this), this.socket.onclose = this._onClose.bind(this), this.socket.onmessage = this._connect_cb_wrapper.bind(this);
            }, _connect_cb: function _connect_cb(b) {
                var c = this._check_streamerror(b, a.Status.CONNFAIL);return c ? a.Status.CONNFAIL : void 0;
            }, _handleStreamStart: function _handleStreamStart(b) {
                var c = !1,
                    d = b.getAttribute("xmlns");"string" != typeof d ? c = "Missing xmlns in <open />" : d !== a.NS.FRAMING && (c = "Wrong xmlns in <open />: " + d);var e = b.getAttribute("version");return "string" != typeof e ? c = "Missing version in <open />" : "1.0" !== e && (c = "Wrong version in <open />: " + e), c ? (this._conn._changeConnectStatus(a.Status.CONNFAIL, c), this._conn._doDisconnect(), !1) : !0;
            }, _connect_cb_wrapper: function _connect_cb_wrapper(b) {
                if (0 === b.data.indexOf("<open ") || 0 === b.data.indexOf("<?xml")) {
                    var c = b.data.replace(/^(<\?.*?\?>\s*)*/, "");if ("" === c) return;var d = new DOMParser().parseFromString(c, "text/xml").documentElement;this._conn.xmlInput(d), this._conn.rawInput(b.data), this._handleStreamStart(d) && this._connect_cb(d);
                } else if (0 === b.data.indexOf("<close ")) {
                    this._conn.rawInput(b.data), this._conn.xmlInput(b);var e = b.getAttribute("see-other-uri");e ? (this._conn._changeConnectStatus(a.Status.REDIRECT, "Received see-other-uri, resetting connection"), this._conn.reset(), this._conn.service = e, this._connect()) : (this._conn._changeConnectStatus(a.Status.CONNFAIL, "Received closing stream"), this._conn._doDisconnect());
                } else {
                    var f = this._streamWrap(b.data),
                        g = new DOMParser().parseFromString(f, "text/xml").documentElement;this.socket.onmessage = this._onMessage.bind(this), this._conn._connect_cb(g, null, b.data);
                }
            }, _disconnect: function _disconnect(c) {
                if (this.socket && this.socket.readyState !== WebSocket.CLOSED) {
                    c && this._conn.send(c);var d = b("close", { xmlns: a.NS.FRAMING });this._conn.xmlOutput(d);var e = a.serialize(d);this._conn.rawOutput(e);try {
                        this.socket.send(e);
                    } catch (f) {
                        a.info("Couldn't send <close /> tag.");
                    }
                }this._conn._doDisconnect();
            }, _doDisconnect: function _doDisconnect() {
                a.info("WebSockets _doDisconnect was called"), this._closeSocket();
            }, _streamWrap: function _streamWrap(a) {
                return "<wrapper>" + a + "</wrapper>";
            }, _closeSocket: function _closeSocket() {
                if (this.socket) try {
                    this.socket.close();
                } catch (a) {}this.socket = null;
            }, _emptyQueue: function _emptyQueue() {
                return !0;
            }, _onClose: function _onClose() {
                this._conn.connected && !this._conn.disconnecting ? (a.error("Websocket closed unexcectedly"), this._conn._doDisconnect()) : a.info("Websocket closed");
            }, _no_auth_received: function _no_auth_received(b) {
                a.error("Server did not send any auth methods"), this._conn._changeConnectStatus(a.Status.CONNFAIL, "Server did not send any auth methods"), b && (b = b.bind(this._conn))(), this._conn._doDisconnect();
            }, _onDisconnectTimeout: function _onDisconnectTimeout() {}, _abortAllRequests: function _abortAllRequests() {}, _onError: function _onError(b) {
                a.error("Websocket error " + b), this._conn._changeConnectStatus(a.Status.CONNFAIL, "The WebSocket connection could not be established was disconnected."), this._disconnect();
            }, _onIdle: function _onIdle() {
                var b = this._conn._data;if (b.length > 0 && !this._conn.paused) {
                    for (var c = 0; c < b.length; c++) if (null !== b[c]) {
                        var d, e;d = "restart" === b[c] ? this._buildStream().tree() : b[c], e = a.serialize(d), this._conn.xmlOutput(d), this._conn.rawOutput(e), this.socket.send(e);
                    }this._conn._data = [];
                }
            }, _onMessage: function _onMessage(b) {
                var c,
                    d,
                    e = '<close xmlns="urn:ietf:params:xml:ns:xmpp-framing" />';if (b.data === e) return this._conn.rawInput(e), this._conn.xmlInput(b), void (this._conn.disconnecting || this._conn._doDisconnect());if (0 === b.data.search("<open ")) {
                    if ((c = new DOMParser().parseFromString(b.data, "text/xml").documentElement, !this._handleStreamStart(c))) return;
                } else d = this._streamWrap(b.data), c = new DOMParser().parseFromString(d, "text/xml").documentElement;return this._check_streamerror(c, a.Status.ERROR) ? void 0 : this._conn.disconnecting && "presence" === c.firstChild.nodeName && "unavailable" === c.firstChild.getAttribute("type") ? (this._conn.xmlInput(c), void this._conn.rawInput(a.serialize(c))) : void this._conn._dataRecv(c, b.data);
            }, _onOpen: function _onOpen() {
                a.info("Websocket open");var b = this._buildStream();this._conn.xmlOutput(b.tree());var c = a.serialize(b);this._conn.rawOutput(c), this.socket.send(c);
            }, _reqToData: function _reqToData(a) {
                return a;
            }, _send: function _send() {
                this._conn.flush();
            }, _sendRestart: function _sendRestart() {
                clearTimeout(this._conn._idleTimeout), this._conn._onIdle.bind(this._conn)();
            } }, a;
    }), (function (a) {
        "function" == typeof define && define.amd && define("strophe", ["strophe-core", "strophe-bosh", "strophe-websocket"], function (a) {
            return a;
        });
    })(this), a)) {
        if ("function" != typeof define || !define.amd) return a(Strophe, $build, $msg, $iq, $pres);var b = a;require(["strophe"], function (a) {
            b(a.Strophe, a.$build, a.$msg, a.$iq, a.$pres);
        });
    }
})(function (a, b, c, d, e) {
    window.Strophe = a, window.$build = b, window.$msg = c, window.$iq = d, window.$pres = e;
});
});

require('web/static/js/app');
//# sourceMappingURL=app.js.map