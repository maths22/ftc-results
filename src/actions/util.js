export const CLEAR_USER_DEPENDENT_STATE = 'CLEAR_USER_DEPENDENT_STATE';
export const INVALIDATE_RANKINGS = 'INVALIDATE_RANKINGS';

export const clearUserDependentState = () => ({
  type: CLEAR_USER_DEPENDENT_STATE
});

export const invalidateRankings = () => ({
  type: INVALIDATE_RANKINGS
});