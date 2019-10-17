"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

var UploaderApi =
/*#__PURE__*/
function () {
  function UploaderApi(apiBase, httpRequestFunc) {
    _classCallCheck(this, UploaderApi);

    this.apiBase = apiBase;
    this.fetcher = httpRequestFunc;
  }

  _createClass(UploaderApi, [{
    key: "postRankings",
    value: function postRankings(event, division, rankings) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/rankings/").concat(event, "?division=").concat(division),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          rankings: rankings
        })
      });
    }
  }, {
    key: "postTeams",
    value: function postTeams(event, division, teams) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/teams/").concat(event, "?division=").concat(division),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          teams: teams
        })
      });
    }
  }, {
    key: "postAlliances",
    value: function postAlliances(event, division, alliances) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/alliances/").concat(event, "?division=").concat(division),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          alliances: alliances
        })
      });
    }
  }, {
    key: "postMatches",
    value: function postMatches(event, division, matches) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/matches/").concat(event, "?division=").concat(division),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          matches: matches
        })
      });
    }
  }, {
    key: "postMatch",
    value: function postMatch(event, division, id, match) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/matches/").concat(event, "/").concat(id, "?division=").concat(division),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(match)
      });
    }
  }, {
    key: "postAwards",
    value: function postAwards(event, awards) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/awards/").concat(event),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          awards: awards
        })
      });
    }
  }, {
    key: "postState",
    value: function postState(event, state) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/state/").concat(event),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({
          state: state
        })
      });
    }
  }, {
    key: "resetEvent",
    value: function resetEvent(event) {
      return this.fetcher({
        endpoint: "".concat(this.apiBase, "/events/reset/").concat(event),
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify({})
      });
    }
  }]);

  return UploaderApi;
}();

exports.default = UploaderApi;