import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEvent, useEventMatches} from "../api";
import LoadingSpinner from "./LoadingSpinner";
import MatchTable from "./MatchTable";
import MatchDetailsDialog from "./MatchDetailsDialog";
import { components } from "../api/first-v3";

export default function MatchTab({ tournamentLevels }: { tournamentLevels?: components["schemas"]["ApiV3TournamentLevel"][] }) {
    const seasonYear = GOV_CUP_SEASON;
    const slug = GOV_CUP_CODE;
    const { division } = useSearch({ from: '/eventSummary' });
    const { data: event, isLoading: isLoadingEvent } = useEvent(seasonYear, slug);
    const { data: matches, isLoading } = useEventMatches(seasonYear, division || slug);

    if(isLoading || isLoadingEvent) {
        return <LoadingSpinner />
    }

    const filteredMatches = tournamentLevels ? matches?.filter(match => tournamentLevels.includes(match.tournamentLevel)) : matches;

    return <>
            <MatchTable seasonYear={seasonYear} matches={filteredMatches || []} event={event} division={division} />
            <MatchDetailsDialog />
        </>
}

export const QualsRoute = createLazyRoute("/quals")({
    component: () => <MatchTab tournamentLevels={['QUALIFICATION']} />
})

export const PracticeRoute = createLazyRoute("/practice")({
    component: () => <MatchTab tournamentLevels={['PRACTICE']} />
})