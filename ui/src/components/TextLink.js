import {Link} from 'react-router-dom';
import React from 'react';

export default function TextLink(props) {
  const Component = props.to ? Link : 'a';
  return (
    <Component to={props.to} href={props.href} target={props.target} onClick={props.onClick} className={props.className} style={{
      textDecoration: 'none',
      cursor: 'pointer',
      color: '#0074D9',
      '&:hover': {
        color: '#0055aa'
      },
      ...(props.style || {})
    }} >
      {props.children}
    </Component>
  );
}
