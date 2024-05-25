import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventAlliances, useEventMatches} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";
import MatchTable from "./MatchTable";
import RankingsTab from "./RankingsTab.tsx";

export default function MatchTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const filteredMatches = (matches || []).filter(a => !division ? !a.division : a.division == division)

    return <MatchTable matches={filteredMatches} event={event} />
}

export const Route = createLazyRoute("/$season/events/$slug/matches")({
    component: MatchTab
})
