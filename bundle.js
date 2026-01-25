var AFFStarTrek = (() => {
  // obr-sdk.js
  var OBR = (() => {
    var __create = Object.create;
    var __defProp = Object.defineProperty;
    var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames = Object.getOwnPropertyNames;
    var __getProtoOf = Object.getPrototypeOf;
    var __hasOwnProp = Object.prototype.hasOwnProperty;
    var __commonJS = (cb, mod) => function __require() {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    };
    var __export = (target, all) => {
      for (var name in all)
        __defProp(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames(from))
          if (!__hasOwnProp.call(to, key) && key !== except)
            __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
      }
      return to;
    };
    var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
      // If the importer is in node compatibility mode or this is not an ESM
      // file that has been converted to a CommonJS file using a Babel-
      // compatible transform (i.e. "__esModule" has not been set), then set
      // "default" to the CommonJS "module.exports" for node compatibility.
      isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
      mod
    ));
    var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
    var require_events = __commonJS({
      "node_modules/events/events.js"(exports, module) {
        "use strict";
        var R2 = typeof Reflect === "object" ? Reflect : null;
        var ReflectApply = R2 && typeof R2.apply === "function" ? R2.apply : function ReflectApply2(target, receiver, args) {
          return Function.prototype.apply.call(target, receiver, args);
        };
        var ReflectOwnKeys;
        if (R2 && typeof R2.ownKeys === "function") {
          ReflectOwnKeys = R2.ownKeys;
        } else if (Object.getOwnPropertySymbols) {
          ReflectOwnKeys = function ReflectOwnKeys2(target) {
            return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
          };
        } else {
          ReflectOwnKeys = function ReflectOwnKeys2(target) {
            return Object.getOwnPropertyNames(target);
          };
        }
        function ProcessEmitWarning(warning) {
          if (console && console.warn) console.warn(warning);
        }
        var NumberIsNaN = Number.isNaN || function NumberIsNaN2(value) {
          return value !== value;
        };
        function EventEmitter2() {
          EventEmitter2.init.call(this);
        }
        module.exports = EventEmitter2;
        module.exports.once = once;
        EventEmitter2.EventEmitter = EventEmitter2;
        EventEmitter2.prototype._events = void 0;
        EventEmitter2.prototype._eventsCount = 0;
        EventEmitter2.prototype._maxListeners = void 0;
        var defaultMaxListeners = 10;
        function checkListener(listener) {
          if (typeof listener !== "function") {
            throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
          }
        }
        Object.defineProperty(EventEmitter2, "defaultMaxListeners", {
          enumerable: true,
          get: function() {
            return defaultMaxListeners;
          },
          set: function(arg) {
            if (typeof arg !== "number" || arg < 0 || NumberIsNaN(arg)) {
              throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + ".");
            }
            defaultMaxListeners = arg;
          }
        });
        EventEmitter2.init = function() {
          if (this._events === void 0 || this._events === Object.getPrototypeOf(this)._events) {
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
          }
          this._maxListeners = this._maxListeners || void 0;
        };
        EventEmitter2.prototype.setMaxListeners = function setMaxListeners(n2) {
          if (typeof n2 !== "number" || n2 < 0 || NumberIsNaN(n2)) {
            throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n2 + ".");
          }
          this._maxListeners = n2;
          return this;
        };
        function _getMaxListeners(that) {
          if (that._maxListeners === void 0)
            return EventEmitter2.defaultMaxListeners;
          return that._maxListeners;
        }
        EventEmitter2.prototype.getMaxListeners = function getMaxListeners() {
          return _getMaxListeners(this);
        };
        EventEmitter2.prototype.emit = function emit(type) {
          var args = [];
          for (var i2 = 1; i2 < arguments.length; i2++) args.push(arguments[i2]);
          var doError = type === "error";
          var events = this._events;
          if (events !== void 0)
            doError = doError && events.error === void 0;
          else if (!doError)
            return false;
          if (doError) {
            var er;
            if (args.length > 0)
              er = args[0];
            if (er instanceof Error) {
              throw er;
            }
            var err = new Error("Unhandled error." + (er ? " (" + er.message + ")" : ""));
            err.context = er;
            throw err;
          }
          var handler = events[type];
          if (handler === void 0)
            return false;
          if (typeof handler === "function") {
            ReflectApply(handler, this, args);
          } else {
            var len = handler.length;
            var listeners = arrayClone(handler, len);
            for (var i2 = 0; i2 < len; ++i2)
              ReflectApply(listeners[i2], this, args);
          }
          return true;
        };
        function _addListener(target, type, listener, prepend) {
          var m2;
          var events;
          var existing;
          checkListener(listener);
          events = target._events;
          if (events === void 0) {
            events = target._events = /* @__PURE__ */ Object.create(null);
            target._eventsCount = 0;
          } else {
            if (events.newListener !== void 0) {
              target.emit(
                "newListener",
                type,
                listener.listener ? listener.listener : listener
              );
              events = target._events;
            }
            existing = events[type];
          }
          if (existing === void 0) {
            existing = events[type] = listener;
            ++target._eventsCount;
          } else {
            if (typeof existing === "function") {
              existing = events[type] = prepend ? [listener, existing] : [existing, listener];
            } else if (prepend) {
              existing.unshift(listener);
            } else {
              existing.push(listener);
            }
            m2 = _getMaxListeners(target);
            if (m2 > 0 && existing.length > m2 && !existing.warned) {
              existing.warned = true;
              var w2 = new Error("Possible EventEmitter memory leak detected. " + existing.length + " " + String(type) + " listeners added. Use emitter.setMaxListeners() to increase limit");
              w2.name = "MaxListenersExceededWarning";
              w2.emitter = target;
              w2.type = type;
              w2.count = existing.length;
              ProcessEmitWarning(w2);
            }
          }
          return target;
        }
        EventEmitter2.prototype.addListener = function addListener(type, listener) {
          return _addListener(this, type, listener, false);
        };
        EventEmitter2.prototype.on = EventEmitter2.prototype.addListener;
        EventEmitter2.prototype.prependListener = function prependListener(type, listener) {
          return _addListener(this, type, listener, true);
        };
        function onceWrapper() {
          if (!this.fired) {
            this.target.removeListener(this.type, this.wrapFn);
            this.fired = true;
            if (arguments.length === 0)
              return this.listener.call(this.target);
            return this.listener.apply(this.target, arguments);
          }
        }
        function _onceWrap(target, type, listener) {
          var state = { fired: false, wrapFn: void 0, target, type, listener };
          var wrapped = onceWrapper.bind(state);
          wrapped.listener = listener;
          state.wrapFn = wrapped;
          return wrapped;
        }
        EventEmitter2.prototype.once = function once2(type, listener) {
          checkListener(listener);
          this.on(type, _onceWrap(this, type, listener));
          return this;
        };
        EventEmitter2.prototype.prependOnceListener = function prependOnceListener(type, listener) {
          checkListener(listener);
          this.prependListener(type, _onceWrap(this, type, listener));
          return this;
        };
        EventEmitter2.prototype.removeListener = function removeListener(type, listener) {
          var list, events, position, i2, originalListener;
          checkListener(listener);
          events = this._events;
          if (events === void 0)
            return this;
          list = events[type];
          if (list === void 0)
            return this;
          if (list === listener || list.listener === listener) {
            if (--this._eventsCount === 0)
              this._events = /* @__PURE__ */ Object.create(null);
            else {
              delete events[type];
              if (events.removeListener)
                this.emit("removeListener", type, list.listener || listener);
            }
          } else if (typeof list !== "function") {
            position = -1;
            for (i2 = list.length - 1; i2 >= 0; i2--) {
              if (list[i2] === listener || list[i2].listener === listener) {
                originalListener = list[i2].listener;
                position = i2;
                break;
              }
            }
            if (position < 0)
              return this;
            if (position === 0)
              list.shift();
            else {
              spliceOne(list, position);
            }
            if (list.length === 1)
              events[type] = list[0];
            if (events.removeListener !== void 0)
              this.emit("removeListener", type, originalListener || listener);
          }
          return this;
        };
        EventEmitter2.prototype.off = EventEmitter2.prototype.removeListener;
        EventEmitter2.prototype.removeAllListeners = function removeAllListeners(type) {
          var listeners, events, i2;
          events = this._events;
          if (events === void 0)
            return this;
          if (events.removeListener === void 0) {
            if (arguments.length === 0) {
              this._events = /* @__PURE__ */ Object.create(null);
              this._eventsCount = 0;
            } else if (events[type] !== void 0) {
              if (--this._eventsCount === 0)
                this._events = /* @__PURE__ */ Object.create(null);
              else
                delete events[type];
            }
            return this;
          }
          if (arguments.length === 0) {
            var keys = Object.keys(events);
            var key;
            for (i2 = 0; i2 < keys.length; ++i2) {
              key = keys[i2];
              if (key === "removeListener") continue;
              this.removeAllListeners(key);
            }
            this.removeAllListeners("removeListener");
            this._events = /* @__PURE__ */ Object.create(null);
            this._eventsCount = 0;
            return this;
          }
          listeners = events[type];
          if (typeof listeners === "function") {
            this.removeListener(type, listeners);
          } else if (listeners !== void 0) {
            for (i2 = listeners.length - 1; i2 >= 0; i2--) {
              this.removeListener(type, listeners[i2]);
            }
          }
          return this;
        };
        function _listeners(target, type, unwrap) {
          var events = target._events;
          if (events === void 0)
            return [];
          var evlistener = events[type];
          if (evlistener === void 0)
            return [];
          if (typeof evlistener === "function")
            return unwrap ? [evlistener.listener || evlistener] : [evlistener];
          return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
        }
        EventEmitter2.prototype.listeners = function listeners(type) {
          return _listeners(this, type, true);
        };
        EventEmitter2.prototype.rawListeners = function rawListeners(type) {
          return _listeners(this, type, false);
        };
        EventEmitter2.listenerCount = function(emitter, type) {
          if (typeof emitter.listenerCount === "function") {
            return emitter.listenerCount(type);
          } else {
            return listenerCount.call(emitter, type);
          }
        };
        EventEmitter2.prototype.listenerCount = listenerCount;
        function listenerCount(type) {
          var events = this._events;
          if (events !== void 0) {
            var evlistener = events[type];
            if (typeof evlistener === "function") {
              return 1;
            } else if (evlistener !== void 0) {
              return evlistener.length;
            }
          }
          return 0;
        }
        EventEmitter2.prototype.eventNames = function eventNames() {
          return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
        };
        function arrayClone(arr, n2) {
          var copy = new Array(n2);
          for (var i2 = 0; i2 < n2; ++i2)
            copy[i2] = arr[i2];
          return copy;
        }
        function spliceOne(list, index) {
          for (; index + 1 < list.length; index++)
            list[index] = list[index + 1];
          list.pop();
        }
        function unwrapListeners(arr) {
          var ret = new Array(arr.length);
          for (var i2 = 0; i2 < ret.length; ++i2) {
            ret[i2] = arr[i2].listener || arr[i2];
          }
          return ret;
        }
        function once(emitter, name) {
          return new Promise(function(resolve, reject) {
            function errorListener(err) {
              emitter.removeListener(name, resolver);
              reject(err);
            }
            function resolver() {
              if (typeof emitter.removeListener === "function") {
                emitter.removeListener("error", errorListener);
              }
              resolve([].slice.call(arguments));
            }
            ;
            eventTargetAgnosticAddListener(emitter, name, resolver, { once: true });
            if (name !== "error") {
              addErrorHandlerIfEventEmitter(emitter, errorListener, { once: true });
            }
          });
        }
        function addErrorHandlerIfEventEmitter(emitter, handler, flags) {
          if (typeof emitter.on === "function") {
            eventTargetAgnosticAddListener(emitter, "error", handler, flags);
          }
        }
        function eventTargetAgnosticAddListener(emitter, name, listener, flags) {
          if (typeof emitter.on === "function") {
            if (flags.once) {
              emitter.once(name, listener);
            } else {
              emitter.on(name, listener);
            }
          } else if (typeof emitter.addEventListener === "function") {
            emitter.addEventListener(name, function wrapListener(arg) {
              if (flags.once) {
                emitter.removeEventListener(name, wrapListener);
              }
              listener(arg);
            });
          } else {
            throw new TypeError('The "emitter" argument must be of type EventEmitter. Received type ' + typeof emitter);
          }
        }
      }
    });
    var index_exports = {};
    __export(index_exports, {
      Command: () => Command,
      buildCurve: () => buildCurve,
      buildImage: () => buildImage,
      buildLabel: () => buildLabel,
      buildLine: () => buildLine,
      buildPath: () => buildPath,
      buildPointer: () => buildPointer,
      buildRuler: () => buildRuler,
      buildShape: () => buildShape,
      buildText: () => buildText,
      default: () => index_default,
      isCurve: () => isCurve,
      isImage: () => isImage,
      isLabel: () => isLabel,
      isLine: () => isLine,
      isPath: () => isPath,
      isPointer: () => isPointer,
      isRuler: () => isRuler,
      isShape: () => isShape,
      isText: () => isText
    });
    var __awaiter = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var PlayerApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      get id() {
        if (!this.messageBus.userId) {
          throw Error("Unable to get user ID: not ready");
        }
        return this.messageBus.userId;
      }
      getSelection() {
        return __awaiter(this, void 0, void 0, function* () {
          const { selection } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_SELECTION", {});
          return selection;
        });
      }
      select(items, replace) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_SELECT", { items, replace });
        });
      }
      deselect(items) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_DESELECt", { items });
        });
      }
      getName() {
        return __awaiter(this, void 0, void 0, function* () {
          const { name } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_NAME", {});
          return name;
        });
      }
      setName(name) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_SET_NAME", { name });
        });
      }
      getColor() {
        return __awaiter(this, void 0, void 0, function* () {
          const { color } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_COLOR", {});
          return color;
        });
      }
      setColor(color) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_SET_COLOR", { color });
        });
      }
      getSyncView() {
        return __awaiter(this, void 0, void 0, function* () {
          const { syncView } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_SYNC_VIEW", {});
          return syncView;
        });
      }
      setSyncView(syncView) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_SET_SYNC_VIEW", { syncView });
        });
      }
      getId() {
        return __awaiter(this, void 0, void 0, function* () {
          const { id } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_ID", {});
          return id;
        });
      }
      getRole() {
        return __awaiter(this, void 0, void 0, function* () {
          const { role } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_ROLE", {});
          return role;
        });
      }
      getMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
          const { metadata } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_METADATA", {});
          return metadata;
        });
      }
      setMetadata(update) {
        return __awaiter(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_PLAYER_SET_METADATA", { update });
        });
      }
      hasPermission(permission) {
        return __awaiter(this, void 0, void 0, function* () {
          const role = yield this.getRole();
          if (role === "GM") {
            return true;
          }
          const { permissions } = yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS", {});
          return permissions.indexOf(permission) === -1;
        });
      }
      getConnectionId() {
        return __awaiter(this, void 0, void 0, function* () {
          const { connectionId } = yield this.messageBus.sendAsync("OBR_PLAYER_GET_CONNECTION_ID", {});
          return connectionId;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.player);
        };
        this.messageBus.send("OBR_PLAYER_SUBSCRIBE", {});
        this.messageBus.on("OBR_PLAYER_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_PLAYER_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_PLAYER_EVENT_CHANGE", handleChange);
        };
      }
    };
    var PlayerApi_default = PlayerApi;
    var __awaiter2 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ViewportApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      reset() {
        return __awaiter2(this, void 0, void 0, function* () {
          const { transform } = yield this.messageBus.sendAsync("OBR_VIEWPORT_RESET", {});
          return transform;
        });
      }
      animateTo(transform) {
        return __awaiter2(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO", { transform });
        });
      }
      animateToBounds(bounds) {
        return __awaiter2(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_VIEWPORT_ANIMATE_TO_BOUNDS", {
            bounds
          });
        });
      }
      getPosition() {
        return __awaiter2(this, void 0, void 0, function* () {
          const { position } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_POSITION", {});
          return position;
        });
      }
      setPosition(position) {
        return __awaiter2(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_POSITION", { position });
        });
      }
      getScale() {
        return __awaiter2(this, void 0, void 0, function* () {
          const { scale } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_SCALE", {});
          return scale;
        });
      }
      setScale(scale) {
        return __awaiter2(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_VIEWPORT_SET_SCALE", { scale });
        });
      }
      getWidth() {
        return __awaiter2(this, void 0, void 0, function* () {
          const { width } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_WIDTH", {});
          return width;
        });
      }
      getHeight() {
        return __awaiter2(this, void 0, void 0, function* () {
          const { height } = yield this.messageBus.sendAsync("OBR_VIEWPORT_GET_HEIGHT", {});
          return height;
        });
      }
      transformPoint(point) {
        return __awaiter2(this, void 0, void 0, function* () {
          const { point: transformed } = yield this.messageBus.sendAsync("OBR_VIEWPORT_TRANSFORM_POINT", { point });
          return transformed;
        });
      }
      inverseTransformPoint(point) {
        return __awaiter2(this, void 0, void 0, function* () {
          const { point: transformed } = yield this.messageBus.sendAsync("OBR_VIEWPORT_INVERSE_TRANSFORM_POINT", { point });
          return transformed;
        });
      }
    };
    var ViewportApi_default = ViewportApi;
    function isMessage(message) {
      return typeof message.id === "string";
    }
    var import_events = __toESM(require_events());
    var getRandomValues;
    var rnds8 = new Uint8Array(16);
    function rng() {
      if (!getRandomValues) {
        getRandomValues = typeof crypto !== "undefined" && crypto.getRandomValues && crypto.getRandomValues.bind(crypto);
        if (!getRandomValues) {
          throw new Error("crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported");
        }
      }
      return getRandomValues(rnds8);
    }
    var byteToHex = [];
    for (let i2 = 0; i2 < 256; ++i2) {
      byteToHex.push((i2 + 256).toString(16).slice(1));
    }
    function unsafeStringify(arr, offset = 0) {
      return byteToHex[arr[offset + 0]] + byteToHex[arr[offset + 1]] + byteToHex[arr[offset + 2]] + byteToHex[arr[offset + 3]] + "-" + byteToHex[arr[offset + 4]] + byteToHex[arr[offset + 5]] + "-" + byteToHex[arr[offset + 6]] + byteToHex[arr[offset + 7]] + "-" + byteToHex[arr[offset + 8]] + byteToHex[arr[offset + 9]] + "-" + byteToHex[arr[offset + 10]] + byteToHex[arr[offset + 11]] + byteToHex[arr[offset + 12]] + byteToHex[arr[offset + 13]] + byteToHex[arr[offset + 14]] + byteToHex[arr[offset + 15]];
    }
    var randomUUID = typeof crypto !== "undefined" && crypto.randomUUID && crypto.randomUUID.bind(crypto);
    var native_default = {
      randomUUID
    };
    function v4(options, buf, offset) {
      if (native_default.randomUUID && !buf && !options) {
        return native_default.randomUUID();
      }
      options = options || {};
      const rnds = options.random || (options.rng || rng)();
      rnds[6] = rnds[6] & 15 | 64;
      rnds[8] = rnds[8] & 63 | 128;
      if (buf) {
        offset = offset || 0;
        for (let i2 = 0; i2 < 16; ++i2) {
          buf[offset + i2] = rnds[i2];
        }
        return buf;
      }
      return unsafeStringify(rnds);
    }
    var v4_default = v4;
    var MessageBus = class extends import_events.EventEmitter {
      constructor(origin, roomId) {
        super();
        this.ready = false;
        this.userId = null;
        this.ref = null;
        this.handleMessage = (event) => {
          const message = event.data;
          if (event.origin === this.targetOrigin && isMessage(message)) {
            if (message.id === "OBR_READY") {
              this.ready = true;
              const data = message.data;
              this.ref = data.ref;
              this.userId = data.userId;
            }
            this.emit(message.id, message.data);
          }
        };
        this.send = (id, data, nonce) => {
          var _a;
          if (!this.ref) {
            throw Error("Unable to send message: not ready");
          }
          (_a = window.parent) === null || _a === void 0 ? void 0 : _a.postMessage({
            id,
            data,
            ref: this.ref,
            nonce
          }, this.targetOrigin);
        };
        this.sendAsync = (id, data, timeout = 5e3) => {
          const nonce = `_${v4_default()}`;
          this.send(id, data, nonce);
          return Promise.race([
            new Promise((resolve, reject) => {
              const self = this;
              function onResponse(value) {
                self.off(`${id}_RESPONSE${nonce}`, onResponse);
                self.off(`${id}_ERROR${nonce}`, onError);
                resolve(value);
              }
              function onError(error) {
                self.off(`${id}_RESPONSE${nonce}`, onResponse);
                self.off(`${id}_ERROR${nonce}`, onError);
                reject(error);
              }
              this.on(`${id}_RESPONSE${nonce}`, onResponse);
              this.on(`${id}_ERROR${nonce}`, onError);
            }),
            new Promise((_2, reject) => window.setTimeout(() => reject(new Error(`Message ${id} took longer than ${timeout}ms to get a result`)), timeout))
          ]);
        };
        this.roomId = roomId;
        this.targetOrigin = origin;
        window.addEventListener("message", this.handleMessage);
        this.setMaxListeners(100);
      }
      destroy() {
        window.removeEventListener("message", this.handleMessage);
      }
    };
    var MessageBus_default = MessageBus;
    var __awaiter3 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var NotificationApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      show(message, variant) {
        return __awaiter3(this, void 0, void 0, function* () {
          const { id } = yield this.messageBus.sendAsync("OBR_NOTIFICATION_SHOW", { message, variant });
          return id;
        });
      }
      close(id) {
        return __awaiter3(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_NOTIFICATION_CLOSE", { id });
        });
      }
    };
    var NotificationApi_default = NotificationApi;
    var __awaiter4 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var SceneFogApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getColor() {
        return __awaiter4(this, void 0, void 0, function* () {
          const { color } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_COLOR", {});
          return color;
        });
      }
      setColor(color) {
        return __awaiter4(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_COLOR", { color });
        });
      }
      getStrokeWidth() {
        return __awaiter4(this, void 0, void 0, function* () {
          const { strokeWidth } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_STROKE_WIDTH", {});
          return strokeWidth;
        });
      }
      setStrokeWidth(strokeWidth) {
        return __awaiter4(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_STROKE_WIDTH", {
            strokeWidth
          });
        });
      }
      getFilled() {
        return __awaiter4(this, void 0, void 0, function* () {
          const { filled } = yield this.messageBus.sendAsync("OBR_SCENE_FOG_GET_FILLED", {});
          return filled;
        });
      }
      setFilled(filled) {
        return __awaiter4(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_FOG_SET_FILLED", { filled });
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.fog);
        };
        this.messageBus.send("OBR_SCENE_FOG_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_FOG_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_FOG_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_FOG_EVENT_CHANGE", handleChange);
        };
      }
    };
    var SceneFogApi_default = SceneFogApi;
    var __awaiter5 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var SceneGridApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getDpi() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { dpi } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DPI", {});
          return dpi;
        });
      }
      getScale() {
        return __awaiter5(this, void 0, void 0, function* () {
          const scale = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_SCALE", {});
          return scale;
        });
      }
      setScale(scale) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_SCALE", { scale });
        });
      }
      getColor() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { color } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_COLOR", {});
          return color;
        });
      }
      setColor(color) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_COLOR", { color });
        });
      }
      getOpacity() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { opacity } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_OPACITY", {});
          return opacity;
        });
      }
      setOpacity(opacity) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_OPACITY", { opacity });
        });
      }
      getType() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { type } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_TYPE", {});
          return type;
        });
      }
      setType(type) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_TYPE", { type });
        });
      }
      getLineType() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { lineType } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_LINE_TYPE", {});
          return lineType;
        });
      }
      setLineType(lineType) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_LINE_TYPE", {
            lineType
          });
        });
      }
      getMeasurement() {
        return __awaiter5(this, void 0, void 0, function* () {
          const { measurement } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_MEASUREMENT", {});
          return measurement;
        });
      }
      setMeasurement(measurement) {
        return __awaiter5(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_GRID_SET_MEASUREMENT", {
            measurement
          });
        });
      }
      snapPosition(position, snappingSensitivity, useCorners) {
        return __awaiter5(this, void 0, void 0, function* () {
          const { position: snapped } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_SNAP_POSITION", {
            position,
            snappingSensitivity,
            useCorners
          });
          return snapped;
        });
      }
      getDistance(from, to) {
        return __awaiter5(this, void 0, void 0, function* () {
          const { distance } = yield this.messageBus.sendAsync("OBR_SCENE_GRID_GET_DISTANCE", { from, to });
          return distance;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.grid);
        };
        this.messageBus.send("OBR_SCENE_GRID_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_GRID_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_GRID_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_GRID_EVENT_CHANGE", handleChange);
        };
      }
    };
    var SceneGridApi_default = SceneGridApi;
    var __awaiter6 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var SceneHistoryApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      undo() {
        return __awaiter6(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_UNDO", {});
        });
      }
      redo() {
        return __awaiter6(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_REDO", {});
        });
      }
      canUndo() {
        return __awaiter6(this, void 0, void 0, function* () {
          const { canUndo } = yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_UNDO", {});
          return canUndo;
        });
      }
      canRedo() {
        return __awaiter6(this, void 0, void 0, function* () {
          const { canRedo } = yield this.messageBus.sendAsync("OBR_SCENE_HISTORY_CAN_REDO", {});
          return canRedo;
        });
      }
    };
    var SceneHistoryApi_default = SceneHistoryApi;
    function n(n2) {
      for (var r2 = arguments.length, t2 = Array(r2 > 1 ? r2 - 1 : 0), e = 1; e < r2; e++) t2[e - 1] = arguments[e];
      if (true) {
        var i2 = Y[n2], o2 = i2 ? "function" == typeof i2 ? i2.apply(null, t2) : i2 : "unknown error nr: " + n2;
        throw Error("[Immer] " + o2);
      }
      throw Error("[Immer] minified error nr: " + n2 + (t2.length ? " " + t2.map((function(n3) {
        return "'" + n3 + "'";
      })).join(",") : "") + ". Find the full error at: https://bit.ly/3cXEKWf");
    }
    function r(n2) {
      return !!n2 && !!n2[Q];
    }
    function t(n2) {
      var r2;
      return !!n2 && ((function(n3) {
        if (!n3 || "object" != typeof n3) return false;
        var r3 = Object.getPrototypeOf(n3);
        if (null === r3) return true;
        var t2 = Object.hasOwnProperty.call(r3, "constructor") && r3.constructor;
        return t2 === Object || "function" == typeof t2 && Function.toString.call(t2) === Z;
      })(n2) || Array.isArray(n2) || !!n2[L] || !!(null === (r2 = n2.constructor) || void 0 === r2 ? void 0 : r2[L]) || s(n2) || v(n2));
    }
    function i(n2, r2, t2) {
      void 0 === t2 && (t2 = false), 0 === o(n2) ? (t2 ? Object.keys : nn)(n2).forEach((function(e) {
        t2 && "symbol" == typeof e || r2(e, n2[e], n2);
      })) : n2.forEach((function(t3, e) {
        return r2(e, t3, n2);
      }));
    }
    function o(n2) {
      var r2 = n2[Q];
      return r2 ? r2.i > 3 ? r2.i - 4 : r2.i : Array.isArray(n2) ? 1 : s(n2) ? 2 : v(n2) ? 3 : 0;
    }
    function u(n2, r2) {
      return 2 === o(n2) ? n2.has(r2) : Object.prototype.hasOwnProperty.call(n2, r2);
    }
    function a(n2, r2) {
      return 2 === o(n2) ? n2.get(r2) : n2[r2];
    }
    function f(n2, r2, t2) {
      var e = o(n2);
      2 === e ? n2.set(r2, t2) : 3 === e ? n2.add(t2) : n2[r2] = t2;
    }
    function c(n2, r2) {
      return n2 === r2 ? 0 !== n2 || 1 / n2 == 1 / r2 : n2 != n2 && r2 != r2;
    }
    function s(n2) {
      return X && n2 instanceof Map;
    }
    function v(n2) {
      return q && n2 instanceof Set;
    }
    function p(n2) {
      return n2.o || n2.t;
    }
    function l(n2) {
      if (Array.isArray(n2)) return Array.prototype.slice.call(n2);
      var r2 = rn(n2);
      delete r2[Q];
      for (var t2 = nn(r2), e = 0; e < t2.length; e++) {
        var i2 = t2[e], o2 = r2[i2];
        false === o2.writable && (o2.writable = true, o2.configurable = true), (o2.get || o2.set) && (r2[i2] = { configurable: true, writable: true, enumerable: o2.enumerable, value: n2[i2] });
      }
      return Object.create(Object.getPrototypeOf(n2), r2);
    }
    function d(n2, e) {
      return void 0 === e && (e = false), y(n2) || r(n2) || !t(n2) || (o(n2) > 1 && (n2.set = n2.add = n2.clear = n2.delete = h), Object.freeze(n2), e && i(n2, (function(n3, r2) {
        return d(r2, true);
      }), true)), n2;
    }
    function h() {
      n(2);
    }
    function y(n2) {
      return null == n2 || "object" != typeof n2 || Object.isFrozen(n2);
    }
    function b(r2) {
      var t2 = tn[r2];
      return t2 || n(18, r2), t2;
    }
    function m(n2, r2) {
      tn[n2] || (tn[n2] = r2);
    }
    function _() {
      return U || n(0), U;
    }
    function j(n2, r2) {
      r2 && (b("Patches"), n2.u = [], n2.s = [], n2.v = r2);
    }
    function g(n2) {
      O(n2), n2.p.forEach(S), n2.p = null;
    }
    function O(n2) {
      n2 === U && (U = n2.l);
    }
    function w(n2) {
      return U = { p: [], l: U, h: n2, m: true, _: 0 };
    }
    function S(n2) {
      var r2 = n2[Q];
      0 === r2.i || 1 === r2.i ? r2.j() : r2.g = true;
    }
    function P(r2, e) {
      e._ = e.p.length;
      var i2 = e.p[0], o2 = void 0 !== r2 && r2 !== i2;
      return e.h.O || b("ES5").S(e, r2, o2), o2 ? (i2[Q].P && (g(e), n(4)), t(r2) && (r2 = M(e, r2), e.l || x(e, r2)), e.u && b("Patches").M(i2[Q].t, r2, e.u, e.s)) : r2 = M(e, i2, []), g(e), e.u && e.v(e.u, e.s), r2 !== H ? r2 : void 0;
    }
    function M(n2, r2, t2) {
      if (y(r2)) return r2;
      var e = r2[Q];
      if (!e) return i(r2, (function(i2, o3) {
        return A(n2, e, r2, i2, o3, t2);
      }), true), r2;
      if (e.A !== n2) return r2;
      if (!e.P) return x(n2, e.t, true), e.t;
      if (!e.I) {
        e.I = true, e.A._--;
        var o2 = 4 === e.i || 5 === e.i ? e.o = l(e.k) : e.o, u2 = o2, a2 = false;
        3 === e.i && (u2 = new Set(o2), o2.clear(), a2 = true), i(u2, (function(r3, i2) {
          return A(n2, e, o2, r3, i2, t2, a2);
        })), x(n2, o2, false), t2 && n2.u && b("Patches").N(e, t2, n2.u, n2.s);
      }
      return e.o;
    }
    function A(e, i2, o2, a2, c2, s2, v2) {
      if (c2 === o2 && n(5), r(c2)) {
        var p2 = M(e, c2, s2 && i2 && 3 !== i2.i && !u(i2.R, a2) ? s2.concat(a2) : void 0);
        if (f(o2, a2, p2), !r(p2)) return;
        e.m = false;
      } else v2 && o2.add(c2);
      if (t(c2) && !y(c2)) {
        if (!e.h.D && e._ < 1) return;
        M(e, c2), i2 && i2.A.l || x(e, c2);
      }
    }
    function x(n2, r2, t2) {
      void 0 === t2 && (t2 = false), !n2.l && n2.h.D && n2.m && d(r2, t2);
    }
    function z(n2, r2) {
      var t2 = n2[Q];
      return (t2 ? p(t2) : n2)[r2];
    }
    function I(n2, r2) {
      if (r2 in n2) for (var t2 = Object.getPrototypeOf(n2); t2; ) {
        var e = Object.getOwnPropertyDescriptor(t2, r2);
        if (e) return e;
        t2 = Object.getPrototypeOf(t2);
      }
    }
    function k(n2) {
      n2.P || (n2.P = true, n2.l && k(n2.l));
    }
    function E(n2) {
      n2.o || (n2.o = l(n2.t));
    }
    function N(n2, r2, t2) {
      var e = s(r2) ? b("MapSet").F(r2, t2) : v(r2) ? b("MapSet").T(r2, t2) : n2.O ? (function(n3, r3) {
        var t3 = Array.isArray(n3), e2 = { i: t3 ? 1 : 0, A: r3 ? r3.A : _(), P: false, I: false, R: {}, l: r3, t: n3, k: null, o: null, j: null, C: false }, i2 = e2, o2 = en;
        t3 && (i2 = [e2], o2 = on);
        var u2 = Proxy.revocable(i2, o2), a2 = u2.revoke, f2 = u2.proxy;
        return e2.k = f2, e2.j = a2, f2;
      })(r2, t2) : b("ES5").J(r2, t2);
      return (t2 ? t2.A : _()).p.push(e), e;
    }
    function R(e) {
      return r(e) || n(22, e), (function n2(r2) {
        if (!t(r2)) return r2;
        var e2, u2 = r2[Q], c2 = o(r2);
        if (u2) {
          if (!u2.P && (u2.i < 4 || !b("ES5").K(u2))) return u2.t;
          u2.I = true, e2 = D(r2, c2), u2.I = false;
        } else e2 = D(r2, c2);
        return i(e2, (function(r3, t2) {
          u2 && a(u2.t, r3) === t2 || f(e2, r3, n2(t2));
        })), 3 === c2 ? new Set(e2) : e2;
      })(e);
    }
    function D(n2, r2) {
      switch (r2) {
        case 2:
          return new Map(n2);
        case 3:
          return Array.from(n2);
      }
      return l(n2);
    }
    function T() {
      function e(n2) {
        if (!t(n2)) return n2;
        if (Array.isArray(n2)) return n2.map(e);
        if (s(n2)) return new Map(Array.from(n2.entries()).map((function(n3) {
          return [n3[0], e(n3[1])];
        })));
        if (v(n2)) return new Set(Array.from(n2).map(e));
        var r2 = Object.create(Object.getPrototypeOf(n2));
        for (var i2 in n2) r2[i2] = e(n2[i2]);
        return u(n2, L) && (r2[L] = n2[L]), r2;
      }
      function f2(n2) {
        return r(n2) ? e(n2) : n2;
      }
      var c2 = "add";
      m("Patches", { $: function(r2, t2) {
        return t2.forEach((function(t3) {
          for (var i2 = t3.path, u2 = t3.op, f3 = r2, s2 = 0; s2 < i2.length - 1; s2++) {
            var v2 = o(f3), p2 = i2[s2];
            "string" != typeof p2 && "number" != typeof p2 && (p2 = "" + p2), 0 !== v2 && 1 !== v2 || "__proto__" !== p2 && "constructor" !== p2 || n(24), "function" == typeof f3 && "prototype" === p2 && n(24), "object" != typeof (f3 = a(f3, p2)) && n(15, i2.join("/"));
          }
          var l2 = o(f3), d2 = e(t3.value), h2 = i2[i2.length - 1];
          switch (u2) {
            case "replace":
              switch (l2) {
                case 2:
                  return f3.set(h2, d2);
                case 3:
                  n(16);
                default:
                  return f3[h2] = d2;
              }
            case c2:
              switch (l2) {
                case 1:
                  return "-" === h2 ? f3.push(d2) : f3.splice(h2, 0, d2);
                case 2:
                  return f3.set(h2, d2);
                case 3:
                  return f3.add(d2);
                default:
                  return f3[h2] = d2;
              }
            case "remove":
              switch (l2) {
                case 1:
                  return f3.splice(h2, 1);
                case 2:
                  return f3.delete(h2);
                case 3:
                  return f3.delete(t3.value);
                default:
                  return delete f3[h2];
              }
            default:
              n(17, u2);
          }
        })), r2;
      }, N: function(n2, r2, t2, e2) {
        switch (n2.i) {
          case 0:
          case 4:
          case 2:
            return (function(n3, r3, t3, e3) {
              var o2 = n3.t, s2 = n3.o;
              i(n3.R, (function(n4, i2) {
                var v2 = a(o2, n4), p2 = a(s2, n4), l2 = i2 ? u(o2, n4) ? "replace" : c2 : "remove";
                if (v2 !== p2 || "replace" !== l2) {
                  var d2 = r3.concat(n4);
                  t3.push("remove" === l2 ? { op: l2, path: d2 } : { op: l2, path: d2, value: p2 }), e3.push(l2 === c2 ? { op: "remove", path: d2 } : "remove" === l2 ? { op: c2, path: d2, value: f2(v2) } : { op: "replace", path: d2, value: f2(v2) });
                }
              }));
            })(n2, r2, t2, e2);
          case 5:
          case 1:
            return (function(n3, r3, t3, e3) {
              var i2 = n3.t, o2 = n3.R, u2 = n3.o;
              if (u2.length < i2.length) {
                var a2 = [u2, i2];
                i2 = a2[0], u2 = a2[1];
                var s2 = [e3, t3];
                t3 = s2[0], e3 = s2[1];
              }
              for (var v2 = 0; v2 < i2.length; v2++) if (o2[v2] && u2[v2] !== i2[v2]) {
                var p2 = r3.concat([v2]);
                t3.push({ op: "replace", path: p2, value: f2(u2[v2]) }), e3.push({ op: "replace", path: p2, value: f2(i2[v2]) });
              }
              for (var l2 = i2.length; l2 < u2.length; l2++) {
                var d2 = r3.concat([l2]);
                t3.push({ op: c2, path: d2, value: f2(u2[l2]) });
              }
              i2.length < u2.length && e3.push({ op: "replace", path: r3.concat(["length"]), value: i2.length });
            })(n2, r2, t2, e2);
          case 3:
            return (function(n3, r3, t3, e3) {
              var i2 = n3.t, o2 = n3.o, u2 = 0;
              i2.forEach((function(n4) {
                if (!o2.has(n4)) {
                  var i3 = r3.concat([u2]);
                  t3.push({ op: "remove", path: i3, value: n4 }), e3.unshift({ op: c2, path: i3, value: n4 });
                }
                u2++;
              })), u2 = 0, o2.forEach((function(n4) {
                if (!i2.has(n4)) {
                  var o3 = r3.concat([u2]);
                  t3.push({ op: c2, path: o3, value: n4 }), e3.unshift({ op: "remove", path: o3, value: n4 });
                }
                u2++;
              }));
            })(n2, r2, t2, e2);
        }
      }, M: function(n2, r2, t2, e2) {
        t2.push({ op: "replace", path: [], value: r2 === H ? void 0 : r2 }), e2.push({ op: "replace", path: [], value: n2 });
      } });
    }
    var G;
    var U;
    var W = "undefined" != typeof Symbol && "symbol" == typeof /* @__PURE__ */ Symbol("x");
    var X = "undefined" != typeof Map;
    var q = "undefined" != typeof Set;
    var B = "undefined" != typeof Proxy && void 0 !== Proxy.revocable && "undefined" != typeof Reflect;
    var H = W ? /* @__PURE__ */ Symbol.for("immer-nothing") : ((G = {})["immer-nothing"] = true, G);
    var L = W ? /* @__PURE__ */ Symbol.for("immer-draftable") : "__$immer_draftable";
    var Q = W ? /* @__PURE__ */ Symbol.for("immer-state") : "__$immer_state";
    var Y = { 0: "Illegal state", 1: "Immer drafts cannot have computed properties", 2: "This object has been frozen and should not be mutated", 3: function(n2) {
      return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + n2;
    }, 4: "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.", 5: "Immer forbids circular references", 6: "The first or second argument to `produce` must be a function", 7: "The third argument to `produce` must be a function or undefined", 8: "First argument to `createDraft` must be a plain object, an array, or an immerable object", 9: "First argument to `finishDraft` must be a draft returned by `createDraft`", 10: "The given draft is already finalized", 11: "Object.defineProperty() cannot be used on an Immer draft", 12: "Object.setPrototypeOf() cannot be used on an Immer draft", 13: "Immer only supports deleting array indices", 14: "Immer only supports setting array indices and the 'length' property", 15: function(n2) {
      return "Cannot apply patch, path doesn't resolve: " + n2;
    }, 16: 'Sets cannot have "replace" patches.', 17: function(n2) {
      return "Unsupported patch operation: " + n2;
    }, 18: function(n2) {
      return "The plugin for '" + n2 + "' has not been loaded into Immer. To enable the plugin, import and call `enable" + n2 + "()` when initializing your application.";
    }, 20: "Cannot use proxies if Proxy, Proxy.revocable or Reflect are not available", 21: function(n2) {
      return "produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '" + n2 + "'";
    }, 22: function(n2) {
      return "'current' expects a draft, got: " + n2;
    }, 23: function(n2) {
      return "'original' expects a draft, got: " + n2;
    }, 24: "Patching reserved attributes like __proto__, prototype and constructor is not allowed" };
    var Z = "" + Object.prototype.constructor;
    var nn = "undefined" != typeof Reflect && Reflect.ownKeys ? Reflect.ownKeys : void 0 !== Object.getOwnPropertySymbols ? function(n2) {
      return Object.getOwnPropertyNames(n2).concat(Object.getOwnPropertySymbols(n2));
    } : Object.getOwnPropertyNames;
    var rn = Object.getOwnPropertyDescriptors || function(n2) {
      var r2 = {};
      return nn(n2).forEach((function(t2) {
        r2[t2] = Object.getOwnPropertyDescriptor(n2, t2);
      })), r2;
    };
    var tn = {};
    var en = { get: function(n2, r2) {
      if (r2 === Q) return n2;
      var e = p(n2);
      if (!u(e, r2)) return (function(n3, r3, t2) {
        var e2, i3 = I(r3, t2);
        return i3 ? "value" in i3 ? i3.value : null === (e2 = i3.get) || void 0 === e2 ? void 0 : e2.call(n3.k) : void 0;
      })(n2, e, r2);
      var i2 = e[r2];
      return n2.I || !t(i2) ? i2 : i2 === z(n2.t, r2) ? (E(n2), n2.o[r2] = N(n2.A.h, i2, n2)) : i2;
    }, has: function(n2, r2) {
      return r2 in p(n2);
    }, ownKeys: function(n2) {
      return Reflect.ownKeys(p(n2));
    }, set: function(n2, r2, t2) {
      var e = I(p(n2), r2);
      if (null == e ? void 0 : e.set) return e.set.call(n2.k, t2), true;
      if (!n2.P) {
        var i2 = z(p(n2), r2), o2 = null == i2 ? void 0 : i2[Q];
        if (o2 && o2.t === t2) return n2.o[r2] = t2, n2.R[r2] = false, true;
        if (c(t2, i2) && (void 0 !== t2 || u(n2.t, r2))) return true;
        E(n2), k(n2);
      }
      return n2.o[r2] === t2 && (void 0 !== t2 || r2 in n2.o) || Number.isNaN(t2) && Number.isNaN(n2.o[r2]) || (n2.o[r2] = t2, n2.R[r2] = true), true;
    }, deleteProperty: function(n2, r2) {
      return void 0 !== z(n2.t, r2) || r2 in n2.t ? (n2.R[r2] = false, E(n2), k(n2)) : delete n2.R[r2], n2.o && delete n2.o[r2], true;
    }, getOwnPropertyDescriptor: function(n2, r2) {
      var t2 = p(n2), e = Reflect.getOwnPropertyDescriptor(t2, r2);
      return e ? { writable: true, configurable: 1 !== n2.i || "length" !== r2, enumerable: e.enumerable, value: t2[r2] } : e;
    }, defineProperty: function() {
      n(11);
    }, getPrototypeOf: function(n2) {
      return Object.getPrototypeOf(n2.t);
    }, setPrototypeOf: function() {
      n(12);
    } };
    var on = {};
    i(en, (function(n2, r2) {
      on[n2] = function() {
        return arguments[0] = arguments[0][0], r2.apply(this, arguments);
      };
    })), on.deleteProperty = function(r2, t2) {
      return isNaN(parseInt(t2)) && n(13), on.set.call(this, r2, t2, void 0);
    }, on.set = function(r2, t2, e) {
      return "length" !== t2 && isNaN(parseInt(t2)) && n(14), en.set.call(this, r2[0], t2, e, r2[0]);
    };
    var un = (function() {
      function e(r2) {
        var e2 = this;
        this.O = B, this.D = true, this.produce = function(r3, i3, o2) {
          if ("function" == typeof r3 && "function" != typeof i3) {
            var u2 = i3;
            i3 = r3;
            var a2 = e2;
            return function(n2) {
              var r4 = this;
              void 0 === n2 && (n2 = u2);
              for (var t2 = arguments.length, e3 = Array(t2 > 1 ? t2 - 1 : 0), o3 = 1; o3 < t2; o3++) e3[o3 - 1] = arguments[o3];
              return a2.produce(n2, (function(n3) {
                var t3;
                return (t3 = i3).call.apply(t3, [r4, n3].concat(e3));
              }));
            };
          }
          var f2;
          if ("function" != typeof i3 && n(6), void 0 !== o2 && "function" != typeof o2 && n(7), t(r3)) {
            var c2 = w(e2), s2 = N(e2, r3, void 0), v2 = true;
            try {
              f2 = i3(s2), v2 = false;
            } finally {
              v2 ? g(c2) : O(c2);
            }
            return "undefined" != typeof Promise && f2 instanceof Promise ? f2.then((function(n2) {
              return j(c2, o2), P(n2, c2);
            }), (function(n2) {
              throw g(c2), n2;
            })) : (j(c2, o2), P(f2, c2));
          }
          if (!r3 || "object" != typeof r3) {
            if (void 0 === (f2 = i3(r3)) && (f2 = r3), f2 === H && (f2 = void 0), e2.D && d(f2, true), o2) {
              var p2 = [], l2 = [];
              b("Patches").M(r3, f2, p2, l2), o2(p2, l2);
            }
            return f2;
          }
          n(21, r3);
        }, this.produceWithPatches = function(n2, r3) {
          if ("function" == typeof n2) return function(r4) {
            for (var t3 = arguments.length, i4 = Array(t3 > 1 ? t3 - 1 : 0), o3 = 1; o3 < t3; o3++) i4[o3 - 1] = arguments[o3];
            return e2.produceWithPatches(r4, (function(r5) {
              return n2.apply(void 0, [r5].concat(i4));
            }));
          };
          var t2, i3, o2 = e2.produce(n2, r3, (function(n3, r4) {
            t2 = n3, i3 = r4;
          }));
          return "undefined" != typeof Promise && o2 instanceof Promise ? o2.then((function(n3) {
            return [n3, t2, i3];
          })) : [o2, t2, i3];
        }, "boolean" == typeof (null == r2 ? void 0 : r2.useProxies) && this.setUseProxies(r2.useProxies), "boolean" == typeof (null == r2 ? void 0 : r2.autoFreeze) && this.setAutoFreeze(r2.autoFreeze);
      }
      var i2 = e.prototype;
      return i2.createDraft = function(e2) {
        t(e2) || n(8), r(e2) && (e2 = R(e2));
        var i3 = w(this), o2 = N(this, e2, void 0);
        return o2[Q].C = true, O(i3), o2;
      }, i2.finishDraft = function(r2, t2) {
        var e2 = r2 && r2[Q];
        e2 && e2.C || n(9), e2.I && n(10);
        var i3 = e2.A;
        return j(i3, t2), P(void 0, i3);
      }, i2.setAutoFreeze = function(n2) {
        this.D = n2;
      }, i2.setUseProxies = function(r2) {
        r2 && !B && n(20), this.O = r2;
      }, i2.applyPatches = function(n2, t2) {
        var e2;
        for (e2 = t2.length - 1; e2 >= 0; e2--) {
          var i3 = t2[e2];
          if (0 === i3.path.length && "replace" === i3.op) {
            n2 = i3.value;
            break;
          }
        }
        e2 > -1 && (t2 = t2.slice(e2 + 1));
        var o2 = b("Patches").$;
        return r(n2) ? o2(n2, t2) : this.produce(n2, (function(n3) {
          return o2(n3, t2);
        }));
      }, e;
    })();
    var an = new un();
    var fn = an.produce;
    var cn = an.produceWithPatches.bind(an);
    var sn = an.setAutoFreeze.bind(an);
    var vn = an.setUseProxies.bind(an);
    var pn = an.applyPatches.bind(an);
    var ln = an.createDraft.bind(an);
    var dn = an.finishDraft.bind(an);
    var __awaiter7 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    T();
    var SceneItemsApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getItems(filter) {
        return __awaiter7(this, void 0, void 0, function* () {
          if (Array.isArray(filter)) {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEMS", { ids: filter });
            return items;
          } else if (filter) {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS", {});
            return items.filter(filter);
          } else {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ALL_ITEMS", {});
            return items;
          }
        });
      }
      isItemArray(value) {
        return Array.isArray(value) && value.every((item) => typeof item !== "string");
      }
      updateItems(filterOrItems, update) {
        return __awaiter7(this, void 0, void 0, function* () {
          let items;
          if (this.isItemArray(filterOrItems)) {
            items = filterOrItems;
          } else {
            items = yield this.getItems(filterOrItems);
          }
          const [nextState, patches] = cn(items, update);
          const updates = nextState.map((item) => ({
            id: item.id,
            type: item.type
          }));
          for (const patch of patches) {
            const [index, key] = patch.path;
            if (typeof index === "number" && typeof key === "string") {
              updates[index][key] = nextState[index][key];
            }
          }
          yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_UPDATE_ITEMS", {
            updates
          });
        });
      }
      addItems(items) {
        return __awaiter7(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_ADD_ITEMS", {
            items
          });
        });
      }
      deleteItems(ids) {
        return __awaiter7(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_DELETE_ITEMS", {
            ids
          });
        });
      }
      getItemAttachments(ids) {
        return __awaiter7(this, void 0, void 0, function* () {
          const { items } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_ATTACHMENTS", { ids });
          return items;
        });
      }
      getItemBounds(ids) {
        return __awaiter7(this, void 0, void 0, function* () {
          const { bounds } = yield this.messageBus.sendAsync("OBR_SCENE_ITEMS_GET_ITEM_BOUNDS", { ids });
          return bounds;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.items);
        };
        this.messageBus.send("OBR_SCENE_ITEMS_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_ITEMS_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_ITEMS_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_ITEMS_EVENT_CHANGE", handleChange);
        };
      }
    };
    var SceneItemsApi_default = SceneItemsApi;
    var __awaiter8 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    T();
    var SceneLocalApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getItems(filter) {
        return __awaiter8(this, void 0, void 0, function* () {
          if (Array.isArray(filter)) {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEMS", { ids: filter });
            return items;
          } else if (filter) {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS", {});
            return items.filter(filter);
          } else {
            const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ALL_ITEMS", {});
            return items;
          }
        });
      }
      updateItems(filter, update, fastUpdate) {
        return __awaiter8(this, void 0, void 0, function* () {
          const items = yield this.getItems(filter);
          const [nextState, patches] = cn(items, update);
          const updates = nextState.map((item) => ({
            id: item.id,
            type: item.type
          }));
          for (const patch of patches) {
            const [index, key] = patch.path;
            if (typeof index === "number" && typeof key === "string") {
              updates[index][key] = nextState[index][key];
            }
          }
          yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_UPDATE_ITEMS", {
            updates,
            fastUpdate
          });
        });
      }
      addItems(items) {
        return __awaiter8(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_ADD_ITEMS", {
            items
          });
        });
      }
      deleteItems(ids) {
        return __awaiter8(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_DELETE_ITEMS", {
            ids
          });
        });
      }
      getItemAttachments(ids) {
        return __awaiter8(this, void 0, void 0, function* () {
          const { items } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_ATTACHMENTS", { ids });
          return items;
        });
      }
      getItemBounds(ids) {
        return __awaiter8(this, void 0, void 0, function* () {
          const { bounds } = yield this.messageBus.sendAsync("OBR_SCENE_LOCAL_GET_ITEM_BOUNDS", { ids });
          return bounds;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.items);
        };
        this.messageBus.send("OBR_SCENE_LOCAL_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_LOCAL_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_LOCAL_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_LOCAL_EVENT_CHANGE", handleChange);
        };
      }
    };
    var SceneLocalApi_default = SceneLocalApi;
    var __awaiter9 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var SceneApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
        this.grid = new SceneGridApi_default(messageBus2);
        this.fog = new SceneFogApi_default(messageBus2);
        this.history = new SceneHistoryApi_default(messageBus2);
        this.items = new SceneItemsApi_default(messageBus2);
        this.local = new SceneLocalApi_default(messageBus2);
      }
      isReady() {
        return __awaiter9(this, void 0, void 0, function* () {
          const { ready } = yield this.messageBus.sendAsync("OBR_SCENE_IS_READY", {});
          return ready;
        });
      }
      onReadyChange(callback) {
        const handleChange = (data) => {
          callback(data.ready);
        };
        this.messageBus.send("OBR_SCENE_READY_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_EVENT_READY_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_READY_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_EVENT_READY_CHANGE", handleChange);
        };
      }
      getMetadata() {
        return __awaiter9(this, void 0, void 0, function* () {
          const { metadata } = yield this.messageBus.sendAsync("OBR_SCENE_GET_METADATA", {});
          return metadata;
        });
      }
      setMetadata(update) {
        return __awaiter9(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_SCENE_SET_METADATA", { update });
        });
      }
      onMetadataChange(callback) {
        const handleChange = (data) => {
          callback(data.metadata);
        };
        this.messageBus.send("OBR_SCENE_METADATA_SUBSCRIBE", {});
        this.messageBus.on("OBR_SCENE_METADATA_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_SCENE_METADATA_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_SCENE_METADATA_EVENT_CHANGE", handleChange);
        };
      }
    };
    var SceneApi_default = SceneApi;
    function normalizeIconPaths(icons) {
      return icons.map((base) => Object.assign(Object.assign({}, base), { icon: base.icon.startsWith("http") ? base.icon : `${window.location.origin}${base.icon}` }));
    }
    function normalizeUrlObject(urlObject) {
      return Object.assign(Object.assign({}, urlObject), { url: urlObject.url.startsWith("http") ? urlObject.url : `${window.location.origin}${urlObject.url}` });
    }
    var __awaiter10 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ContextMenuApi = class {
      constructor(messageBus2) {
        this.contextMenus = {};
        this.handleClick = (event) => {
          const menu = this.contextMenus[event.id];
          if (menu) {
            menu.onClick(event.context, event.elementId);
          }
        };
        this.messageBus = messageBus2;
        messageBus2.on("OBR_CONTEXT_MENU_EVENT_CLICK", this.handleClick);
      }
      create(contextMenu) {
        return __awaiter10(this, void 0, void 0, function* () {
          this.messageBus.sendAsync("OBR_CONTEXT_MENU_CREATE", {
            id: contextMenu.id,
            shortcut: contextMenu.shortcut,
            icons: normalizeIconPaths(contextMenu.icons)
          });
          this.contextMenus[contextMenu.id] = contextMenu;
        });
      }
      remove(id) {
        return __awaiter10(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_CONTEXT_MENU_REMOVE", { id });
          delete this.contextMenus[id];
        });
      }
    };
    var ContextMenuApi_default = ContextMenuApi;
    var __awaiter11 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ToolApi = class {
      constructor(messageBus2) {
        this.tools = {};
        this.toolActions = {};
        this.toolModes = {};
        this.handleToolClick = (event) => {
          const tool = this.tools[event.id];
          if (tool) {
            if (tool.onClick) {
              const result = tool.onClick(event.context, event.elementId);
              Promise.resolve(result).then((activate) => {
                if (activate) {
                  this.messageBus.send("OBR_TOOL_ACTIVATE", {
                    id: event.id
                  });
                }
              });
            } else {
              this.messageBus.send("OBR_TOOL_ACTIVATE", {
                id: event.id
              });
            }
          }
        };
        this.handleToolActionClick = (event) => {
          var _a;
          const action = this.toolActions[event.id];
          if (action) {
            (_a = action.onClick) === null || _a === void 0 ? void 0 : _a.call(action, event.context, event.elementId);
          }
        };
        this.handleToolModeClick = (event) => {
          const mode = this.toolModes[event.id];
          if (mode) {
            if (mode.onClick) {
              const result = mode.onClick(event.context, event.elementId);
              Promise.resolve(result).then((activate) => {
                if (activate) {
                  this.messageBus.send("OBR_TOOL_MODE_ACTIVATE", {
                    toolId: event.context.activeTool,
                    modeId: event.id
                  });
                }
              });
            } else {
              this.messageBus.send("OBR_TOOL_MODE_ACTIVATE", {
                toolId: event.context.activeTool,
                modeId: event.id
              });
            }
          }
        };
        this.handleToolModeToolClick = (event) => {
          const mode = this.toolModes[event.id];
          if (mode) {
            if (mode.onToolClick) {
              const result = mode.onToolClick(event.context, event.event);
              Promise.resolve(result).then((select) => {
                if (select && event.event.target && !event.event.target.locked) {
                  this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                    items: [event.event.target.id]
                  });
                }
              });
            } else {
              if (event.event.target && !event.event.target.locked) {
                this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                  items: [event.event.target.id]
                });
              }
            }
          }
        };
        this.handleToolModeToolDoubleClick = (event) => {
          const mode = this.toolModes[event.id];
          if (mode) {
            if (mode.onToolDoubleClick) {
              const result = mode.onToolDoubleClick(event.context, event.event);
              Promise.resolve(result).then((select) => {
                if (select && event.event.target) {
                  this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                    items: [event.event.target.id]
                  });
                }
              });
            } else {
              if (event.event.target) {
                this.messageBus.sendAsync("OBR_PLAYER_SELECT", {
                  items: [event.event.target.id]
                });
              }
            }
          }
        };
        this.handleToolModeToolDown = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolDown) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolMove = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolMove) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolUp = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolUp) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolDragStart = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolDragStart) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolDragMove = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolDragMove) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolDragEnd = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolDragEnd) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeToolDragCancel = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onToolDragCancel) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeKeyDown = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onKeyDown) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.handleToolModeKeyUp = (event) => {
          var _a;
          const mode = this.toolModes[event.id];
          if (mode) {
            (_a = mode.onKeyUp) === null || _a === void 0 ? void 0 : _a.call(mode, event.context, event.event);
          }
        };
        this.messageBus = messageBus2;
        messageBus2.on("OBR_TOOL_EVENT_CLICK", this.handleToolClick);
        messageBus2.on("OBR_TOOL_ACTION_EVENT_CLICK", this.handleToolActionClick);
        messageBus2.on("OBR_TOOL_MODE_EVENT_CLICK", this.handleToolModeClick);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_CLICK", this.handleToolModeToolClick);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DOUBLE_CLICK", this.handleToolModeToolDoubleClick);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DOWN", this.handleToolModeToolDown);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_MOVE", this.handleToolModeToolMove);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_UP", this.handleToolModeToolUp);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_START", this.handleToolModeToolDragStart);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_MOVE", this.handleToolModeToolDragMove);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_END", this.handleToolModeToolDragEnd);
        messageBus2.on("OBR_TOOL_MODE_EVENT_TOOL_DRAG_CANCEL", this.handleToolModeToolDragCancel);
        messageBus2.on("OBR_TOOL_MODE_EVENT_KEY_DOWN", this.handleToolModeKeyDown);
        messageBus2.on("OBR_TOOL_MODE_EVENT_KEY_UP", this.handleToolModeKeyUp);
      }
      create(tool) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_CREATE", {
            id: tool.id,
            shortcut: tool.shortcut,
            defaultMode: tool.defaultMode,
            defaultMetadata: tool.defaultMetadata,
            icons: normalizeIconPaths(tool.icons),
            disabled: tool.disabled
          });
          this.tools[tool.id] = tool;
        });
      }
      remove(id) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_REMOVE", { id });
          delete this.tools[id];
        });
      }
      activateTool(id) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_ACTIVATE", { id });
        });
      }
      getMetadata(id) {
        return __awaiter11(this, void 0, void 0, function* () {
          const { metadata } = yield this.messageBus.sendAsync("OBR_TOOL_GET_METADATA", { id });
          return metadata;
        });
      }
      setMetadata(toolId, update) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_SET_METADATA", {
            toolId,
            update
          });
        });
      }
      createAction(action) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_ACTION_CREATE", {
            id: action.id,
            shortcut: action.shortcut,
            icons: normalizeIconPaths(action.icons),
            disabled: action.disabled
          });
          this.toolActions[action.id] = action;
        });
      }
      removeAction(id) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_ACTION_REMOVE", { id });
          delete this.tools[id];
        });
      }
      createMode(mode) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_MODE_CREATE", {
            id: mode.id,
            shortcut: mode.shortcut,
            icons: normalizeIconPaths(mode.icons),
            preventDrag: mode.preventDrag,
            disabled: mode.disabled,
            cursors: mode.cursors
          });
          this.toolModes[mode.id] = mode;
        });
      }
      removeMode(id) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_MODE_REMOVE", { id });
          delete this.tools[id];
        });
      }
      activateMode(toolId, modeId) {
        return __awaiter11(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_TOOL_MODE_ACTIVATE", {
            toolId,
            modeId
          });
        });
      }
    };
    var ToolApi_default = ToolApi;
    var __awaiter12 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var PopoverApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      open(popover) {
        return __awaiter12(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_POPOVER_OPEN", Object.assign({}, normalizeUrlObject(popover)));
        });
      }
      close(id) {
        return __awaiter12(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_POPOVER_CLOSE", { id });
        });
      }
    };
    var PopoverApi_default = PopoverApi;
    var __awaiter13 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ModalApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      open(modal) {
        return __awaiter13(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_MODAL_OPEN", Object.assign({}, normalizeUrlObject(modal)));
        });
      }
      close(id) {
        return __awaiter13(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_MODAL_CLOSE", { id });
        });
      }
    };
    var ModalApi_default = ModalApi;
    var __awaiter14 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ActionApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getWidth() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { width } = yield this.messageBus.sendAsync("OBR_ACTION_GET_WIDTH", {});
          return width;
        });
      }
      setWidth(width) {
        return __awaiter14(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ACTION_SET_WIDTH", { width });
        });
      }
      getHeight() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { height } = yield this.messageBus.sendAsync("OBR_ACTION_GET_HEIGHT", {});
          return height;
        });
      }
      setHeight(height) {
        return __awaiter14(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ACTION_SET_HEIGHT", { height });
        });
      }
      getBadgeText() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { badgeText } = yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_TEXT", {});
          return badgeText;
        });
      }
      setBadgeText(badgeText) {
        return __awaiter14(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_TEXT", { badgeText });
        });
      }
      getBadgeBackgroundColor() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { badgeBackgroundColor } = yield this.messageBus.sendAsync("OBR_ACTION_GET_BADGE_BACKGROUND_COLOR", {});
          return badgeBackgroundColor;
        });
      }
      setBadgeBackgroundColor(badgeBackgroundColor) {
        return __awaiter14(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ACTION_SET_BADGE_BACKGROUND_COLOR", {
            badgeBackgroundColor
          });
        });
      }
      getIcon() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { icon } = yield this.messageBus.sendAsync("OBR_ACTION_GET_ICON", {});
          return icon;
        });
      }
      setIcon(icon) {
        return __awaiter14(this, void 0, void 0, function* () {
          const data = normalizeIconPaths([{ icon }]);
          yield this.messageBus.sendAsync("OBR_ACTION_SET_ICON", {
            icon: data[0].icon
          });
        });
      }
      getTitle() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { title } = yield this.messageBus.sendAsync("OBR_ACTION_GET_TITLE", {});
          return title;
        });
      }
      setTitle(title) {
        return __awaiter14(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ACTION_SET_TITLE", { title });
        });
      }
      isOpen() {
        return __awaiter14(this, void 0, void 0, function* () {
          const { isOpen } = yield this.messageBus.sendAsync("OBR_ACTION_GET_IS_OPEN", {});
          return isOpen;
        });
      }
      onOpenChange(callback) {
        const handleChange = (data) => {
          callback(data.isOpen);
        };
        this.messageBus.send("OBR_ACTION_IS_OPEN_SUBSCRIBE", {});
        this.messageBus.on("OBR_ACTION_IS_OPEN_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_IS_OPEN_ACTION_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_ACTION_IS_OPEN_EVENT_CHANGE", handleChange);
        };
      }
    };
    var ActionApi_default = ActionApi;
    var __awaiter15 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    T();
    var InteractionApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      startItemInteraction(baseState) {
        return __awaiter15(this, void 0, void 0, function* () {
          const { id } = yield this.messageBus.sendAsync("OBR_INTERACTION_START_ITEM_INTERACTION", { baseState });
          let prev = baseState;
          const dispatcher = (update) => {
            const [next, patches] = cn(prev, update);
            prev = next;
            this.messageBus.send("OBR_INTERACTION_UPDATE_ITEM_INTERACTION", {
              id,
              patches
            });
            return next;
          };
          const stop = () => {
            this.messageBus.send("OBR_INTERACTION_STOP_ITEM_INTERACTION", { id });
          };
          return [dispatcher, stop];
        });
      }
    };
    var InteractionApi_default = InteractionApi;
    var __awaiter16 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var PartyApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getPlayers() {
        return __awaiter16(this, void 0, void 0, function* () {
          const { players } = yield this.messageBus.sendAsync("OBR_PARTY_GET_PLAYERS", {});
          return players;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.players);
        };
        this.messageBus.send("OBR_PARTY_SUBSCRIBE", {});
        this.messageBus.on("OBR_PARTY_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_PARTY_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_PARTY_EVENT_CHANGE", handleChange);
        };
      }
    };
    var PartyApi_default = PartyApi;
    var __awaiter17 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var RoomApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      get id() {
        return this.messageBus.roomId;
      }
      getPermissions() {
        return __awaiter17(this, void 0, void 0, function* () {
          const { permissions } = yield this.messageBus.sendAsync("OBR_ROOM_GET_PERMISSIONS", {});
          return permissions;
        });
      }
      getMetadata() {
        return __awaiter17(this, void 0, void 0, function* () {
          const { metadata } = yield this.messageBus.sendAsync("OBR_ROOM_GET_METADATA", {});
          return metadata;
        });
      }
      setMetadata(update) {
        return __awaiter17(this, void 0, void 0, function* () {
          yield this.messageBus.sendAsync("OBR_ROOM_SET_METADATA", { update });
        });
      }
      onMetadataChange(callback) {
        const handleChange = (data) => {
          callback(data.metadata);
        };
        this.messageBus.send("OBR_ROOM_METADATA_SUBSCRIBE", {});
        this.messageBus.on("OBR_ROOM_METADATA_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_METADATA_ROOM_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_ROOM_METADATA_EVENT_CHANGE", handleChange);
        };
      }
      onPermissionsChange(callback) {
        const handleChange = (data) => {
          callback(data.permissions);
        };
        this.messageBus.send("OBR_ROOM_PERMISSIONS_SUBSCRIBE", {});
        this.messageBus.on("OBR_ROOM_PERMISSIONS_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_PERMISSIONS_ROOM_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_ROOM_PERMISSIONS_EVENT_CHANGE", handleChange);
        };
      }
    };
    var RoomApi_default = RoomApi;
    var __awaiter18 = function(thisArg, _arguments, P2, generator) {
      function adopt(value) {
        return value instanceof P2 ? value : new P2(function(resolve) {
          resolve(value);
        });
      }
      return new (P2 || (P2 = Promise))(function(resolve, reject) {
        function fulfilled(value) {
          try {
            step(generator.next(value));
          } catch (e) {
            reject(e);
          }
        }
        function rejected(value) {
          try {
            step(generator["throw"](value));
          } catch (e) {
            reject(e);
          }
        }
        function step(result) {
          result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
      });
    };
    var ThemeApi = class {
      constructor(messageBus2) {
        this.messageBus = messageBus2;
      }
      getTheme() {
        return __awaiter18(this, void 0, void 0, function* () {
          const { theme } = yield this.messageBus.sendAsync("OBR_THEME_GET_THEME", {});
          return theme;
        });
      }
      onChange(callback) {
        const handleChange = (data) => {
          callback(data.theme);
        };
        this.messageBus.send("OBR_THEME_SUBSCRIBE", {});
        this.messageBus.on("OBR_THEME_EVENT_CHANGE", handleChange);
        return () => {
          this.messageBus.send("OBR_THEME_UNSUBSCRIBE", {});
          this.messageBus.off("OBR_THEME_EVENT_CHANGE", handleChange);
        };
      }
    };
    var ThemeApi_default = ThemeApi;
    var GenericItemBuilder = class {
      constructor(player) {
        this._item = {
          createdUserId: player.id,
          id: v4_default(),
          name: "Item",
          zIndex: Date.now(),
          lastModified: (/* @__PURE__ */ new Date()).toISOString(),
          lastModifiedUserId: player.id,
          locked: false,
          metadata: {},
          position: { x: 0, y: 0 },
          rotation: 0,
          scale: { x: 1, y: 1 },
          type: "ITEM",
          visible: true,
          layer: "POPOVER"
        };
      }
      createdUserId(createdUserId) {
        this._item.createdUserId = createdUserId;
        return this.self();
      }
      id(id) {
        this._item.id = id;
        return this.self();
      }
      name(name) {
        this._item.name = name;
        return this.self();
      }
      lastModified(lastModified) {
        this._item.lastModified = lastModified;
        return this.self();
      }
      zIndex(zIndex) {
        this._item.zIndex = zIndex;
        return this.self();
      }
      lastModifiedUserId(lastModifiedUserId) {
        this._item.lastModifiedUserId = lastModifiedUserId;
        return this.self();
      }
      locked(locked) {
        this._item.locked = locked;
        return this.self();
      }
      metadata(metadata) {
        this._item.metadata = metadata;
        return this.self();
      }
      position(position) {
        this._item.position = position;
        return this.self();
      }
      rotation(rotation) {
        this._item.rotation = rotation;
        return this.self();
      }
      scale(scale) {
        this._item.scale = scale;
        return this.self();
      }
      visible(visible) {
        this._item.visible = visible;
        return this.self();
      }
      attachedTo(attachedTo) {
        this._item.attachedTo = attachedTo;
        return this.self();
      }
      layer(layer) {
        this._item.layer = layer;
        return this.self();
      }
      disableHit(disable) {
        this._item.disableHit = disable;
        return this.self();
      }
      disableAutoZIndex(disable) {
        this._item.disableAutoZIndex = disable;
        return this.self();
      }
      self() {
        return this;
      }
    };
    var CurveBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._points = [];
        this._style = {
          fillColor: "black",
          fillOpacity: 1,
          strokeColor: "white",
          strokeOpacity: 1,
          strokeWidth: 5,
          strokeDash: [],
          tension: 0.5
        };
        this._item.name = "Curve";
        this._item.layer = "DRAWING";
      }
      points(points) {
        this._points = points;
        return this.self();
      }
      style(style) {
        this._style = style;
        return this.self();
      }
      fillColor(fillColor) {
        this._style.fillColor = fillColor;
        return this.self();
      }
      fillOpacity(fillOpacity) {
        this._style.fillOpacity = fillOpacity;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._style.strokeWidth = strokeWidth;
        return this.self();
      }
      strokeDash(strokeDash) {
        this._style.strokeDash = strokeDash;
        return this.self();
      }
      tension(tension) {
        this._style.tension = tension;
        return this.self();
      }
      closed(closed) {
        this._style.closed = closed;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "CURVE", points: this._points, style: this._style });
      }
    };
    var ImageBuilder = class extends GenericItemBuilder {
      constructor(player, image, grid) {
        super(player);
        this._image = image;
        this._grid = grid;
        this._item.name = "Image";
        this._text = {
          richText: [
            {
              type: "paragraph",
              children: [{ text: "" }]
            }
          ],
          plainText: "",
          style: {
            padding: 8,
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: 400,
            textAlign: "CENTER",
            textAlignVertical: "BOTTOM",
            fillColor: "white",
            fillOpacity: 1,
            strokeColor: "white",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5
          },
          type: "PLAIN",
          width: "AUTO",
          height: "AUTO"
        };
        this._textItemType = "LABEL";
      }
      text(text) {
        this._text = text;
        return this.self();
      }
      textItemType(textItemType) {
        this._textItemType = textItemType;
        return this.self();
      }
      textWidth(width) {
        this._text.width = width;
        return this.self();
      }
      textHeight(height) {
        this._text.height = height;
        return this.self();
      }
      richText(richText) {
        this._text.richText = richText;
        return this.self();
      }
      plainText(plainText) {
        this._text.plainText = plainText;
        return this.self();
      }
      textType(textType) {
        this._text.type = textType;
        return this.self();
      }
      textPadding(padding) {
        this._text.style.padding = padding;
        return this.self();
      }
      fontFamily(fontFamily) {
        this._text.style.fontFamily = fontFamily;
        return this.self();
      }
      fontSize(fontSize) {
        this._text.style.fontSize = fontSize;
        return this.self();
      }
      fontWeight(fontWeight) {
        this._text.style.fontWeight = fontWeight;
        return this.self();
      }
      textAlign(textAlign) {
        this._text.style.textAlign = textAlign;
        return this.self();
      }
      textAlignVertical(textAlignVertical) {
        this._text.style.textAlignVertical = textAlignVertical;
        return this.self();
      }
      textFillColor(fillColor) {
        this._text.style.fillColor = fillColor;
        return this.self();
      }
      textFillOpacity(fillOpacity) {
        this._text.style.fillOpacity = fillOpacity;
        return this.self();
      }
      textStrokeColor(strokeColor) {
        this._text.style.strokeColor = strokeColor;
        return this.self();
      }
      textStrokeOpacity(strokeOpacity) {
        this._text.style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      textStrokeWidth(strokeWidth) {
        this._text.style.strokeWidth = strokeWidth;
        return this.self();
      }
      textLineHeight(lineHeight) {
        this._text.style.lineHeight = lineHeight;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "IMAGE", image: this._image, grid: this._grid, text: this._text, textItemType: this._textItemType });
      }
    };
    var LabelBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._text = {
          richText: [
            {
              type: "paragraph",
              children: [{ text: "" }]
            }
          ],
          plainText: "",
          style: {
            padding: 8,
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: 400,
            textAlign: "CENTER",
            textAlignVertical: "MIDDLE",
            fillColor: "white",
            fillOpacity: 1,
            strokeColor: "white",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5
          },
          type: "PLAIN",
          width: "AUTO",
          height: "AUTO"
        };
        this._style = {
          backgroundColor: "#3D4051",
          backgroundOpacity: 1,
          cornerRadius: 8,
          pointerDirection: "DOWN",
          pointerWidth: 4,
          pointerHeight: 4
        };
        this._item.layer = "TEXT";
        this._item.name = "Label";
      }
      text(text) {
        this._text = text;
        return this.self();
      }
      width(width) {
        this._text.width = width;
        return this.self();
      }
      height(height) {
        this._text.height = height;
        return this.self();
      }
      plainText(plainText) {
        this._text.plainText = plainText;
        return this.self();
      }
      padding(padding) {
        this._text.style.padding = padding;
        return this.self();
      }
      fontFamily(fontFamily) {
        this._text.style.fontFamily = fontFamily;
        return this.self();
      }
      fontSize(fontSize) {
        this._text.style.fontSize = fontSize;
        return this.self();
      }
      fontWeight(fontWeight) {
        this._text.style.fontWeight = fontWeight;
        return this.self();
      }
      textAlign(textAlign) {
        this._text.style.textAlign = textAlign;
        return this.self();
      }
      textAlignVertical(textAlignVertical) {
        this._text.style.textAlignVertical = textAlignVertical;
        return this.self();
      }
      fillColor(fillColor) {
        this._text.style.fillColor = fillColor;
        return this.self();
      }
      fillOpacity(fillOpacity) {
        this._text.style.fillOpacity = fillOpacity;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._text.style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._text.style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._text.style.strokeWidth = strokeWidth;
        return this.self();
      }
      lineHeight(lineHeight) {
        this._text.style.lineHeight = lineHeight;
        return this.self();
      }
      style(style) {
        this._style = style;
        return this.self();
      }
      backgroundColor(backgroundColor) {
        this._style.backgroundColor = backgroundColor;
        return this.self();
      }
      backgroundOpacity(backgroundOpacity) {
        this._style.backgroundOpacity = backgroundOpacity;
        return this.self();
      }
      cornerRadius(cornerRadius) {
        this._style.cornerRadius = cornerRadius;
        return this.self();
      }
      pointerWidth(pointerWidth) {
        this._style.pointerWidth = pointerWidth;
        return this.self();
      }
      pointerHeight(pointerHeight) {
        this._style.pointerHeight = pointerHeight;
        return this.self();
      }
      pointerDirection(pointerDirection) {
        this._style.pointerDirection = pointerDirection;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "LABEL", text: this._text, style: this._style });
      }
    };
    var LineBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._style = {
          strokeColor: "black",
          strokeOpacity: 1,
          strokeWidth: 5,
          strokeDash: []
        };
        this._startPosition = { x: 0, y: 0 };
        this._endPosition = { x: 0, y: 0 };
        this._item.layer = "DRAWING";
        this._item.name = "Line";
      }
      style(style) {
        this._style = style;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._style.strokeWidth = strokeWidth;
        return this.self();
      }
      strokeDash(strokeDash) {
        this._style.strokeDash = strokeDash;
        return this.self();
      }
      startPosition(startPosition) {
        this._startPosition = startPosition;
        return this.self();
      }
      endPosition(endPosition) {
        this._endPosition = endPosition;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "LINE", startPosition: this._startPosition, endPosition: this._endPosition, style: this._style });
      }
    };
    var PointerBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._color = "black";
        this._radius = 20;
        this._item.layer = "POINTER";
        this._item.name = "Pointer";
      }
      color(color) {
        this._color = color;
        return this.self();
      }
      radius(radius) {
        this._radius = radius;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "POINTER", color: this._color, radius: this._radius });
      }
    };
    var RulerBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._startPosition = { x: 0, y: 0 };
        this._endPosition = { x: 0, y: 0 };
        this._measurement = "";
        this._item.layer = "RULER";
        this._item.name = "Ruler";
        this._style = {
          variant: "FILLED"
        };
      }
      startPosition(startPosition) {
        this._startPosition = startPosition;
        return this.self();
      }
      endPosition(endPosition) {
        this._endPosition = endPosition;
        return this.self();
      }
      measurement(measurement) {
        this._measurement = measurement;
        return this.self();
      }
      variant(variant) {
        this._style.variant = variant;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "RULER", startPosition: this._startPosition, endPosition: this._endPosition, measurement: this._measurement, style: this._style });
      }
    };
    var ShapeBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._width = 0;
        this._height = 0;
        this._shapeType = "RECTANGLE";
        this._style = {
          fillColor: "black",
          fillOpacity: 1,
          strokeColor: "white",
          strokeOpacity: 1,
          strokeWidth: 5,
          strokeDash: []
        };
        this._item.layer = "DRAWING";
        this._item.name = "Shape";
      }
      width(width) {
        this._width = width;
        return this.self();
      }
      height(height) {
        this._height = height;
        return this.self();
      }
      shapeType(shapeType) {
        this._shapeType = shapeType;
        return this.self();
      }
      style(style) {
        this._style = style;
        return this.self();
      }
      fillColor(fillColor) {
        this._style.fillColor = fillColor;
        return this.self();
      }
      fillOpacity(fillOpacity) {
        this._style.fillOpacity = fillOpacity;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._style.strokeWidth = strokeWidth;
        return this.self();
      }
      strokeDash(strokeDash) {
        this._style.strokeDash = strokeDash;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "SHAPE", width: this._width, height: this._height, shapeType: this._shapeType, style: this._style });
      }
    };
    var TextBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._text = {
          richText: [
            {
              type: "paragraph",
              children: [{ text: "" }]
            }
          ],
          plainText: "",
          style: {
            padding: 0,
            fontFamily: "Roboto",
            fontSize: 16,
            fontWeight: 400,
            textAlign: "LEFT",
            textAlignVertical: "TOP",
            fillColor: "white",
            fillOpacity: 1,
            strokeColor: "white",
            strokeOpacity: 1,
            strokeWidth: 0,
            lineHeight: 1.5
          },
          type: "RICH",
          width: "AUTO",
          height: "AUTO"
        };
        this._item.layer = "TEXT";
        this._item.name = "Text";
      }
      text(text) {
        this._text = text;
        return this.self();
      }
      width(width) {
        this._text.width = width;
        return this.self();
      }
      height(height) {
        this._text.height = height;
        return this.self();
      }
      richText(richText) {
        this._text.richText = richText;
        return this.self();
      }
      plainText(plainText) {
        this._text.plainText = plainText;
        return this.self();
      }
      textType(textType) {
        this._text.type = textType;
        return this.self();
      }
      padding(padding) {
        this._text.style.padding = padding;
        return this.self();
      }
      fontFamily(fontFamily) {
        this._text.style.fontFamily = fontFamily;
        return this.self();
      }
      fontSize(fontSize) {
        this._text.style.fontSize = fontSize;
        return this.self();
      }
      fontWeight(fontWeight) {
        this._text.style.fontWeight = fontWeight;
        return this.self();
      }
      textAlign(textAlign) {
        this._text.style.textAlign = textAlign;
        return this.self();
      }
      textAlignVertical(textAlignVertical) {
        this._text.style.textAlignVertical = textAlignVertical;
        return this.self();
      }
      fillColor(fillColor) {
        this._text.style.fillColor = fillColor;
        return this.self();
      }
      fillOpacity(fillOpacity) {
        this._text.style.fillOpacity = fillOpacity;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._text.style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._text.style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._text.style.strokeWidth = strokeWidth;
        return this.self();
      }
      lineHeight(lineHeight) {
        this._text.style.lineHeight = lineHeight;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "TEXT", text: this._text });
      }
    };
    var PathBuilder = class extends GenericItemBuilder {
      constructor(player) {
        super(player);
        this._commands = [];
        this._fillRule = "nonzero";
        this._style = {
          fillColor: "black",
          fillOpacity: 1,
          strokeColor: "white",
          strokeOpacity: 1,
          strokeWidth: 5,
          strokeDash: []
        };
        this._item.name = "Path";
        this._item.layer = "DRAWING";
      }
      commands(commands) {
        this._commands = commands;
        return this.self();
      }
      fillRule(fillRule) {
        this._fillRule = fillRule;
        return this.self();
      }
      style(style) {
        this._style = style;
        return this.self();
      }
      fillColor(fillColor) {
        this._style.fillColor = fillColor;
        return this.self();
      }
      fillOpacity(fillOpacity) {
        this._style.fillOpacity = fillOpacity;
        return this.self();
      }
      strokeColor(strokeColor) {
        this._style.strokeColor = strokeColor;
        return this.self();
      }
      strokeOpacity(strokeOpacity) {
        this._style.strokeOpacity = strokeOpacity;
        return this.self();
      }
      strokeWidth(strokeWidth) {
        this._style.strokeWidth = strokeWidth;
        return this.self();
      }
      strokeDash(strokeDash) {
        this._style.strokeDash = strokeDash;
        return this.self();
      }
      build() {
        return Object.assign(Object.assign({}, this._item), { type: "PATH", commands: this._commands, fillRule: this._fillRule, style: this._style });
      }
    };
    var _hasBuffer = typeof Buffer === "function";
    var _TD = typeof TextDecoder === "function" ? new TextDecoder() : void 0;
    var _TE = typeof TextEncoder === "function" ? new TextEncoder() : void 0;
    var b64ch = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
    var b64chs = Array.prototype.slice.call(b64ch);
    var b64tab = ((a2) => {
      let tab = {};
      a2.forEach((c2, i2) => tab[c2] = i2);
      return tab;
    })(b64chs);
    var b64re = /^(?:[A-Za-z\d+\/]{4})*?(?:[A-Za-z\d+\/]{2}(?:==)?|[A-Za-z\d+\/]{3}=?)?$/;
    var _fromCC = String.fromCharCode.bind(String);
    var _U8Afrom = typeof Uint8Array.from === "function" ? Uint8Array.from.bind(Uint8Array) : (it) => new Uint8Array(Array.prototype.slice.call(it, 0));
    var _tidyB64 = (s2) => s2.replace(/[^A-Za-z0-9\+\/]/g, "");
    var re_btou = /[\xC0-\xDF][\x80-\xBF]|[\xE0-\xEF][\x80-\xBF]{2}|[\xF0-\xF7][\x80-\xBF]{3}/g;
    var cb_btou = (cccc) => {
      switch (cccc.length) {
        case 4:
          var cp = (7 & cccc.charCodeAt(0)) << 18 | (63 & cccc.charCodeAt(1)) << 12 | (63 & cccc.charCodeAt(2)) << 6 | 63 & cccc.charCodeAt(3), offset = cp - 65536;
          return _fromCC((offset >>> 10) + 55296) + _fromCC((offset & 1023) + 56320);
        case 3:
          return _fromCC((15 & cccc.charCodeAt(0)) << 12 | (63 & cccc.charCodeAt(1)) << 6 | 63 & cccc.charCodeAt(2));
        default:
          return _fromCC((31 & cccc.charCodeAt(0)) << 6 | 63 & cccc.charCodeAt(1));
      }
    };
    var btou = (b2) => b2.replace(re_btou, cb_btou);
    var atobPolyfill = (asc) => {
      asc = asc.replace(/\s+/g, "");
      if (!b64re.test(asc))
        throw new TypeError("malformed base64.");
      asc += "==".slice(2 - (asc.length & 3));
      let u24, r1, r2;
      let binArray = [];
      for (let i2 = 0; i2 < asc.length; ) {
        u24 = b64tab[asc.charAt(i2++)] << 18 | b64tab[asc.charAt(i2++)] << 12 | (r1 = b64tab[asc.charAt(i2++)]) << 6 | (r2 = b64tab[asc.charAt(i2++)]);
        if (r1 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255));
        } else if (r2 === 64) {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255));
        } else {
          binArray.push(_fromCC(u24 >> 16 & 255, u24 >> 8 & 255, u24 & 255));
        }
      }
      return binArray.join("");
    };
    var _atob = typeof atob === "function" ? (asc) => atob(_tidyB64(asc)) : _hasBuffer ? (asc) => Buffer.from(asc, "base64").toString("binary") : atobPolyfill;
    var _toUint8Array = _hasBuffer ? (a2) => _U8Afrom(Buffer.from(a2, "base64")) : (a2) => _U8Afrom(_atob(a2).split("").map((c2) => c2.charCodeAt(0)));
    var _decode = _hasBuffer ? (a2) => Buffer.from(a2, "base64").toString("utf8") : _TD ? (a2) => _TD.decode(_toUint8Array(a2)) : (a2) => btou(_atob(a2));
    var _unURI = (a2) => _tidyB64(a2.replace(/[-_]/g, (m0) => m0 == "-" ? "+" : "/"));
    var decode = (src) => _decode(_unURI(src));
    function getDetails() {
      const urlSearchParams = new URLSearchParams(window.location.search);
      const ref = urlSearchParams.get("obrref");
      let origin = "";
      let roomId = "";
      if (ref) {
        const decodedRef = decode(ref);
        const parts = decodedRef.split(" ");
        if (parts.length === 2) {
          origin = parts[0];
          roomId = parts[1];
        }
      }
      return { origin, roomId };
    }
    function isCurve(item) {
      return item.type === "CURVE";
    }
    function isImage(item) {
      return item.type === "IMAGE";
    }
    function isLabel(item) {
      return item.type === "LABEL";
    }
    function isLine(item) {
      return item.type === "LINE";
    }
    function isPointer(item) {
      return item.type === "POINTER";
    }
    function isRuler(item) {
      return item.type === "RULER";
    }
    function isShape(item) {
      return item.type === "SHAPE";
    }
    function isText(item) {
      return item.type === "TEXT";
    }
    var Command;
    (function(Command2) {
      Command2[Command2["MOVE"] = 0] = "MOVE";
      Command2[Command2["LINE"] = 1] = "LINE";
      Command2[Command2["QUAD"] = 2] = "QUAD";
      Command2[Command2["CONIC"] = 3] = "CONIC";
      Command2[Command2["CUBIC"] = 4] = "CUBIC";
      Command2[Command2["CLOSE"] = 5] = "CLOSE";
    })(Command || (Command = {}));
    function isPath(item) {
      return item.type === "PATH";
    }
    var details = getDetails();
    var messageBus = new MessageBus_default(details.origin, details.roomId);
    var viewportApi = new ViewportApi_default(messageBus);
    var playerApi = new PlayerApi_default(messageBus);
    var partyApi = new PartyApi_default(messageBus);
    var notificationApi = new NotificationApi_default(messageBus);
    var sceneApi = new SceneApi_default(messageBus);
    var contextMenuApi = new ContextMenuApi_default(messageBus);
    var toolApi = new ToolApi_default(messageBus);
    var popoverApi = new PopoverApi_default(messageBus);
    var modalApi = new ModalApi_default(messageBus);
    var actionApi = new ActionApi_default(messageBus);
    var interactionApi = new InteractionApi_default(messageBus);
    var roomApi = new RoomApi_default(messageBus);
    var themeApi = new ThemeApi_default(messageBus);
    var OBR2 = {
      onReady: (callback) => {
        if (messageBus.ready) {
          callback();
        } else {
          messageBus.once("OBR_READY", () => callback());
        }
      },
      get isReady() {
        return messageBus.ready;
      },
      viewport: viewportApi,
      player: playerApi,
      party: partyApi,
      notification: notificationApi,
      scene: sceneApi,
      contextMenu: contextMenuApi,
      tool: toolApi,
      popover: popoverApi,
      modal: modalApi,
      action: actionApi,
      interaction: interactionApi,
      room: roomApi,
      theme: themeApi,
      /** True if the current site is embedded in an instance of Owlbear Rodeo */
      isAvailable: Boolean(details.origin)
    };
    function buildCurve() {
      return new CurveBuilder(playerApi);
    }
    function buildImage(image, grid) {
      return new ImageBuilder(playerApi, image, grid);
    }
    function buildLabel() {
      return new LabelBuilder(playerApi);
    }
    function buildLine() {
      return new LineBuilder(playerApi);
    }
    function buildPointer() {
      return new PointerBuilder(playerApi);
    }
    function buildRuler() {
      return new RulerBuilder(playerApi);
    }
    function buildShape() {
      return new ShapeBuilder(playerApi);
    }
    function buildText() {
      return new TextBuilder(playerApi);
    }
    function buildPath() {
      return new PathBuilder(playerApi);
    }
    var index_default = OBR2;
    return __toCommonJS(index_exports);
  })();
  try {
    obrGlobal = OBR && OBR.default ? OBR.default : OBR;
    if (typeof globalThis !== "undefined") {
      globalThis.OBR = globalThis.OBR || obrGlobal;
    }
    if (typeof window !== "undefined") {
      window.OBR = window.OBR || obrGlobal;
    }
  } catch (e) {
  }
  var obrGlobal;

  // main.js
  var panel = document.querySelector(".panel");
  var tabButtons = [];
  var tabPanels = Array.from(document.querySelectorAll(".tab-panel"));
  var newButton = document.querySelector('[data-action="new"]');
  var getGradeSelects = () => Array.from(document.querySelectorAll('[data-role="grade-select"]'));
  var getBackgroundSelects = () => Array.from(document.querySelectorAll('[data-role="background-select"]'));
  var getStatsBadges = () => Array.from(document.querySelectorAll('[data-role="stats-badges"]'));
  var getDerivedStatsBadges = () => Array.from(document.querySelectorAll('[data-role="derived-stats-badges"]'));
  var getSkillsLists = () => Array.from(document.querySelectorAll('[data-role="skills-list"]'));
  var getFeaturesLists = () => Array.from(document.querySelectorAll('[data-role="features-list"]'));
  var getFeatureCategoryPickers = () => Array.from(document.querySelectorAll('[data-role="feature-category-picker"]'));
  var getFeatureListPickers = () => Array.from(document.querySelectorAll('[data-role="feature-list-picker"]'));
  var getSkillCategoryPickers = () => Array.from(document.querySelectorAll('[data-role="skill-category-picker"]'));
  var getSkillListPickers = () => Array.from(document.querySelectorAll('[data-role="skill-list-picker"]'));
  var baseCharacteristics = {
    BODY: 4,
    MIND: 4,
    LUCK: 8
  };
  var statPointsByGrade = {};
  var statCostsByStat = {};
  var currentStatModifiers = {};
  var gradeMaxBonusesByGrade = {};
  var backgroundSourceCache = null;
  var skills = [];
  var backgroundSkillModifiers = /* @__PURE__ */ new Map();
  var skillRanks = /* @__PURE__ */ new Map();
  var purchasedSkills = /* @__PURE__ */ new Set();
  var skillPointsByGrade = {};
  var featurePointsByGrade = {};
  var maxSkillRanksByGrade = {};
  var purchasedFeatures = /* @__PURE__ */ new Set();
  var backgroundFeatures = [];
  var featureSelections = /* @__PURE__ */ new Map();
  var featuresMap = /* @__PURE__ */ new Map();
  var currentBackgroundName = "";
  var PLAYER_TABS_SELECTOR = '[data-role="player-tabs"]';
  var METADATA_KEY = "affStarTrek.characters";
  var PERSIST_DEBOUNCE_MS = 400;
  var obrReady = false;
  var isDm = false;
  var localPlayerId = null;
  var localPlayerName = "";
  var activePlayerId = null;
  var cachedPlayers = [];
  var persistenceReady = false;
  var isApplyingRemote = false;
  var persistTimer = null;
  var statBadgeMaps = /* @__PURE__ */ new Map();
  var statState = /* @__PURE__ */ new Map();
  var activePanelKey = () => panel?.dataset.activeTab || "sheet";
  var getPlayerTabsContainer = () => document.querySelector(PLAYER_TABS_SELECTOR);
  var showPlayerTabsMessage = (message) => {
    const container = getPlayerTabsContainer();
    if (!container) return;
    container.textContent = message;
    container.hidden = false;
    container.removeAttribute("hidden");
    container.style.display = "flex";
  };
  var getObrGlobal = () => window.OBR || globalThis.OBR;
  var getCharactersFromMetadata = (metadata) => {
    const raw = metadata?.[METADATA_KEY];
    if (!raw || typeof raw !== "object") return {};
    return raw;
  };
  var schedulePersist = () => {
    if (!persistenceReady || isApplyingRemote || !obrReady || !activePlayerId) return;
    if (persistTimer) {
      window.clearTimeout(persistTimer);
    }
    persistTimer = window.setTimeout(() => {
      persistTimer = null;
      persistCharacter().catch((error) => {
        console.error("Error persisting character:", error);
      });
    }, PERSIST_DEBOUNCE_MS);
  };
  var persistCharacter = async () => {
    if (!obrReady || !activePlayerId || !window.OBR?.room?.getMetadata) return;
    const characterData = buildCharacterData();
    const metadata = await window.OBR.room.getMetadata();
    const characters = getCharactersFromMetadata(metadata);
    const next = {
      ...characters,
      [activePlayerId]: characterData
    };
    await window.OBR.room.setMetadata({
      ...metadata,
      [METADATA_KEY]: next
    });
  };
  var getSelfPlayer = async () => {
    if (window.OBR?.player?.getSelf) {
      return window.OBR.player.getSelf();
    }
    const id = await window.OBR?.player?.getId?.();
    const name = await window.OBR?.player?.getName?.();
    const role = await window.OBR?.player?.getRole?.();
    return { id, name, role };
  };
  var getAllPlayers = async (self) => {
    if (window.OBR?.party?.getPlayers) {
      return window.OBR.party.getPlayers();
    }
    return self ? [self] : [];
  };
  var renderPlayerTabs = (players, activeId) => {
    const container = getPlayerTabsContainer();
    if (!container) return;
    container.innerHTML = "";
    const orderedPlayers = [];
    if (localPlayerId) {
      orderedPlayers.push({
        id: localPlayerId,
        name: localPlayerName || "GM",
        isSelf: true
      });
    }
    players.forEach((player) => {
      if (!player?.id || player.id === localPlayerId) return;
      orderedPlayers.push({ ...player, isSelf: false });
    });
    orderedPlayers.forEach((player) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = `player-tab${player.id === activeId ? " is-active" : ""}`;
      button.dataset.playerId = player.id;
      const baseName = player.name || "Unknown Player";
      button.textContent = player.isSelf ? `${baseName} \u2606` : baseName;
      button.addEventListener("click", () => {
        if (player.id === activePlayerId) return;
        switchActivePlayer(player.id);
      });
      container.appendChild(button);
    });
  };
  var loadCharacterForPlayer = async (playerId) => {
    if (!obrReady || !playerId || !window.OBR?.room?.getMetadata) return false;
    const metadata = await window.OBR.room.getMetadata();
    const characters = getCharactersFromMetadata(metadata);
    const data = characters[playerId];
    isApplyingRemote = true;
    try {
      if (data) {
        await applyCharacterData(data);
        return true;
      }
      resetCharacter();
      return false;
    } finally {
      isApplyingRemote = false;
    }
  };
  var switchActivePlayer = async (playerId) => {
    if (persistenceReady && activePlayerId && activePlayerId !== playerId) {
      if (persistTimer) {
        window.clearTimeout(persistTimer);
        persistTimer = null;
      }
      await persistCharacter();
    }
    activePlayerId = playerId;
    if (isDm) {
      renderPlayerTabs(cachedPlayers, activePlayerId);
    }
    await loadCharacterForPlayer(activePlayerId);
  };
  var initObrContext = async () => {
    const obrAvailable = getObrGlobal();
    if (!obrAvailable?.onReady) {
      showPlayerTabsMessage("OBR SDK not available; player tabs disabled.");
      return false;
    }
    if (!window.OBR) {
      window.OBR = obrAvailable;
    }
    await window.OBR.onReady();
    if (!window.OBR?.isAvailable) {
      showPlayerTabsMessage("OBR not available; player tabs disabled.");
      return false;
    }
    obrReady = true;
    const self = await getSelfPlayer();
    localPlayerId = self?.id || null;
    localPlayerName = self?.name || "";
    const role = await window.OBR?.player?.getRole?.();
    isDm = role === "GM";
    cachedPlayers = await getAllPlayers(self);
    activePlayerId = localPlayerId;
    const playerTabs = getPlayerTabsContainer();
    if (playerTabs) {
      if (isDm) {
        renderPlayerTabs(cachedPlayers, activePlayerId);
        playerTabs.hidden = false;
        playerTabs.removeAttribute("hidden");
        playerTabs.style.display = "flex";
      } else {
        playerTabs.hidden = true;
      }
    }
    if (window.OBR?.party?.onChange) {
      window.OBR.party.onChange((players) => {
        cachedPlayers = players;
        if (isDm) {
          renderPlayerTabs(cachedPlayers, activePlayerId);
        }
      });
    }
    const loaded = await loadCharacterForPlayer(activePlayerId);
    persistenceReady = true;
    return loaded;
  };
  var skillCategoryEmojis = {
    Combat: "\u2694\uFE0F",
    Movement: "\u{1F3C3}",
    Stealth: "\u{1F575}\uFE0F",
    Knowledge: "\u{1F4DA}",
    Science: "\u{1F9EA}",
    Speech: "\u{1F4AC}",
    Psionic: "\u{1F52E}",
    Pilot: "\u2708\uFE0F",
    Language: "\u{1F5E3}\uFE0F"
  };
  var skillCategoryOrder = ["Combat", "Psionic", "Movement", "Pilot", "Stealth", "Knowledge", "Science", "Speech", "Language"];
  var defaultGradeValue = "Uncommon";
  var defaultBackgroundValue = "";
  var gradeColors = {
    Poor: "#9d9d9d",
    Common: "#ffffff",
    Uncommon: "#1eff00",
    Rare: "#0070dd",
    Epic: "#a335ee",
    Legendary: "#ff8000",
    Mythic: "#e6cc80"
  };
  var defaultStatPoints = {
    Poor: 5,
    Common: 6,
    Uncommon: 7,
    Rare: 8,
    Epic: 9,
    Legendary: 10,
    Mythic: 11
  };
  var defaultGradeMaxBonuses = {
    Poor: { BODY: 1, LUCK: 3, MIND: 1 },
    Common: { BODY: 2, LUCK: 3, MIND: 2 },
    Uncommon: { BODY: 3, LUCK: 3, MIND: 3 },
    Rare: { BODY: 4, LUCK: 3, MIND: 4 },
    Epic: { BODY: 5, LUCK: 3, MIND: 5 },
    Legendary: { BODY: 6, LUCK: 3, MIND: 6 },
    Mythic: { BODY: 7, LUCK: 3, MIND: 7 }
  };
  gradeMaxBonusesByGrade = { ...defaultGradeMaxBonuses };
  var statColorScale = [
    gradeColors.Poor,
    gradeColors.Common,
    gradeColors.Uncommon,
    gradeColors.Rare,
    gradeColors.Epic,
    gradeColors.Legendary,
    gradeColors.Mythic
  ];
  var updateTabInteractivity = () => {
    const activeTab = activePanelKey();
    const gradeEnabled = activeTab === "edit";
    const backgroundEnabled = activeTab === "edit";
    const shouldShowPoints = activeTab === "edit";
    getGradeSelects().forEach((select) => {
      select.disabled = !gradeEnabled;
    });
    getBackgroundSelects().forEach((select) => {
      select.disabled = !backgroundEnabled;
    });
    updateFeaturePointsBadge();
    getSkillCategoryPickers().forEach((picker) => {
      if (!shouldShowPoints) {
        picker.hidden = true;
      }
    });
    getSkillListPickers().forEach((picker) => {
      if (!shouldShowPoints) {
        picker.hidden = true;
      }
    });
    const statBadgesAdjustable = Array.from(
      document.querySelectorAll('[data-role="stat-badge-adjustable"]')
    );
    statBadgesAdjustable.forEach((badge) => {
      badge.style.cursor = shouldShowPoints ? "pointer" : "default";
    });
    if (shouldShowPoints) {
      updateStatPointsBadges();
      updateAdjusterStates();
    }
  };
  var resizePopover = () => {
    try {
      const targetWidth = Math.floor(window.screen.availWidth / 3);
      const targetHeight = Math.floor(window.screen.availHeight);
      if (Number.isFinite(targetWidth) && Number.isFinite(targetHeight)) {
        window.resizeTo(targetWidth, targetHeight);
        window.moveTo(0, 0);
      }
    } catch (error) {
      if (panel) {
        panel.dataset.resizeFailed = "true";
      }
    }
  };
  window.addEventListener("load", async () => {
    resizePopover();
    mirrorTabPanels();
    await loadBaseCharacteristics();
    await loadStatCosts();
    await loadStatPoints();
    await loadStatsBadges();
    await loadFeatures();
    await loadSkills();
    await loadSkillPoints();
    await loadGradeOptions();
    await loadBackgroundOptions();
    attachBackgroundListeners();
    attachGradeListeners();
    const loadedFromMetadata = await initObrContext();
    if (!loadedFromMetadata) {
      const firstBackground = getBackgroundSelects()[0]?.value || defaultBackgroundValue;
      await updateStatsForBackground(firstBackground);
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
    }
    updateTabInteractivity();
    updateStatPointsBadges();
    tabButtons = Array.from(document.querySelectorAll(".tab-button"));
    console.log(`[DEBUG] Found ${tabButtons.length} tab buttons:`, tabButtons.map((btn) => ({
      action: btn.dataset.action,
      tab: btn.dataset.tab,
      title: btn.title,
      visible: btn.offsetParent !== null,
      display: window.getComputedStyle(btn).display,
      element: btn
    })));
    const buttons = tabButtons;
    buttons.forEach((button) => {
      const tab = button.dataset.tab;
      if (tab) {
        button.addEventListener("click", (event) => {
          event.stopPropagation();
          event.preventDefault();
          setActiveTab(tab);
        });
      }
    });
    const newBtn = document.querySelector('[data-action="new"]');
    if (newBtn) {
      newBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        const confirmed = window.confirm(
          "This will clear the current character. Continue?"
        );
        if (!confirmed) return;
        resetCharacter();
      });
    }
    const saveBtn = document.querySelector('[data-action="save"]');
    if (saveBtn) {
      console.log("[DEBUG] Save button found and listener attached", saveBtn);
      console.log("[DEBUG] Save button computed styles:", {
        display: window.getComputedStyle(saveBtn).display,
        visibility: window.getComputedStyle(saveBtn).visibility,
        opacity: window.getComputedStyle(saveBtn).opacity,
        width: window.getComputedStyle(saveBtn).width,
        height: window.getComputedStyle(saveBtn).height
      });
      saveBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("[DEBUG] Save button clicked!");
        saveCharacter();
      });
    } else {
      console.error("[DEBUG] Save button NOT FOUND in DOM!");
      console.error("[DEBUG] All buttons with data-action:", document.querySelectorAll("[data-action]"));
    }
    const loadBtn = document.querySelector('[data-action="load"]');
    if (loadBtn) {
      console.log("[DEBUG] Load button found and listener attached", loadBtn);
      console.log("[DEBUG] Load button computed styles:", {
        display: window.getComputedStyle(loadBtn).display,
        visibility: window.getComputedStyle(loadBtn).visibility,
        opacity: window.getComputedStyle(loadBtn).opacity,
        width: window.getComputedStyle(loadBtn).width,
        height: window.getComputedStyle(loadBtn).height
      });
      loadBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        event.preventDefault();
        console.log("[DEBUG] Load button clicked!");
        loadCharacter();
      });
    } else {
      console.error("[DEBUG] Load button NOT FOUND in DOM!");
      console.error("[DEBUG] All buttons with data-action:", document.querySelectorAll("[data-action]"));
    }
  });
  window.addEventListener("resize", () => {
    if (panel) {
      panel.style.height = `${window.innerHeight}px`;
    }
  });
  var parseStringList = (text) => {
    const matches = text.match(/"([^"]+)"/g) || [];
    return matches.map((item) => item.slice(1, -1));
  };
  var parseNumberMap = (blockText) => {
    const entries = {};
    const matches = blockText.matchAll(/(?:"([^"]+)"|([A-Z_]+))\s*:\s*(-?\d+)/g);
    for (const match of matches) {
      const key = match[1] || match[2];
      if (key) {
        entries[key] = Number(match[3]);
      }
    }
    return entries;
  };
  var extractObjectBlock = (text, startIndex) => {
    const braceStart = text.indexOf("{", startIndex);
    if (braceStart === -1) return null;
    let depth = 0;
    for (let i = braceStart; i < text.length; i += 1) {
      if (text[i] === "{") depth += 1;
      if (text[i] === "}") {
        depth -= 1;
        if (depth === 0) {
          return text.slice(braceStart + 1, i);
        }
      }
    }
    return null;
  };
  var loadBaseCharacteristics = async () => {
    try {
      const response = await fetch("./data/statsMaxValuesByQuality.ts");
      const text = await response.text();
      const match = text.match(/baseCharacteristics\s*=\s*\{([\s\S]*?)\}/);
      if (!match) return;
      const parsed = parseNumberMap(match[1]);
      baseCharacteristics = {
        BODY: parsed.BODY ?? baseCharacteristics.BODY,
        MIND: parsed.MIND ?? baseCharacteristics.MIND,
        LUCK: parsed.LUCK ?? baseCharacteristics.LUCK
      };
      const parsedBonuses = parseGradeMaxBonusesFromText(text);
      gradeMaxBonusesByGrade = Object.keys(parsedBonuses).length === 0 ? { ...defaultGradeMaxBonuses } : parsedBonuses;
    } catch (error) {
      gradeMaxBonusesByGrade = { ...defaultGradeMaxBonuses };
    }
  };
  var parseGradeMaxBonusesFromText = (text) => {
    const startIndex = text.indexOf("statsMaxValuesByQuality");
    if (startIndex === -1) return {};
    const blockText = extractObjectBlock(text, startIndex);
    if (!blockText) return {};
    const result = {};
    const quote = '"';
    const findMatchingBrace = (s, braceStart) => {
      let depth = 0;
      for (let i = braceStart; i < s.length; i += 1) {
        if (s[i] === "{") depth += 1;
        if (s[i] === "}") {
          depth -= 1;
          if (depth === 0) return i;
        }
      }
      return -1;
    };
    let idx = 0;
    while (idx < blockText.length) {
      const keyStart = blockText.indexOf(quote, idx);
      if (keyStart === -1) break;
      const keyEnd = blockText.indexOf(quote, keyStart + 1);
      if (keyEnd === -1) break;
      const grade = blockText.slice(keyStart + 1, keyEnd);
      const braceStart = blockText.indexOf("{", keyEnd);
      if (braceStart === -1) break;
      const braceEnd = findMatchingBrace(blockText, braceStart);
      if (braceEnd === -1) break;
      const bonusBlock = blockText.slice(braceStart + 1, braceEnd);
      if (grade) {
        result[grade] = parseNumberMap(bonusBlock);
      }
      idx = braceEnd + 1;
    }
    return result;
  };
  var loadStatCosts = async () => {
    try {
      const response = await fetch("./data/statCosts.ts", { cache: "no-store" });
      const text = await response.text();
      const match = text.match(/statCosts\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
      if (!match) return;
      statCostsByStat = parseNumberMap(match[1]);
    } catch (error) {
      statCostsByStat = {};
    }
  };
  var loadStatPoints = async () => {
    try {
      const response = await fetch("./data/statPoints.ts", { cache: "no-store" });
      const text = await response.text();
      const match = text.match(/statPointsByGrade\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
      if (!match) {
        statPointsByGrade = parseNumberMap(text);
      } else {
        statPointsByGrade = parseNumberMap(match[1]);
      }
      if (Object.keys(statPointsByGrade).length === 0) {
        statPointsByGrade = { ...defaultStatPoints };
      }
    } catch (error) {
      statPointsByGrade = { ...defaultStatPoints };
    }
  };
  var loadGradeOptions = async () => {
    const selects = getGradeSelects();
    if (selects.length === 0) return;
    try {
      const response = await fetch("./data/grades.ts", { cache: "no-store" });
      const text = await response.text();
      const listMatch = text.match(/gradeOptions\s*=\s*\[([\s\S]*?)\]/);
      const options = listMatch ? parseStringList(listMatch[1]) : [];
      if (options.length === 0) {
        throw new Error("No grade options found");
      }
      selects.forEach((select) => {
        select.innerHTML = "";
        options.forEach((grade) => {
          const option = document.createElement("option");
          option.value = grade;
          option.textContent = grade;
          select.appendChild(option);
        });
        if (!select.value && options.length > 0) {
          defaultGradeValue = options.includes("Uncommon") ? "Uncommon" : options[0];
          select.value = defaultGradeValue;
        }
      });
      if (options.length > 0 && !defaultGradeValue) {
        defaultGradeValue = options[0];
      }
      syncSelectValues("grade", selects[0]?.value || defaultGradeValue);
    } catch (error) {
      selects.forEach((select) => {
        select.innerHTML = "<option>Grades unavailable</option>";
      });
    }
  };
  var loadBackgroundOptions = async () => {
    const selects = getBackgroundSelects();
    if (selects.length === 0) return;
    try {
      const response = await fetch("./data/backgrounds.ts", { cache: "no-store" });
      const text = await response.text();
      const matches = Array.from(text.matchAll(/"([^"]+)":\s*\{/g));
      const options = matches.map((match) => match[1]).sort();
      if (options.length === 0) {
        throw new Error("No background options found");
      }
      selects.forEach((select) => {
        select.innerHTML = "";
        options.forEach((background) => {
          const option = document.createElement("option");
          option.value = background;
          option.textContent = background;
          select.appendChild(option);
        });
      });
      if (options.length > 0) {
        defaultBackgroundValue = options[0];
      }
    } catch (error) {
      selects.forEach((select) => {
        select.innerHTML = "<option>Backgrounds unavailable</option>";
      });
    }
  };
  var getBackgroundBlock = async (backgroundName) => {
    if (!backgroundSourceCache) {
      const response = await fetch("./data/backgrounds.ts", { cache: "no-store" });
      backgroundSourceCache = await response.text();
    }
    const escaped = backgroundName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const match = backgroundSourceCache.match(new RegExp(`"${escaped}"\\s*:\\s*\\{`));
    if (!match || match.index === void 0) return null;
    return extractObjectBlock(backgroundSourceCache, match.index);
  };
  var getBackgroundModifiers = async (backgroundName) => {
    const block = await getBackgroundBlock(backgroundName);
    if (!block) return {};
    const modifiersBlockMatch = block.match(/statModifiers\s*:\s*\{/);
    if (modifiersBlockMatch) {
      const modifiersBlock = extractObjectBlock(block, modifiersBlockMatch.index);
      if (modifiersBlock) {
        return parseNumberMap(modifiersBlock);
      }
    }
    const baseBlockMatch = block.match(/baseCharacteristics\s*:\s*\{/);
    if (baseBlockMatch) {
      const baseBlock = extractObjectBlock(block, baseBlockMatch.index);
      if (baseBlock) {
        const base = parseNumberMap(baseBlock);
        const bodyBase = base.SKILL ?? base.BODY ?? 0;
        const mindBase = base.PSIONICS ?? base.MIND ?? 0;
        return {
          BODY: bodyBase - baseCharacteristics.BODY,
          MIND: mindBase - baseCharacteristics.MIND,
          LUCK: (base.LUCK ?? 0) - baseCharacteristics.LUCK,
          HEALTH: (base.STAMINA ?? 0) - bodyBase * 2
        };
      }
    }
    return {};
  };
  var parseFeatureList = (blockText) => {
    const features = [];
    if (!blockText) return features;
    const objectBlocks = blockText.match(/\{[\s\S]*?\}/g) || [];
    objectBlocks.forEach((block) => {
      const nameMatch = block.match(/name\s*:\s*"([^"]+)"/);
      const variantMatch = block.match(/variantId\s*:\s*"([^"]+)"/);
      if (nameMatch) {
        features.push({
          id: nameMatch[1],
          name: nameMatch[1],
          variantId: variantMatch ? variantMatch[1] : void 0,
          isChoice: Boolean(variantMatch)
        });
      }
    });
    const textWithoutObjects = blockText.replace(/\{[\s\S]*?\}/g, "");
    parseStringList(textWithoutObjects).forEach((id) => {
      features.push({ id });
    });
    return features;
  };
  var getBackgroundFeatures = async (backgroundName) => {
    const block = await getBackgroundBlock(backgroundName);
    if (!block) return [];
    const featuresMatch = block.match(/features\s*:\s*\[([\s\S]*?)\]/);
    if (!featuresMatch) return [];
    return parseFeatureList(featuresMatch[1]);
  };
  var loadFeatures = async () => {
    try {
      const response = await fetch("./data/features.ts", { cache: "no-store" });
      const text = await response.text();
      featuresMap.clear();
      const featureBlockRegex = /\{\s*id:\s*['"]([^'"]+)['"]/g;
      let blockMatch;
      let loadedCount = 0;
      while ((blockMatch = featureBlockRegex.exec(text)) !== null) {
        const startPos = blockMatch.index;
        const id = blockMatch[1];
        if (!id) continue;
        let braceCount = 0;
        let inString = false;
        let stringChar = null;
        let endPos = startPos;
        for (let i = startPos; i < text.length; i++) {
          const char = text[i];
          const prevChar = i > 0 ? text[i - 1] : "";
          if (prevChar === "\\" && inString) {
            continue;
          }
          if ((char === '"' || char === "'") && !inString) {
            inString = true;
            stringChar = char;
          } else if (char === stringChar && inString) {
            inString = false;
            stringChar = null;
          }
          if (!inString) {
            if (char === "{") braceCount++;
            if (char === "}") {
              braceCount--;
              if (braceCount === 0) {
                endPos = i + 1;
                break;
              }
            }
          }
        }
        const block = text.substring(startPos, endPos);
        const nameMatch = block.match(/name:\s*['"]([^'"]+)['"]/);
        const emojiMatch = block.match(/emoji:\s*['"]([^'"]+)['"]/);
        const exclusiveCategoryMatch = block.match(/exclusiveCategory:\s*['"]([^'"]+)['"]/);
        const descriptionMatch = block.match(/description:\s*['"]([^'"]*(?:\\.[^'"]*)*)['"]/);
        const name = nameMatch ? nameMatch[1] : formatFeatureName(id);
        const emoji = emojiMatch ? emojiMatch[1] : "";
        const description = descriptionMatch ? descriptionMatch[1].replace(/\\'/g, "'").replace(/\\"/g, '"') : "";
        const exclusiveCategory = exclusiveCategoryMatch ? exclusiveCategoryMatch[1] : null;
        const costMatch = block.match(/cost:\s*(-?\d+)/);
        const cost = costMatch ? Number(costMatch[1]) : 0;
        const costTypeMatch = block.match(/costType:\s*['"]([^'"]+)['"]/);
        const costType = costTypeMatch ? costTypeMatch[1] : "none";
        const typeMatch = block.match(/type:\s*['"]([^'"]+)['"]/);
        const type = typeMatch ? typeMatch[1] : "talent";
        const mindValueMatch = block.match(/mindValue:\s*(\d+)/);
        const mindValue = mindValueMatch ? Number(mindValueMatch[1]) : null;
        const gradeMatch = block.match(/grade:\s*['"]([^'"]+)['"]/);
        const grade = gradeMatch ? gradeMatch[1] : null;
        const categoryMatch = block.match(/category:\s*['"]([^'"]+)['"]/);
        const category = categoryMatch ? categoryMatch[1] : null;
        let skillBonuses = null;
        const skillBonusesMatch = block.match(/skillBonuses:\s*\{([^}]+)\}/);
        if (skillBonusesMatch) {
          skillBonuses = {};
          const bonusesText = skillBonusesMatch[1];
          const bonusEntries = bonusesText.matchAll(/(?:['"])([^'"]+)(?:['"])\s*:\s*(\d+)/g);
          for (const entry of bonusEntries) {
            skillBonuses[entry[1]] = Number(entry[2]);
          }
        }
        featuresMap.set(id, {
          id,
          name,
          emoji,
          description,
          exclusiveCategory,
          cost,
          costType,
          type,
          mindValue,
          grade,
          category,
          skillBonuses
        });
        loadedCount++;
      }
      console.log(`Loaded ${loadedCount} features, ${featuresMap.size} total in map`);
      const purchasableCount = Array.from(featuresMap.values()).filter((f) => f.costType === "feature-points").length;
      console.log(`Found ${purchasableCount} features with costType 'feature-points'`);
    } catch (error) {
      console.error("Error loading features:", error);
      featuresMap.clear();
    }
  };
  var loadSkills = async () => {
    try {
      const response = await fetch("./data/skills.ts", { cache: "no-store" });
      const text = await response.text();
      const matches = Array.from(
        text.matchAll(/\{\s*name:\s*"([^"]+)",\s*category:\s*"([^"]+)"(?:,[^\n]*?emoji:\s*"([^"]+)")?/g)
      );
      skills = matches.map((match) => ({
        name: match[1],
        category: match[2],
        emoji: match[3] || ""
      }));
      populateSkillPickers();
      renderSkills();
    } catch (error) {
      skills = [];
    }
  };
  var loadSkillPoints = async () => {
    try {
      const response = await fetch("./data/skillPoints.ts", { cache: "no-store" });
      const text = await response.text();
      const pointsMatch = text.match(/skillPoints\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
      const maxMatch = text.match(/maxSkillRanks\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
      if (pointsMatch) {
        skillPointsByGrade = parseNumberMap(pointsMatch[1]);
      }
      if (maxMatch) {
        maxSkillRanksByGrade = parseNumberMap(maxMatch[1]);
      }
    } catch (error) {
      skillPointsByGrade = {};
      maxSkillRanksByGrade = {};
    }
    try {
      const featurePointsResponse = await fetch("./data/featurePoints.ts?t=" + Date.now(), { cache: "no-store" });
      if (featurePointsResponse.ok) {
        const featurePointsText = await featurePointsResponse.text();
        const featurePointsMatch = featurePointsText.match(/featurePoints\s*(?::[^=]+)?=\s*\{([\s\S]*?)\}/);
        if (featurePointsMatch) {
          featurePointsByGrade = parseNumberMap(featurePointsMatch[1]);
        }
      }
    } catch (error) {
    }
    if (Object.keys(featurePointsByGrade).length === 0) {
      featurePointsByGrade = {
        "Poor": 0,
        "Common": 2,
        "Uncommon": 4,
        "Rare": 6,
        "Epic": 8,
        "Legendary": 10,
        "Mythic": 12
      };
    }
  };
  var updateSkillPointsBadge = () => {
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = skillPointsByGrade[currentGrade] ?? 0;
    const spentPoints = getSkillSpentPoints();
    const skillsTitles = Array.from(document.querySelectorAll('[data-role="skills-title"]'));
    skillsTitles.forEach((title) => {
      const panel2 = title.closest(".tab-panel");
      const panelKey = panel2?.dataset?.tabPanel;
      if (panelKey === "sheet" || panelKey === "level-up") {
        title.textContent = "SKILLS";
        return;
      }
      title.textContent = `SKILLS (${formatPointsDecimal(spentPoints)}/${formatPointsDecimal(totalPoints)})`;
    });
    const inlineBadges = Array.from(
      document.querySelectorAll('[data-role="skill-points-inline"] .stat-value')
    );
    inlineBadges.forEach((valueEl) => {
      valueEl.textContent = `${formatPointsDecimal(spentPoints)}/${formatPointsDecimal(totalPoints)}`;
    });
  };
  var getSkillCost = (category) => {
    if (category === "Combat" || category === "Psionic") return 2;
    if (category === "Science") return 0.5;
    if (category === "Language") return 0.25;
    return 1;
  };
  var formatCostAsFraction = (cost) => {
    if (cost === 0.25) return "\xBC";
    if (cost === 0.5) return "\xBD";
    if (cost === 1) return "1";
    if (cost === 2) return "2";
    if (Number.isInteger(cost)) return String(cost);
    const tolerance = 1e-3;
    for (let denom = 1; denom <= 100; denom++) {
      for (let num = 1; num < denom; num++) {
        const fraction = num / denom;
        if (Math.abs(cost - fraction) < tolerance) {
          return `${num}/${denom}`;
        }
      }
    }
    return cost.toFixed(2);
  };
  var getSkillColor = (total) => {
    if (total <= 0) return null;
    if (total === 1) return "#ffffff";
    if (total === 2) return "#1eff00";
    if (total === 3) return "#0070dd";
    if (total === 4) return "#a335ee";
    if (total === 5) return "#e6cc80";
    return "#ffd100";
  };
  var formatPointsDecimal = (value) => {
    if (Number.isInteger(value)) return String(value);
    return value.toFixed(2);
  };
  var getSkillCategoryForName = (name) => {
    const skillInfo = skills.find((skill) => skill.name === name);
    if (skillInfo?.category) return skillInfo.category;
    const backgroundInfo = backgroundSkillModifiers.get(name);
    return backgroundInfo?.category || "Skill";
  };
  var getSkillsAtOrAboveRank = (rank) => {
    let count = 0;
    skillRanks.forEach((value) => {
      if (value >= rank) count += 1;
    });
    return count;
  };
  var canIncreaseSkill = (name, currentRank) => {
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const maxRank = maxSkillRanksByGrade[currentGrade] ?? 0;
    const category = getSkillCategoryForName(name);
    const cost = getSkillCost(category);
    const remainingPoints = getSkillRemainingPoints();
    const targetRank = currentRank + 1;
    if (targetRank > maxRank) {
      return { allowed: false, reason: `Max rank ${maxRank} for grade`, cost };
    }
    if (remainingPoints < cost) {
      return { allowed: false, reason: "Not enough skill points", cost };
    }
    if (targetRank > 1) {
      const requiredRank = targetRank - 1;
      const count = getSkillsAtOrAboveRank(requiredRank);
      if (count < 2) {
        return {
          allowed: false,
          reason: `Need two rank ${requiredRank} skills first`,
          cost
        };
      }
    }
    return { allowed: true, reason: `Cost to increase: ${cost}`, cost };
  };
  var getSkillSpentPoints = () => {
    let total = 0;
    skillRanks.forEach((rank, name) => {
      const category = getSkillCategoryForName(name);
      total += rank * getSkillCost(category);
    });
    return total;
  };
  var getFeatureSpentPoints = () => {
    let total = 0;
    purchasedFeatures.forEach((featureId) => {
      const featureDef = featuresMap.get(featureId);
      if (featureDef && featureDef.costType === "feature-points") {
        total += featureDef.cost || 0;
      }
    });
    return total;
  };
  var updateFeaturePointsBadge = () => {
    try {
      const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
      const totalPoints = featurePointsByGrade[currentGrade] ?? 0;
      const spentPoints = getFeatureSpentPoints();
      const featuresTitles = Array.from(document.querySelectorAll('[data-role="features-title"]'));
      const isEditMode = activePanelKey() === "edit";
      featuresTitles.forEach((title) => {
        if (isEditMode) {
          title.textContent = `FEATURES (${spentPoints}/${totalPoints})`;
        } else {
          title.textContent = "FEATURES";
        }
      });
      const inlineBadges = Array.from(
        document.querySelectorAll('[data-role="feature-points-inline"] .stat-value')
      );
      inlineBadges.forEach((valueEl) => {
        if (valueEl) valueEl.textContent = `${spentPoints}/${totalPoints}`;
      });
    } catch (error) {
      console.error("Error updating feature points badge:", error);
    }
  };
  var getAllOwnedFeatures = () => {
    const owned = /* @__PURE__ */ new Set();
    if (backgroundFeatures) {
      backgroundFeatures.forEach((feature) => {
        const featureId = typeof feature === "string" ? feature : feature.id;
        owned.add(featureId);
      });
    }
    purchasedFeatures.forEach((featureId) => {
      owned.add(featureId);
    });
    return owned;
  };
  var canPurchaseFeature = (featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (!featureDef) return { allowed: false, reason: "Feature not found" };
    const owned = getAllOwnedFeatures();
    if (owned.has(featureId)) {
      return { allowed: false, reason: "Already owned" };
    }
    if (featureDef.costType !== "feature-points") {
      return { allowed: false, reason: "Not purchasable with feature points" };
    }
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = featurePointsByGrade[currentGrade] ?? 0;
    const spentPoints = getFeatureSpentPoints();
    const cost = featureDef.cost || 0;
    const remainingPoints = totalPoints - spentPoints;
    if (remainingPoints < cost) {
      return { allowed: false, reason: "Not enough feature points", cost };
    }
    return { allowed: true, reason: `Cost: ${cost} feature points`, cost };
  };
  var purchaseFeature = (featureId, selection = null) => {
    const status = canPurchaseFeature(featureId);
    if (status.allowed) {
      purchasedFeatures.add(featureId);
      if (selection !== null) {
        featureSelections.set(featureId, selection);
      }
      renderFeatures();
      updateFeaturePointsBadge();
      populateFeatureCategoryPicker();
      schedulePersist();
      return true;
    }
    return false;
  };
  var showFeatureSelectionPopup = (featureId) => {
    const featureDef = featuresMap.get(featureId);
    if (!featureDef || !featureDef.requiresSelection) return false;
    const picker = document.querySelector('[data-role="feature-selection-picker"]');
    if (!picker) return false;
    const titleEl = picker.querySelector('[data-role="feature-selection-title"]');
    const bodyEl = picker.querySelector('[data-role="feature-selection-body"]');
    if (!titleEl || !bodyEl) return false;
    picker.dataset.featureId = featureId;
    titleEl.textContent = `Select ${featureDef.name} Option`;
    bodyEl.innerHTML = "";
    if (featureDef.selectionType === "enemy-type") {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.marginBottom = "1rem";
      label.innerHTML = `<span style="display: block; margin-bottom: 0.5rem; color: rgba(255, 255, 255, 0.9);">Select Enemy Type:</span>`;
      const select = document.createElement("select");
      select.className = "field__control";
      select.style.width = "100%";
      select.dataset.role = "enemy-type-select";
      const enemyTypes = [
        "Goblin",
        "Hill Giant",
        "Marsh Goblin",
        "Mountain Giant",
        "Orc",
        "Troll",
        "Dragon",
        "Demon",
        "Undead",
        "Beast",
        "Alien",
        "Robot",
        "Android",
        "Klingon",
        "Romulan",
        "Cardassian",
        "Borg",
        "Other"
      ];
      const defaultOption = document.createElement("option");
      defaultOption.value = "";
      defaultOption.textContent = "-- Select Enemy Type --";
      select.appendChild(defaultOption);
      enemyTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        select.appendChild(option);
      });
      label.appendChild(select);
      bodyEl.appendChild(label);
    }
    picker.hidden = false;
    return true;
  };
  var closeFeatureSelectionPopup = () => {
    const picker = document.querySelector('[data-role="feature-selection-picker"]');
    if (picker) {
      picker.hidden = true;
      picker.dataset.featureId = "";
    }
  };
  var removeFeature = (featureId) => {
    if (purchasedFeatures.has(featureId)) {
      purchasedFeatures.delete(featureId);
      featureSelections.delete(featureId);
      renderFeatures();
      updateFeaturePointsBadge();
      populateFeatureCategoryPicker();
      schedulePersist();
      return true;
    }
    return false;
  };
  var populateFeatureCategoryPicker = () => {
    const categories = /* @__PURE__ */ new Set();
    let purchasableCount = 0;
    featuresMap.forEach((featureDef, featureId) => {
      if (featureDef.costType === "feature-points") {
        purchasableCount++;
        const category = featureDef.category || skillCategoryOrder[0];
        if (skillCategoryOrder.includes(category)) {
          categories.add(category);
        }
      }
    });
    const sortedCategories = Array.from(categories).sort((a, b) => {
      const aIndex = skillCategoryOrder.indexOf(a);
      const bIndex = skillCategoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    getFeatureCategoryPickers().forEach((picker) => {
      const categoryGrid = picker.querySelector('[data-role="feature-category-buttons"]');
      if (!(categoryGrid instanceof HTMLElement)) {
        return;
      }
      categoryGrid.innerHTML = "";
      sortedCategories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "skill-category-button";
        button.dataset.role = "feature-category-button";
        button.dataset.category = category;
        const emoji = skillCategoryEmojis[category] || "\u2728";
        const availableFeatures = Array.from(featuresMap.entries()).filter(([featureId, featureDef]) => {
          if (featureDef.costType !== "feature-points") return false;
          const featureCategory = featureDef.category || skillCategoryOrder[0];
          if (featureCategory !== category) return false;
          return !purchasedFeatures.has(featureId);
        });
        const featureCount = availableFeatures.length;
        button.innerHTML = `<span class="skill-emoji">${emoji}</span><span>${category}</span><span class="skill-cost">(${featureCount} feature${featureCount !== 1 ? "s" : ""})</span>`;
        categoryGrid.appendChild(button);
      });
    });
    updateFeaturePointsBadge();
  };
  var populateFeatureListPicker = (category) => {
    getFeatureListPickers().forEach((picker) => {
      const featureList = picker.querySelector('[data-role="feature-list"]');
      if (!(featureList instanceof HTMLElement)) {
        return;
      }
      featureList.innerHTML = "";
      const purchasableFeatures = [];
      featuresMap.forEach((featureDef, featureId) => {
        if (featureDef.costType === "feature-points") {
          const featureCategory = featureDef.category || skillCategoryOrder[0];
          if (featureCategory === category) {
            purchasableFeatures.push({ id: featureId, ...featureDef });
          }
        }
      });
      purchasableFeatures.sort((a, b) => a.name.localeCompare(b.name));
      purchasableFeatures.forEach((feature) => {
        const purchaseStatus = canPurchaseFeature(feature.id);
        const isDisabled = !purchaseStatus.allowed;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "skill-picker-item";
        if (isDisabled) {
          button.classList.add("skill-picker-item--disabled");
          button.disabled = true;
        }
        button.dataset.role = "feature-item";
        button.dataset.feature = feature.id;
        const costText = feature.cost !== void 0 ? `${feature.cost >= 0 ? "+" : ""}${feature.cost}` : "0";
        const emoji = feature.emoji || "\u2728";
        const tooltipParts = [];
        if (purchaseStatus.reason) {
          tooltipParts.push(purchaseStatus.reason);
        }
        if (feature.description) {
          tooltipParts.push(feature.description);
        }
        button.title = tooltipParts.join("\n\n");
        button.innerHTML = `
        <div class="skill-picker-item-title">
          <span class="skill-emoji">${emoji}</span>
          <span>${feature.name}</span>
          <span style="margin-left: auto; color: rgba(255, 255, 255, 0.6); font-size: 0.75rem;">${costText} pts</span>
        </div>
      `;
        featureList.appendChild(button);
      });
    });
    updateFeaturePointsBadge();
  };
  var getSkillRemainingPoints = () => {
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = skillPointsByGrade[currentGrade] ?? 0;
    const spentPoints = getSkillSpentPoints();
    return totalPoints - spentPoints;
  };
  var getBackgroundSkillModifiers = async (backgroundName) => {
    const block = await getBackgroundBlock(backgroundName);
    if (!block) return /* @__PURE__ */ new Map();
    const match = block.match(/skillModifiers\s*:\s*\[([\s\S]*?)\]/);
    if (!match) return /* @__PURE__ */ new Map();
    const entries = Array.from(
      match[1].matchAll(/\{\s*name:\s*"([^"]+)",\s*section:\s*"([^"]+)",\s*modifier:\s*(-?\d+)\s*\}/g)
    );
    const sectionMap = {
      combat: "Combat",
      movement: "Movement",
      stealth: "Stealth",
      knowledge: "Knowledge",
      science: "Science",
      psionic: "Psionic"
    };
    const result = /* @__PURE__ */ new Map();
    entries.forEach((entry) => {
      const name = entry[1];
      const section = entry[2];
      const modifier = Number(entry[3]);
      const category = sectionMap[section] || section;
      result.set(name, { modifier, category });
    });
    return result;
  };
  var calculateMoveFromLegFeatures = (features) => {
    if (!features || features.length === 0) return 4;
    let baseMove = 4;
    let hasTrotterFeet = false;
    for (const feature of features) {
      const featureId = typeof feature === "string" ? feature : feature.id;
      if (featureId === "hexapod-crystalline") {
        return 5;
      }
      if (featureId === "legs-humanoid") {
        baseMove = 4;
      }
      if (featureId === "feet-trotter") {
        hasTrotterFeet = true;
      }
    }
    if (hasTrotterFeet) {
      baseMove -= 1;
    }
    return baseMove;
  };
  var updateStatsForBackground = async (backgroundName) => {
    if (!backgroundName || statBadgeMaps.size === 0) return;
    backgroundSourceCache = null;
    currentBackgroundName = backgroundName;
    const modifiers = await getBackgroundModifiers(backgroundName);
    currentStatModifiers = modifiers;
    backgroundSkillModifiers = await getBackgroundSkillModifiers(backgroundName);
    backgroundFeatures = await getBackgroundFeatures(backgroundName);
    let mindFromBrain = null;
    if (backgroundFeatures) {
      for (const feature of backgroundFeatures) {
        const featureId = typeof feature === "string" ? feature : feature.id;
        const featureDef = featuresMap.get(featureId);
        if (featureDef && featureDef.exclusiveCategory === "brain" && featureDef.mindValue !== null && featureDef.mindValue !== void 0) {
          mindFromBrain = featureDef.mindValue;
          break;
        }
      }
    }
    if (mindFromBrain === null) {
      purchasedFeatures.forEach((featureId) => {
        const featureDef = featuresMap.get(featureId);
        if (featureDef && featureDef.exclusiveCategory === "brain" && featureDef.mindValue !== null && featureDef.mindValue !== void 0) {
          mindFromBrain = featureDef.mindValue;
        }
      });
    }
    const body = baseCharacteristics.BODY + (modifiers.BODY ?? 0);
    const mind = mindFromBrain !== null ? mindFromBrain : baseCharacteristics.MIND + (modifiers.MIND ?? 0);
    const luck = baseCharacteristics.LUCK + (modifiers.LUCK ?? 0);
    const move = calculateMoveFromLegFeatures(backgroundFeatures);
    const power = mind * 2;
    const attacks = modifiers.ATTACKS ?? 0;
    let healthMultiplier = 2;
    const allOwnedFeatures = getAllOwnedFeatures();
    allOwnedFeatures.forEach((featureId) => {
      const featureDef = featuresMap.get(featureId);
      if (featureDef?.healthMultiplier) {
        healthMultiplier = featureDef.healthMultiplier;
      }
    });
    const health = body * healthMultiplier + (modifiers.HEALTH ?? 0);
    const nextInitials = {
      BODY: body,
      MIND: mind,
      LUCK: luck,
      MOVE: move,
      POWER: power,
      ATTACKS: attacks,
      HEALTH: health
    };
    Object.entries(nextInitials).forEach(([name, initial]) => {
      const previous = statState.get(name);
      const previousInitial = previous ? previous.initial : initial;
      const previousCurrent = previous ? previous.current : initial;
      const delta = initial - previousInitial;
      const current = previousCurrent + delta;
      statState.set(name, { initial, current });
      statBadgeMaps.forEach((map) => {
        const valueEl = map.get(name);
        if (valueEl) {
          valueEl.textContent = `${current}/${initial}`;
        }
      });
    });
    updateStatPointsBadges();
    updateAdjusterStates();
    renderSkills();
    renderFeatures();
    populateFeatureCategoryPicker();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    populateSkillPickers();
  };
  var getStatInitial = (name) => {
    return statState.get(name)?.initial ?? 0;
  };
  var setStatState = (name, initial) => {
    const previous = statState.get(name);
    const previousInitial = previous ? previous.initial : initial;
    const previousCurrent = previous ? previous.current : initial;
    const delta = initial - previousInitial;
    const current = previousCurrent + delta;
    statState.set(name, { initial, current });
    statBadgeMaps.forEach((map) => {
      const valueEl = map.get(name);
      if (valueEl) {
        valueEl.textContent = `${current}/${initial}`;
        applyStatBadgeColor(valueEl, name, initial);
      }
    });
    schedulePersist();
  };
  var getStatColorIndex = (statName, value) => {
    if (statName === "BODY" || statName === "MIND") {
      if (value <= 5) return 0;
      return Math.min(6, value - 5);
    }
    if (statName === "LUCK") {
      if (value <= 8) return 0;
      return Math.min(6, value - 8);
    }
    if (statName === "HEALTH" || statName === "POWER") {
      if (value <= 11) return 0;
      const index = Math.floor((value - 12) / 2) + 1;
      return Math.min(6, Math.max(0, index));
    }
    return null;
  };
  var applyStatBadgeColor = (valueEl, statName, value) => {
    const badge = valueEl.closest(".stat-badge");
    if (!badge) return;
    const index = getStatColorIndex(statName, value);
    const grade = getGradeSelects()[0]?.value;
    const gradeColor = grade ? gradeColors[grade] : null;
    if (index === null) {
      if (["ATTACKS", "MOVE"].includes(statName)) {
        badge.style.borderColor = "#ffffff";
        badge.style.color = "#ffffff";
        return;
      }
      badge.style.borderColor = gradeColor || "";
      badge.style.color = gradeColor || "";
      return;
    }
    const color = statColorScale[index] || gradeColors.Poor;
    badge.style.borderColor = color;
    badge.style.color = color;
  };
  var refreshStatBadgeColors = () => {
    statBadgeMaps.forEach((map) => {
      map.forEach((valueEl, statName) => {
        const currentInitial = statState.get(statName)?.initial ?? 0;
        applyStatBadgeColor(valueEl, statName, currentInitial);
      });
    });
  };
  var getSkillBaseStat = (skillName) => {
    const skillInfo = skills.find((s) => s.name === skillName);
    if (!skillInfo) return null;
    const category = skillInfo.category;
    if (category === "Language") {
      return null;
    }
    if (category === "Combat" || category === "Stealth" || category === "Movement" || category === "Pilot") {
      return "BODY";
    } else {
      return "MIND";
    }
  };
  var recomputeDerivedStats = () => {
    const body = getStatInitial("BODY");
    const mind = getStatInitial("MIND");
    let healthMultiplier = 2;
    const allOwnedFeatures = getAllOwnedFeatures();
    allOwnedFeatures.forEach((featureId) => {
      const featureDef = featuresMap.get(featureId);
      if (featureDef?.healthMultiplier) {
        healthMultiplier = featureDef.healthMultiplier;
      }
    });
    const health = body * healthMultiplier + (currentStatModifiers.HEALTH ?? 0);
    const power = mind * 2;
    const move = calculateMoveFromLegFeatures(backgroundFeatures);
    setStatState("HEALTH", health);
    setStatState("POWER", power);
    setStatState("MOVE", move);
    setStatState("ATTACKS", currentStatModifiers.ATTACKS ?? 0);
  };
  var getSpentPoints = () => {
    const adjustables = ["BODY", "MIND", "LUCK"];
    return adjustables.reduce((total, statName) => {
      const base = baseCharacteristics[statName] ?? 0;
      const modifier = currentStatModifiers[statName] ?? 0;
      const currentInitial = getStatInitial(statName);
      const cost = statCostsByStat[statName] ?? 0;
      const baseWithModifier = base + modifier;
      const delta = Math.max(0, currentInitial - baseWithModifier);
      return total + delta * cost;
    }, 0);
  };
  var updateStatPointsBadges = () => {
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    if (!currentGrade) return;
    const totalPoints = statPointsByGrade[currentGrade] ?? 0;
    const spentPoints = getSpentPoints();
    const statsTitles = Array.from(document.querySelectorAll('[data-role="stats-title"]'));
    statsTitles.forEach((title) => {
      const panel2 = title.closest(".tab-panel");
      const panelKey = panel2?.dataset?.tabPanel;
      if (panelKey === "sheet" || panelKey === "level-up") {
        title.textContent = "STATS";
        return;
      }
      title.textContent = `STATS (${spentPoints}/${totalPoints})`;
    });
  };
  var updateAdjusterStates = () => {
    const statBadges = Array.from(
      document.querySelectorAll('[data-role="stat-badge-adjustable"]')
    );
    const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
    const totalPoints = statPointsByGrade[currentGrade] ?? 0;
    const spentPoints = getSpentPoints();
    const remaining = totalPoints - spentPoints;
    const gradeBonuses = gradeMaxBonusesByGrade[currentGrade] || defaultGradeMaxBonuses[currentGrade] || {};
    statBadges.forEach((badge) => {
      const stat = badge.dataset.stat;
      if (!stat) return;
      const base = baseCharacteristics[stat] ?? 0;
      const currentInitial = getStatInitial(stat);
      const cost = statCostsByStat[stat] ?? 0;
      const bonusCap = gradeBonuses[stat] ?? gradeBonuses.MIND ?? 0;
      const maxValue = base + bonusCap;
      const minValue = base;
      const canIncrease = remaining >= cost && currentInitial < maxValue;
      const canDecrease = currentInitial > minValue;
      let tooltip = `${stat}: ${currentInitial}/${currentInitial}`;
      if (canIncrease) {
        tooltip += `

Left click: Increase (cost: ${cost} pts)`;
      } else if (currentInitial >= maxValue) {
        tooltip += `

Cannot increase: Maximum value reached (${maxValue})`;
      } else {
        tooltip += `

Cannot increase: Insufficient stat points (need ${cost}, have ${remaining})`;
      }
      if (canDecrease) {
        tooltip += `

Right click: Decrease`;
      } else {
        tooltip += `

Cannot decrease: Minimum value (${minValue})`;
      }
      badge.title = tooltip;
    });
  };
  var loadStatsBadges = async () => {
    const badgeContainers = getStatsBadges();
    if (badgeContainers.length === 0) return;
    try {
      const indexResponse = await fetch("./characteristics/index.json", { cache: "no-store" });
      const indexData = await indexResponse.json();
      const files = indexData.files || indexData;
      const stats = [];
      for (const file of files) {
        const cleanPath = String(file).replace(/^characteristics\//, "");
        const response = await fetch(`./characteristics/${cleanPath}`, { cache: "no-store" });
        if (!response.ok) continue;
        const data = await response.json();
        stats.push(data);
      }
      const baseStatsOrder = ["BODY", "MIND", "LUCK"];
      const derivedStatsOrder = ["HEALTH", "POWER", "ATTACKS", "MOVE"];
      const allStatsOrder = [...baseStatsOrder, ...derivedStatsOrder];
      stats.sort((a, b) => {
        const aIndex = allStatsOrder.indexOf(a.name);
        const bIndex = allStatsOrder.indexOf(b.name);
        if (aIndex !== -1 || bIndex !== -1) {
          return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
        }
        return a.name.localeCompare(b.name);
      });
      const baseStats = stats.filter((s) => baseStatsOrder.includes(s.name));
      const derivedStats = stats.filter((s) => derivedStatsOrder.includes(s.name));
      badgeContainers.forEach((container, index) => {
        container.innerHTML = "";
        statBadgeMaps.set(index, /* @__PURE__ */ new Map());
      });
      const derivedBadgeContainers = getDerivedStatsBadges();
      derivedBadgeContainers.forEach((container) => {
        container.innerHTML = "";
      });
      statState.clear();
      baseStats.forEach((stat) => {
        badgeContainers.forEach((container, index) => {
          const badge = document.createElement("div");
          badge.className = "stat-badge";
          badge.dataset.statName = stat.name;
          badge.innerHTML = `
          <span class="stat-emoji">${stat.emoji || "\u2B50"}</span>
          <span class="stat-name">${stat.name}</span>
          <span class="stat-value">0/0</span>
        `;
          if (["BODY", "MIND", "LUCK"].includes(stat.name)) {
            badge.dataset.role = "stat-badge-adjustable";
            badge.dataset.stat = stat.name;
            badge.style.cursor = "pointer";
          }
          const valueEl = badge.querySelector(".stat-value");
          if (valueEl) {
            const map = statBadgeMaps.get(index);
            map?.set(stat.name, valueEl);
            statState.set(stat.name, { initial: 0, current: 0 });
          }
          container.appendChild(badge);
        });
      });
      badgeContainers.forEach((container, index) => {
        const xpBadge = document.createElement("div");
        xpBadge.className = "stat-badge stat-badge--xp";
        xpBadge.dataset.role = "stat-xp";
        xpBadge.innerHTML = `
        <span class="stat-emoji">\u2728</span>
        <span class="stat-name">XP</span>
        <span class="stat-value">0</span>
      `;
        container.appendChild(xpBadge);
      });
      derivedStats.forEach((stat) => {
        derivedBadgeContainers.forEach((container, index) => {
          const badge = document.createElement("div");
          badge.className = "stat-badge";
          badge.dataset.statName = stat.name;
          badge.innerHTML = `
          <span class="stat-emoji">${stat.emoji || "\u2B50"}</span>
          <span class="stat-name">${stat.name}</span>
          <span class="stat-value">0/0</span>
        `;
          const valueEl = badge.querySelector(".stat-value");
          if (valueEl) {
            const map = statBadgeMaps.get(index);
            map?.set(stat.name, valueEl);
            statState.set(stat.name, { initial: 0, current: 0 });
          }
          container.appendChild(badge);
        });
      });
    } catch (error) {
      badgeContainers.forEach((container) => {
        container.innerHTML = "<p>Stats unavailable.</p>";
      });
    }
  };
  var populateSkillPickers = () => {
    const categories = Array.from(new Set(skills.map((s) => s.category))).sort((a, b) => {
      const aIndex = skillCategoryOrder.indexOf(a);
      const bIndex = skillCategoryOrder.indexOf(b);
      if (aIndex === -1 && bIndex === -1) return a.localeCompare(b);
      if (aIndex === -1) return 1;
      if (bIndex === -1) return -1;
      return aIndex - bIndex;
    });
    getSkillCategoryPickers().forEach((picker) => {
      const categoryGrid = picker.querySelector('[data-role="skill-category-buttons"]');
      if (!(categoryGrid instanceof HTMLElement)) {
        return;
      }
      categoryGrid.innerHTML = "";
      categories.forEach((category) => {
        const button = document.createElement("button");
        button.type = "button";
        button.className = "skill-category-button";
        button.dataset.role = "skill-category-button";
        button.dataset.category = category;
        const emoji = skillCategoryEmojis[category] || "\u2728";
        const cost = getSkillCost(category);
        const costText = formatCostAsFraction(cost);
        const availableSkills = skills.filter((s) => {
          if (s.category !== category) return false;
          const hasRank = (skillRanks.get(s.name) || 0) > 0 || purchasedSkills.has(s.name);
          return !hasRank;
        });
        const skillCount = availableSkills.length;
        button.innerHTML = `<span class="skill-emoji">${emoji}</span><span>${category}</span><span class="skill-cost">(${costText} Pts) - ${skillCount} skill${skillCount !== 1 ? "s" : ""}</span>`;
        categoryGrid.appendChild(button);
      });
    });
  };
  var populateSkillList = (category) => {
    getSkillListPickers().forEach((picker) => {
      const skillList = picker.querySelector('[data-role="skill-list"]');
      if (!(skillList instanceof HTMLElement)) {
        return;
      }
      picker.dataset.selectedCategory = category;
      const filteredSkills = skills.filter((s) => {
        if (s.category !== category) return false;
        return true;
      });
      skillList.innerHTML = "";
      filteredSkills.forEach((skill) => {
        const rank = skillRanks.get(skill.name) || 0;
        const backgroundMod = backgroundSkillModifiers.get(skill.name)?.modifier || 0;
        let featureMod = 0;
        const ownedFeatures = getAllOwnedFeatures();
        ownedFeatures.forEach((featureId) => {
          const featureDef = featuresMap.get(featureId);
          if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skill.name]) {
            featureMod += featureDef.skillBonuses[skill.name];
          }
        });
        const modifier = backgroundMod + featureMod;
        const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
        const button = document.createElement("button");
        button.type = "button";
        button.className = "skill-picker-item";
        button.dataset.role = "skill-item-picker";
        button.dataset.skill = skill.name;
        button.style.cursor = "pointer";
        const increaseStatus = canIncreaseSkill(skill.name, rank);
        const canIncrease = increaseStatus.allowed;
        const canDecrease = rank > 0;
        const tooltipText = skill.description || "";
        const actionText = canIncrease ? `Left click: Add/increase (cost: ${increaseStatus.cost} pts)` : increaseStatus.reason;
        const decreaseText = canDecrease ? `Right click: Decrease rank` : "";
        const tooltipLines = tooltipText ? [tooltipText] : [];
        if (actionText) tooltipLines.push(actionText);
        if (decreaseText) tooltipLines.push(decreaseText);
        button.title = tooltipLines.join("\n\n");
        let skillColor;
        if (rank === 0) {
          skillColor = "#9d9d9d";
        } else {
          skillColor = getSkillColor(rank);
        }
        button.style.borderColor = skillColor;
        button.style.color = skillColor;
        button.innerHTML = `
        <div class="skill-picker-item-title">
          <span class="skill-emoji">${skill.emoji || "\u2728"}</span>
          <span>${skill.name}</span>
          <span style="margin-left: auto; color: rgba(255, 255, 255, 0.8); font-size: 0.9rem;">${rankModText}</span>
        </div>
        <div class="skill-picker-item-desc">${skill.description || ""}</div>
      `;
        skillList.appendChild(button);
      });
    });
  };
  var renderSkills = () => {
    const lists = getSkillsLists();
    if (lists.length === 0) return;
    lists.forEach((list) => {
      list.innerHTML = "";
    });
    renderFeatures();
    const combined = /* @__PURE__ */ new Map();
    backgroundSkillModifiers.forEach((value, name) => {
      combined.set(name, {
        name,
        modifier: value.modifier,
        category: value.category,
        rank: 0,
        emoji: ""
      });
    });
    const ownedFeatures = getAllOwnedFeatures();
    ownedFeatures.forEach((featureId) => {
      const featureDef = featuresMap.get(featureId);
      if (featureDef && featureDef.skillBonuses) {
        Object.entries(featureDef.skillBonuses).forEach(([skillName, bonus]) => {
          const existing = combined.get(skillName) || { name: skillName, modifier: 0, category: "", rank: 0, emoji: "" };
          existing.modifier = (existing.modifier || 0) + bonus;
          combined.set(skillName, existing);
        });
      }
    });
    skillRanks.forEach((rank, name) => {
      const existing = combined.get(name) || { name, modifier: 0, category: "", rank: 0, emoji: "" };
      combined.set(name, { ...existing, rank });
    });
    const listItems = Array.from(combined.values()).filter((skill) => {
      const isPurchased = purchasedSkills.has(skill.name);
      if (skill.modifier === 0 && skill.rank <= 0 && !isPurchased) return false;
      return true;
    });
    const skillsByCategory = /* @__PURE__ */ new Map();
    listItems.forEach((skill) => {
      const skillInfo = skills.find((s) => s.name === skill.name);
      const category = skillInfo?.category || skill.category || "Skill";
      if (!skillsByCategory.has(category)) {
        skillsByCategory.set(category, []);
      }
      skillsByCategory.get(category).push(skill);
    });
    skillsByCategory.forEach((categorySkills) => {
      categorySkills.sort((a, b) => a.name.localeCompare(b.name));
    });
    const extraCategories = Array.from(skillsByCategory.keys()).filter(
      (cat) => !skillCategoryOrder.includes(cat)
    ).sort((a, b) => a.localeCompare(b));
    skillCategoryOrder.forEach((category) => {
      const categorySkills = skillsByCategory.get(category) || [];
      const categoryEmoji = skillCategoryEmojis[category] || "\u2728";
      lists.forEach((list, index) => {
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        if (!isSheetView) {
          const categoryBadge = document.createElement("div");
          categoryBadge.className = "skill-category-badge";
          categoryBadge.title = category;
          categoryBadge.dataset.role = "skill-category-badge";
          categoryBadge.dataset.category = category;
          categoryBadge.style.cursor = "pointer";
          categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
          list.appendChild(categoryBadge);
        }
      });
      categorySkills.forEach((skill) => {
        const skillInfo = skills.find((s) => s.name === skill.name);
        const emoji = skillInfo?.emoji || "";
        const category2 = skillInfo?.category || skill.category || "Skill";
        const description = skillInfo?.description || "";
        const rank = skill.rank || 0;
        const modifier = skill.modifier || 0;
        const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
        const increaseStatus = canIncreaseSkill(skill.name, skill.rank);
        const canIncrease = increaseStatus.allowed;
        const canDecrease = skill.rank > 0;
        const increaseTitle = canIncrease ? `Cost to increase: ${increaseStatus.cost}` : increaseStatus.reason;
        const decreaseTitle = canDecrease ? "Decrease rank" : "No rank to remove";
        lists.forEach((list, index) => {
          const badge = document.createElement("div");
          badge.className = "skill-badge";
          const isSheetView = index === 0 || activePanelKey() === "sheet";
          const rank2 = skill.rank || 0;
          const modifier2 = skill.modifier || 0;
          const baseStatName = getSkillBaseStat(skill.name);
          let baseStatValue = 0;
          if (baseStatName) {
            baseStatValue = getStatInitial(baseStatName);
          }
          const total = baseStatValue + modifier2 + rank2;
          const calcParts = [];
          if (baseStatName) calcParts.push(`${baseStatName} ${baseStatValue}`);
          if (modifier2 !== 0) {
            const modSign = modifier2 > 0 ? "+" : "";
            calcParts.push(`Modifier ${modSign}${modifier2}`);
          }
          if (rank2 > 0) calcParts.push(`Rank ${rank2}`);
          const calcText = calcParts.length > 0 ? `

Calculation: ${calcParts.join(" + ")} = ${total}` : `

Total: ${total}`;
          const safeDescription = description ? description.replace(/`/g, "'") : "";
          const tooltipText = safeDescription ? `${safeDescription}${calcText}` : `${category2} Skill${calcText}`;
          if (isSheetView) {
            badge.innerHTML = `
          <span class="stat-emoji">${emoji}</span>
          <span class="stat-name">${skill.name}</span>
          <span class="skill-badge-total">${total}</span>
        `;
          } else {
            badge.dataset.role = "skill-badge";
            badge.dataset.skill = skill.name;
            badge.style.cursor = "pointer";
            badge.title = tooltipText + (canIncrease ? `

Left click: ${increaseTitle}` : "") + (canDecrease ? `

Right click: ${decreaseTitle}` : "");
            badge.innerHTML = `
          <span class="stat-emoji">${emoji}</span>
          <span class="stat-name">${skill.name}</span>
          <span class="skill-badge-rank-mod">${rankModText}</span>
        `;
          }
          let colorValue;
          let color;
          if (isSheetView) {
            if (total <= 6) {
              color = "#9d9d9d";
            } else {
              colorValue = total - 6;
              color = getSkillColor(colorValue);
            }
          } else {
            colorValue = rank2;
            color = getSkillColor(colorValue);
          }
          if (color) {
            badge.style.borderColor = color;
            badge.style.color = color;
          }
          badge.title = tooltipText;
          list.appendChild(badge);
        });
      });
    });
    extraCategories.forEach((category) => {
      const categorySkills = skillsByCategory.get(category) || [];
      const categoryEmoji = skillCategoryEmojis[category] || "\u2728";
      lists.forEach((list, index) => {
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        if (!isSheetView) {
          const categoryBadge = document.createElement("div");
          categoryBadge.className = "skill-category-badge";
          categoryBadge.title = category;
          categoryBadge.dataset.role = "skill-category-badge";
          categoryBadge.dataset.category = category;
          categoryBadge.style.cursor = "pointer";
          categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
          list.appendChild(categoryBadge);
        }
      });
      categorySkills.forEach((skill) => {
        const skillInfo = skills.find((s) => s.name === skill.name);
        const emoji = skillInfo?.emoji || "";
        const category2 = skillInfo?.category || skill.category || "Skill";
        const description = skillInfo?.description || "";
        const rank = skill.rank || 0;
        const modifier = skill.modifier || 0;
        const rankModText = `${rank}/${modifier > 0 ? "+" : ""}${modifier}`;
        const increaseStatus = canIncreaseSkill(skill.name, skill.rank);
        const canIncrease = increaseStatus.allowed;
        const canDecrease = skill.rank > 0;
        const increaseTitle = canIncrease ? `Cost to increase: ${increaseStatus.cost}` : increaseStatus.reason;
        const decreaseTitle = canDecrease ? "Decrease rank" : "No rank to remove";
        lists.forEach((list, index) => {
          const badge = document.createElement("div");
          badge.className = "skill-badge";
          const isSheetView = index === 0 || activePanelKey() === "sheet";
          const rank2 = skill.rank || 0;
          const modifier2 = skill.modifier || 0;
          const baseStatName = getSkillBaseStat(skill.name);
          let baseStatValue = 0;
          if (baseStatName) {
            baseStatValue = getStatInitial(baseStatName);
          }
          const total = baseStatValue + modifier2 + rank2;
          const calcParts = [];
          if (baseStatName) calcParts.push(`${baseStatName} ${baseStatValue}`);
          if (modifier2 !== 0) {
            const modSign = modifier2 > 0 ? "+" : "";
            calcParts.push(`Modifier ${modSign}${modifier2}`);
          }
          if (rank2 > 0) calcParts.push(`Rank ${rank2}`);
          const calcText = calcParts.length > 0 ? `

Calculation: ${calcParts.join(" + ")} = ${total}` : `

Total: ${total}`;
          const safeDescription = description ? description.replace(/`/g, "'") : "";
          const tooltipText = safeDescription ? `${safeDescription}${calcText}` : `${category2} Skill${calcText}`;
          if (isSheetView) {
            badge.innerHTML = `
            <span class="stat-emoji">${emoji}</span>
            <span class="stat-name">${skill.name}</span>
            <span class="stat-value">${total}</span>
          `;
            const color = getSkillColor(total, true);
            if (color) {
              badge.style.borderColor = color;
              badge.style.color = color;
            }
          } else {
            badge.dataset.role = "skill-badge";
            badge.dataset.skill = skill.name;
            badge.style.cursor = "pointer";
            badge.title = tooltipText + (canIncrease ? `

Left click: ${increaseTitle}` : "") + (canDecrease ? `

Right click: ${decreaseTitle}` : "");
            badge.innerHTML = `
            <span class="stat-emoji">${emoji}</span>
            <span class="stat-name">${skill.name}</span>
            <span class="skill-badge-rank-mod">${rankModText}</span>
          `;
            const color = getSkillColor(rank2, false);
            if (color) {
              badge.style.borderColor = color;
              badge.style.color = color;
            }
          }
          badge.title = tooltipText;
          list.appendChild(badge);
        });
      });
    });
  };
  var formatFeatureName = (featureId) => {
    if (!featureId) return "";
    return featureId.replace(/[\/_]+/g, " ").replace(/[-]+/g, " ").replace(/\b\w/g, (match) => match.toUpperCase());
  };
  var normalizeFeatureKey = (value) => {
    if (!value) return "";
    return value.toLowerCase().replace(/[\/_-]+/g, " ").replace(/\s+/g, " ").trim();
  };
  var getFeatureColor = (cost, grade, featureDef) => {
    if (!featureDef) {
      if (cost === 0) return "#ffffff";
      if (cost < 0) return gradeColors.Poor;
      if (cost <= 2) return gradeColors.Poor;
      if (cost <= 4) return gradeColors.Uncommon;
      if (cost <= 6) return gradeColors.Rare;
      if (cost <= 8) return gradeColors.Epic;
      if (cost <= 10) return gradeColors.Legendary;
      return gradeColors.Mythic;
    }
    const featureId = featureDef.id;
    if (featureId === "eye-left-blind" || featureId === "eye-right-blind" || featureId === "eye-left-nearsighted" || featureId === "eye-right-nearsighted") {
      return gradeColors.Poor;
    }
    if (featureId === "ear-left-humanoid" || featureId === "nose-humanoid" || featureId === "teeth-humanoid" || featureId === "skull-humanoid" || featureId === "arm-left-humanoid" || featureId === "arm-right-humanoid" || featureId === "leg-left-humanoid" || featureId === "leg-right-humanoid" || featureId === "hand-left-humanoid" || featureId === "hand-right-humanoid" || featureId === "foot-left-humanoid" || featureId === "foot-right-humanoid") {
      return "#ffffff";
    }
    if (featureId === "ear-right-universal-translator") {
      return gradeColors.Uncommon;
    }
    if (featureId === "antennae-andorian-left" || featureId === "antennae-andorian-right") {
      return gradeColors.Uncommon;
    }
    if (featureId === "brain-andorian") {
      return "#ffffff";
    }
    if (featureId === "ear-right-humanoid") {
      return gradeColors.Poor;
    }
    if (grade && gradeColors[grade]) {
      return gradeColors[grade];
    }
    if (cost === 0) return "#ffffff";
    if (cost < 0) return gradeColors.Poor;
    if (cost <= 2) return gradeColors.Poor;
    if (cost <= 4) return gradeColors.Uncommon;
    if (cost <= 6) return gradeColors.Rare;
    if (cost <= 8) return gradeColors.Epic;
    if (cost <= 10) return gradeColors.Legendary;
    return gradeColors.Mythic;
  };
  var getFeatureEmoji = (featureId, featureName) => {
    const normalized = (featureId || featureName || "").toLowerCase();
    if (normalized.includes("blood")) return "\u{1FA78}";
    if (normalized.includes("brain")) return "\u{1F9E0}";
    if (normalized.includes("ears")) return "\u{1F442}";
    if (normalized.includes("hands")) return "\u270B";
    if (normalized.includes("nose")) return "\u{1F443}";
    if (normalized.includes("jaw")) return "\u{1F9B7}";
    if (normalized.includes("skull")) return "\u{1F480}";
    if (normalized.includes("skin color") || normalized.includes("skin-color")) return "\u{1F3A8}";
    if (normalized.includes("hair")) return "\u{1F487}";
    if (normalized.includes("vision")) return "\u{1F441}\uFE0F";
    if (normalized.includes("sunlight")) return "\u2600\uFE0F";
    if (normalized.includes("light")) return "\u{1F4A1}";
    if (normalized.includes("scaly")) return "\u{1F98E}";
    if (normalized.includes("tail")) return "\u{1F98A}";
    if (normalized.includes("antennae")) return "\u{1FAB2}";
    if (normalized.includes("extra arm")) return "\u{1F9BE}";
    if (normalized.includes("arm") || normalized.includes("strong")) return "\u{1F4AA}";
    if (normalized.includes("leg")) return "\u{1F9B5}";
    if (normalized.includes("paw")) return "\u{1F43E}";
    if (normalized.includes("trotter") || normalized.includes("pig")) return "\u{1F437}";
    if (normalized.includes("bat")) return "\u{1F987}";
    if (normalized.includes("ugly")) return "\u{1F62C}";
    if (normalized.includes("secret identity")) return "\u{1F575}\uFE0F";
    if (normalized.includes("psionic") || normalized.includes("psionics")) return "\u{1F52E}";
    return "\u2728";
  };
  var renderFeatures = () => {
    const lists = getFeaturesLists();
    if (lists.length === 0) return;
    lists.forEach((list) => {
      list.innerHTML = "";
    });
    const allFeatures = [];
    if (backgroundFeatures && backgroundFeatures.length > 0) {
      backgroundFeatures.forEach((feature) => {
        allFeatures.push({ feature, isPurchased: false });
      });
    }
    purchasedFeatures.forEach((featureId) => {
      allFeatures.push({ feature: featureId, isPurchased: true });
    });
    const featuresByCategory = /* @__PURE__ */ new Map();
    allFeatures.forEach(({ feature, isPurchased }) => {
      const featureId = typeof feature === "string" ? feature : feature.id;
      const featureDef = featuresMap.get(featureId);
      const category = featureDef?.category || skillCategoryOrder[0];
      if (!featuresByCategory.has(category)) {
        featuresByCategory.set(category, []);
      }
      featuresByCategory.get(category).push({ feature, isPurchased });
    });
    featuresByCategory.forEach((categoryFeatures) => {
      categoryFeatures.sort((a, b) => {
        const aId = typeof a.feature === "string" ? a.feature : a.feature.id;
        const bId = typeof b.feature === "string" ? b.feature : b.feature.id;
        const aDef = featuresMap.get(aId);
        const bDef = featuresMap.get(bId);
        const aName = aDef?.name || aId;
        const bName = bDef?.name || bId;
        return aName.localeCompare(bName);
      });
    });
    const extraCategories = Array.from(featuresByCategory.keys()).filter(
      (cat) => !skillCategoryOrder.includes(cat)
    ).sort((a, b) => a.localeCompare(b));
    skillCategoryOrder.forEach((category) => {
      const categoryFeatures = featuresByCategory.get(category) || [];
      const categoryEmoji = skillCategoryEmojis[category] || "\u2728";
      lists.forEach((list, index) => {
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        if (!isSheetView) {
          const categoryBadge = document.createElement("div");
          categoryBadge.className = "skill-category-badge";
          categoryBadge.title = category;
          categoryBadge.dataset.role = "feature-category-badge";
          categoryBadge.dataset.category = category;
          categoryBadge.style.cursor = "pointer";
          categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
          list.appendChild(categoryBadge);
        }
        categoryFeatures.forEach(({ feature, isPurchased }) => {
          const featureId = typeof feature === "string" ? feature : feature.id;
          const featureDef = featuresMap.get(featureId);
          const featureName = featureDef?.name || (typeof feature === "string" ? formatFeatureName(feature) : feature.name || formatFeatureName(featureId));
          const emoji = featureDef?.emoji || getFeatureEmoji(featureId, featureName);
          const description = featureDef?.description || "";
          const cost = featureDef?.cost ?? 0;
          const grade = featureDef?.grade || null;
          const featureColor = getFeatureColor(cost, grade, featureDef);
          const tooltipLines = [isPurchased ? "Purchased feature" : "Background feature"];
          const normalizedId = normalizeFeatureKey(featureId);
          const normalizedName = normalizeFeatureKey(featureName);
          if (description) {
            tooltipLines.push(description);
          }
          const selection = featureSelections.get(featureId);
          let displayName = featureName || featureId;
          if (selection) {
            displayName += ` (${selection})`;
            tooltipLines.push(`Selected: ${selection}`);
          }
          const tooltipText = tooltipLines.join("\n");
          const badge = document.createElement("div");
          badge.className = "feature-badge";
          badge.title = tooltipText;
          badge.style.borderColor = featureColor;
          badge.style.color = featureColor;
          const removeButton = isPurchased ? '<button type="button" class="feature-remove" data-role="feature-remove" data-feature="' + featureId.replace(/"/g, "&quot;") + '" title="Remove feature">\u{1F5D1}\uFE0F</button>' : "";
          badge.innerHTML = `
          <span class="feature-emoji">${emoji}</span>
          <span class="feature-name">${displayName}</span>
          ${removeButton}
        `;
          list.appendChild(badge);
        });
      });
    });
    extraCategories.forEach((category) => {
      const categoryFeatures = featuresByCategory.get(category) || [];
      const categoryEmoji = skillCategoryEmojis[category] || "\u2728";
      lists.forEach((list, index) => {
        const isSheetView = index === 0 || activePanelKey() === "sheet";
        if (!isSheetView) {
          const categoryBadge = document.createElement("div");
          categoryBadge.className = "skill-category-badge";
          categoryBadge.title = category;
          categoryBadge.dataset.role = "feature-category-badge";
          categoryBadge.dataset.category = category;
          categoryBadge.style.cursor = "pointer";
          categoryBadge.innerHTML = `
          <span class="skill-category-emoji">${categoryEmoji}</span>
        `;
          list.appendChild(categoryBadge);
        }
        categoryFeatures.forEach(({ feature, isPurchased }) => {
          const featureId = typeof feature === "string" ? feature : feature.id;
          const featureDef = featuresMap.get(featureId);
          const featureName = featureDef?.name || (typeof feature === "string" ? formatFeatureName(feature) : feature.name || formatFeatureName(featureId));
          const emoji = featureDef?.emoji || getFeatureEmoji(featureId, featureName);
          const description = featureDef?.description || "";
          const cost = featureDef?.cost ?? 0;
          const grade = featureDef?.grade || null;
          const featureColor = getFeatureColor(cost, grade, featureDef);
          const tooltipLines = [isPurchased ? "Purchased feature" : "Background feature"];
          const normalizedId = normalizeFeatureKey(featureId);
          const normalizedName = normalizeFeatureKey(featureName);
          if (description) {
            tooltipLines.push(description);
          }
          const selection = featureSelections.get(featureId);
          let displayName = featureName || featureId;
          if (selection) {
            displayName += ` (${selection})`;
            tooltipLines.push(`Selected: ${selection}`);
          }
          const tooltipText = tooltipLines.join("\n");
          const badge = document.createElement("div");
          badge.className = "feature-badge";
          badge.title = tooltipText;
          badge.style.borderColor = featureColor;
          badge.style.color = featureColor;
          const removeButton = isPurchased ? '<button type="button" class="feature-remove" data-role="feature-remove" data-feature="' + featureId.replace(/"/g, "&quot;") + '" title="Remove feature">\u{1F5D1}\uFE0F</button>' : "";
          badge.innerHTML = `
          <span class="feature-emoji">${emoji}</span>
          <span class="feature-name">${displayName}</span>
          ${removeButton}
        `;
          list.appendChild(badge);
        });
      });
    });
  };
  var setActiveTab = (tabId) => {
    if (!panel) return;
    panel.dataset.activeTab = tabId;
    tabButtons.forEach((button) => {
      button.classList.toggle("is-active", button.dataset.tab === tabId);
    });
    tabPanels.forEach((panelEl) => {
      panelEl.classList.toggle("is-active", panelEl.dataset.tabPanel === tabId);
    });
    updateTabInteractivity();
    refreshStatBadgeColors();
    renderSkills();
    renderFeatures();
  };
  var syncSelectValues = (role, value) => {
    const selects = role === "grade" ? getGradeSelects() : getBackgroundSelects();
    selects.forEach((select) => {
      if (select.value !== value) {
        select.value = value;
      }
    });
    if (role === "grade") {
      applyGradeStyles();
      refreshStatBadgeColors();
      updateStatPointsBadges();
      updateAdjusterStates();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateFeatureCategoryPicker();
    }
    schedulePersist();
  };
  var applyGradeStyles = () => {
    const currentGrade = getGradeSelects()[0]?.value;
    const color = currentGrade ? gradeColors[currentGrade] : null;
    getGradeSelects().forEach((select) => {
      if (color) {
        select.style.color = color;
        select.style.borderColor = color;
        select.style.boxShadow = `0 0 0 1px ${color}33`;
      } else {
        select.style.color = "";
        select.style.borderColor = "";
        select.style.boxShadow = "";
      }
    });
  };
  var attachBackgroundListeners = () => {
    getBackgroundSelects().forEach((select) => {
      select.addEventListener("change", () => {
        if (select.disabled) return;
        syncSelectValues("background", select.value);
        updateStatsForBackground(select.value);
      });
    });
  };
  var attachGradeListeners = () => {
    getGradeSelects().forEach((select) => {
      select.addEventListener("change", () => {
        if (select.disabled) return;
        syncSelectValues("grade", select.value);
      });
    });
  };
  var mirrorTabPanels = () => {
    const sheetPanel = document.querySelector('[data-tab-panel="sheet"]');
    if (!sheetPanel) return;
    tabPanels.forEach((panelEl) => {
      if (panelEl.dataset.tabPanel !== "sheet") {
        panelEl.innerHTML = sheetPanel.innerHTML;
      }
    });
    populateSkillPickers();
    renderSkills();
  };
  var resetCharacter = () => {
    purchasedSkills.clear();
    skillRanks.clear();
    purchasedFeatures.clear();
    featureSelections.clear();
    if (defaultGradeValue) {
      syncSelectValues("grade", defaultGradeValue);
    }
    if (defaultBackgroundValue) {
      syncSelectValues("background", defaultBackgroundValue);
    }
    updateStatsForBackground(
      getBackgroundSelects()[0]?.value || defaultBackgroundValue
    );
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
    schedulePersist();
  };
  var buildCharacterData = () => {
    const gradeSelect = getGradeSelects()[0];
    const backgroundSelect = getBackgroundSelects()[0];
    return {
      version: 1,
      grade: gradeSelect?.value || defaultGradeValue,
      background: backgroundSelect?.value || defaultBackgroundValue,
      baseCharacteristics: { ...baseCharacteristics },
      currentStatModifiers: { ...currentStatModifiers },
      skillRanks: Array.from(skillRanks.entries()),
      purchasedSkills: Array.from(purchasedSkills),
      purchasedFeatures: Array.from(purchasedFeatures),
      featureSelections: Array.from(featureSelections.entries()),
      statState: Array.from(statState.entries()),
      currentBackgroundName
    };
  };
  var applyCharacterData = async (characterData) => {
    if (!characterData || typeof characterData !== "object") {
      throw new Error("Invalid character data.");
    }
    if (characterData.grade) {
      syncSelectValues("grade", characterData.grade);
    }
    if (characterData.background) {
      syncSelectValues("background", characterData.background);
    }
    if (characterData.baseCharacteristics) {
      Object.assign(baseCharacteristics, characterData.baseCharacteristics);
    }
    if (characterData.currentStatModifiers) {
      Object.assign(currentStatModifiers, characterData.currentStatModifiers);
    }
    if (characterData.skillRanks) {
      skillRanks.clear();
      characterData.skillRanks.forEach(([key, value]) => {
        skillRanks.set(key, value);
      });
    }
    if (characterData.purchasedSkills) {
      purchasedSkills.clear();
      characterData.purchasedSkills.forEach((skill) => {
        purchasedSkills.add(skill);
      });
    }
    if (characterData.purchasedFeatures) {
      purchasedFeatures.clear();
      characterData.purchasedFeatures.forEach((feature) => {
        purchasedFeatures.add(feature);
      });
    }
    if (characterData.featureSelections) {
      featureSelections.clear();
      characterData.featureSelections.forEach(([key, value]) => {
        featureSelections.set(key, value);
      });
    }
    if (characterData.statState) {
      statState.clear();
      characterData.statState.forEach(([key, value]) => {
        statState.set(key, value);
      });
    }
    if (characterData.currentBackgroundName) {
      currentBackgroundName = characterData.currentBackgroundName;
    }
    await updateStatsForBackground(
      getBackgroundSelects()[0]?.value || defaultBackgroundValue
    );
    renderSkills();
    updateSkillPointsBadge();
    updateFeaturePointsBadge();
  };
  var saveCharacter = async () => {
    try {
      const characterData = buildCharacterData();
      const json = JSON.stringify(characterData, null, 2);
      const suggestedName = `aff-star-trek-${characterData.background || "character"}.json`;
      let saved = false;
      if (window.showSaveFilePicker) {
        try {
          const handle = await window.showSaveFilePicker({
            suggestedName,
            types: [
              {
                description: "JSON",
                accept: { "application/json": [".json"] }
              }
            ]
          });
          const writable = await handle.createWritable();
          await writable.write(json);
          await writable.close();
          saved = true;
        } catch (error) {
          if (error?.name === "AbortError") return;
          if (error?.name !== "SecurityError") {
            throw error;
          }
        }
      }
      if (!saved) {
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = suggestedName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        URL.revokeObjectURL(url);
      }
      const saveBtn = document.querySelector('[data-action="save"]');
      if (saveBtn) {
        const originalTitle = saveBtn.title;
        saveBtn.title = "SAVED!";
        setTimeout(() => {
          saveBtn.title = originalTitle;
        }, 1e3);
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error saving character:", error);
      alert("Failed to save character: " + error.message);
    }
  };
  var loadCharacter = async () => {
    try {
      let file = null;
      if (window.showOpenFilePicker) {
        try {
          const [handle] = await window.showOpenFilePicker({
            multiple: false,
            types: [
              {
                description: "JSON",
                accept: { "application/json": [".json"] }
              }
            ]
          });
          file = await handle.getFile();
        } catch (error) {
          if (error?.name === "AbortError") return;
          if (error?.name !== "SecurityError") {
            throw error;
          }
        }
      } else {
        file = await new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "application/json,.json";
          input.addEventListener(
            "change",
            () => {
              resolve(input.files?.[0] || null);
            },
            { once: true }
          );
          input.click();
        });
      }
      if (!file) {
        file = await new Promise((resolve) => {
          const input = document.createElement("input");
          input.type = "file";
          input.accept = "application/json,.json";
          input.addEventListener(
            "change",
            () => {
              resolve(input.files?.[0] || null);
            },
            { once: true }
          );
          input.click();
        });
      }
      if (!file) return;
      const text = await file.text();
      const characterData = JSON.parse(text);
      await applyCharacterData(characterData);
      schedulePersist();
      const loadBtn = document.querySelector('[data-action="load"]');
      if (loadBtn) {
        const originalTitle = loadBtn.title;
        loadBtn.title = "LOADED!";
        setTimeout(() => {
          loadBtn.title = originalTitle;
        }, 1e3);
      }
    } catch (error) {
      if (error?.name === "AbortError") return;
      console.error("Error loading character:", error);
      alert("Failed to load character: " + error.message);
    }
  };
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.closest(".tab-button")) return;
    const featureCategoryBadge = target.closest('[data-role="feature-category-badge"]');
    if (featureCategoryBadge && activePanelKey() === "edit") {
      const category = featureCategoryBadge.dataset.category;
      if (category) {
        const section = featureCategoryBadge.closest(".features-section");
        const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
        if (listPicker) {
          populateFeatureListPicker(category);
          listPicker.hidden = false;
        }
      }
      return;
    }
    const featureCategoryButton = target.closest('[data-role="feature-category-button"]');
    if (featureCategoryButton) {
      const picker = featureCategoryButton.closest('[data-role="feature-category-picker"]');
      const category = featureCategoryButton.dataset.category;
      if (picker && category) {
        picker.hidden = true;
        const listPicker = picker.closest(".features-section")?.querySelector('[data-role="feature-list-picker"]');
        if (listPicker) {
          populateFeatureListPicker(category);
          listPicker.hidden = false;
        }
      }
      return;
    }
    const featureBack = target.closest('[data-role="feature-back"]');
    if (featureBack) {
      const picker = featureBack.closest('[data-role="feature-list-picker"]');
      if (picker) {
        picker.hidden = true;
        const categoryPicker = picker.closest(".features-section")?.querySelector('[data-role="feature-category-picker"]');
        if (categoryPicker) {
          categoryPicker.hidden = false;
        }
      }
      return;
    }
    const featureCancel = target.closest('[data-role="feature-cancel"]');
    if (featureCancel) {
      const section = featureCancel.closest(".features-section");
      const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
      const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
      if (categoryPicker) categoryPicker.hidden = true;
      if (listPicker) listPicker.hidden = true;
      return;
    }
    const featureItem = target.closest('[data-role="feature-item"]');
    if (featureItem) {
      const featureId = featureItem.dataset.feature;
      if (featureId) {
        const featureDef = featuresMap.get(featureId);
        if (featureDef?.requiresSelection) {
          const section = featureItem.closest(".features-section");
          const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
          const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
          if (categoryPicker) categoryPicker.hidden = true;
          if (listPicker) listPicker.hidden = true;
          showFeatureSelectionPopup(featureId);
        } else {
          purchaseFeature(featureId);
          const section = featureItem.closest(".features-section");
          const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
          const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
          if (categoryPicker) categoryPicker.hidden = true;
          if (listPicker) listPicker.hidden = true;
        }
      }
      return;
    }
    const featureSelectionConfirm = target.closest('[data-role="feature-selection-confirm"]');
    if (featureSelectionConfirm) {
      const picker = featureSelectionConfirm.closest('[data-role="feature-selection-picker"]');
      const featureId = picker?.dataset.featureId;
      if (featureId) {
        const select = picker.querySelector('[data-role="enemy-type-select"]');
        if (select && select.value) {
          purchaseFeature(featureId, select.value);
          closeFeatureSelectionPopup();
          const section = picker.closest(".features-section");
          const categoryPicker = section?.querySelector('[data-role="feature-category-picker"]');
          const listPicker = section?.querySelector('[data-role="feature-list-picker"]');
          if (categoryPicker) categoryPicker.hidden = true;
          if (listPicker) listPicker.hidden = true;
        }
      }
      return;
    }
    const featureSelectionCancel = target.closest('[data-role="feature-selection-cancel"]');
    if (featureSelectionCancel) {
      closeFeatureSelectionPopup();
      return;
    }
    const featureRemove = target.closest('[data-role="feature-remove"]');
    if (featureRemove) {
      const featureId = featureRemove.dataset.feature;
      if (featureId) {
        removeFeature(featureId);
      }
      return;
    }
    const skillCategoryBadge = target.closest('[data-role="skill-category-badge"]');
    if (skillCategoryBadge) {
      const category = skillCategoryBadge.dataset.category;
      if (category) {
        const section = skillCategoryBadge.closest(".skills-section");
        const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
        const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
        if (categoryPicker && listPicker) {
          populateSkillList(category);
          categoryPicker.hidden = true;
          listPicker.hidden = false;
        }
      }
      return;
    }
    const skillCategoryButton = target.closest('[data-role="skill-category-button"]');
    if (skillCategoryButton) {
      const picker = skillCategoryButton.closest('[data-role="skill-category-picker"]');
      const category = skillCategoryButton.dataset.category;
      if (picker && category) {
        picker.hidden = true;
        const listPicker = picker.closest(".skills-section")?.querySelector('[data-role="skill-list-picker"]');
        if (listPicker) {
          populateSkillList(category);
          listPicker.hidden = false;
        }
      }
      return;
    }
    const skillDone = target.closest('[data-role="skill-done"]');
    if (skillDone) {
      const section = skillDone.closest(".skills-section");
      const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
      const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
      if (categoryPicker) categoryPicker.hidden = true;
      if (listPicker) listPicker.hidden = true;
      return;
    }
    const skillCancel = target.closest('[data-role="skill-cancel"]');
    if (skillCancel) {
      const section = skillCancel.closest(".skills-section");
      const categoryPicker = section?.querySelector('[data-role="skill-category-picker"]');
      const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
      if (categoryPicker) categoryPicker.hidden = true;
      if (listPicker) listPicker.hidden = true;
      return;
    }
    const skillItemPicker = target.closest('[data-role="skill-item-picker"]');
    if (skillItemPicker) {
      const section = skillItemPicker.closest(".skills-section");
      const skillName = skillItemPicker.dataset.skill;
      if (skillName) {
        const existing = skillRanks.get(skillName) || 0;
        const increaseStatus = canIncreaseSkill(skillName, existing);
        if (increaseStatus.allowed) {
          skillRanks.set(skillName, existing + 1);
          purchasedSkills.add(skillName);
        }
        renderSkills();
        updateSkillPointsBadge();
        updateFeaturePointsBadge();
        populateSkillPickers();
        const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
        if (listPicker && listPicker.dataset.selectedCategory) {
          populateSkillList(listPicker.dataset.selectedCategory);
        }
        schedulePersist();
      }
      return;
    }
    const skillItem = target.closest('[data-role="skill-item"]');
    if (skillItem) {
      const section = skillItem.closest(".skills-section");
      const skillName = skillItem.dataset.skill;
      if (skillName) {
        const existing = skillRanks.get(skillName) || 0;
        const increaseStatus = canIncreaseSkill(skillName, existing);
        if (increaseStatus.allowed) {
          skillRanks.set(skillName, existing + 1);
          purchasedSkills.add(skillName);
        }
        renderSkills();
        updateSkillPointsBadge();
        updateFeaturePointsBadge();
        populateSkillPickers();
        const listPicker = section?.querySelector('[data-role="skill-list-picker"]');
        if (listPicker) {
          listPicker.hidden = true;
        }
        schedulePersist();
      }
      return;
    }
    const statBadge = target.closest('[data-role="stat-badge-adjustable"]');
    if (statBadge && activePanelKey() === "edit") {
      const stat = statBadge.dataset.stat;
      if (!stat) return;
      const base = baseCharacteristics[stat] ?? 0;
      const currentInitial = getStatInitial(stat);
      const cost = statCostsByStat[stat] ?? 0;
      const currentGrade = getGradeSelects()[0]?.value || "Uncommon";
      const totalPoints = statPointsByGrade[currentGrade] ?? 0;
      const spentPoints = getSpentPoints();
      const remaining = totalPoints - spentPoints;
      const gradeBonuses = gradeMaxBonusesByGrade[currentGrade] || defaultGradeMaxBonuses[currentGrade] || {};
      const bonusCap = gradeBonuses[stat] ?? gradeBonuses.MIND ?? 0;
      const maxValue = base + bonusCap;
      if (remaining < cost || currentInitial >= maxValue) return;
      setStatState(stat, currentInitial + 1);
      recomputeDerivedStats();
      updateStatPointsBadges();
      updateAdjusterStates();
      populateFeatureCategoryPicker();
      return;
    }
  });
  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const skillBadge = target.closest('[data-role="skill-badge"]');
    if (skillBadge && activePanelKey() === "edit") {
      const skillName = skillBadge.dataset.skill;
      if (!skillName) return;
      const currentRank = skillRanks.get(skillName) || 0;
      const increaseStatus = canIncreaseSkill(skillName, currentRank);
      if (!increaseStatus.allowed) return;
      skillRanks.set(skillName, currentRank + 1);
      purchasedSkills.add(skillName);
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateSkillPickers();
      schedulePersist();
      return;
    }
  });
  document.addEventListener("contextmenu", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    const statBadge = target.closest('[data-role="stat-badge-adjustable"]');
    if (statBadge && activePanelKey() === "edit") {
      event.preventDefault();
      const stat = statBadge.dataset.stat;
      if (!stat) return;
      const base = baseCharacteristics[stat] ?? 0;
      const currentInitial = getStatInitial(stat);
      if (currentInitial <= base) return;
      setStatState(stat, currentInitial - 1);
      recomputeDerivedStats();
      updateStatPointsBadges();
      updateAdjusterStates();
      populateFeatureCategoryPicker();
      return;
    }
    const skillBadge = target.closest('[data-role="skill-badge"]');
    if (skillBadge && activePanelKey() === "edit") {
      event.preventDefault();
      const skillName = skillBadge.dataset.skill;
      if (!skillName) return;
      const currentRank = skillRanks.get(skillName) || 0;
      if (currentRank <= 0) return;
      const newRank = currentRank - 1;
      skillRanks.set(skillName, newRank);
      purchasedSkills.add(skillName);
      if (newRank === 0) {
        const backgroundModifier = backgroundSkillModifiers.get(skillName)?.modifier || 0;
        let featureModifier = 0;
        const ownedFeatures = getAllOwnedFeatures();
        ownedFeatures.forEach((featureId) => {
          const featureDef = featuresMap.get(featureId);
          if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skillName]) {
            featureModifier += featureDef.skillBonuses[skillName];
          }
        });
        const totalModifier = backgroundModifier + featureModifier;
        if (totalModifier === 0) {
          skillRanks.delete(skillName);
          purchasedSkills.delete(skillName);
        }
      }
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateSkillPickers();
      schedulePersist();
      return;
    }
    const skillItemPicker = target.closest('[data-role="skill-item-picker"]');
    if (skillItemPicker) {
      event.preventDefault();
      const skillName = skillItemPicker.dataset.skill;
      if (!skillName) return;
      const currentRank = skillRanks.get(skillName) || 0;
      if (currentRank <= 0) return;
      const newRank = currentRank - 1;
      skillRanks.set(skillName, newRank);
      if (newRank === 0) {
        const backgroundModifier = backgroundSkillModifiers.get(skillName)?.modifier || 0;
        let featureModifier = 0;
        const ownedFeatures = getAllOwnedFeatures();
        ownedFeatures.forEach((featureId) => {
          const featureDef = featuresMap.get(featureId);
          if (featureDef && featureDef.skillBonuses && featureDef.skillBonuses[skillName]) {
            featureModifier += featureDef.skillBonuses[skillName];
          }
        });
        const totalModifier = backgroundModifier + featureModifier;
        if (totalModifier === 0) {
          skillRanks.delete(skillName);
          purchasedSkills.delete(skillName);
        } else {
          purchasedSkills.delete(skillName);
        }
      } else {
        purchasedSkills.add(skillName);
      }
      renderSkills();
      updateSkillPointsBadge();
      updateFeaturePointsBadge();
      populateSkillPickers();
      const picker = skillItemPicker.closest('[data-role="skill-list-picker"]');
      if (picker && picker.dataset.selectedCategory) {
        populateSkillList(picker.dataset.selectedCategory);
      }
      schedulePersist();
      return;
    }
  });
})();
