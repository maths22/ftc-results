export type Fetcher = (req: {
  endpoint: string,
  method: 'GET' | 'POST',
  headers: Record<string, string>,
  body: string
}) => Promise<{
  error: boolean,
  payload: string
}>

export default class UploaderApi {
  private readonly fetcher: Fetcher;
  private readonly apiBase: string;
  
  constructor(apiBase: string, httpRequestFunc: Fetcher) {
    this.apiBase = apiBase;
    this.fetcher = httpRequestFunc;
  }

  postRankings(season: string, event: string, division: number, rankings: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/rankings?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({rankings}),
    });
  }

  postTeams(season: string, event: string, division: number, teams: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/teams?division=${division}`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({teams})
    });
  }
  postAlliances(season: string, event: string, division: number, alliances: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/alliances?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({alliances})
    });
  }

  postMatches(season: string, event: string, division: number, matches: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/matches?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({matches})
    });
  }

  postMatch(season: string, event: string, division: number, id: number, match: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/matches/${id}?division=${division}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify(match)
    });
  }

  postAwards(season: string, event: string, awards: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/awards`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({awards})
    });
  }

  postState(season: string, event: string, state: any) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/state`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      body: JSON.stringify({state})
    });
  }

  resetEvent(season: string, event: string) {
    return this.fetcher({
      endpoint: `${this.apiBase}/${season}/events/${event}/reset`,
      method: 'POST',
      headers: {'Content-Type': 'application/json; charset=utf-8'},
      body: JSON.stringify({})
    });
  }
}

