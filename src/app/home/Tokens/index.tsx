"use client"
import { useAppSelector } from "@/redux"
import React from "react"
import { Token } from "./Token"
import { valuesWithKey } from "@/utils"

export const Tokens = () => {
    const preferenceChainKey = useAppSelector(
        (state) => state.blockchainReducer.preferenceChainKey
    )

    const tokens = valuesWithKey(useAppSelector(
        (state) => state.blockchainReducer.chains[preferenceChainKey].tokens
    )) 

    return (
        <div>
            <div className="grid gap-2">
                {tokens.map((token) => (
                    <Token key={token.key} token={token} />
                ))}
            </div>
        </div>
        
    )
}
