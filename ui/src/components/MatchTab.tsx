import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventMatches} from "../api";
import LoadingSpinner from "./LoadingSpinner";
import MatchTable from "./MatchTable";
import MatchDetailsDialog from "./MatchDetailsDialog";

export default function MatchTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { division } = useSearch({ from: '/$season/events/$slug' });
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

export const Route = createLazyRoute("/$season/events/$slug/matches")({
    component: MatchTab
})
