import {Link} from '@tanstack/react-router';
import {styled} from "@mui/material/styles";
import {HTMLProps, MouseEventHandler} from "react";

const StyledA = styled('a')(() => ({
    textDecoration: 'none',
    cursor: 'pointer',
    color: '#0074D9',
    '&:hover': {
        color: '#0055aa'
    }
}));
const StyledLink = styled(Link)(() => ({
    textDecoration: 'none',
    cursor: 'pointer',
    color: '#0074D9',
    '&:hover': {
        color: '#0055aa'
    }
}));

export default function TextLink(props: {
    to?: string,
    href?: string,
    onClick?: MouseEventHandler<unknown>,
    target?: string,
    children: HTMLProps<'a'>['children']
}) {
  return props.to ? <StyledLink {...props} /> : <StyledA {...props} />
}
