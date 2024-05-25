import {useParams, useSearch} from "@tanstack/react-router";
import {useEventAlliances} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";
import RankingsTable from "./RankingsTable";

export default function AlliancesTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { data: allianceData, isLoading } = useEventAlliances(seasonYear, slug);
    const { division } = useSearch({ from: '/$season/events/$slug' });

    if(isLoading) {
        return <LoadingSpinner />
    }

    const alliances = (allianceData?.alliances || []).filter(a => !division ? !a.division : a.division == division)

    return <>
        <RankingsTable rankings={allianceData?.rankings} showRecord={true} elims={true} />
        <AlliancesTable alliances={alliances} />
    </>
}