export const SET_TITLE = 'SET_TITLE';

export const setTitle = (title) => ({
  type: SET_TITLE,
  title
});

export const HIDE_VIDEO = 'HIDE_VIDEO';

export const hideVideo = (hidden) => ({
  type: HIDE_VIDEO,
  hidden
});

export const SHOW_ONLY_MY_EVENTS = 'SHOW_ONLY_MY_EVENTS';

export const setShowOnlyMyEvents = (state) => ({
  type: SHOW_ONLY_MY_EVENTS,
  state
});