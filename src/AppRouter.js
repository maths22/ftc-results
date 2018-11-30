import {ConnectedRouter} from 'connected-react-router';
import {Switch} from 'react-router';
import React, {Component} from 'react';
import App from './App';
import DivisionsSummary from './components/DivisionsSummary';

// Global styles

import LeagueRankings from './components/LeagueRankings';
import EventsSummary from './components/EventsSummary';
import DefaultLayout from './components/DefaultLayout';
import TeamSummary from './components/TeamSummary';

class AppRouter extends Component {

  render () {
    return <ConnectedRouter history={this.props.history}>
      <div>
        <Switch>
          <DefaultLayout exact path="/" component={App} />
          <DefaultLayout exact path="/divisions/summary" component={DivisionsSummary} />
          <DefaultLayout exact path="/events/all" component={EventsSummary} />
          <DefaultLayout exact path="/teams/rankings" component={() => <LeagueRankings type="all"/>}/>
          <DefaultLayout exact path="/leagues/rankings/:id" component={({match}) => <LeagueRankings type="league" id={match.params.id}/>}/>
          <DefaultLayout exact path="/divisions/rankings/:id" component={({match}) => <LeagueRankings type="division" id={match.params.id}/>}/>
          <DefaultLayout exact path="/teams/summary/:id" component={({match}) => <TeamSummary id={match.params.id}/>}/>
          <DefaultLayout component={() => (<div>404 — Page Not Found</div>)} />
        </Switch>
      </div>
    </ConnectedRouter>;
  }
}



export default AppRouter;