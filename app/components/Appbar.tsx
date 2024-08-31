"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//@ts-ignore
import { Music } from "lucide-react";
import { WalletDisconnectButton, WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import React from "react";
import { useWallet } from "@solana/wallet-adapter-react";

export function Appbar() {
    const { connected } = useWallet();
    const session = useSession();

    const buttonStyle = {
        backgroundColor: "#6B21A8",
        color: "white",
        padding: "0.5rem 1rem",
        borderRadius: "0.375rem",
        fontWeight: "500",
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        cursor: "pointer",
        transition: "background-color 0.2s ease-in-out",
        border: "none",
        textDecoration: "none",
        fontSize: "0.875rem",
        height: "2.6rem",



    };

    const hoverStyle = {
        backgroundColor: "#7E22CE",
    };

    return (
        <div className="flex justify-between px-20 pt-4">
            <div className="text-lg font-bold flex flex-col justify-center text-white">
                Muzer
            </div>
            <div>
                {session.data?.user && (
                    <div className="flex flex-row justify-center items-center text-center gap-1">
                        <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signOut()}>
                            Logout
                        </Button>
                        {connected ? (
                            <WalletDisconnectButton
                                style={buttonStyle}
                            />
                        ) : (
                            <WalletMultiButton
                                style={buttonStyle}
                            />
                        )}
                    </div>
                )}
                {!session.data?.user && (
                    <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signIn()}>
                        Signin
                    </Button>
                )}
            </div>
        </div>
    );
}
