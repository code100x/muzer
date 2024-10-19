import { YT_REGEX } from "@/lib/utils";
import { useSocket } from "@/context/socket-context";
import React, { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import LiteYouTubeEmbed from "react-lite-youtube-embed";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { useSession } from "next-auth/react";



type Props = {
  inputLink: string;
  creatorId: string;
  userId: string;
  setLoading: (value: boolean) => void;
  setInputLink: (value: string) => void;
  loading: boolean;
  enqueueToast: (type: "error" | "success", message: string) => void;
  spaceId:string,
  isSpectator:boolean,
  checkIsDuplicate:(url:string)=>boolean
};

export default function AddSongForm({
  inputLink,
  enqueueToast,
  setInputLink,
  loading,
  setLoading,
  userId,
  spaceId,
  isSpectator,
  checkIsDuplicate
}: Props) {
  const { sendMessage } = useSocket();
  const wallet = useWallet();
  const {connection} = useConnection();
  const user = useSession().data?.user;
  const [duplicateDiv, setDuplicateDiv] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inputLink.match(YT_REGEX)) {
      setLoading(true);
      
      sendMessage("add-to-queue", {
        spaceId,
        userId,
        url: inputLink,
      });
    } else {
      enqueueToast("error", "Invalid please use specified format");
    }
    setLoading(false);
    setInputLink("");
  };

  const finallyPlaySong = async (songLink:string)=>{
    if(!wallet.publicKey || !connection){
      enqueueToast("error", "Please connect your wallet");
      return;
    }
    // check if user creds for this space is pending or not 
      const response = await fetch(`/api/remcreds`,{
          method:"POST",
          body:JSON.stringify({
            spaceId:spaceId,
          })
      });
      const data = await response.json();

      if(!data.ok){
        const transaction = new Transaction();
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: wallet.publicKey,
                toPubkey: new PublicKey(process.env.NEXT_PUBLIC_PUBLICKEY as string),
                lamports: Number(process.env.NEXT_PUBLIC_SOL_PER_PAYMENT) * LAMPORTS_PER_SOL,
            })
        )

        // sign Transaction steps 
        const blockHash = await connection.getLatestBlockhash();
        transaction.feePayer = wallet.publicKey;
        transaction.recentBlockhash = blockHash.blockhash;
        //@ts-ignore
        const signed = await wallet.signTransaction(transaction);
        

        const signature = await connection.sendRawTransaction(signed.serialize());
        
        enqueueToast("success", `Transaction signature: ${signature}`);
        await connection.confirmTransaction({
            blockhash: blockHash.blockhash,
            lastValidBlockHeight: blockHash.lastValidBlockHeight,
            signature
        });
        enqueueToast("success", `Payment successful`);
      }
      
      sendMessage("pay-and-play-next", {
        spaceId,
        userId: user?.id,
        url:songLink
      });
  }

  const handlePayAndPlay = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if(!wallet.publicKey || !connection){
      enqueueToast("error", "Please connect your wallet");
      return;
    }
    if (!inputLink.match(YT_REGEX)) {
      enqueueToast("error", "Invalid please use specified formate");
    }
    try{
      setLoading(true);

      //check if it is duplicate or not if it is accepted by user then play 
      if(checkIsDuplicate(inputLink)){
        
        if(!duplicateDiv){
          setDuplicateDiv(true);
          return;
        }
        if(duplicateDiv){
          
          setDuplicateDiv(false);
          await finallyPlaySong(inputLink);
          setLoading(false);
        }
        return;
      }
      await finallyPlaySong(inputLink);

    }
    catch(error){
      enqueueToast("error", `Payment unsuccessful`);
    }
    setLoading(false);

  },[ duplicateDiv,wallet , connection, inputLink]);

  const videoId = inputLink ? inputLink.match(YT_REGEX)?.[1] : undefined;

  return (
    <>
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Add a song</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-2 relative">
        <Input
          type="text"
          placeholder="Please paste your link"
          value={inputLink}
          onChange={(e) => setInputLink(e.target.value)}
        />
        { duplicateDiv &&
          <div className="w-full z-10 absolute top-10  right-0 transition-all ease-in duration-500 bg-black rounded-md flex flex-col gap-3 px-4 py-2 justify-center items-center ">
            <h1 className="font-semibold text-lg">Duplicate Song</h1>
            <Button 
              className="w-full"
              type="submit"
              onClick={handlePayAndPlay}
            >
              Accept
            </Button>
            <Button 
              className="w-full bg-red-500 hover:bg-red-400"
              onClick={()=>{setDuplicateDiv(false);setLoading(false)}}
              >
              Cancel
            </Button>
          </div>
        }
        <Button
          disabled={loading}
          onClick={handleSubmit}
          type="submit"
          className="w-full"
        >
          {loading ? "Loading..." : "Add to Queue"}
        </Button>
        
        { isSpectator && 
          <Button
            disabled={loading}
            onClick={handlePayAndPlay}
            type="submit"
            className="w-full"
          >
            {loading ? "Loading..." : "Pay and Play"}
          </Button>
        }
        
      </form>

      {videoId && !loading && (
        <Card>
          <CardContent className="p-4">
            <LiteYouTubeEmbed title="" id={videoId} />
          </CardContent>
        </Card>
      )}
    </>
  );
}
