import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventAlliances, useEventMatches} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";
import MatchTable from "./MatchTable";
import RankingsTab from "./RankingsTab.tsx";

export default function MatchTab({practice}: {practice?: boolean}) {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const filteredMatches = (matches || [])
        .filter(a => !division ? !a.division : a.division == division)
        .filter(a => practice ? a.phase == 'practice' : a.phase != 'practice')

    return <MatchTable practice={practice} matches={filteredMatches} event={event} />
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
