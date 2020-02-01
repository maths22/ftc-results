"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = exports.websocketPath = void 0;

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var websocketPath = '/api/v2/stream/';
exports.websocketPath = websocketPath;

var ScoringApi =
/*#__PURE__*/
function () {
  function ScoringApi(hostname, port) {
    _classCallCheck(this, ScoringApi);

    this.hostname = hostname;
    this.port = port;
  }

  _createClass(ScoringApi, [{
    key: "getEvents",
    value: function getEvents() {
      return this._fetch(this._apiUrl('/v1/events'));
    }
  }, {
    key: "getVersion",
    value: function getVersion() {
      return this._fetch(this._apiUrl('/v1/version'));
    }
  }, {
    key: "getEvent",
    value: function getEvent(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event)));
    }
  }, {
    key: "getTeamList",
    value: function getTeamList(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/teams")));
    }
  }, {
    key: "getRankings",
    value: function getRankings(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/rankings")));
    }
  }, {
    key: "getCombinedRankings",
    value: function getCombinedRankings(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/rankings/combined")));
    }
  }, {
    key: "getAlliances",
    value: function getAlliances(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/elim/alliances")));
    }
  }, {
    key: "getMatches",
    value: function getMatches(event) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/matches")));
    }
  }, {
    key: "getElimMatches",
    value: function getElimMatches(event, prefix) {
      return this._fetch(this._apiUrl("/v1/events/".concat(event, "/elim/").concat(prefix)));
    }
  }, {
    key: "getMatchDetails",
    value: function getMatchDetails(event, season, prefix, matchNo) {
      return this._fetch(this._apiUrl("/".concat(season, "/v1/events/").concat(event, "/").concat(prefix, "/").concat(matchNo)));
    }
  }, {
    key: "getAwards",
    value: function getAwards(event) {
      return this._fetch(this._apiUrl("/v2/events/".concat(event, "/awards")));
    }
  }, {
    key: "_fetch",
    value: function () {
      var _fetch2 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee(url) {
        var resp, payload;
        return regeneratorRuntime.wrap(function _callee$(_context) {
          while (1) {
            switch (_context.prev = _context.next) {
              case 0:
                _context.next = 2;
                return fetch(url);

              case 2:
                resp = _context.sent;
                _context.next = 5;
                return resp.text();

              case 5:
                payload = _context.sent;

                try {
                  payload = JSON.parse(payload);
                } catch (err) {}

                if (!resp.ok) {
                  _context.next = 11;
                  break;
                }

                return _context.abrupt("return", {
                  payload: payload
                });

              case 11:
                return _context.abrupt("return", {
                  error: true,
                  payload: {
                    response: payload
                  }
                });

              case 12:
              case "end":
                return _context.stop();
            }
          }
        }, _callee);
      }));

      function _fetch(_x) {
        return _fetch2.apply(this, arguments);
      }

      return _fetch;
    }()
  }, {
    key: "_apiUrl",
    value: function _apiUrl(path) {
      return "http://".concat(this.hostname, ":").concat(this.port, "/api").concat(path, "/");
    }
  }]);

  return ScoringApi;
}();

exports.default = ScoringApi;