import { createSelector } from 'reselect';
import { IStore } from '.';

const getState = (state: IStore) => state;

export const getSafeAreaTop = createSelector(getState, state => state.safeAreaTop);
