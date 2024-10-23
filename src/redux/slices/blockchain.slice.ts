import {
    ChainInfo,
    Network,
    TokenInfo,
    blockchainConfig,
    defaultChainKey,
} from "@/config"
import { PayloadAction, createSlice } from "@reduxjs/toolkit"

export interface ChainState {
  network: Network;
  preferenceChainKey: string;
  chains: Record<string, ChainInfo>;
  saveChainsKey: number;
}


const initialState: ChainState = {
    preferenceChainKey: defaultChainKey,
    network: Network.Testnet,
    chains: blockchainConfig().chains,
    saveChainsKey: 0,
}

export interface AddTokenParams {
  chainKey: string;
  tokenInfo: Omit<TokenInfo, "key">;
  network: Network;
}

export const blockchainSlice = createSlice({
    name: "blockchainReducer",
    initialState,
    reducers: {
        setPreferenceChainKey: (state, { payload }: PayloadAction<string>) => {
            state.preferenceChainKey = payload
        },
        setChain: (state, { payload }: { payload: Record<string, ChainInfo> }) => {
            state.chains = payload
        },
        triggerSaveChains: (state) => {
            state.saveChainsKey++
        },
    },
})

export const {
    setPreferenceChainKey,
    setChain,
    triggerSaveChains,
} = blockchainSlice.actions
export const blockchainReducer = blockchainSlice.reducer
