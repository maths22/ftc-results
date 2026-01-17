import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEvent, useEventRankings} from "../api";
import RankingsTable from "./RankingsTable";
import LoadingSpinner from "./LoadingSpinner";

export default function RankingsTab() {
    const seasonYear = GOV_CUP_SEASON;
    const slug = GOV_CUP_CODE;
    const { division } = useSearch({ from: '/eventSummary' });
    const { data: event } = useEvent(seasonYear, slug);
    const { data: rankingsData, isLoading } = useEventRankings(seasonYear, division || slug);

    if(isLoading) {
        return <LoadingSpinner />
    }

    const rankings = (rankingsData || [])

    return <RankingsTable seasonYear={seasonYear} rankings={rankings} showRecord={event?.format != 'REMOTE'} elims={false} />
}

export const Route = createLazyRoute("/rankings")({
    component: RankingsTab
})
