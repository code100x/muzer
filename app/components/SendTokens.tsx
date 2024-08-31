"use client";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useState } from "react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { toast } from "react-toastify";

export function SendTokens({ handleSubmit, loading }: { handleSubmit: any, inputLink: string, loading: boolean }) {
    const { connected, publicKey, sendTransaction } = useWallet();
    const { connection } = useConnection();
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [isOpen, setOpen] = useState(false);

    async function handleSend() {
        try {
            const to=process.env.SOL_PUBLIC_KEY;
            if (!connected || !publicKey) {
                setError("Please connect your wallet first!");
                return;
            }


            if (!amount || !to) {
                setError("Please enter a valid amount and recipient address.");
                return;
            }

            setError("");
            setSending(true);

            const transaction = new Transaction();
            transaction.add(SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey(to),
                lamports: Number(amount) * LAMPORTS_PER_SOL,
            }));

            await sendTransaction(transaction, connection);

            setOpen(false);
            setSending(false);
            toast.success('Payment Successful!', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
            handleSubmit();
        } catch (err) {
            setOpen(false);
            setSending(false);
            console.error('Error in Payment: ', err);
            toast.error('Payment failed. Please try again.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
            });
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="w-full bg-purple-700 hover:bg-purple-800 text-white" disabled={loading || !connected}>
                    {
                        connected
                            ? (loading ? "Loading..." : "Pay and Add to Queue")
                            : "Please connect your wallet first!"
                    }
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-white">
                        Send SOL
                    </DialogTitle>
                    <DialogDescription className="text-gray-300 mt-2">
                        Enter the amount of SOL you want to send.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 mt-4">
                    {error && <p className="text-red-500">{error}</p>}
                    <div className="grid gap-2">
                        <Label htmlFor="amount" className="text-gray-300">
                            Amount (SOL)
                        </Label>
                        <Input
                            id="amount"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            placeholder="Enter amount in SOL"
                            className="bg-gray-700 text-white px-4 py-2 rounded-md"
                        />
                    </div>
                </div>
                <DialogFooter className="sm:justify-start mt-6">
                    <Button
                        onClick={handleSend}
                        disabled={sending}
                        className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-400 hover:to-indigo-400 text-white px-4 py-2 rounded-lg"
                    >
                        {sending ? "Sending..." : "Send SOL"}
                    </Button>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="secondary"
                            className="bg-gray-600 hover:bg-gray-500 text-white px-4 py-2 rounded-md ml-2"
                        >
                            Close
                        </Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
