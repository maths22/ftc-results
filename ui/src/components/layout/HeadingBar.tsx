import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';
import Typography from '@mui/material/Typography';

import {Link} from '@tanstack/react-router';

export default function HeadingBar({selectedSeason, title}: {
  selectedSeason?: string,
  title: string,
}) {
  return (
    <div>
      <div style={{flexGrow: 1}}>
        <AppBar position="static">
          <Toolbar>
            <IconButton
              sx={{marginLeft: -1.5, marginRight: 2}}
              color="inherit"
              aria-label="Home"
              to={selectedSeason ? `/${selectedSeason}` : '/'}
              component={Link}
              size="large">
              <HomeIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" sx={{flexGrow: 1}}>
              {title}
            </Typography>
          </Toolbar>
        </AppBar>
      </div>
    </div>
  );
}
