import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventRankings} from "../api";
import RankingsTable from "./RankingsTable";
import LoadingSpinner from "./LoadingSpinner";
import TeamsTable from "./TeamsTable.tsx";

export default function RankingsTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: event } = useEvent(seasonYear, slug);
    const { data: rankingsData, isLoading } = useEventRankings(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading) {
        return <LoadingSpinner />
    }

    const rankings = (rankingsData || []).filter(a => !division ? !a.division : a.division == division)

    return <RankingsTable rankings={rankings} showRecord={!event?.remote} elims={false} />
}

export const Route = createLazyRoute("/$season/events/$slug/rankings")({
    component: RankingsTab
})
