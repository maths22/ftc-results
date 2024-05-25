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
            {seasons.map((s) => {
                return <MenuItem value={s.year} key={s.year}>
                    {`${s.name} (${s.year})`}
                </MenuItem>;}
            )}
        </Select>
    </Typography>;
}
