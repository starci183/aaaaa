import { FormikProps, useFormik } from "formik"
import * as Yup from "yup"
import { TokenId, nativeTokenId, serialize } from "@wormhole-foundation/sdk"
import { useFormiks } from "."
import {
    chainConfig,
    defaultChain,
    defaultChainKey,
    defaultSecondaryChain,
    defaultSecondaryChainKey,
} from "@/config"
import { useEffect } from "react"
import { setBridgeTransferResult, useAppDispatch, useAppSelector } from "@/redux"
import { createAptosAccount, createSolanaAccount, transfer } from "@/services"
import { useSigner } from "../miscellaneous"
import { computeRaw } from "@/utils"
import { useBridgeTransferResultModalDiscloresure } from "../modals"

export interface BridgeTransferFormikValues {
  targetChainKey: string;
  targetAccountNumber: 0;
  targetAddress: "";
  amount: number;
  tokenId: TokenId;
}

export const _useBridgeTransferFormik =
  (): FormikProps<BridgeTransferFormikValues> => {
      const preferenceChainKey = useAppSelector(
          (state) => state.chainReducer.preferenceChainKey
      )
      const mnemonic = useAppSelector((state) => state.authReducer.mnemonic)
      const aptosAccountNumber = useAppSelector(
          (state) => state.authReducer.accountNumbers.aptos.activeAccountNumber
      )
      const solanaAccountNumber = useAppSelector(
          (state) => state.authReducer.accountNumbers.solana.activeAccountNumber
      )

      const signer = useSigner(preferenceChainKey)

      useEffect(() => {
          let defaultTargetAccountNumber = 0
          switch (formik.values.targetChainKey) {
          case "aptos": {
              defaultTargetAccountNumber = aptosAccountNumber
              break
          }
          case "solana": {
              defaultTargetAccountNumber = solanaAccountNumber
              break
          }
          default:
              break
          }
          formik.setFieldValue("targetAccountNumber", defaultTargetAccountNumber)
      }, [aptosAccountNumber, solanaAccountNumber])

      const initialValues: BridgeTransferFormikValues = {
          amount: 0,
          targetAccountNumber: 0,
          targetAddress: "",
          targetChainKey: defaultSecondaryChainKey,
          tokenId: nativeTokenId(defaultSecondaryChain),
      }

      const validationSchema = Yup.object({
          amount: Yup.number()
              .min(0, "Amount must be higher than 0")
              .required("Amount is required"),
      })

      const network = useAppSelector((state) => state.chainReducer.network)

      const { onOpen } = useBridgeTransferResultModalDiscloresure()
      const dispatch = useAppDispatch()

      const formik = useFormik({
          initialValues,
          validationSchema,
          onSubmit: async ({
              targetAccountNumber,
              targetAddress,
              targetChainKey,
          }) => {
              const { accountAddress } = createAptosAccount({
                  accountNumber: targetAccountNumber,
                  mnemonic,
              })

              const { publicKey } = createSolanaAccount({
                  accountNumber: targetAccountNumber,
                  mnemonic,
              })

              const map: Record<string, string> = {
                  aptos: accountAddress.toString(),
                  solana: publicKey.toString() ?? "",
              }

              const address = targetAddress || map[targetChainKey]
              if (!signer) return
              const { txHash, vaa } = await transfer({
                  signer,
                  transferAmount: computeRaw(formik.values.amount),
                  sourceChainName:
            chainConfig().chains.find(({ key }) => key === preferenceChainKey)
                ?.chain ?? defaultChain,
                  targetChainName:
            chainConfig().chains.find(({ key }) => key === targetChainKey)
                ?.chain ?? defaultChain,
                  network,
                  recipientAddress: address,
                  tokenAddress: formik.values.tokenId.address,
              })
              if (vaa === null) return
              const serializedVaa = Buffer.from(serialize(vaa)).toString("base64")
              dispatch(setBridgeTransferResult({ serializedVaa, txHash }))    
              onOpen()
          },
      })

      useEffect(() => {
          if (preferenceChainKey === defaultSecondaryChainKey) {
              formik.setFieldValue("targetChainKey", defaultChainKey)
          } else {
              formik.setFieldValue("targetChainKey", defaultSecondaryChainKey)
          }
      }, [preferenceChainKey])

      useEffect(() => {
          formik.setFieldValue("tokenId", {
              address: "native",
              chain:
          chainConfig().chains.find(({ key }) => key === preferenceChainKey)
              ?.chain ?? "",
          })
      }, [preferenceChainKey])

      return formik
  }

export const useBridgeTransferFormik = () => {
    const { bridgeTransferFormik } = useFormiks()
    return bridgeTransferFormik
}
