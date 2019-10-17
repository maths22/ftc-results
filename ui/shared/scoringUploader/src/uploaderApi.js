export default class UploaderApi {
  constructor(apiBase, httpRequestFunc) {
    this.apiBase = apiBase;
    this.fetcher = httpRequestFunc;
  }

  postRankings(event, division, rankings) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/rankings/${event}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({rankings}),
    });
  }

  postTeams(event, division, teams) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/teams/${event}?division=${division}`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({teams})
    });
  }
  postAlliances(event, division, alliances) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/alliances/${event}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({alliances})
    });
  }

  postMatches(event, division, matches) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/matches/${event}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({matches})
    });
  }

  postMatch(event, division, id, match) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/matches/${event}/${id}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(match)
    });
  }

  postAwards(event, awards) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/awards/${event}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({awards})
    });
  }

  postState(event, state) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/state/${event}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({state})
    });
  }

  resetEvent(event) {
    return this.fetcher({
      endpoint: `${this.apiBase}/events/reset/${event}`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({})
    });
  }
}

