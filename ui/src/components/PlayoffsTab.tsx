import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEventAlliances} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";
import MatchTab from "./MatchTab.tsx";

export default function PlayoffsTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: allianceData, isLoading } = useEventAlliances(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading) {
        return <LoadingSpinner />
    }

    const alliances = (allianceData?.alliances || []).filter(a => !division ? !a.division : a.division == division)

    return <>
        <RankingsTable rankings={allianceData?.rankings} showRecord={true} elims={true} />
        <h3>Alliances</h3>
        <AlliancesTable alliances={alliances} />
        <h3>Matches</h3>
        <MatchTab tournamentLevels={['playoff', 'final', 'semi', 'interfinal']} />
    </>
}

export const Route = createLazyRoute("/$season/events/$slug/alliances")({
    component: PlayoffsTab
})
