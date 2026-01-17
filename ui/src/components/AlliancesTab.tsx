import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {GOV_CUP_CODE, GOV_CUP_SEASON, useEventAlliances} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";

export default function AlliancesTab() {
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
        <AlliancesTable seasonYear={seasonYear} alliances={alliances} />
    </>
}

export const Route = createLazyRoute("/alliances")({
    component: AlliancesTab
})
