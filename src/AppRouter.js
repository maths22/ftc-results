import {ConnectedRouter} from 'connected-react-router';
import {Route, Switch} from 'react-router';
import React, {Component} from 'react';
import App from './App';
import DivisionsSummary from './components/DivisionsSummary';

// Global styles

import LeagueRankings from './components/LeagueRankings';
import EventsSummary from './components/EventsSummary';
import DefaultLayout from './components/DefaultLayout';
import TeamSummary from './components/TeamSummary';
import EventSummary from './components/EventSummary';
import asyncComponent from './components/asyncComponent';
import UpdateAccount from './components/users/UpdateAccount';
import ConfirmAccount from './components/users/ConfirmAccount';
import EventRankings from './components/display/EventRankings';

const AsyncUploader = asyncComponent(() => import('./components/localScoring/Uploader'));

class AppRouter extends Component {

  render () {
    return <ConnectedRouter history={this.props.history}>
      <div>
        <Switch>
          <DefaultLayout exact path="/" component={App} />
          <DefaultLayout exact path="/divisions/summary" component={DivisionsSummary} />
          <DefaultLayout exact path="/events/all" component={EventsSummary} />
          <DefaultLayout exact path="/events/summary/:id" component={({match}) => <EventSummary id={match.params.id}/>} />
          <DefaultLayout exact path="/events/uploader/:id" component={({match}) => <AsyncUploader id={match.params.id}/>} />
          <DefaultLayout exact path="/teams/rankings" component={() => <LeagueRankings type="all"/>}/>
          <DefaultLayout exact path="/leagues/rankings/:id" component={({match}) => <LeagueRankings type="league" id={match.params.id}/>}/>
          <DefaultLayout exact path="/divisions/rankings/:id" component={({match}) => <LeagueRankings type="division" id={match.params.id}/>}/>
          <DefaultLayout exact path="/teams/summary/:id" component={({match}) => <TeamSummary id={match.params.id}/>}/>
          <Route exact path="/display/rankings/:id" component={({match}) => <EventRankings id={match.params.id}/>}/>
          <DefaultLayout exact path="/account" component={UpdateAccount}/>
          <DefaultLayout exact path="/account/confirm" component={ConfirmAccount}/>
          <DefaultLayout component={() => (<div>404 – Page Not Found</div>)} />
        </Switch>
      </div>
    </ConnectedRouter>;
  }
}



export default AppRouter;