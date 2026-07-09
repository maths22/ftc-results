import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEvent, useEventAlliances, useEventMatches} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";
import MatchTable from "./MatchTable";
import RankingsTab from "./RankingsTab.tsx";
import MatchDetailsDialog from "./MatchDetailsDialog.tsx";
import {components} from "../api/v1";

export default function MatchTab({ tournamentLevels }: { tournamentLevels?: components["schemas"]["match"]["phase"][] }) {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const filteredMatches = (matches || [])
        .filter(a => !division ? !a.division : a.division == division)
        .filter(m => tournamentLevels ? tournamentLevels.includes(m.phase) : null)

    return <>
        <MatchTable matches={filteredMatches} event={event} />
        <MatchDetailsDialog />
    </>
}

export const QualsRoute = createLazyRoute("/$season/events/$slug/quals")({
    component: () => <MatchTab tournamentLevels={['qual']} />
})

export const PracticeRoute = createLazyRoute("/$season/events/$slug/practice")({
    component: () => <MatchTab tournamentLevels={['practice']} />
})