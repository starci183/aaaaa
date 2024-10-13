import { useAppSelector } from "@/redux"
import { BlockchainTokenService } from "@/services"
import useSWR, { SWRResponse } from "swr"

export interface UseBalanceParams {
  accountAddress: string;
  tokenKey: string;
  chainKey: string;
}

export interface UseBalanceReturn {
  balanceSwr: SWRResponse<number | undefined, unknown>;
}

export const useBalance = ({
    accountAddress,
    tokenKey,
    chainKey,
}: UseBalanceParams): UseBalanceReturn => {
    const refreshBalanceKey = useAppSelector(
        (state) => state.refreshReducer.refreshBalanceKey
    )
    const network = useAppSelector((state) => state.blockchainReducer.network)
    const chains = useAppSelector((state) => state.blockchainReducer.chains)
    const activeAccountNumber = useAppSelector(
        (state) =>
            state.authReducer.accountNumbers[chainKey].activeAccountNumber
    )

    const balanceSwr = useSWR(
        [
            "BALANCE_SWR",
            tokenKey,
            refreshBalanceKey,
            activeAccountNumber,
            chainKey
        ],
        async () => {
            const tokenService = new BlockchainTokenService({
                chainKey,
                tokenAddress:
          chains[chainKey].tokens[tokenKey].addresses[network],
                network,
            })
            return await tokenService.getBalance({ accountAddress })
        }
    )

    return {
        balanceSwr,
    }
}
