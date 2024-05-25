import {useMutation, useQuery} from '@tanstack/react-query';
import createClient, {Middleware} from "openapi-fetch";
import type {paths} from "./api/v1";
import {Store} from "@tanstack/store";
import {keyResolver, windowScheduler, create} from "@yornaath/batshit";
import {queryClient} from "./index";

const AUTH_UID_KEY = "auth:uid";
const AUTH_AUTHORIZATION_KEY = "auth:authorization";
export const authorizationStore = new Store({
    uid: localStorage.getItem(AUTH_UID_KEY),
    authorization: localStorage.getItem(AUTH_AUTHORIZATION_KEY),
    name: null
});

function updateAuthorization(headers: Headers) {
    const updates: { uid?: string, authorization?: string } = {};
    const newUid = headers.get('x-uid');
    const newAuthorization = headers.get('authorization');
    if(newUid) {
        updates['uid'] = newUid;
        localStorage.setItem(AUTH_UID_KEY, newUid);
    }
    if(newAuthorization) {
        updates['authorization'] = newAuthorization;
        localStorage.setItem(AUTH_AUTHORIZATION_KEY, newAuthorization);
    }
    authorizationStore.setState((was) => ({...was, ...updates}));
}

export async function createAccount(params: {
    email: string,
    name: string,
    password: string,
    password_confirmation: string
}) {
    const res = await fetch("/api/v1/auth", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ ...params, confirm_success_url: `${window.location.protocol}//${window.location.host}/confirm` })
    })
    const body = await res.json()
    return {
        ok: res.ok,
        body
    };
}

export async function resetPassword(email: string) {
    const res = await fetch("/api/v1/auth/password", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ email, redirect_url: `${window.location.protocol}//${window.location.host}/account` })
    })
    const body = await res.json()
    return {
        ok: res.ok,
        body
    };
}

export async function changePassword(password: string, password_confirmation: string, reset_password_token: string) {
    return await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
        `/api/v1/auth/password`, {
            method: 'PUT',
            body: new URLSearchParams({
                password, password_confirmation, reset_password_token
            })
        }))))
}

export async function activateAccount(name: string, password: string, password_confirmation: string, invitation_token: string) {
    return await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
        `/api/v1/auth/invitation`, {
            method: 'PUT',
            body: new URLSearchParams({
                name, password, password_confirmation, invitation_token
            })
        }))))
}

export async function updateAccount(name: string, email: string, password: string, password_confirmation: string, current_password: string) {
    return await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
        `/api/v1/auth/invitation`, {
            method: 'PUT',
            body: new URLSearchParams({
                name, email, password, password_confirmation, current_password
            })
        }))))
}

export async function login(email: string, password: string) {
    const res = await fetch("/api/v1/auth/sign_in", {
        method: "POST",
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({email, password})
    })
    const body = await res.json()
    updateAuthorization(res.headers);
    if(res.ok)
    {
        authorizationStore.setState((was) => ({
            ...was,
            name: body.data.name
        }))
        queryClient.invalidateQueries();
    }
    return {
        ok: res.ok,
        body
    };
}

export function logout() {
    localStorage.removeItem(AUTH_UID_KEY);
    localStorage.removeItem(AUTH_AUTHORIZATION_KEY);
    authorizationStore.setState(() => ({ uid: null, authorization: null, name: null }));
    queryClient.invalidateQueries();
}

export async function validateAuth() {
    if(!authorizationStore.state.authorization) {
        return;
    }
    const res = await fetch("/api/v1/auth/validate_token", {
        method: "GET",
        headers: { Authorization: authorizationStore.state.authorization },
    })
    const body = await res.json();
    if(res.ok && body.success) {
        authorizationStore.setState((was) => ({
            ...was,
            name: body.data.name
        }))
    } else {
        logout()
    }
}


// Middleware from here https://github.com/drwpow/openapi-typescript/blob/main/packages/openapi-fetch/examples/react-query/src/lib/api/index.ts
const throwOnError: Middleware = {
    async onResponse(res) {
        if (res.status >= 400) {
            const body = res.headers.get("content-type")?.includes("json")
                ? await res.clone().json()
                : await res.clone().text();
            throw new Error(body);
        }
        return undefined;
    },
};
const authAdapter = {
    async onRequest(req: Request) {
        let adaptedRequest: Request = req;
        // Cache busting
        if(authorizationStore.state.uid) {
            const url = new URL(req.url)
            url.searchParams.append('_uid', authorizationStore.state.uid);
            adaptedRequest = new Request(url, {
                method: req.method,
                headers: req.headers,
                body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.blob(),
                referrer: req.referrer,
                referrerPolicy: req.referrerPolicy,
                mode: req.mode,
                credentials: req.credentials,
                cache: req.cache,
                redirect: req.redirect,
                integrity: req.integrity,
            });
        }
        if(authorizationStore.state.authorization) {
            adaptedRequest.headers.set("Authorization", authorizationStore.state.authorization);
        }
        return adaptedRequest;
    },
    async onResponse(res: Response) {
        updateAuthorization(res.headers);
        return res;
    }
}
const client = createClient<paths>({ baseUrl: "/" });
client.use(throwOnError)
client.use(authAdapter)

export function refreshEvent(season: string, slug: string) {
    queryClient.invalidateQueries({ queryKey: ['event', season, slug] })
}

export function useSeasons() {
  return useQuery({ queryKey: ['seasons'], queryFn: async ({signal}) => {
      const { data } = await client.GET("/api/v1/seasons", {signal});
      return data;
    },
    staleTime: 1000 * 60 * 60});
}

export function useSeason(year?: string) {
  const { data, ...rest } = useSeasons();
  return {
    data: (data ? data.find(s => s.year === year) : undefined),
    ...rest
  };
}

export function useLeagues(season: string, enabled: boolean = true) {
  return useQuery({ queryKey: ['leagues', season], enabled: enabled, queryFn: async ({signal}) => {
          const { data } = await client.GET("/api/v1/{season}/leagues", {signal, params: {
                  path: {
                      season
                  }
              }});
          return data
      }});
}

export function leagueQueryOpts(season: string, slug: string) {
    return { queryKey: ['leagues', season, slug], queryFn: async () => {
        const { data } = await client.GET("/api/v1/{season}/leagues/{slug}", {params: {
                path: {
                    season, slug
                }
            }});
        return data
    }}
}

export function useLeague(season: string, slug?: string) {
  const { data, ...rest } = useLeagues(season, slug !== undefined);
  return {
    data: (data ? data.find(s => s.slug === slug) : undefined),
    ...rest
  };
}

export function useEvents(season: string) {
  return useQuery({ queryKey: ['events', season], queryFn: async ({signal}) => {
      const { data } = await client.GET("/api/v1/{season}/events", {signal, params: {
          path: {
              season
          }
      }});
      return data;
    }});
}

export function eventQueryOpts(season: string, slug: string) {
    return { queryKey: ['event', season, slug], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }}
}

export function useEvent(season: string, slug: string) {
    return useQuery(eventQueryOpts(season, slug));
}

export function useEventAlliances(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'alliances'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/alliances", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }});
}


export function useEventAwards(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'awards'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/awards", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }});
}

export function useEventMatches(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'matches'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/matches", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }});
}

export function useEventRankings(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'rankings'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/rankings", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }});
}

export function useEventTeams(season: string, slug: string) {
    return useQuery({ queryKey: ['event', season, slug, 'teams'], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/teams", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }});
}

const teamBatcher = create({
    // The fetcher resolves the list of queries(here just a list of user ids as number) to one single api call.
    fetcher: async (numbers: number[]) => {
        const { data } = await client.GET("/api/v1/teams", { params: {
                query: {
                    'numbers[]': numbers
                }
            }});
        if(!data) {
            return [];
        }
        return data;
    },
    // when we call users.fetch, this will resolve the correct user using the field `id`
    resolver: keyResolver("number"),
    // this will batch all calls to users.fetch that are made within 10 milliseconds.
    scheduler: windowScheduler(10)
})

export function useTeam(number?: number) {
    return useQuery({
        queryKey: ['team', number],
        queryFn: () => number ? teamBatcher.fetch(number) : undefined,
        staleTime: 1000 * 60 * 60,
        enabled: !!number
    });
}

export function useTeamDetails(number?: number) {
    return useQuery({ queryKey: ['teamDetails', number], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/teams/{number}/details", {signal, params: {
                    path: {
                        number: number || 0
                    }
                }});
            return data;
        }, enabled: !!number
    });
}

export function useMatchDetails(season: string, slug: string, name?: string) {
    return useQuery({ queryKey: ['event', season, slug, 'matchDetails', name], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/events/{slug}/matches/{name}", {signal, params: {
                    path: {
                        season, slug, name: name || ''
                    }
                }});
            return data;
        }, enabled: !!name
    });
}

export function useGlobalRankings(season: string) {
    return useQuery({ queryKey: ['globalRankings', season], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/rankings/league", {signal, params: {
                    path: {
                        season
                    }
                }});
            return data;
        }
    });
}

export function useLeagueRankings(season: string, slug: string) {
    return useQuery({ queryKey: ['leagueRankings', season, slug], queryFn: async ({signal}) => {
            const { data } = await client.GET("/api/v1/{season}/rankings/league/{slug}", {signal, params: {
                    path: {
                        season, slug
                    }
                }});
            return data;
        }
    });
}

export function useAddOwnerMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async (uid: string) => {
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/add_owner`, {
                    method: 'POST',
                    body: new URLSearchParams({uid})
                }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', season]})
        }
    })
}

export function useRemoveOwnerMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async (uid: string) => {
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/remove_owner`, {
                    method: 'POST',
                    body: new URLSearchParams({uid})
                }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', season]})
        }
    })
}

export function useRequestAccessMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async (message: string) => {
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/request_access`, {
                    method: 'POST',
                    body: new URLSearchParams({message})
            }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
        }
    })
}

export function useTwitchMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async (enable: boolean) => {
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/twitch`, {
                    method: enable ? 'POST' : 'DELETE'
            }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', season]})
        }
    })
}

// TODO this doesn't plumb through activestorage yet
export function useImportDbMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async ({file, division}: {file: File, division: string}) => {
            const formData = new FormData();
            formData.append('db', file);
            formData.append('division', division);
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/import_results`, {
                    method: 'POST',
                    body: formData
                }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['events', season]})
        }
    })
}

export function useTransformDbMutation(season?: string, slug?: string) {
    return useMutation({
        mutationFn: async (file: File) => {
            const formData = new FormData();
            formData.append('db', file);
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/${season}/events/${slug}/transform_db`, {
                    method: 'POST',
                    body: formData
                }))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
            const url = URL.createObjectURL(await res.blob());
            const anchorElement = document.createElement('a');
            anchorElement.href = url;
            anchorElement.download = `${slug}.db`;
            anchorElement.click();
            anchorElement.remove();
            URL.revokeObjectURL(url);
        }
    })
}

export function useUserSearch(query?: string) {
    return useQuery({
        queryKey: ['userSearch', query],
        queryFn: async () => {
            const res = await authAdapter.onResponse(await fetch(await authAdapter.onRequest(new Request(
                `/api/v1/users/search?query=${encodeURIComponent(query || '')}`))))
            if(!res.ok) {
                throw new Error((await res.json())['error'])
            }
            return await res.json() as {uid: string, name: string}[]
        },
        enabled: !!query
    })
}