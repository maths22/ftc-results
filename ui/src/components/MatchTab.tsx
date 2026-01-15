import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventMatches} from "../api";
import LoadingSpinner from "./LoadingSpinner";
import MatchTable from "./MatchTable";
import MatchDetailsDialog from "./MatchDetailsDialog";

export default function MatchTab({practice}: {practice?: boolean}) {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { division } = useSearch({ from: '/$season/events/$slug' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, division || slug);

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const filteredMatches = (matches || [])
        .filter(a => practice ? a.tournamentLevel == 'PRACTICE' : a.tournamentLevel != 'PRACTICE')

    return <>
            <MatchTable practice={practice} seasonYear={seasonYear} matches={filteredMatches} event={event} division={division} />
            <MatchDetailsDialog />
        </>
}

export function PracticeMatchTab() {
    return <MatchTab practice />
}

export const Route = createLazyRoute("/$season/events/$slug/matches")({
    component: MatchTab
})

export const PracticeRoute = createLazyRoute("/$season/events/$slug/practice")({
    component: PracticeMatchTab
})
