"use client"
import {
    useBridgeRedeemFormik,
    useBridgeRedeemResultModalDiscloresure,
} from "@/hooks"
import { Button } from "@nextui-org/react"
import React from "react"
import { EmptyProfile } from "./EmptyProfile"
import { VAAProfile } from "./VAAProfile"
import { useAppSelector } from "@/redux"

export const RedeemTab = () => {
    const storedVaas = useAppSelector(state => state.vaaReducer.storedVaas.filter(({ isUsed }) => !isUsed))

    const formik = useBridgeRedeemFormik()

    const { onOpen: onBridgeRedeemResultModalOpen } =
    useBridgeRedeemResultModalDiscloresure()

    const hasVaa = storedVaas.length > 0
    
    return (
        <form
            className="h-full"
            onSubmit={formik.handleSubmit}
            onReset={formik.handleReset}
        >
            <div className="w-full h-full flex flex-col justify-between">
                <div>{hasVaa ? <VAAProfile /> : <EmptyProfile />}</div>
                <Button
                    color="primary"
                    isDisabled={!hasVaa}
                    isLoading={formik.isSubmitting}
                    onPress={async () => {
                        await formik.submitForm()
                        onBridgeRedeemResultModalOpen()
                    }}
                    fullWidth
                >
          Redeem
                </Button>
            </div>
        </form>
    )
}
