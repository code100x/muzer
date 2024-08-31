import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction} from "@solana/web3.js";
import {useState} from "react";
import {
    Dialog, DialogClose,
    DialogContent,
    DialogDescription, DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog";
import {Button} from "@/components/ui/button";
import {Label} from "@/components/ui/label";
import {Input} from "@/components/ui/input";



export function SendTokens() {
    const wallet = useWallet();
    const {connection} = useConnection();
    const [to,setTo] = useState<string>("");
    const [recipient, setRecipient] = useState("");
    const [amount, setAmount] = useState("");
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [isOpen, setOpen] = useState(false);

    async function handleSend() {

        if(!wallet || !wallet?.publicKey){
            console.log("Please connect wallet first!")
            return;
        }

        const transaction = new Transaction();
        transaction.add(SystemProgram.transfer({
            fromPubkey: wallet.publicKey,
            toPubkey: new PublicKey(to),
            lamports: Number(amount) * LAMPORTS_PER_SOL,
        }));

        await wallet.sendTransaction(transaction, connection);
        alert("Sent " + amount + " SOL to " + to);
    }

    return <Dialog open={isOpen} onOpenChange={setOpen}>
        <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-400 hover:to-teal-400 text-white flex items-center gap-2 px-4 py-2 rounded-lg shadow-lg">
                {/*<FaArrowUp className="text-xl" />*/}
                Send
            </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md bg-gray-800 p-6 rounded-lg shadow-xl">
            <DialogHeader>
                <DialogTitle className="text-xl font-semibold text-white">
                    Send SOL
                </DialogTitle>
                <DialogDescription className="text-gray-300 mt-2">
                    Enter the recipient&apos;s public key and the amount of SOL you want to
                    send.
                </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 mt-4">
                {error && <p className="text-red-500">{error}</p>}
                <div className="grid gap-2">
                    <Label htmlFor="recipient" className="text-gray-300">
                        Recipient Public Key
                    </Label>
                    <Input
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        placeholder="Enter recipient's public key"
                        className="bg-gray-700 text-white px-4 py-2 rounded-md"
                    />
                </div>
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
}