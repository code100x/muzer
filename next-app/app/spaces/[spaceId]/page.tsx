"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socket-context";
import jwt from "jsonwebtoken";
import StreamView from "@/components/StreamView";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation";


// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';



export default function Component({params:{spaceId}}:{params:{spaceId:string}}) {


  const { socket, user, loading, setUser, connectionError } = useSocket();


  const [creatorId,setCreatorId]=useState<string>();
  const [loading1, setLoading1] = useState(true);
  const router = useRouter();

 
 
  console.log(spaceId)
  
  useEffect(()=>{
    async function fetchHostId(){
      try {
        const response = await fetch(`/api/spaces/?spaceId=${spaceId}`,{
          method:"GET"
        });
        const data = await response.json()
        if (!response.ok || !data.success) {
          throw new Error(data.message || "Failed to retreive space's host id");
        }
        setCreatorId(data.hostId)
       

      } catch (error) {
        
      }
      finally{
        setLoading1(false)
      }
    }
    fetchHostId();
  },[spaceId])

 

  useEffect(() => {
    if (user && socket && creatorId) {
      const token =  user.token || jwt.sign(
        {
          creatorId: creatorId,
          userId: user?.id,
        },
        process.env.NEXT_PUBLIC_SECRET || "",
        {
          expiresIn: "24h",
        }
      );

      socket?.send(
        JSON.stringify({
          type: "join-room",
          data: {
            token,
            spaceId
          },
        })
      );
      if(!user.token){
        setUser({ ...user, token });
      }
      
    }
  }, [user,spaceId,creatorId,socket]);

  if (connectionError) {
    return <ErrorScreen>Cannot connect to socket server</ErrorScreen>;
  }

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user) {
    return <ErrorScreen>Please Log in....</ErrorScreen>;
  }
  if(loading1){
  return <LoadingScreen></LoadingScreen>
  }

  if(creatorId===user.id){
    router.push(`/dashboard/${spaceId}`)
  }


  
  
  return <StreamView creatorId={creatorId as string} playVideo={false} spaceId={spaceId} />;
  
}

export const dynamic = "auto";
