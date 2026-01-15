import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import {useSeasons} from '../api';

export default function SeasonSelector({selectedSeason, onChange}: {
    selectedSeason: string,
    onChange: (newSeason: string) => void
}) {
    const { data: seasons } = useSeasons();

    if(!seasons) return null;

    return <Typography variant={'h6'}>
        {'Season: '}
        <Select
            value={selectedSeason}
            onChange={(evt) => onChange(evt.target.value)}
        >
            {seasons.seasons.map((s) => {
                return <MenuItem value={s.cmpYear} key={s.cmpYear}>
                    {`${s.gameName} (${s.cmpYear - 1} - ${s.cmpYear})`}
                </MenuItem>;}
            )}
        </Select>
    </Typography>;
}
