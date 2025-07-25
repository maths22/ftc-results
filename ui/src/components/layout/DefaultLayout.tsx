import {useEffect} from 'react';
import HeadingBar from './HeadingBar';
import CssBaseline from '@mui/material/CssBaseline';
import ErrorBoundary from '../ErrorBoundary';
import {styled} from '@mui/material/styles';
import {Outlet, useParams, useRouter} from '@tanstack/react-router';

const Main = styled('main')(({theme}) => ({
  flexGrow: 1,
  padding: theme.spacing(3)
}));

export default function DefaultLayout() {
  const router = useRouter();

  const matchWithTitle = [...router.state.matches]
    .reverse()
    .find((d) => d.__routeContext.title);

  const title: string = matchWithTitle && matchWithTitle.__routeContext.title ? matchWithTitle.__routeContext.title as string : 'FTC Results';
  useEffect(() => {
    document.title = title;
  }, [title]);

  const params = useParams({ strict: false });
  let season = undefined;
  if('season' in params) {
    season = params.season;
  }
    return (
      <ErrorBoundary>
        <div>
          <CssBaseline/>
          <HeadingBar selectedSeason={season} title={title} />
          <Main>
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </Main>
        </div>
      </ErrorBoundary>
    );
}
