export const websocketPath = '/api/v2/stream/';

export default class ScoringApi {
  constructor(hostname, port) {
    this.hostname = hostname;
    this.port = port;
  }

  getEvents() {
    return this._fetch(this._apiUrl('/v1/events'));
  }

  getVersion() {
    return this._fetch(this._apiUrl('/v1/version'));
  }

  getEvent(event) {
    return this._fetch(this._apiUrl(`/v1/events/${event}`));
  }

  getTeamList(event) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/teams`));
  }

  getRankings(event) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/rankings`));
  }

  getAlliances(event) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/elim/alliances`));
  }

  getMatches(event) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/matches`));
  }

  getElimMatches(event, prefix) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/elim/${prefix}`));
  }

  getMatchDetails(event, season, prefix, matchNo) {
    return this._fetch(this._apiUrl(`/${season}/v1/events/${event}/${prefix}/${matchNo}`));
  }

  getAwards(event) {
    return this._fetch(this._apiUrl(`/v2/events/${event}/awards`));
  }

  async _fetch(url) {
    const resp = await fetch(url);

    let payload = await resp.text();
    try {
      payload = JSON.parse(payload);
    } catch (err) {}


    if(resp.ok) {
      return {
        payload
      };
    } else {
      return {
        error: true,
        payload: {
          response: payload
        }
      };
    }

  }

  _apiUrl(path) {
    return `http://${this.hostname}:${this.port}/api${path}/`;
  }
}

