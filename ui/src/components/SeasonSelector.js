import React, {Component} from 'react';
import {connect} from 'react-redux';

import { getSeasons } from '../actions/api';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import {push} from 'connected-react-router';

class SeasonSelector extends Component {
    componentDidMount() {
        if(!this.props.seasons) {
            this.props.getSeasons();
        }
    }

    setSeason = (val) => {
        this.props.onChange(val);
    }

    render () {
        if(!this.props.seasons) return null;

        return <><Typography variant={'h6'}>{'Season: '}
        <Select
            value={this.props.selectedSeason || this.props.defaultSeason}
            onChange={(evt) => this.setSeason(evt.target.value)}
        >
            {(this.props.seasons || []).map((s) => {
                return <MenuItem value={s.year} key={s.year}>
                    {`${s.name} (${s.year})`}
                </MenuItem>;}
            )}
        </Select></Typography></>;
    }
}


const mapStateToProps = (state) => {
    const ret = {
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
    push,
};


export default connect(mapStateToProps, mapDispatchToProps)(SeasonSelector);