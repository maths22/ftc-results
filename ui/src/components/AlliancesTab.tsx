import {createLazyRoute, useParams, useSearch} from "@tanstack/react-router";
import {useEventAlliances} from "../api";
import AlliancesTable from "./AlliancesTable";
import LoadingSpinner from "./LoadingSpinner";

export default function AlliancesTab() {
    const { season: seasonYear, slug} = useParams({ from: '/$season/events/$slug' });
    const { division } = useSearch({ from: '/$season/events/$slug' });
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

export const Route = createLazyRoute("/$season/events/$slug/alliances")({
    component: AlliancesTab
})
