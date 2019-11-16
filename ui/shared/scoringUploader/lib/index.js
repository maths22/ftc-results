"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

require("regenerator-runtime/runtime");

require("isomorphic-fetch");

require("core-js/features/object/assign");

require("core-js/features/array/includes");

var _isomorphicWs = _interopRequireDefault(require("isomorphic-ws"));

var _pws = _interopRequireDefault(require("pws"));

var _scoringApi = _interopRequireWildcard(require("./scoringApi"));

var _uploaderApi = _interopRequireDefault(require("./uploaderApi"));

var _objectHash = _interopRequireDefault(require("object-hash"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function _getRequireWildcardCache() { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; if (obj != null) { var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { if (!(Symbol.iterator in Object(arr) || Object.prototype.toString.call(arr) === "[object Arguments]")) { return; } var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _wrapNativeSuper(Class) { var _cache = typeof Map === "function" ? new Map() : undefined; _wrapNativeSuper = function _wrapNativeSuper(Class) { if (Class === null || !_isNativeFunction(Class)) return Class; if (typeof Class !== "function") { throw new TypeError("Super expression must either be null or a function"); } if (typeof _cache !== "undefined") { if (_cache.has(Class)) return _cache.get(Class); _cache.set(Class, Wrapper); } function Wrapper() { return _construct(Class, arguments, _getPrototypeOf(this).constructor); } Wrapper.prototype = Object.create(Class.prototype, { constructor: { value: Wrapper, enumerable: false, writable: true, configurable: true } }); return _setPrototypeOf(Wrapper, Class); }; return _wrapNativeSuper(Class); }

function isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Date.prototype.toString.call(Reflect.construct(Date, [], function () {})); return true; } catch (e) { return false; } }

function _construct(Parent, args, Class) { if (isNativeReflectConstruct()) { _construct = Reflect.construct; } else { _construct = function _construct(Parent, args, Class) { var a = [null]; a.push.apply(a, args); var Constructor = Function.bind.apply(Parent, a); var instance = new Constructor(); if (Class) _setPrototypeOf(instance, Class.prototype); return instance; }; } return _construct.apply(null, arguments); }

function _isNativeFunction(fn) { return Function.toString.call(fn).indexOf("[native code]") !== -1; }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

var MINUTES_IN_MILIS = 60000;
var DISPLAY_DELAY = 10 * MINUTES_IN_MILIS;

var UploaderApiError =
/*#__PURE__*/
function (_Error) {
  _inherits(UploaderApiError, _Error);

  function UploaderApiError(message) {
    var _this;

    _classCallCheck(this, UploaderApiError);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(UploaderApiError).call(this, JSON.stringify(message, null, 2)));
    _this.name = "UploaderApiError";
    return _this;
  }

  return UploaderApiError;
}(_wrapNativeSuper(Error));

var Uploader =
/*#__PURE__*/
function () {
  function Uploader(hostname, port, localEvent, hostedEvent, apiBase, uploadCallback, statusCallback) {
    var _this2 = this;

    _classCallCheck(this, Uploader);

    _defineProperty(this, "displayedMatches", {});

    _defineProperty(this, "displayedInitialized", false);

    _defineProperty(this, "targetDivision", 0);

    _defineProperty(this, "hashes", {});

    _defineProperty(this, "state", {});

    _defineProperty(this, "stopUpload", function () {
      _this2.hashes = {};
      clearInterval(_this2.syncInterval); // OPEN

      if (_this2.pws && _this2.pws.readyState === 1) {
        _this2.pws.close();
      }
    });

    _defineProperty(this, "startUpload",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee() {
      var eventInfo;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return _this2.scoringApi.getEvent(_this2.localEvent);

            case 2:
              eventInfo = _context.sent;
              _this2.targetDivision = eventInfo.payload.division;

              _this2.syncData();

              _this2.syncInterval = setInterval(_this2.syncData, 30000);
              _this2.pws = new _pws.default("ws://".concat(_this2.hostname, ":").concat(_this2.port).concat(_scoringApi.websocketPath, "?code=").concat(_this2.localEvent), _isomorphicWs.default);

              _this2.pws.onmessage = function (e) {
                var msg = JSON.parse(e.data);

                if (msg.updateType === 'MATCH_POST') {
                  var shortName = msg.payload.shortName;
                  var phase = '';
                  var matchNum = '';
                  var series = null;

                  if (shortName[0] === 'Q') {
                    phase = 'qual';
                    matchNum = parseInt(shortName.substr(1));
                  }

                  if (shortName.substr(0, 2) === 'SF') {
                    phase = 'semi';
                    series = parseInt(shortName.substr(2, 1));
                    matchNum = parseInt(shortName.substr(4));
                  }

                  if (shortName[0] === 'F') {
                    phase = 'final';
                    matchNum = parseInt(shortName.substr(1));
                  }

                  if (shortName.substr(0, 2) === 'IF') {
                    phase = 'final';
                    matchNum = parseInt(shortName.substr(2));
                  }

                  var mid = phase + '-' + (series ? series + '-' : '') + matchNum;
                  var dispMatch = _this2.displayedMatches[mid] || {};
                  dispMatch.displayAt = new Date();
                  _this2.displayedMatches[mid] = dispMatch;
                }
              };

            case 8:
            case "end":
              return _context.stop();
          }
        }
      }, _callee);
    })));

    _defineProperty(this, "syncData", function () {
      _this2.syncState().then(function () {
        return Promise.all([_this2.syncTeams(), _this2.syncRankings(), _this2.syncElimAlliances().then(_this2.syncMatchList).then(_this2.syncMatchResults), _this2.syncAwards()]).then(function () {
          _this2.setState({
            success: true,
            date: new Date()
          });
        }).catch(function (e) {
          _this2.setState({
            success: false,
            date: new Date(),
            error: e
          });

          console.error('Sync failed: ', e);
        });
      });
    });

    _defineProperty(this, "syncState",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2() {
      var eventResult, status, state, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.next = 2;
              return _this2.scoringApi.getEvent(_this2.localEvent);

            case 2:
              eventResult = _context2.sent;
              status = eventResult.payload.status;
              state = ['Future', 'Setup'].includes(status) ? 'not_started' : 'started';
              newHash = (0, _objectHash.default)(state);

              if (!(_this2.hashes['state'] !== newHash)) {
                _context2.next = 12;
                break;
              }

              _context2.next = 9;
              return _this2.uploaderApi.postState(_this2.hostedEvent, state);

            case 9:
              postResult = _context2.sent;

              if (!postResult.error) {
                _context2.next = 12;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 12:
              _this2.hashes['state'] = newHash;

            case 13:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })));

    _defineProperty(this, "syncTeams",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3() {
      var teamsResult, teams, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.next = 2;
              return _this2.scoringApi.getTeamList(_this2.localEvent);

            case 2:
              teamsResult = _context3.sent;
              teams = teamsResult.payload.teamNumbers;
              newHash = (0, _objectHash.default)(teams);

              if (!(_this2.hashes['teamList'] !== newHash)) {
                _context3.next = 11;
                break;
              }

              _context3.next = 8;
              return _this2.uploaderApi.postTeams(_this2.hostedEvent, _this2.targetDivision, teams);

            case 8:
              postResult = _context3.sent;

              if (!postResult.error) {
                _context3.next = 11;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 11:
              _this2.hashes['teamList'] = newHash;

            case 12:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })));

    _defineProperty(this, "syncElimAlliances",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4() {
      var alliancesResult, alliances, uploadAlliances, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.next = 2;
              return _this2.scoringApi.getAlliances(_this2.localEvent);

            case 2:
              alliancesResult = _context4.sent;

              if (!(alliancesResult.error && alliancesResult.payload.response.errorCode === 'NOT_READY')) {
                _context4.next = 7;
                break;
              }

              return _context4.abrupt("return");

            case 7:
              if (!alliancesResult.error) {
                _context4.next = 9;
                break;
              }

              throw new UploaderApiError(alliancesResult.payload);

            case 9:
              alliances = alliancesResult.payload.alliances;
              uploadAlliances = alliances.map(function (a) {
                return {
                  seed: a.seed,
                  teams: [a.captain, a.pick1, a.pick2, a.pick3].filter(function (t) {
                    return t && t !== -1;
                  })
                };
              });
              newHash = (0, _objectHash.default)(uploadAlliances);

              if (!(_this2.hashes['alliances'] !== newHash)) {
                _context4.next = 18;
                break;
              }

              _context4.next = 15;
              return _this2.uploaderApi.postAlliances(_this2.hostedEvent, _this2.targetDivision, uploadAlliances);

            case 15:
              postResult = _context4.sent;

              if (!postResult.error) {
                _context4.next = 18;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 18:
              _this2.hashes['alliances'] = newHash;

            case 19:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4);
    })));

    _defineProperty(this, "syncRankings",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee5() {
      var rankingsResult, rankings, uploadRankings, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee5$(_context5) {
        while (1) {
          switch (_context5.prev = _context5.next) {
            case 0:
              _context5.next = 2;
              return _this2.scoringApi.getRankings(_this2.localEvent);

            case 2:
              rankingsResult = _context5.sent;
              rankings = rankingsResult.payload.rankingList;
              uploadRankings = rankings.map(function (r) {
                return {
                  team_id: r.team,
                  ranking: r.ranking,
                  ranking_points: r.rankingPoints,
                  tie_breaker_points: r.tieBreakerPoints,
                  matches_played: r.matchesPlayed
                };
              });
              newHash = (0, _objectHash.default)(uploadRankings);

              if (!(_this2.hashes['rankings'] !== newHash)) {
                _context5.next = 12;
                break;
              }

              _context5.next = 9;
              return _this2.uploaderApi.postRankings(_this2.hostedEvent, _this2.targetDivision, uploadRankings);

            case 9:
              postResult = _context5.sent;

              if (!postResult.error) {
                _context5.next = 12;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 12:
              _this2.hashes['rankings'] = newHash;

            case 13:
            case "end":
              return _context5.stop();
          }
        }
      }, _callee5);
    })));

    _defineProperty(this, "syncAwards",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee6() {
      var awardsResult, awards, uploadAwards, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee6$(_context6) {
        while (1) {
          switch (_context6.prev = _context6.next) {
            case 0:
              _context6.next = 2;
              return _this2.scoringApi.getAwards(_this2.localEvent);

            case 2:
              awardsResult = _context6.sent;
              awards = awardsResult.payload.awards;
              uploadAwards = awards.map(function (a) {
                return {
                  name: a.name,
                  finalists: a.winners.map(function (fin) {
                    return {
                      place: fin.series,
                      recipient: a.isTeamAward ? undefined : "".concat(fin.firstName, " ").concat(fin.lastName),
                      team_id: fin.team
                    };
                  })
                };
              });
              newHash = (0, _objectHash.default)(uploadAwards);

              if (!(_this2.hashes['awards'] !== newHash)) {
                _context6.next = 12;
                break;
              }

              _context6.next = 9;
              return _this2.uploaderApi.postAwards(_this2.hostedEvent, uploadAwards);

            case 9:
              postResult = _context6.sent;

              if (!postResult.error) {
                _context6.next = 12;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 12:
              _this2.hashes['awards'] = newHash;

            case 13:
            case "end":
              return _context6.stop();
          }
        }
      }, _callee6);
    })));

    _defineProperty(this, "getQualMatches",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee7() {
      var matchesResult, matches;
      return regeneratorRuntime.wrap(function _callee7$(_context7) {
        while (1) {
          switch (_context7.prev = _context7.next) {
            case 0:
              _context7.next = 2;
              return _this2.scoringApi.getMatches(_this2.localEvent);

            case 2:
              matchesResult = _context7.sent;
              matches = matchesResult.payload.matches;
              return _context7.abrupt("return", matches.map(function (m) {
                return {
                  phase: 'qual',
                  number: m.matchNumber,
                  red_alliance: [m.red.team1, m.red.team2, m.red.team3].filter(Boolean),
                  blue_alliance: [m.blue.team1, m.blue.team2, m.blue.team3].filter(Boolean),
                  red_surrogate: [m.red.isTeam1Surrogate, m.red.isTeam2Surrogate, m.red.isTeam3Surrogate].slice(0, m.red.team3 ? 3 : 2),
                  blue_surrogate: [m.blue.isTeam1Surrogate, m.blue.isTeam2Surrogate, m.blue.isTeam3Surrogate].slice(0, m.blue.team3 ? 3 : 2),
                  finished: m.finished
                };
              }));

            case 5:
            case "end":
              return _context7.stop();
          }
        }
      }, _callee7);
    })));

    _defineProperty(this, "getElimMatches",
    /*#__PURE__*/
    function () {
      var _ref8 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee8(phase, series) {
        var prefix, matchesResult, matches;
        return regeneratorRuntime.wrap(function _callee8$(_context8) {
          while (1) {
            switch (_context8.prev = _context8.next) {
              case 0:
                prefix = phase === 'final' ? 'finals' : 'sf/' + series;
                _context8.next = 3;
                return _this2.scoringApi.getElimMatches(_this2.localEvent, prefix);

              case 3:
                matchesResult = _context8.sent;

                if (!(matchesResult.error && (matchesResult.payload.name === 'InternalError' || matchesResult.payload.response.errorCode === 'NOT_READY' || matchesResult.payload.response.errorCode === 'NO_SUCH_EVENT') // This error code makes no sense for the situation in which it appears
                )) {
                  _context8.next = 8;
                  break;
                }

                return _context8.abrupt("return", []);

              case 8:
                if (!matchesResult.error) {
                  _context8.next = 10;
                  break;
                }

                throw new UploaderApiError(matchesResult.payload);

              case 10:
                matches = matchesResult.payload.matchList;
                return _context8.abrupt("return", matches.map(function (m) {
                  return {
                    phase: phase,
                    series: series,
                    //TODO check this pls (is this really right for semis)
                    number: m.match.split('-')[1],
                    red_alliance: m.red.seed,
                    blue_alliance: m.blue.seed,
                    red_present: [m.red.captain !== -1, m.red.pick1 !== -1, m.red.pick2 !== -1],
                    blue_present: [m.blue.captain !== -1, m.blue.pick1 !== -1, m.blue.pick2 !== -1],
                    finished: true
                  };
                }));

              case 12:
              case "end":
                return _context8.stop();
            }
          }
        }, _callee8);
      }));

      return function (_x, _x2) {
        return _ref8.apply(this, arguments);
      };
    }());

    _defineProperty(this, "syncMatchList",
    /*#__PURE__*/
    _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee9() {
      var matches, uploadMatches, newHash, postResult;
      return regeneratorRuntime.wrap(function _callee9$(_context9) {
        while (1) {
          switch (_context9.prev = _context9.next) {
            case 0:
              _context9.next = 2;
              return Promise.all([_this2.getQualMatches(), _this2.getElimMatches('semi', 1), _this2.getElimMatches('semi', 2), _this2.getElimMatches('final')]);

            case 2:
              matches = _context9.sent;
              uploadMatches = [].concat.apply([], matches);
              newHash = (0, _objectHash.default)(uploadMatches);

              if (!(_this2.hashes['matchList'] !== newHash)) {
                _context9.next = 11;
                break;
              }

              _context9.next = 8;
              return _this2.uploaderApi.postMatches(_this2.hostedEvent, _this2.targetDivision, uploadMatches);

            case 8:
              postResult = _context9.sent;

              if (!postResult.error) {
                _context9.next = 11;
                break;
              }

              throw new UploaderApiError(postResult.payload);

            case 11:
              _this2.hashes['matchList'] = newHash;
              return _context9.abrupt("return", uploadMatches.filter(function (m) {
                return m.finished;
              }));

            case 13:
            case "end":
              return _context9.stop();
          }
        }
      }, _callee9);
    })));

    _defineProperty(this, "syncMatchResults",
    /*#__PURE__*/
    function () {
      var _ref10 = _asyncToGenerator(
      /*#__PURE__*/
      regeneratorRuntime.mark(function _callee12(matches) {
        var matchResults;
        return regeneratorRuntime.wrap(function _callee12$(_context12) {
          while (1) {
            switch (_context12.prev = _context12.next) {
              case 0:
                // Calculate which results should be posted
                matches.forEach(function (m) {
                  var mid = m.phase + '-' + (m.series ? m.series + '-' : '') + m.number;
                  var dispMatch = _this2.displayedMatches[mid] || {};
                  var now = new Date();

                  if (dispMatch.displayAt) {
                    if (dispMatch.displayAt <= new Date()) {
                      m.postResults = true;
                    }
                  } else {
                    dispMatch.displayAt = new Date(now.getTime() + (_this2.displayedInitialized ? DISPLAY_DELAY : 0));
                    if (!_this2.displayedInitialized) m.postResults = true;
                  }

                  _this2.displayedMatches[mid] = dispMatch;
                });
                _this2.displayedInitialized = true; //TODO generalize seasons

                _context12.next = 4;
                return Promise.all(matches.filter(function (m) {
                  return m.postResults;
                }).map(
                /*#__PURE__*/
                function () {
                  var _ref11 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee10(m) {
                    var prefix, details;
                    return regeneratorRuntime.wrap(function _callee10$(_context10) {
                      while (1) {
                        switch (_context10.prev = _context10.next) {
                          case 0:
                            if (m.phase !== 'qual') {
                              prefix = 'elim/' + (m.phase === 'final' ? 'finals' : 'sf/' + m.series);
                            } else {
                              prefix = 'matches';
                            }

                            _context10.next = 3;
                            return _this2.scoringApi.getMatchDetails(_this2.localEvent, '2020', prefix, m.number);

                          case 3:
                            details = _context10.sent;
                            return _context10.abrupt("return", [[m.phase, m.series, m.number].filter(function (m) {
                              return m;
                            }).join('-'), details.payload]);

                          case 5:
                          case "end":
                            return _context10.stop();
                        }
                      }
                    }, _callee10);
                  }));

                  return function (_x4) {
                    return _ref11.apply(this, arguments);
                  };
                }()));

              case 4:
                matchResults = _context12.sent;
                _context12.next = 7;
                return Promise.all(matchResults.map(
                /*#__PURE__*/
                function () {
                  var _ref12 = _asyncToGenerator(
                  /*#__PURE__*/
                  regeneratorRuntime.mark(function _callee11(val) {
                    var _val, mid, mr, mapScoreToUploadScore, uploadScore, newHash, postResult;

                    return regeneratorRuntime.wrap(function _callee11$(_context11) {
                      while (1) {
                        switch (_context11.prev = _context11.next) {
                          case 0:
                            _val = _slicedToArray(val, 2), mid = _val[0], mr = _val[1];

                            mapScoreToUploadScore = function mapScoreToUploadScore(s) {
                              return {
                                auto_skystones: s.autoStones.filter(function (s) {
                                  return s === 'SKYSTONE';
                                }).length - (s.firstReturnedIsSkystone ? 1 : 0),
                                // Note we aren't counting skystones in this number
                                auto_delivered: s.autoDelivered - s.autoReturned - s.autoStones.filter(function (s) {
                                  return s === 'SKYSTONE';
                                }).length,
                                auto_placed: s.autoPlaced,
                                robots_navigated: (s.robot1.navigated ? 1 : 0) + (s.robot2.navigated ? 1 : 0),
                                foundation_repositioned: s.foundationRepositioned ? 1 : 0,
                                teleop_placed: s.driverControlledPlaced,
                                teleop_delivered: s.driverControlledDelivered - s.driverControlledReturned,
                                tallest_height: s.towerBonusPoints / 2,
                                foundation_moved: s.foundationMoved ? 1 : 0,
                                robots_parked: (s.robot1.parked ? 1 : 0) + (s.robot2.parked ? 1 : 0),
                                capstone_1_level: s.robot1.capstoneLevel,
                                capstone_2_level: s.robot2.capstoneLevel,
                                minor_penalties: s.minorPenalties,
                                major_penalties: s.majorPenalties
                              };
                            };

                            uploadScore = {
                              red_score: mapScoreToUploadScore(mr.red),
                              blue_score: mapScoreToUploadScore(mr.blue)
                            };
                            newHash = (0, _objectHash.default)(uploadScore);

                            if (!(_this2.hashes['match-' + mid] !== newHash)) {
                              _context11.next = 10;
                              break;
                            }

                            _context11.next = 7;
                            return _this2.uploaderApi.postMatch(_this2.hostedEvent, _this2.targetDivision, mid, uploadScore);

                          case 7:
                            postResult = _context11.sent;

                            if (!postResult.error) {
                              _context11.next = 10;
                              break;
                            }

                            throw new UploaderApiError(postResult.payload);

                          case 10:
                            _this2.hashes['match-' + mid] = newHash;

                          case 11:
                          case "end":
                            return _context11.stop();
                        }
                      }
                    }, _callee11);
                  }));

                  return function (_x5) {
                    return _ref12.apply(this, arguments);
                  };
                }()));

              case 7:
              case "end":
                return _context12.stop();
            }
          }
        }, _callee12);
      }));

      return function (_x3) {
        return _ref10.apply(this, arguments);
      };
    }());

    this.hostname = hostname;
    this.port = port;
    this.localEvent = localEvent;
    this.hostedEvent = hostedEvent;
    this.scoringApi = new _scoringApi.default(hostname, port);
    this.uploaderApi = new _uploaderApi.default(apiBase, uploadCallback);
    this.statusCallback = statusCallback;
  }

  _createClass(Uploader, [{
    key: "setState",
    value: function setState(newState) {
      Object.assign(this.state, newState);
      this.statusCallback(newState);
    }
  }]);

  return Uploader;
}();

exports.default = Uploader;