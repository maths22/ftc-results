import {ConnectedRouter} from 'connected-react-router';
import {Switch} from 'react-router';
import React, {Component, Suspense} from 'react';

// Global styles

import DefaultLayout from './components/layout/DefaultLayout';
import LoadingSpinner from './components/LoadingSpinner';

const AsyncUploader = React.lazy(() => import(/* webpackChunkName: "uploader" */ './components/localScoring/Uploader'));
const AsyncLeagueRankings = React.lazy(() => import(/* webpackChunkName: "leagueRankings" */ './components/LeagueRankings'));
const AsyncEventsSummary = React.lazy(() => import(/* webpackChunkName: "eventSummary" */ './components/EventsSummary'));
const AsyncTeamSummary = React.lazy(() => import(/* webpackChunkName: "teamSummary" */ './components/TeamSummary'));
const AsyncEventSummary = React.lazy(() => import(/* webpackChunkName: "eventSummary" */ './components/EventSummary'));
const AsyncDivisionsSummary = React.lazy(() => import(/* webpackChunkName: "divisionsSummary" */ './components/DivisionsSummary'));
const AsyncUpdateAccount = React.lazy(() => import(/* webpackChunkName: "updateAccount" */ './components/users/UpdateAccount'));
const AsyncConfirmAccount = React.lazy(() => import(/* webpackChunkName: "confirmAccount" */ './components/users/ConfirmAccount'));
const AsyncHome = React.lazy(() => import(/* webpackChunkName: "home" */ './App'));

class AppRouter extends Component {

  render () {
    return <ConnectedRouter history={this.props.history}>
      <Suspense fallback={<LoadingSpinner/>}>
        <Switch>
          <DefaultLayout exact path="/" component={AsyncHome} />
          <DefaultLayout exact path="/divisions/summary" component={AsyncDivisionsSummary} />
          <DefaultLayout exact path="/events/all" component={AsyncEventsSummary} />
          <DefaultLayout exact path="/events/summary/:id" component={({match}) => <AsyncEventSummary id={match.params.id}/>} />
          <DefaultLayout exact path="/events/uploader/:id" component={({match}) => <AsyncUploader id={match.params.id}/>} />
          <DefaultLayout exact path="/teams/rankings" component={() => <AsyncLeagueRankings type="all"/>}/>
          <DefaultLayout exact path="/leagues/rankings/:id" component={({match}) => <AsyncLeagueRankings type="league" id={match.params.id}/>}/>
          <DefaultLayout exact path="/divisions/rankings/:id" component={({match}) => <AsyncLeagueRankings type="division" id={match.params.id}/>}/>
          <DefaultLayout exact path="/teams/summary/:id" component={({match}) => <AsyncTeamSummary id={match.params.id}/>}/>
          <DefaultLayout exact path="/account" component={AsyncUpdateAccount}/>
          <DefaultLayout exact path="/account/confirm" component={AsyncConfirmAccount}/>
          <DefaultLayout component={() => (<div>404 – Page Not Found</div>)} />
        </Switch>
      </Suspense>
    </ConnectedRouter>;
  }
}



export default AppRouter;