import React, {Component} from 'react';
import {connect} from 'react-redux';

import { withStyles } from '@material-ui/core/styles';

import { getSeasons } from '../actions/api';
import { setSeason } from '../actions/ui';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import {push} from "connected-react-router";
import queryString from 'query-string';



class SeasonSelector extends Component {
    componentDidMount() {
        if(!this.props.seasons) {
            this.props.getSeasons();
        }
    }

    setSeason = (val) => {
        this.props.setSeason(val);
        const values = queryString.parse(window.location.search);
        values['season'] = val;
        this.props.push({ search: queryString.stringify(values) });
    }

    render () {
        return <><Typography variant={'h6'}>{'Season: '}
        <Select
            value={this.props.selectedSeason || this.props.defaultSeason}
            onChange={(evt) => this.setSeason(evt.target.value)}
        >
            {(this.props.seasons || []).map((s) => {
                return <MenuItem value={s.year} key={s.year}>
                    {`${s.name} (${s.year})`}
                </MenuItem>}
            )}
        </Select></Typography></>;
    }
}


const mapStateToProps = (state) => {
    const ret = {
        selectedSeason: state.ui.season,
        defaultSeason: state.ui.defaultSeason
    };
    if (state.seasons) {
        Object.assign(ret, {
            seasons: state.seasons
        });
    }
    return ret;
};

const mapDispatchToProps = {
    getSeasons,
    setSeason,
    push,
};


export default connect(mapStateToProps, mapDispatchToProps)(SeasonSelector);