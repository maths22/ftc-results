export const websocketPath = '/api/v2/stream/';

export default class ScoringApi {
  private readonly hostname: string;
  private readonly port: number;
  constructor(hostname: string, port: number) {
    this.hostname = hostname;
    this.port = port;
  }

  getEvents() {
    return this._fetch(this._apiUrl('/v1/events'));
  }

  getVersion() {
    return this._fetch(this._apiUrl('/v1/version'));
  }

  getEvent(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}`));
  }

  getTeamList(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/teams`));
  }

  getRankings(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/rankings`));
  }

  getCombinedRankings(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/rankings/combined`));
  }

  getAlliances(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/elim/alliances`));
  }

  getMatches(event: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/matches`));
  }

  getElimMatches(event: string, prefix: string) {
    return this._fetch(this._apiUrl(`/v1/events/${event}/elim/${prefix}`));
  }

  getMatchDetails(event: string, season: string, prefix: string, matchNo: number) {
    return this._fetch(this._apiUrl(`/${season}/v1/events/${event}/${prefix}/${matchNo}`));
  }

  getAwards(event: string) {
    return this._fetch(this._apiUrl(`/v2/events/${event}/awards`));
  }

  async _fetch(url: string) {
    const resp = await fetch(url);

    let payload: any = await resp.text();
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

  _apiUrl(path: string) {
    return `http://${this.hostname}:${this.port}/api${path}/`;
  }
}

