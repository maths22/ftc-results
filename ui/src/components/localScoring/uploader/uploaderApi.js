export default class UploaderApi {
  constructor(apiBase, httpRequestFunc) {
    this.apiBase = apiBase;
    this.fetcher = httpRequestFunc;
  }

  postRankings(season, event, division, rankings) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/rankings?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({rankings}),
    });
  }

  postTeams(season, event, division, teams) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/teams?division=${division}`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({teams})
    });
  }
  postAlliances(season, event, division, alliances) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/alliances?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({alliances})
    });
  }

  postMatches(season, event, division, matches) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/matches?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({matches})
    });
  }

  postMatch(season, event, division, id, match) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/matches/${id}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(match)
    });
  }

  postAwards(season, event, awards) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/awards`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({awards})
    });
  }

  postState(season, event, state) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/state`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({state})
    });
  }

  resetEvent(season, event) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/reset`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({})
    });
  }
}

