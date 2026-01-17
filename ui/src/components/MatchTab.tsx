import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEvent, useEventMatches} from "../api";
import LoadingSpinner from "./LoadingSpinner";
import MatchTable from "./MatchTable";
import MatchDetailsDialog from "./MatchDetailsDialog";

export default function MatchTab() {
    const seasonYear = GOV_CUP_SEASON;
    const slug = GOV_CUP_CODE;
    const { division } = useSearch({ from: '/eventSummary' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, division || slug);

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    return <>
            <MatchTable seasonYear={seasonYear} matches={matches || []} event={event} division={division} />
            <MatchDetailsDialog />
        </>
}

export const Route = createLazyRoute("/matches")({
    component: MatchTab
})
