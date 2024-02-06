import { createSelector } from 'reselect';
import { IStore } from '.';

const getState = (state: IStore) => state;

export const getSafeAreaTop = createSelector(getState, state => state.safeAreaTop);
export const getWeb3State = createSelector(getState, state => state.web3);
export const getPoolsState = createSelector(getState, state => state.pools);

// Web3 Selectors
export const walletAddressState = createSelector(getWeb3State, state => state.walletAddress);
export const connectWalletState = createSelector(getWeb3State, state => state.connectWallet);

// Pools Selectors
export const poolGroupsState = createSelector(getPoolsState, state => state.poolGroups);
export const totalTVLState = createSelector(getPoolsState, state => state.totalTVL);
