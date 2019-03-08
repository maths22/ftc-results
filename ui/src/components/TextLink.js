import {withStyles} from '@material-ui/core';
import {Link} from 'react-router-dom';
import React from 'react';

const styles = {
  myTextStyle: {
    textDecoration: 'none',
    cursor: 'pointer',
    color: '#0074D9',
    '&:hover': {
      color: '#0055aa'
    }
  }
};

function TextLink(props) {
  const Component = props.to ? Link : 'a';
  return (
    <Component to={props.to} href={props.href} target={props.target} onClick={props.onClick} className={props.classes.myTextStyle} >
      {props.children}
    </Component>
  );
}

export default withStyles(styles)(TextLink);