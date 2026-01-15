import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventRankings} from "../api";
import RankingsTable from "./RankingsTable";
import LoadingSpinner from "./LoadingSpinner";

export default function RankingsTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { division } = useSearch({ from: '/$season/events/$slug' });
    const { data: event } = useEvent(seasonYear, slug);
    const { data: rankingsData, isLoading } = useEventRankings(seasonYear, division || slug);

    if(isLoading) {
        return <LoadingSpinner />
    }

    const rankings = (rankingsData || [])

    return <RankingsTable seasonYear={seasonYear} rankings={rankings} showRecord={event?.format != 'REMOTE'} elims={false} />
}

export const Route = createLazyRoute("/$season/events/$slug/rankings")({
    component: RankingsTab
})
