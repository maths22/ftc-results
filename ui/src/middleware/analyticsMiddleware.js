import ReactGA from 'react-ga4';

const options = {};

const trackPage = (page) => {
  ReactGA.send({ hitType: 'pageview', page: page, ...options});
};

let currentPage = '';

export default store => next => action => {
  if (process.env.REACT_APP_GA_KEY && action.type === '@@router/LOCATION_CHANGE') {
    const nextPage = `${action.payload.location.pathname}${action.payload.location.search}`;

    if (currentPage !== nextPage) {
      currentPage = nextPage;
      trackPage(nextPage);
    }
  }

  return next(action);
};