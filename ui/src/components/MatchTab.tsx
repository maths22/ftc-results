import {useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventAlliances, useEventMatches} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";
import MatchTable from "./MatchTable";

export default function MatchTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const alliances = (matches || []).filter(a => !division ? !a.division : a.division == division)

    return <MatchTable matches={matches} event={event} />
}