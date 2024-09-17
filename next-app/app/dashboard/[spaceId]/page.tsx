"use client";
import { useEffect, useState } from "react";
import { useSocket } from "@/context/socket-context";
import jwt from "jsonwebtoken";
import StreamView from "@/components/StreamView";
import ErrorScreen from "@/components/ErrorScreen";
import LoadingScreen from "@/components/LoadingScreen";



export default function Component({params:{spaceId}}:{params:{spaceId:string}}) {


  const { socket, user, loading, setUser, connectionError } = useSocket();


  const [creatorId,setCreatorId]=useState<string | null>(null);
  const [loading1, setLoading1] = useState(true);
  
 
 
  
  
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


  if(user.id!=creatorId){
    return <ErrorScreen>You are not the creator of this space</ErrorScreen>
  }



  
  return <StreamView creatorId={creatorId as string} playVideo={true} spaceId={spaceId} />;
  
}

export const dynamic = "auto";
