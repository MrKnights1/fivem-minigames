var I =
    typeof globalThis < "u"
      ? globalThis
      : typeof window < "u"
        ? window
        : typeof global < "u"
          ? global
          : typeof self < "u"
            ? self
            : {},
  C = {};
/*!
 *  howler.js v2.2.4
 *  howlerjs.com
 *
 *  (c) 2013-2020, James Simpson of GoldFire Studios
 *  goldfirestudios.com
 *
 *  MIT License
 */ var P;
function V() {
  return (
    P ||
      ((P = 1),
      (function (A) {
        (function () {
          var f = function () {
            this.init();
          };
          f.prototype = {
            init: function () {
              var e = this || n;
              return (
                (e._counter = 1e3),
                (e._html5AudioPool = []),
                (e.html5PoolSize = 10),
                (e._codecs = {}),
                (e._howls = []),
                (e._muted = !1),
                (e._volume = 1),
                (e._canPlayEvent = "canplaythrough"),
                (e._navigator =
                  typeof window < "u" && window.navigator
                    ? window.navigator
                    : null),
                (e.masterGain = null),
                (e.noAudio = !1),
                (e.usingWebAudio = !0),
                (e.autoSuspend = !0),
                (e.ctx = null),
                (e.autoUnlock = !0),
                e._setup(),
                e
              );
            },
            volume: function (e) {
              var t = this || n;
              if (
                ((e = parseFloat(e)),
                t.ctx || T(),
                typeof e < "u" && e >= 0 && e <= 1)
              ) {
                if (((t._volume = e), t._muted)) return t;
                t.usingWebAudio &&
                  t.masterGain.gain.setValueAtTime(e, n.ctx.currentTime);
                for (var r = 0; r < t._howls.length; r++)
                  if (!t._howls[r]._webAudio)
                    for (
                      var o = t._howls[r]._getSoundIds(), l = 0;
                      l < o.length;
                      l++
                    ) {
                      var u = t._howls[r]._soundById(o[l]);
                      u && u._node && (u._node.volume = u._volume * e);
                    }
                return t;
              }
              return t._volume;
            },
            mute: function (e) {
              var t = this || n;
              (t.ctx || T(),
                (t._muted = e),
                t.usingWebAudio &&
                  t.masterGain.gain.setValueAtTime(
                    e ? 0 : t._volume,
                    n.ctx.currentTime,
                  ));
              for (var r = 0; r < t._howls.length; r++)
                if (!t._howls[r]._webAudio)
                  for (
                    var o = t._howls[r]._getSoundIds(), l = 0;
                    l < o.length;
                    l++
                  ) {
                    var u = t._howls[r]._soundById(o[l]);
                    u && u._node && (u._node.muted = e ? !0 : u._muted);
                  }
              return t;
            },
            stop: function () {
              for (var e = this || n, t = 0; t < e._howls.length; t++)
                e._howls[t].stop();
              return e;
            },
            unload: function () {
              for (var e = this || n, t = e._howls.length - 1; t >= 0; t--)
                e._howls[t].unload();
              return (
                e.usingWebAudio &&
                  e.ctx &&
                  typeof e.ctx.close < "u" &&
                  (e.ctx.close(), (e.ctx = null), T()),
                e
              );
            },
            codecs: function (e) {
              return (this || n)._codecs[e.replace(/^x-/, "")];
            },
            _setup: function () {
              var e = this || n;
              if (
                ((e.state = (e.ctx && e.ctx.state) || "suspended"),
                e._autoSuspend(),
                !e.usingWebAudio)
              )
                if (typeof Audio < "u")
                  try {
                    var t = new Audio();
                    typeof t.oncanplaythrough > "u" &&
                      (e._canPlayEvent = "canplay");
                  } catch {
                    e.noAudio = !0;
                  }
                else e.noAudio = !0;
              try {
                var t = new Audio();
                t.muted && (e.noAudio = !0);
              } catch {}
              return (e.noAudio || e._setupCodecs(), e);
            },
            _setupCodecs: function () {
              var e = this || n,
                t = null;
              try {
                t = typeof Audio < "u" ? new Audio() : null;
              } catch {
                return e;
              }
              if (!t || typeof t.canPlayType != "function") return e;
              var r = t.canPlayType("audio/mpeg;").replace(/^no$/, ""),
                o = e._navigator ? e._navigator.userAgent : "",
                l = o.match(/OPR\/(\d+)/g),
                u = l && parseInt(l[0].split("/")[1], 10) < 33,
                s = o.indexOf("Safari") !== -1 && o.indexOf("Chrome") === -1,
                m = o.match(/Version\/(.*?) /),
                h = s && m && parseInt(m[1], 10) < 15;
              return (
                (e._codecs = {
                  mp3: !!(
                    !u &&
                    (r || t.canPlayType("audio/mp3;").replace(/^no$/, ""))
                  ),
                  mpeg: !!r,
                  opus: !!t
                    .canPlayType('audio/ogg; codecs="opus"')
                    .replace(/^no$/, ""),
                  ogg: !!t
                    .canPlayType('audio/ogg; codecs="vorbis"')
                    .replace(/^no$/, ""),
                  oga: !!t
                    .canPlayType('audio/ogg; codecs="vorbis"')
                    .replace(/^no$/, ""),
                  wav: !!(
                    t.canPlayType('audio/wav; codecs="1"') ||
                    t.canPlayType("audio/wav")
                  ).replace(/^no$/, ""),
                  aac: !!t.canPlayType("audio/aac;").replace(/^no$/, ""),
                  caf: !!t.canPlayType("audio/x-caf;").replace(/^no$/, ""),
                  m4a: !!(
                    t.canPlayType("audio/x-m4a;") ||
                    t.canPlayType("audio/m4a;") ||
                    t.canPlayType("audio/aac;")
                  ).replace(/^no$/, ""),
                  m4b: !!(
                    t.canPlayType("audio/x-m4b;") ||
                    t.canPlayType("audio/m4b;") ||
                    t.canPlayType("audio/aac;")
                  ).replace(/^no$/, ""),
                  mp4: !!(
                    t.canPlayType("audio/x-mp4;") ||
                    t.canPlayType("audio/mp4;") ||
                    t.canPlayType("audio/aac;")
                  ).replace(/^no$/, ""),
                  weba: !!(
                    !h &&
                    t
                      .canPlayType('audio/webm; codecs="vorbis"')
                      .replace(/^no$/, "")
                  ),
                  webm: !!(
                    !h &&
                    t
                      .canPlayType('audio/webm; codecs="vorbis"')
                      .replace(/^no$/, "")
                  ),
                  dolby: !!t
                    .canPlayType('audio/mp4; codecs="ec-3"')
                    .replace(/^no$/, ""),
                  flac: !!(
                    t.canPlayType("audio/x-flac;") ||
                    t.canPlayType("audio/flac;")
                  ).replace(/^no$/, ""),
                }),
                e
              );
            },
            _unlockAudio: function () {
              var e = this || n;
              if (!(e._audioUnlocked || !e.ctx)) {
                ((e._audioUnlocked = !1),
                  (e.autoUnlock = !1),
                  !e._mobileUnloaded &&
                    e.ctx.sampleRate !== 44100 &&
                    ((e._mobileUnloaded = !0), e.unload()),
                  (e._scratchBuffer = e.ctx.createBuffer(1, 1, 22050)));
                var t = function (r) {
                  for (; e._html5AudioPool.length < e.html5PoolSize; )
                    try {
                      var o = new Audio();
                      ((o._unlocked = !0), e._releaseHtml5Audio(o));
                    } catch {
                      e.noAudio = !0;
                      break;
                    }
                  for (var l = 0; l < e._howls.length; l++)
                    if (!e._howls[l]._webAudio)
                      for (
                        var u = e._howls[l]._getSoundIds(), s = 0;
                        s < u.length;
                        s++
                      ) {
                        var m = e._howls[l]._soundById(u[s]);
                        m &&
                          m._node &&
                          !m._node._unlocked &&
                          ((m._node._unlocked = !0), m._node.load());
                      }
                  e._autoResume();
                  var h = e.ctx.createBufferSource();
                  ((h.buffer = e._scratchBuffer),
                    h.connect(e.ctx.destination),
                    typeof h.start > "u" ? h.noteOn(0) : h.start(0),
                    typeof e.ctx.resume == "function" && e.ctx.resume(),
                    (h.onended = function () {
                      (h.disconnect(0),
                        (e._audioUnlocked = !0),
                        document.removeEventListener("touchstart", t, !0),
                        document.removeEventListener("touchend", t, !0),
                        document.removeEventListener("click", t, !0),
                        document.removeEventListener("keydown", t, !0));
                      for (var y = 0; y < e._howls.length; y++)
                        e._howls[y]._emit("unlock");
                    }));
                };
                return (
                  document.addEventListener("touchstart", t, !0),
                  document.addEventListener("touchend", t, !0),
                  document.addEventListener("click", t, !0),
                  document.addEventListener("keydown", t, !0),
                  e
                );
              }
            },
            _obtainHtml5Audio: function () {
              var e = this || n;
              if (e._html5AudioPool.length) return e._html5AudioPool.pop();
              var t = new Audio().play();
              return (
                t &&
                  typeof Promise < "u" &&
                  (t instanceof Promise || typeof t.then == "function") &&
                  t.catch(function () {
                    console.warn(
                      "HTML5 Audio pool exhausted, returning potentially locked audio object.",
                    );
                  }),
                new Audio()
              );
            },
            _releaseHtml5Audio: function (e) {
              var t = this || n;
              return (e._unlocked && t._html5AudioPool.push(e), t);
            },
            _autoSuspend: function () {
              var e = this;
              if (
                !(
                  !e.autoSuspend ||
                  !e.ctx ||
                  typeof e.ctx.suspend > "u" ||
                  !n.usingWebAudio
                )
              ) {
                for (var t = 0; t < e._howls.length; t++)
                  if (e._howls[t]._webAudio) {
                    for (var r = 0; r < e._howls[t]._sounds.length; r++)
                      if (!e._howls[t]._sounds[r]._paused) return e;
                  }
                return (
                  e._suspendTimer && clearTimeout(e._suspendTimer),
                  (e._suspendTimer = setTimeout(function () {
                    if (e.autoSuspend) {
                      ((e._suspendTimer = null), (e.state = "suspending"));
                      var o = function () {
                        ((e.state = "suspended"),
                          e._resumeAfterSuspend &&
                            (delete e._resumeAfterSuspend, e._autoResume()));
                      };
                      e.ctx.suspend().then(o, o);
                    }
                  }, 3e4)),
                  e
                );
              }
            },
            _autoResume: function () {
              var e = this;
              if (!(!e.ctx || typeof e.ctx.resume > "u" || !n.usingWebAudio))
                return (
                  e.state === "running" &&
                  e.ctx.state !== "interrupted" &&
                  e._suspendTimer
                    ? (clearTimeout(e._suspendTimer), (e._suspendTimer = null))
                    : e.state === "suspended" ||
                        (e.state === "running" && e.ctx.state === "interrupted")
                      ? (e.ctx.resume().then(function () {
                          e.state = "running";
                          for (var t = 0; t < e._howls.length; t++)
                            e._howls[t]._emit("resume");
                        }),
                        e._suspendTimer &&
                          (clearTimeout(e._suspendTimer),
                          (e._suspendTimer = null)))
                      : e.state === "suspending" &&
                        (e._resumeAfterSuspend = !0),
                  e
                );
            },
          };
          var n = new f(),
            a = function (e) {
              var t = this;
              if (!e.src || e.src.length === 0) {
                console.error(
                  "An array of source files must be passed with any new Howl.",
                );
                return;
              }
              t.init(e);
            };
          a.prototype = {
            init: function (e) {
              var t = this;
              return (
                n.ctx || T(),
                (t._autoplay = e.autoplay || !1),
                (t._format =
                  typeof e.format != "string" ? e.format : [e.format]),
                (t._html5 = e.html5 || !1),
                (t._muted = e.mute || !1),
                (t._loop = e.loop || !1),
                (t._pool = e.pool || 5),
                (t._preload =
                  typeof e.preload == "boolean" || e.preload === "metadata"
                    ? e.preload
                    : !0),
                (t._rate = e.rate || 1),
                (t._sprite = e.sprite || {}),
                (t._src = typeof e.src != "string" ? e.src : [e.src]),
                (t._volume = e.volume !== void 0 ? e.volume : 1),
                (t._xhr = {
                  method: e.xhr && e.xhr.method ? e.xhr.method : "GET",
                  headers: e.xhr && e.xhr.headers ? e.xhr.headers : null,
                  withCredentials:
                    e.xhr && e.xhr.withCredentials ? e.xhr.withCredentials : !1,
                }),
                (t._duration = 0),
                (t._state = "unloaded"),
                (t._sounds = []),
                (t._endTimers = {}),
                (t._queue = []),
                (t._playLock = !1),
                (t._onend = e.onend ? [{ fn: e.onend }] : []),
                (t._onfade = e.onfade ? [{ fn: e.onfade }] : []),
                (t._onload = e.onload ? [{ fn: e.onload }] : []),
                (t._onloaderror = e.onloaderror ? [{ fn: e.onloaderror }] : []),
                (t._onplayerror = e.onplayerror ? [{ fn: e.onplayerror }] : []),
                (t._onpause = e.onpause ? [{ fn: e.onpause }] : []),
                (t._onplay = e.onplay ? [{ fn: e.onplay }] : []),
                (t._onstop = e.onstop ? [{ fn: e.onstop }] : []),
                (t._onmute = e.onmute ? [{ fn: e.onmute }] : []),
                (t._onvolume = e.onvolume ? [{ fn: e.onvolume }] : []),
                (t._onrate = e.onrate ? [{ fn: e.onrate }] : []),
                (t._onseek = e.onseek ? [{ fn: e.onseek }] : []),
                (t._onunlock = e.onunlock ? [{ fn: e.onunlock }] : []),
                (t._onresume = []),
                (t._webAudio = n.usingWebAudio && !t._html5),
                typeof n.ctx < "u" && n.ctx && n.autoUnlock && n._unlockAudio(),
                n._howls.push(t),
                t._autoplay &&
                  t._queue.push({
                    event: "play",
                    action: function () {
                      t.play();
                    },
                  }),
                t._preload && t._preload !== "none" && t.load(),
                t
              );
            },
            load: function () {
              var e = this,
                t = null;
              if (n.noAudio) {
                e._emit("loaderror", null, "No audio support.");
                return;
              }
              typeof e._src == "string" && (e._src = [e._src]);
              for (var r = 0; r < e._src.length; r++) {
                var o, l;
                if (e._format && e._format[r]) o = e._format[r];
                else {
                  if (((l = e._src[r]), typeof l != "string")) {
                    e._emit(
                      "loaderror",
                      null,
                      "Non-string found in selected audio sources - ignoring.",
                    );
                    continue;
                  }
                  ((o = /^data:audio\/([^;,]+);/i.exec(l)),
                    o || (o = /\.([^.]+)$/.exec(l.split("?", 1)[0])),
                    o && (o = o[1].toLowerCase()));
                }
                if (
                  (o ||
                    console.warn(
                      'No file extension was found. Consider using the "format" property or specify an extension.',
                    ),
                  o && n.codecs(o))
                ) {
                  t = e._src[r];
                  break;
                }
              }
              if (!t) {
                e._emit(
                  "loaderror",
                  null,
                  "No codec support for selected audio sources.",
                );
                return;
              }
              return (
                (e._src = t),
                (e._state = "loading"),
                window.location.protocol === "https:" &&
                  t.slice(0, 5) === "http:" &&
                  ((e._html5 = !0), (e._webAudio = !1)),
                new i(e),
                e._webAudio && c(e),
                e
              );
            },
            play: function (e, t) {
              var r = this,
                o = null;
              if (typeof e == "number") ((o = e), (e = null));
              else {
                if (
                  typeof e == "string" &&
                  r._state === "loaded" &&
                  !r._sprite[e]
                )
                  return null;
                if (typeof e > "u" && ((e = "__default"), !r._playLock)) {
                  for (var l = 0, u = 0; u < r._sounds.length; u++)
                    r._sounds[u]._paused &&
                      !r._sounds[u]._ended &&
                      (l++, (o = r._sounds[u]._id));
                  l === 1 ? (e = null) : (o = null);
                }
              }
              var s = o ? r._soundById(o) : r._inactiveSound();
              if (!s) return null;
              if (
                (o && !e && (e = s._sprite || "__default"),
                r._state !== "loaded")
              ) {
                ((s._sprite = e), (s._ended = !1));
                var m = s._id;
                return (
                  r._queue.push({
                    event: "play",
                    action: function () {
                      r.play(m);
                    },
                  }),
                  m
                );
              }
              if (o && !s._paused) return (t || r._loadQueue("play"), s._id);
              r._webAudio && n._autoResume();
              var h = Math.max(
                  0,
                  s._seek > 0 ? s._seek : r._sprite[e][0] / 1e3,
                ),
                y = Math.max(0, (r._sprite[e][0] + r._sprite[e][1]) / 1e3 - h),
                b = (y * 1e3) / Math.abs(s._rate),
                E = r._sprite[e][0] / 1e3,
                S = (r._sprite[e][0] + r._sprite[e][1]) / 1e3;
              ((s._sprite = e), (s._ended = !1));
              var H = function () {
                ((s._paused = !1),
                  (s._seek = h),
                  (s._start = E),
                  (s._stop = S),
                  (s._loop = !!(s._loop || r._sprite[e][2])));
              };
              if (h >= S) {
                r._ended(s);
                return;
              }
              var v = s._node;
              if (r._webAudio) {
                var B = function () {
                  ((r._playLock = !1), H(), r._refreshBuffer(s));
                  var x = s._muted || r._muted ? 0 : s._volume;
                  (v.gain.setValueAtTime(x, n.ctx.currentTime),
                    (s._playStart = n.ctx.currentTime),
                    typeof v.bufferSource.start > "u"
                      ? s._loop
                        ? v.bufferSource.noteGrainOn(0, h, 86400)
                        : v.bufferSource.noteGrainOn(0, h, y)
                      : s._loop
                        ? v.bufferSource.start(0, h, 86400)
                        : v.bufferSource.start(0, h, y),
                    b !== 1 / 0 &&
                      (r._endTimers[s._id] = setTimeout(
                        r._ended.bind(r, s),
                        b,
                      )),
                    t ||
                      setTimeout(function () {
                        (r._emit("play", s._id), r._loadQueue());
                      }, 0));
                };
                n.state === "running" && n.ctx.state !== "interrupted"
                  ? B()
                  : ((r._playLock = !0),
                    r.once("resume", B),
                    r._clearTimer(s._id));
              } else {
                var G = function () {
                  ((v.currentTime = h),
                    (v.muted = s._muted || r._muted || n._muted || v.muted),
                    (v.volume = s._volume * n.volume()),
                    (v.playbackRate = s._rate));
                  try {
                    var x = v.play();
                    if (
                      (x &&
                      typeof Promise < "u" &&
                      (x instanceof Promise || typeof x.then == "function")
                        ? ((r._playLock = !0),
                          H(),
                          x
                            .then(function () {
                              ((r._playLock = !1),
                                (v._unlocked = !0),
                                t ? r._loadQueue() : r._emit("play", s._id));
                            })
                            .catch(function () {
                              ((r._playLock = !1),
                                r._emit(
                                  "playerror",
                                  s._id,
                                  "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.",
                                ),
                                (s._ended = !0),
                                (s._paused = !0));
                            }))
                        : t ||
                          ((r._playLock = !1), H(), r._emit("play", s._id)),
                      (v.playbackRate = s._rate),
                      v.paused)
                    ) {
                      r._emit(
                        "playerror",
                        s._id,
                        "Playback was unable to start. This is most commonly an issue on mobile devices and Chrome where playback was not within a user interaction.",
                      );
                      return;
                    }
                    e !== "__default" || s._loop
                      ? (r._endTimers[s._id] = setTimeout(
                          r._ended.bind(r, s),
                          b,
                        ))
                      : ((r._endTimers[s._id] = function () {
                          (r._ended(s),
                            v.removeEventListener(
                              "ended",
                              r._endTimers[s._id],
                              !1,
                            ));
                        }),
                        v.addEventListener("ended", r._endTimers[s._id], !1));
                  } catch (N) {
                    r._emit("playerror", s._id, N);
                  }
                };
                v.src ===
                  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA" &&
                  ((v.src = r._src), v.load());
                var F =
                  (window && window.ejecta) ||
                  (!v.readyState && n._navigator.isCocoonJS);
                if (v.readyState >= 3 || F) G();
                else {
                  ((r._playLock = !0), (r._state = "loading"));
                  var M = function () {
                    ((r._state = "loaded"),
                      G(),
                      v.removeEventListener(n._canPlayEvent, M, !1));
                  };
                  (v.addEventListener(n._canPlayEvent, M, !1),
                    r._clearTimer(s._id));
                }
              }
              return s._id;
            },
            pause: function (e) {
              var t = this;
              if (t._state !== "loaded" || t._playLock)
                return (
                  t._queue.push({
                    event: "pause",
                    action: function () {
                      t.pause(e);
                    },
                  }),
                  t
                );
              for (var r = t._getSoundIds(e), o = 0; o < r.length; o++) {
                t._clearTimer(r[o]);
                var l = t._soundById(r[o]);
                if (
                  l &&
                  !l._paused &&
                  ((l._seek = t.seek(r[o])),
                  (l._rateSeek = 0),
                  (l._paused = !0),
                  t._stopFade(r[o]),
                  l._node)
                )
                  if (t._webAudio) {
                    if (!l._node.bufferSource) continue;
                    (typeof l._node.bufferSource.stop > "u"
                      ? l._node.bufferSource.noteOff(0)
                      : l._node.bufferSource.stop(0),
                      t._cleanBuffer(l._node));
                  } else
                    (!isNaN(l._node.duration) || l._node.duration === 1 / 0) &&
                      l._node.pause();
                arguments[1] || t._emit("pause", l ? l._id : null);
              }
              return t;
            },
            stop: function (e, t) {
              var r = this;
              if (r._state !== "loaded" || r._playLock)
                return (
                  r._queue.push({
                    event: "stop",
                    action: function () {
                      r.stop(e);
                    },
                  }),
                  r
                );
              for (var o = r._getSoundIds(e), l = 0; l < o.length; l++) {
                r._clearTimer(o[l]);
                var u = r._soundById(o[l]);
                u &&
                  ((u._seek = u._start || 0),
                  (u._rateSeek = 0),
                  (u._paused = !0),
                  (u._ended = !0),
                  r._stopFade(o[l]),
                  u._node &&
                    (r._webAudio
                      ? u._node.bufferSource &&
                        (typeof u._node.bufferSource.stop > "u"
                          ? u._node.bufferSource.noteOff(0)
                          : u._node.bufferSource.stop(0),
                        r._cleanBuffer(u._node))
                      : (!isNaN(u._node.duration) ||
                          u._node.duration === 1 / 0) &&
                        ((u._node.currentTime = u._start || 0),
                        u._node.pause(),
                        u._node.duration === 1 / 0 && r._clearSound(u._node))),
                  t || r._emit("stop", u._id));
              }
              return r;
            },
            mute: function (e, t) {
              var r = this;
              if (r._state !== "loaded" || r._playLock)
                return (
                  r._queue.push({
                    event: "mute",
                    action: function () {
                      r.mute(e, t);
                    },
                  }),
                  r
                );
              if (typeof t > "u")
                if (typeof e == "boolean") r._muted = e;
                else return r._muted;
              for (var o = r._getSoundIds(t), l = 0; l < o.length; l++) {
                var u = r._soundById(o[l]);
                u &&
                  ((u._muted = e),
                  u._interval && r._stopFade(u._id),
                  r._webAudio && u._node
                    ? u._node.gain.setValueAtTime(
                        e ? 0 : u._volume,
                        n.ctx.currentTime,
                      )
                    : u._node && (u._node.muted = n._muted ? !0 : e),
                  r._emit("mute", u._id));
              }
              return r;
            },
            volume: function () {
              var e = this,
                t = arguments,
                r,
                o;
              if (t.length === 0) return e._volume;
              if (t.length === 1 || (t.length === 2 && typeof t[1] > "u")) {
                var l = e._getSoundIds(),
                  u = l.indexOf(t[0]);
                u >= 0 ? (o = parseInt(t[0], 10)) : (r = parseFloat(t[0]));
              } else
                t.length >= 2 &&
                  ((r = parseFloat(t[0])), (o = parseInt(t[1], 10)));
              var s;
              if (typeof r < "u" && r >= 0 && r <= 1) {
                if (e._state !== "loaded" || e._playLock)
                  return (
                    e._queue.push({
                      event: "volume",
                      action: function () {
                        e.volume.apply(e, t);
                      },
                    }),
                    e
                  );
                (typeof o > "u" && (e._volume = r), (o = e._getSoundIds(o)));
                for (var m = 0; m < o.length; m++)
                  ((s = e._soundById(o[m])),
                    s &&
                      ((s._volume = r),
                      t[2] || e._stopFade(o[m]),
                      e._webAudio && s._node && !s._muted
                        ? s._node.gain.setValueAtTime(r, n.ctx.currentTime)
                        : s._node &&
                          !s._muted &&
                          (s._node.volume = r * n.volume()),
                      e._emit("volume", s._id)));
              } else
                return (
                  (s = o ? e._soundById(o) : e._sounds[0]),
                  s ? s._volume : 0
                );
              return e;
            },
            fade: function (e, t, r, o) {
              var l = this;
              if (l._state !== "loaded" || l._playLock)
                return (
                  l._queue.push({
                    event: "fade",
                    action: function () {
                      l.fade(e, t, r, o);
                    },
                  }),
                  l
                );
              ((e = Math.min(Math.max(0, parseFloat(e)), 1)),
                (t = Math.min(Math.max(0, parseFloat(t)), 1)),
                (r = parseFloat(r)),
                l.volume(e, o));
              for (var u = l._getSoundIds(o), s = 0; s < u.length; s++) {
                var m = l._soundById(u[s]);
                if (m) {
                  if ((o || l._stopFade(u[s]), l._webAudio && !m._muted)) {
                    var h = n.ctx.currentTime,
                      y = h + r / 1e3;
                    ((m._volume = e),
                      m._node.gain.setValueAtTime(e, h),
                      m._node.gain.linearRampToValueAtTime(t, y));
                  }
                  l._startFadeInterval(m, e, t, r, u[s], typeof o > "u");
                }
              }
              return l;
            },
            _startFadeInterval: function (e, t, r, o, l, u) {
              var s = this,
                m = t,
                h = r - t,
                y = Math.abs(h / 0.01),
                b = Math.max(4, y > 0 ? o / y : o),
                E = Date.now();
              ((e._fadeTo = r),
                (e._interval = setInterval(function () {
                  var S = (Date.now() - E) / o;
                  ((E = Date.now()),
                    (m += h * S),
                    (m = Math.round(m * 100) / 100),
                    h < 0 ? (m = Math.max(r, m)) : (m = Math.min(r, m)),
                    s._webAudio ? (e._volume = m) : s.volume(m, e._id, !0),
                    u && (s._volume = m),
                    ((r < t && m <= r) || (r > t && m >= r)) &&
                      (clearInterval(e._interval),
                      (e._interval = null),
                      (e._fadeTo = null),
                      s.volume(r, e._id),
                      s._emit("fade", e._id)));
                }, b)));
            },
            _stopFade: function (e) {
              var t = this,
                r = t._soundById(e);
              return (
                r &&
                  r._interval &&
                  (t._webAudio &&
                    r._node.gain.cancelScheduledValues(n.ctx.currentTime),
                  clearInterval(r._interval),
                  (r._interval = null),
                  t.volume(r._fadeTo, e),
                  (r._fadeTo = null),
                  t._emit("fade", e)),
                t
              );
            },
            loop: function () {
              var e = this,
                t = arguments,
                r,
                o,
                l;
              if (t.length === 0) return e._loop;
              if (t.length === 1)
                if (typeof t[0] == "boolean") ((r = t[0]), (e._loop = r));
                else
                  return (
                    (l = e._soundById(parseInt(t[0], 10))),
                    l ? l._loop : !1
                  );
              else t.length === 2 && ((r = t[0]), (o = parseInt(t[1], 10)));
              for (var u = e._getSoundIds(o), s = 0; s < u.length; s++)
                ((l = e._soundById(u[s])),
                  l &&
                    ((l._loop = r),
                    e._webAudio &&
                      l._node &&
                      l._node.bufferSource &&
                      ((l._node.bufferSource.loop = r),
                      r &&
                        ((l._node.bufferSource.loopStart = l._start || 0),
                        (l._node.bufferSource.loopEnd = l._stop),
                        e.playing(u[s]) &&
                          (e.pause(u[s], !0), e.play(u[s], !0))))));
              return e;
            },
            rate: function () {
              var e = this,
                t = arguments,
                r,
                o;
              if (t.length === 0) o = e._sounds[0]._id;
              else if (t.length === 1) {
                var l = e._getSoundIds(),
                  u = l.indexOf(t[0]);
                u >= 0 ? (o = parseInt(t[0], 10)) : (r = parseFloat(t[0]));
              } else
                t.length === 2 &&
                  ((r = parseFloat(t[0])), (o = parseInt(t[1], 10)));
              var s;
              if (typeof r == "number") {
                if (e._state !== "loaded" || e._playLock)
                  return (
                    e._queue.push({
                      event: "rate",
                      action: function () {
                        e.rate.apply(e, t);
                      },
                    }),
                    e
                  );
                (typeof o > "u" && (e._rate = r), (o = e._getSoundIds(o)));
                for (var m = 0; m < o.length; m++)
                  if (((s = e._soundById(o[m])), s)) {
                    (e.playing(o[m]) &&
                      ((s._rateSeek = e.seek(o[m])),
                      (s._playStart = e._webAudio
                        ? n.ctx.currentTime
                        : s._playStart)),
                      (s._rate = r),
                      e._webAudio && s._node && s._node.bufferSource
                        ? s._node.bufferSource.playbackRate.setValueAtTime(
                            r,
                            n.ctx.currentTime,
                          )
                        : s._node && (s._node.playbackRate = r));
                    var h = e.seek(o[m]),
                      y =
                        (e._sprite[s._sprite][0] + e._sprite[s._sprite][1]) /
                          1e3 -
                        h,
                      b = (y * 1e3) / Math.abs(s._rate);
                    ((e._endTimers[o[m]] || !s._paused) &&
                      (e._clearTimer(o[m]),
                      (e._endTimers[o[m]] = setTimeout(
                        e._ended.bind(e, s),
                        b,
                      ))),
                      e._emit("rate", s._id));
                  }
              } else return ((s = e._soundById(o)), s ? s._rate : e._rate);
              return e;
            },
            seek: function () {
              var e = this,
                t = arguments,
                r,
                o;
              if (t.length === 0) e._sounds.length && (o = e._sounds[0]._id);
              else if (t.length === 1) {
                var l = e._getSoundIds(),
                  u = l.indexOf(t[0]);
                u >= 0
                  ? (o = parseInt(t[0], 10))
                  : e._sounds.length &&
                    ((o = e._sounds[0]._id), (r = parseFloat(t[0])));
              } else
                t.length === 2 &&
                  ((r = parseFloat(t[0])), (o = parseInt(t[1], 10)));
              if (typeof o > "u") return 0;
              if (
                typeof r == "number" &&
                (e._state !== "loaded" || e._playLock)
              )
                return (
                  e._queue.push({
                    event: "seek",
                    action: function () {
                      e.seek.apply(e, t);
                    },
                  }),
                  e
                );
              var s = e._soundById(o);
              if (s)
                if (typeof r == "number" && r >= 0) {
                  var m = e.playing(o);
                  (m && e.pause(o, !0),
                    (s._seek = r),
                    (s._ended = !1),
                    e._clearTimer(o),
                    !e._webAudio &&
                      s._node &&
                      !isNaN(s._node.duration) &&
                      (s._node.currentTime = r));
                  var h = function () {
                    (m && e.play(o, !0), e._emit("seek", o));
                  };
                  if (m && !e._webAudio) {
                    var y = function () {
                      e._playLock ? setTimeout(y, 0) : h();
                    };
                    setTimeout(y, 0);
                  } else h();
                } else if (e._webAudio) {
                  var b = e.playing(o) ? n.ctx.currentTime - s._playStart : 0,
                    E = s._rateSeek ? s._rateSeek - s._seek : 0;
                  return s._seek + (E + b * Math.abs(s._rate));
                } else return s._node.currentTime;
              return e;
            },
            playing: function (e) {
              var t = this;
              if (typeof e == "number") {
                var r = t._soundById(e);
                return r ? !r._paused : !1;
              }
              for (var o = 0; o < t._sounds.length; o++)
                if (!t._sounds[o]._paused) return !0;
              return !1;
            },
            duration: function (e) {
              var t = this,
                r = t._duration,
                o = t._soundById(e);
              return (o && (r = t._sprite[o._sprite][1] / 1e3), r);
            },
            state: function () {
              return this._state;
            },
            unload: function () {
              for (var e = this, t = e._sounds, r = 0; r < t.length; r++)
                (t[r]._paused || e.stop(t[r]._id),
                  e._webAudio ||
                    (e._clearSound(t[r]._node),
                    t[r]._node.removeEventListener("error", t[r]._errorFn, !1),
                    t[r]._node.removeEventListener(
                      n._canPlayEvent,
                      t[r]._loadFn,
                      !1,
                    ),
                    t[r]._node.removeEventListener("ended", t[r]._endFn, !1),
                    n._releaseHtml5Audio(t[r]._node)),
                  delete t[r]._node,
                  e._clearTimer(t[r]._id));
              var o = n._howls.indexOf(e);
              o >= 0 && n._howls.splice(o, 1);
              var l = !0;
              for (r = 0; r < n._howls.length; r++)
                if (
                  n._howls[r]._src === e._src ||
                  e._src.indexOf(n._howls[r]._src) >= 0
                ) {
                  l = !1;
                  break;
                }
              return (
                d && l && delete d[e._src],
                (n.noAudio = !1),
                (e._state = "unloaded"),
                (e._sounds = []),
                (e = null),
                null
              );
            },
            on: function (e, t, r, o) {
              var l = this,
                u = l["_on" + e];
              return (
                typeof t == "function" &&
                  u.push(o ? { id: r, fn: t, once: o } : { id: r, fn: t }),
                l
              );
            },
            off: function (e, t, r) {
              var o = this,
                l = o["_on" + e],
                u = 0;
              if ((typeof t == "number" && ((r = t), (t = null)), t || r))
                for (u = 0; u < l.length; u++) {
                  var s = r === l[u].id;
                  if ((t === l[u].fn && s) || (!t && s)) {
                    l.splice(u, 1);
                    break;
                  }
                }
              else if (e) o["_on" + e] = [];
              else {
                var m = Object.keys(o);
                for (u = 0; u < m.length; u++)
                  m[u].indexOf("_on") === 0 &&
                    Array.isArray(o[m[u]]) &&
                    (o[m[u]] = []);
              }
              return o;
            },
            once: function (e, t, r) {
              var o = this;
              return (o.on(e, t, r, 1), o);
            },
            _emit: function (e, t, r) {
              for (
                var o = this, l = o["_on" + e], u = l.length - 1;
                u >= 0;
                u--
              )
                (!l[u].id || l[u].id === t || e === "load") &&
                  (setTimeout(
                    function (s) {
                      s.call(this, t, r);
                    }.bind(o, l[u].fn),
                    0,
                  ),
                  l[u].once && o.off(e, l[u].fn, l[u].id));
              return (o._loadQueue(e), o);
            },
            _loadQueue: function (e) {
              var t = this;
              if (t._queue.length > 0) {
                var r = t._queue[0];
                (r.event === e && (t._queue.shift(), t._loadQueue()),
                  e || r.action());
              }
              return t;
            },
            _ended: function (e) {
              var t = this,
                r = e._sprite;
              if (
                !t._webAudio &&
                e._node &&
                !e._node.paused &&
                !e._node.ended &&
                e._node.currentTime < e._stop
              )
                return (setTimeout(t._ended.bind(t, e), 100), t);
              var o = !!(e._loop || t._sprite[r][2]);
              if (
                (t._emit("end", e._id),
                !t._webAudio && o && t.stop(e._id, !0).play(e._id),
                t._webAudio && o)
              ) {
                (t._emit("play", e._id),
                  (e._seek = e._start || 0),
                  (e._rateSeek = 0),
                  (e._playStart = n.ctx.currentTime));
                var l = ((e._stop - e._start) * 1e3) / Math.abs(e._rate);
                t._endTimers[e._id] = setTimeout(t._ended.bind(t, e), l);
              }
              return (
                t._webAudio &&
                  !o &&
                  ((e._paused = !0),
                  (e._ended = !0),
                  (e._seek = e._start || 0),
                  (e._rateSeek = 0),
                  t._clearTimer(e._id),
                  t._cleanBuffer(e._node),
                  n._autoSuspend()),
                !t._webAudio && !o && t.stop(e._id, !0),
                t
              );
            },
            _clearTimer: function (e) {
              var t = this;
              if (t._endTimers[e]) {
                if (typeof t._endTimers[e] != "function")
                  clearTimeout(t._endTimers[e]);
                else {
                  var r = t._soundById(e);
                  r &&
                    r._node &&
                    r._node.removeEventListener("ended", t._endTimers[e], !1);
                }
                delete t._endTimers[e];
              }
              return t;
            },
            _soundById: function (e) {
              for (var t = this, r = 0; r < t._sounds.length; r++)
                if (e === t._sounds[r]._id) return t._sounds[r];
              return null;
            },
            _inactiveSound: function () {
              var e = this;
              e._drain();
              for (var t = 0; t < e._sounds.length; t++)
                if (e._sounds[t]._ended) return e._sounds[t].reset();
              return new i(e);
            },
            _drain: function () {
              var e = this,
                t = e._pool,
                r = 0,
                o = 0;
              if (!(e._sounds.length < t)) {
                for (o = 0; o < e._sounds.length; o++)
                  e._sounds[o]._ended && r++;
                for (o = e._sounds.length - 1; o >= 0; o--) {
                  if (r <= t) return;
                  e._sounds[o]._ended &&
                    (e._webAudio &&
                      e._sounds[o]._node &&
                      e._sounds[o]._node.disconnect(0),
                    e._sounds.splice(o, 1),
                    r--);
                }
              }
            },
            _getSoundIds: function (e) {
              var t = this;
              if (typeof e > "u") {
                for (var r = [], o = 0; o < t._sounds.length; o++)
                  r.push(t._sounds[o]._id);
                return r;
              } else return [e];
            },
            _refreshBuffer: function (e) {
              var t = this;
              return (
                (e._node.bufferSource = n.ctx.createBufferSource()),
                (e._node.bufferSource.buffer = d[t._src]),
                e._panner
                  ? e._node.bufferSource.connect(e._panner)
                  : e._node.bufferSource.connect(e._node),
                (e._node.bufferSource.loop = e._loop),
                e._loop &&
                  ((e._node.bufferSource.loopStart = e._start || 0),
                  (e._node.bufferSource.loopEnd = e._stop || 0)),
                e._node.bufferSource.playbackRate.setValueAtTime(
                  e._rate,
                  n.ctx.currentTime,
                ),
                t
              );
            },
            _cleanBuffer: function (e) {
              var t = this,
                r = n._navigator && n._navigator.vendor.indexOf("Apple") >= 0;
              if (!e.bufferSource) return t;
              if (
                n._scratchBuffer &&
                e.bufferSource &&
                ((e.bufferSource.onended = null),
                e.bufferSource.disconnect(0),
                r)
              )
                try {
                  e.bufferSource.buffer = n._scratchBuffer;
                } catch {}
              return ((e.bufferSource = null), t);
            },
            _clearSound: function (e) {
              var t = /MSIE |Trident\//.test(
                n._navigator && n._navigator.userAgent,
              );
              t ||
                (e.src =
                  "data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
            },
          };
          var i = function (e) {
            ((this._parent = e), this.init());
          };
          i.prototype = {
            init: function () {
              var e = this,
                t = e._parent;
              return (
                (e._muted = t._muted),
                (e._loop = t._loop),
                (e._volume = t._volume),
                (e._rate = t._rate),
                (e._seek = 0),
                (e._paused = !0),
                (e._ended = !0),
                (e._sprite = "__default"),
                (e._id = ++n._counter),
                t._sounds.push(e),
                e.create(),
                e
              );
            },
            create: function () {
              var e = this,
                t = e._parent,
                r = n._muted || e._muted || e._parent._muted ? 0 : e._volume;
              return (
                t._webAudio
                  ? ((e._node =
                      typeof n.ctx.createGain > "u"
                        ? n.ctx.createGainNode()
                        : n.ctx.createGain()),
                    e._node.gain.setValueAtTime(r, n.ctx.currentTime),
                    (e._node.paused = !0),
                    e._node.connect(n.masterGain))
                  : n.noAudio ||
                    ((e._node = n._obtainHtml5Audio()),
                    (e._errorFn = e._errorListener.bind(e)),
                    e._node.addEventListener("error", e._errorFn, !1),
                    (e._loadFn = e._loadListener.bind(e)),
                    e._node.addEventListener(n._canPlayEvent, e._loadFn, !1),
                    (e._endFn = e._endListener.bind(e)),
                    e._node.addEventListener("ended", e._endFn, !1),
                    (e._node.src = t._src),
                    (e._node.preload = t._preload === !0 ? "auto" : t._preload),
                    (e._node.volume = r * n.volume()),
                    e._node.load()),
                e
              );
            },
            reset: function () {
              var e = this,
                t = e._parent;
              return (
                (e._muted = t._muted),
                (e._loop = t._loop),
                (e._volume = t._volume),
                (e._rate = t._rate),
                (e._seek = 0),
                (e._rateSeek = 0),
                (e._paused = !0),
                (e._ended = !0),
                (e._sprite = "__default"),
                (e._id = ++n._counter),
                e
              );
            },
            _errorListener: function () {
              var e = this;
              (e._parent._emit(
                "loaderror",
                e._id,
                e._node.error ? e._node.error.code : 0,
              ),
                e._node.removeEventListener("error", e._errorFn, !1));
            },
            _loadListener: function () {
              var e = this,
                t = e._parent;
              ((t._duration = Math.ceil(e._node.duration * 10) / 10),
                Object.keys(t._sprite).length === 0 &&
                  (t._sprite = { __default: [0, t._duration * 1e3] }),
                t._state !== "loaded" &&
                  ((t._state = "loaded"), t._emit("load"), t._loadQueue()),
                e._node.removeEventListener(n._canPlayEvent, e._loadFn, !1));
            },
            _endListener: function () {
              var e = this,
                t = e._parent;
              (t._duration === 1 / 0 &&
                ((t._duration = Math.ceil(e._node.duration * 10) / 10),
                t._sprite.__default[1] === 1 / 0 &&
                  (t._sprite.__default[1] = t._duration * 1e3),
                t._ended(e)),
                e._node.removeEventListener("ended", e._endFn, !1));
            },
          };
          var d = {},
            c = function (e) {
              var t = e._src;
              if (d[t]) {
                ((e._duration = d[t].duration), _(e));
                return;
              }
              if (/^data:[^;]+;base64,/.test(t)) {
                for (
                  var r = atob(t.split(",")[1]),
                    o = new Uint8Array(r.length),
                    l = 0;
                  l < r.length;
                  ++l
                )
                  o[l] = r.charCodeAt(l);
                p(o.buffer, e);
              } else {
                var u = new XMLHttpRequest();
                (u.open(e._xhr.method, t, !0),
                  (u.withCredentials = e._xhr.withCredentials),
                  (u.responseType = "arraybuffer"),
                  e._xhr.headers &&
                    Object.keys(e._xhr.headers).forEach(function (s) {
                      u.setRequestHeader(s, e._xhr.headers[s]);
                    }),
                  (u.onload = function () {
                    var s = (u.status + "")[0];
                    if (s !== "0" && s !== "2" && s !== "3") {
                      e._emit(
                        "loaderror",
                        null,
                        "Failed loading audio file with status: " +
                          u.status +
                          ".",
                      );
                      return;
                    }
                    p(u.response, e);
                  }),
                  (u.onerror = function () {
                    e._webAudio &&
                      ((e._html5 = !0),
                      (e._webAudio = !1),
                      (e._sounds = []),
                      delete d[t],
                      e.load());
                  }),
                  g(u));
              }
            },
            g = function (e) {
              try {
                e.send();
              } catch {
                e.onerror();
              }
            },
            p = function (e, t) {
              var r = function () {
                  t._emit("loaderror", null, "Decoding audio data failed.");
                },
                o = function (l) {
                  l && t._sounds.length > 0 ? ((d[t._src] = l), _(t, l)) : r();
                };
              typeof Promise < "u" && n.ctx.decodeAudioData.length === 1
                ? n.ctx.decodeAudioData(e).then(o).catch(r)
                : n.ctx.decodeAudioData(e, o, r);
            },
            _ = function (e, t) {
              (t && !e._duration && (e._duration = t.duration),
                Object.keys(e._sprite).length === 0 &&
                  (e._sprite = { __default: [0, e._duration * 1e3] }),
                e._state !== "loaded" &&
                  ((e._state = "loaded"), e._emit("load"), e._loadQueue()));
            },
            T = function () {
              if (n.usingWebAudio) {
                try {
                  typeof AudioContext < "u"
                    ? (n.ctx = new AudioContext())
                    : typeof webkitAudioContext < "u"
                      ? (n.ctx = new webkitAudioContext())
                      : (n.usingWebAudio = !1);
                } catch {
                  n.usingWebAudio = !1;
                }
                n.ctx || (n.usingWebAudio = !1);
                var e = /iP(hone|od|ad)/.test(
                    n._navigator && n._navigator.platform,
                  ),
                  t =
                    n._navigator &&
                    n._navigator.appVersion.match(/OS (\d+)_(\d+)_?(\d+)?/),
                  r = t ? parseInt(t[1], 10) : null;
                if (e && r && r < 9) {
                  var o = /safari/.test(
                    n._navigator && n._navigator.userAgent.toLowerCase(),
                  );
                  n._navigator && !o && (n.usingWebAudio = !1);
                }
                (n.usingWebAudio &&
                  ((n.masterGain =
                    typeof n.ctx.createGain > "u"
                      ? n.ctx.createGainNode()
                      : n.ctx.createGain()),
                  n.masterGain.gain.setValueAtTime(
                    n._muted ? 0 : n._volume,
                    n.ctx.currentTime,
                  ),
                  n.masterGain.connect(n.ctx.destination)),
                  n._setup());
              }
            };
          ((A.Howler = n),
            (A.Howl = a),
            typeof I < "u"
              ? ((I.HowlerGlobal = f),
                (I.Howler = n),
                (I.Howl = a),
                (I.Sound = i))
              : typeof window < "u" &&
                ((window.HowlerGlobal = f),
                (window.Howler = n),
                (window.Howl = a),
                (window.Sound = i)));
        })();
        /*!
         *  Spatial Plugin - Adds support for stereo and 3D audio where Web Audio is supported.
         *
         *  howler.js v2.2.4
         *  howlerjs.com
         *
         *  (c) 2013-2020, James Simpson of GoldFire Studios
         *  goldfirestudios.com
         *
         *  MIT License
         */ (function () {
          ((HowlerGlobal.prototype._pos = [0, 0, 0]),
            (HowlerGlobal.prototype._orientation = [0, 0, -1, 0, 1, 0]),
            (HowlerGlobal.prototype.stereo = function (n) {
              var a = this;
              if (!a.ctx || !a.ctx.listener) return a;
              for (var i = a._howls.length - 1; i >= 0; i--)
                a._howls[i].stereo(n);
              return a;
            }),
            (HowlerGlobal.prototype.pos = function (n, a, i) {
              var d = this;
              if (!d.ctx || !d.ctx.listener) return d;
              if (
                ((a = typeof a != "number" ? d._pos[1] : a),
                (i = typeof i != "number" ? d._pos[2] : i),
                typeof n == "number")
              )
                ((d._pos = [n, a, i]),
                  typeof d.ctx.listener.positionX < "u"
                    ? (d.ctx.listener.positionX.setTargetAtTime(
                        d._pos[0],
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      d.ctx.listener.positionY.setTargetAtTime(
                        d._pos[1],
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      d.ctx.listener.positionZ.setTargetAtTime(
                        d._pos[2],
                        Howler.ctx.currentTime,
                        0.1,
                      ))
                    : d.ctx.listener.setPosition(
                        d._pos[0],
                        d._pos[1],
                        d._pos[2],
                      ));
              else return d._pos;
              return d;
            }),
            (HowlerGlobal.prototype.orientation = function (n, a, i, d, c, g) {
              var p = this;
              if (!p.ctx || !p.ctx.listener) return p;
              var _ = p._orientation;
              if (
                ((a = typeof a != "number" ? _[1] : a),
                (i = typeof i != "number" ? _[2] : i),
                (d = typeof d != "number" ? _[3] : d),
                (c = typeof c != "number" ? _[4] : c),
                (g = typeof g != "number" ? _[5] : g),
                typeof n == "number")
              )
                ((p._orientation = [n, a, i, d, c, g]),
                  typeof p.ctx.listener.forwardX < "u"
                    ? (p.ctx.listener.forwardX.setTargetAtTime(
                        n,
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      p.ctx.listener.forwardY.setTargetAtTime(
                        a,
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      p.ctx.listener.forwardZ.setTargetAtTime(
                        i,
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      p.ctx.listener.upX.setTargetAtTime(
                        d,
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      p.ctx.listener.upY.setTargetAtTime(
                        c,
                        Howler.ctx.currentTime,
                        0.1,
                      ),
                      p.ctx.listener.upZ.setTargetAtTime(
                        g,
                        Howler.ctx.currentTime,
                        0.1,
                      ))
                    : p.ctx.listener.setOrientation(n, a, i, d, c, g));
              else return _;
              return p;
            }),
            (Howl.prototype.init = (function (n) {
              return function (a) {
                var i = this;
                return (
                  (i._orientation = a.orientation || [1, 0, 0]),
                  (i._stereo = a.stereo || null),
                  (i._pos = a.pos || null),
                  (i._pannerAttr = {
                    coneInnerAngle:
                      typeof a.coneInnerAngle < "u" ? a.coneInnerAngle : 360,
                    coneOuterAngle:
                      typeof a.coneOuterAngle < "u" ? a.coneOuterAngle : 360,
                    coneOuterGain:
                      typeof a.coneOuterGain < "u" ? a.coneOuterGain : 0,
                    distanceModel:
                      typeof a.distanceModel < "u"
                        ? a.distanceModel
                        : "inverse",
                    maxDistance:
                      typeof a.maxDistance < "u" ? a.maxDistance : 1e4,
                    panningModel:
                      typeof a.panningModel < "u" ? a.panningModel : "HRTF",
                    refDistance: typeof a.refDistance < "u" ? a.refDistance : 1,
                    rolloffFactor:
                      typeof a.rolloffFactor < "u" ? a.rolloffFactor : 1,
                  }),
                  (i._onstereo = a.onstereo ? [{ fn: a.onstereo }] : []),
                  (i._onpos = a.onpos ? [{ fn: a.onpos }] : []),
                  (i._onorientation = a.onorientation
                    ? [{ fn: a.onorientation }]
                    : []),
                  n.call(this, a)
                );
              };
            })(Howl.prototype.init)),
            (Howl.prototype.stereo = function (n, a) {
              var i = this;
              if (!i._webAudio) return i;
              if (i._state !== "loaded")
                return (
                  i._queue.push({
                    event: "stereo",
                    action: function () {
                      i.stereo(n, a);
                    },
                  }),
                  i
                );
              var d =
                typeof Howler.ctx.createStereoPanner > "u"
                  ? "spatial"
                  : "stereo";
              if (typeof a > "u")
                if (typeof n == "number")
                  ((i._stereo = n), (i._pos = [n, 0, 0]));
                else return i._stereo;
              for (var c = i._getSoundIds(a), g = 0; g < c.length; g++) {
                var p = i._soundById(c[g]);
                if (p)
                  if (typeof n == "number")
                    ((p._stereo = n),
                      (p._pos = [n, 0, 0]),
                      p._node &&
                        ((p._pannerAttr.panningModel = "equalpower"),
                        (!p._panner || !p._panner.pan) && f(p, d),
                        d === "spatial"
                          ? typeof p._panner.positionX < "u"
                            ? (p._panner.positionX.setValueAtTime(
                                n,
                                Howler.ctx.currentTime,
                              ),
                              p._panner.positionY.setValueAtTime(
                                0,
                                Howler.ctx.currentTime,
                              ),
                              p._panner.positionZ.setValueAtTime(
                                0,
                                Howler.ctx.currentTime,
                              ))
                            : p._panner.setPosition(n, 0, 0)
                          : p._panner.pan.setValueAtTime(
                              n,
                              Howler.ctx.currentTime,
                            )),
                      i._emit("stereo", p._id));
                  else return p._stereo;
              }
              return i;
            }),
            (Howl.prototype.pos = function (n, a, i, d) {
              var c = this;
              if (!c._webAudio) return c;
              if (c._state !== "loaded")
                return (
                  c._queue.push({
                    event: "pos",
                    action: function () {
                      c.pos(n, a, i, d);
                    },
                  }),
                  c
                );
              if (
                ((a = typeof a != "number" ? 0 : a),
                (i = typeof i != "number" ? -0.5 : i),
                typeof d > "u")
              )
                if (typeof n == "number") c._pos = [n, a, i];
                else return c._pos;
              for (var g = c._getSoundIds(d), p = 0; p < g.length; p++) {
                var _ = c._soundById(g[p]);
                if (_)
                  if (typeof n == "number")
                    ((_._pos = [n, a, i]),
                      _._node &&
                        ((!_._panner || _._panner.pan) && f(_, "spatial"),
                        typeof _._panner.positionX < "u"
                          ? (_._panner.positionX.setValueAtTime(
                              n,
                              Howler.ctx.currentTime,
                            ),
                            _._panner.positionY.setValueAtTime(
                              a,
                              Howler.ctx.currentTime,
                            ),
                            _._panner.positionZ.setValueAtTime(
                              i,
                              Howler.ctx.currentTime,
                            ))
                          : _._panner.setPosition(n, a, i)),
                      c._emit("pos", _._id));
                  else return _._pos;
              }
              return c;
            }),
            (Howl.prototype.orientation = function (n, a, i, d) {
              var c = this;
              if (!c._webAudio) return c;
              if (c._state !== "loaded")
                return (
                  c._queue.push({
                    event: "orientation",
                    action: function () {
                      c.orientation(n, a, i, d);
                    },
                  }),
                  c
                );
              if (
                ((a = typeof a != "number" ? c._orientation[1] : a),
                (i = typeof i != "number" ? c._orientation[2] : i),
                typeof d > "u")
              )
                if (typeof n == "number") c._orientation = [n, a, i];
                else return c._orientation;
              for (var g = c._getSoundIds(d), p = 0; p < g.length; p++) {
                var _ = c._soundById(g[p]);
                if (_)
                  if (typeof n == "number")
                    ((_._orientation = [n, a, i]),
                      _._node &&
                        (_._panner ||
                          (_._pos || (_._pos = c._pos || [0, 0, -0.5]),
                          f(_, "spatial")),
                        typeof _._panner.orientationX < "u"
                          ? (_._panner.orientationX.setValueAtTime(
                              n,
                              Howler.ctx.currentTime,
                            ),
                            _._panner.orientationY.setValueAtTime(
                              a,
                              Howler.ctx.currentTime,
                            ),
                            _._panner.orientationZ.setValueAtTime(
                              i,
                              Howler.ctx.currentTime,
                            ))
                          : _._panner.setOrientation(n, a, i)),
                      c._emit("orientation", _._id));
                  else return _._orientation;
              }
              return c;
            }),
            (Howl.prototype.pannerAttr = function () {
              var n = this,
                a = arguments,
                i,
                d,
                c;
              if (!n._webAudio) return n;
              if (a.length === 0) return n._pannerAttr;
              if (a.length === 1)
                if (typeof a[0] == "object")
                  ((i = a[0]),
                    typeof d > "u" &&
                      (i.pannerAttr ||
                        (i.pannerAttr = {
                          coneInnerAngle: i.coneInnerAngle,
                          coneOuterAngle: i.coneOuterAngle,
                          coneOuterGain: i.coneOuterGain,
                          distanceModel: i.distanceModel,
                          maxDistance: i.maxDistance,
                          refDistance: i.refDistance,
                          rolloffFactor: i.rolloffFactor,
                          panningModel: i.panningModel,
                        }),
                      (n._pannerAttr = {
                        coneInnerAngle:
                          typeof i.pannerAttr.coneInnerAngle < "u"
                            ? i.pannerAttr.coneInnerAngle
                            : n._coneInnerAngle,
                        coneOuterAngle:
                          typeof i.pannerAttr.coneOuterAngle < "u"
                            ? i.pannerAttr.coneOuterAngle
                            : n._coneOuterAngle,
                        coneOuterGain:
                          typeof i.pannerAttr.coneOuterGain < "u"
                            ? i.pannerAttr.coneOuterGain
                            : n._coneOuterGain,
                        distanceModel:
                          typeof i.pannerAttr.distanceModel < "u"
                            ? i.pannerAttr.distanceModel
                            : n._distanceModel,
                        maxDistance:
                          typeof i.pannerAttr.maxDistance < "u"
                            ? i.pannerAttr.maxDistance
                            : n._maxDistance,
                        refDistance:
                          typeof i.pannerAttr.refDistance < "u"
                            ? i.pannerAttr.refDistance
                            : n._refDistance,
                        rolloffFactor:
                          typeof i.pannerAttr.rolloffFactor < "u"
                            ? i.pannerAttr.rolloffFactor
                            : n._rolloffFactor,
                        panningModel:
                          typeof i.pannerAttr.panningModel < "u"
                            ? i.pannerAttr.panningModel
                            : n._panningModel,
                      })));
                else
                  return (
                    (c = n._soundById(parseInt(a[0], 10))),
                    c ? c._pannerAttr : n._pannerAttr
                  );
              else a.length === 2 && ((i = a[0]), (d = parseInt(a[1], 10)));
              for (var g = n._getSoundIds(d), p = 0; p < g.length; p++)
                if (((c = n._soundById(g[p])), c)) {
                  var _ = c._pannerAttr;
                  _ = {
                    coneInnerAngle:
                      typeof i.coneInnerAngle < "u"
                        ? i.coneInnerAngle
                        : _.coneInnerAngle,
                    coneOuterAngle:
                      typeof i.coneOuterAngle < "u"
                        ? i.coneOuterAngle
                        : _.coneOuterAngle,
                    coneOuterGain:
                      typeof i.coneOuterGain < "u"
                        ? i.coneOuterGain
                        : _.coneOuterGain,
                    distanceModel:
                      typeof i.distanceModel < "u"
                        ? i.distanceModel
                        : _.distanceModel,
                    maxDistance:
                      typeof i.maxDistance < "u"
                        ? i.maxDistance
                        : _.maxDistance,
                    refDistance:
                      typeof i.refDistance < "u"
                        ? i.refDistance
                        : _.refDistance,
                    rolloffFactor:
                      typeof i.rolloffFactor < "u"
                        ? i.rolloffFactor
                        : _.rolloffFactor,
                    panningModel:
                      typeof i.panningModel < "u"
                        ? i.panningModel
                        : _.panningModel,
                  };
                  var T = c._panner;
                  (T ||
                    (c._pos || (c._pos = n._pos || [0, 0, -0.5]),
                    f(c, "spatial"),
                    (T = c._panner)),
                    (T.coneInnerAngle = _.coneInnerAngle),
                    (T.coneOuterAngle = _.coneOuterAngle),
                    (T.coneOuterGain = _.coneOuterGain),
                    (T.distanceModel = _.distanceModel),
                    (T.maxDistance = _.maxDistance),
                    (T.refDistance = _.refDistance),
                    (T.rolloffFactor = _.rolloffFactor),
                    (T.panningModel = _.panningModel));
                }
              return n;
            }),
            (Sound.prototype.init = (function (n) {
              return function () {
                var a = this,
                  i = a._parent;
                ((a._orientation = i._orientation),
                  (a._stereo = i._stereo),
                  (a._pos = i._pos),
                  (a._pannerAttr = i._pannerAttr),
                  n.call(this),
                  a._stereo
                    ? i.stereo(a._stereo)
                    : a._pos && i.pos(a._pos[0], a._pos[1], a._pos[2], a._id));
              };
            })(Sound.prototype.init)),
            (Sound.prototype.reset = (function (n) {
              return function () {
                var a = this,
                  i = a._parent;
                return (
                  (a._orientation = i._orientation),
                  (a._stereo = i._stereo),
                  (a._pos = i._pos),
                  (a._pannerAttr = i._pannerAttr),
                  a._stereo
                    ? i.stereo(a._stereo)
                    : a._pos
                      ? i.pos(a._pos[0], a._pos[1], a._pos[2], a._id)
                      : a._panner &&
                        (a._panner.disconnect(0),
                        (a._panner = void 0),
                        i._refreshBuffer(a)),
                  n.call(this)
                );
              };
            })(Sound.prototype.reset)));
          var f = function (n, a) {
            ((a = a || "spatial"),
              a === "spatial"
                ? ((n._panner = Howler.ctx.createPanner()),
                  (n._panner.coneInnerAngle = n._pannerAttr.coneInnerAngle),
                  (n._panner.coneOuterAngle = n._pannerAttr.coneOuterAngle),
                  (n._panner.coneOuterGain = n._pannerAttr.coneOuterGain),
                  (n._panner.distanceModel = n._pannerAttr.distanceModel),
                  (n._panner.maxDistance = n._pannerAttr.maxDistance),
                  (n._panner.refDistance = n._pannerAttr.refDistance),
                  (n._panner.rolloffFactor = n._pannerAttr.rolloffFactor),
                  (n._panner.panningModel = n._pannerAttr.panningModel),
                  typeof n._panner.positionX < "u"
                    ? (n._panner.positionX.setValueAtTime(
                        n._pos[0],
                        Howler.ctx.currentTime,
                      ),
                      n._panner.positionY.setValueAtTime(
                        n._pos[1],
                        Howler.ctx.currentTime,
                      ),
                      n._panner.positionZ.setValueAtTime(
                        n._pos[2],
                        Howler.ctx.currentTime,
                      ))
                    : n._panner.setPosition(n._pos[0], n._pos[1], n._pos[2]),
                  typeof n._panner.orientationX < "u"
                    ? (n._panner.orientationX.setValueAtTime(
                        n._orientation[0],
                        Howler.ctx.currentTime,
                      ),
                      n._panner.orientationY.setValueAtTime(
                        n._orientation[1],
                        Howler.ctx.currentTime,
                      ),
                      n._panner.orientationZ.setValueAtTime(
                        n._orientation[2],
                        Howler.ctx.currentTime,
                      ))
                    : n._panner.setOrientation(
                        n._orientation[0],
                        n._orientation[1],
                        n._orientation[2],
                      ))
                : ((n._panner = Howler.ctx.createStereoPanner()),
                  n._panner.pan.setValueAtTime(
                    n._stereo,
                    Howler.ctx.currentTime,
                  )),
              n._panner.connect(n._node),
              n._paused || n._parent.pause(n._id, !0).play(n._id, !0));
          };
        })();
      })(C)),
    C
  );
}

// Initialize Howler and expose Howl/Howler as globals
V();
