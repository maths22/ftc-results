import {useMutation, useQuery} from '@tanstack/react-query';
import createClient, {Middleware} from "openapi-fetch";
import type {paths, components} from "./api/first-v3";
import {Store} from "@tanstack/store";
import {keyResolver, windowScheduler, create} from "@yornaath/batshit";
import {queryClient} from "./index";

// TODO at least use an env variable for this
const API_KEY = import.meta.env.VITE_API_KEY;
const API_ENDPOINT = import.meta.env.VITE_API_ENDPOINT;
export const GOV_CUP_SEASON = import.meta.env.VITE_GOV_CUP_SEASON;
export const GOV_CUP_CODE = import.meta.env.VITE_GOV_CUP_CODE;

export type TournamentLevel = components["schemas"]["ApiV3TournamentLevel"];

// Middleware from here https://github.com/drwpow/openapi-typescript/blob/main/packages/openapi-fetch/examples/react-query/src/lib/api/index.ts
const throwOnError: Middleware = {
    async onResponse({ response }) {
        if (response.status >= 400) {
            const body = await response.clone().text();
            throw new Error(body);
        }
        return undefined;
    },
};

async function authTransformRequest(request: Request): Promise<Request> {
    const url = new URL(request.url)
    url.searchParams.append('api_key', API_KEY);
    return  new Request(url, {
        method: request.method,
        headers: request.headers,
        body: ['GET', 'HEAD'].includes(request.method) ? undefined : await request.blob(),
        referrer: request.referrer,
        referrerPolicy: request.referrerPolicy,
        mode: request.mode,
        credentials: request.credentials,
        cache: request.cache,
        redirect: request.redirect,
        integrity: request.integrity,
    });
}

const authAdapter: Middleware = {
    async onRequest({ request }) {
        return await authTransformRequest(request);
    }
}
const client = createClient<paths>({ baseUrl: API_ENDPOINT });
client.use(throwOnError)
client.use(authAdapter)

export function refreshEvent(season: string, slug: string) {
    queryClient.invalidateQueries({ queryKey: ['event', season, slug] })
}

export function useSeasons() {
  return useQuery({ queryKey: ['seasons'], queryFn: async ({signal}) => {
      const { data } = await client.GET("/api/v3/seasons", {signal});
      return data;
    },
    staleTime: 1000 * 60 * 60});
}

export function useSeason(year?: string) {
  return useQuery({ queryKey: ['seasons', year || 'default'], queryFn: async ({signal}) => {
        if(!year) {
            const { data } = await client.GET("/api/v3/seasons", {signal});
            return data?.seasons.filter(s => s.cmpYear == data?.currentSeasonCmpYear)[0]
        }
      const { data } = await client.GET("/api/v3/seasons/{cmpYear}", {signal, params: {
        path: {
            cmpYear: year
        }
      }});
      return data;
    },
    staleTime: 1000 * 60 * 60});
}

export function useEvents(season: string) {
  return useQuery({ queryKey: ['events', season], queryFn: async ({signal}) => {
      const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events", {signal, params: {
          path: {
              cmpYear: season
          }
      }});
      return data?.events.filter(e => e.code == GOV_CUP_CODE);
    }});
}

export function eventQueryOpts(season?: string, slug?: string) {
    return { queryKey: ['event', season, slug], queryFn: async ({}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}", {params: {
                    path: {
                        cmpYear: season!, eventCode: slug!
                    }
                }});
            return data;
        },
        enabled: !!season && !!slug
    }
}

export function useEvent(season: string, slug: string) {
    return useQuery(eventQueryOpts(season, slug));
}

export function useEventAlliances(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'alliances'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/alliances", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug
                    }
                }});
            return data;
        }});
}


export function useEventAwards(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'awards'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/awards", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug
                    }
                }});
            return data?.awards;
        }});
}

export function useEventMatches(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'matches'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/matches", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug
                    }
                }});
            return data?.matches;
        }});
}

export function useEventRankings(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'rankings'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/rankings", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug
                    }
                }});
            return data?.rankings;
        }});
}

export function useEventTeams(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'teams'], queryFn: async ({signal, client: queryClient}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/teams", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug
                    }
                }});
            data?.participants.map(part => {
                queryClient.setQueryData(['team', season, part.team.number], part.team);
            });
            return data;
        }});
}

export function teamQueryOpts(season: string, number?: string) {
    return {
        queryKey: ['team', season, number],
        queryFn: async () => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/teams/{number}", { params: {
                    path: {
                        cmpYear: season, number: number || ""
                    }
                }});
            return data;
        },
        staleTime: 1000 * 60 * 60,
        enabled: !!number
    }
}

// TODO this fetches very aggressively if it is loaded before useEventTeams has populated the cache
export function useTeam(season: string, number?: string) {
    return useQuery(teamQueryOpts(season, number));
}

export function useTeamDetails(season: string, number?: string) {
    return useQuery({ queryKey: ['teamDetails', season, number], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/teams/{number}/details", {signal, params: {
                    path: {
                        cmpYear: season, number: number || ""
                    }
                }});
            if(!data) {
                return undefined
            }
            return { ...data, events: data.events.filter(e => e.event.code == GOV_CUP_CODE) };
        }, enabled: !!number
    });
}

export function useMatchDetails(season: string, slug?: string, tournamentLevel?: TournamentLevel, series?: string, number?: number ) {
    return useQuery({ queryKey: ['event', season, slug, 'matchDetails', tournamentLevel, series, number], queryFn: async ({signal}) => {
            if(!slug || !tournamentLevel || series === undefined || number === undefined) {
                return undefined;
            }
            const { data } = await client.GET("/api/v3/seasons/{cmpYear}/events/{eventCode}/matches/{tournamentLevel}/{series}/{number}", {signal, params: {
                    path: {
                        cmpYear: season, eventCode: slug, tournamentLevel, series, number
                    }
                }});
            return data;
        }, enabled: !!slug
    });
}
