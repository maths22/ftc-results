import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEventAlliances} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import MatchTab from "./MatchTab";

export default function PlayoffsTab() {
    const seasonYear = GOV_CUP_SEASON;
    const slug = GOV_CUP_CODE;
    const { division } = useSearch({ from: '/eventSummary' });
    const { data: allianceData, isLoading } = useEventAlliances(seasonYear, division || slug);

    if(isLoading) {
        return <LoadingSpinner />
    }

    const alliances = (allianceData?.alliances || [])

    return <>
        {/* <RankingsTable rankings={allianceData?.rankings} showRecord={true} elims={true} /> */}
        <h3>Alliances</h3>
        <AlliancesTable seasonYear={seasonYear} alliances={alliances} />
        <h3>Matches</h3>
        <MatchTab tournamentLevels={['PLAYOFF', 'FINAL', 'SEMIFINAL']} />
    </>
}

export const Route = createLazyRoute("/playoffs")({
    component: PlayoffsTab
})
