"use client"
import OldStreamView from "@/components/OldStreamView";
import useRedirect from "@/hooks/useRedirect";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

// Use this when using old stream view for spaces
export default function Creator({params:{spaceId}}:{params:{spaceId:string}}) {
const [creatorId,setCreatorId]=useState<string>("invalid");
const session = useSession();
const router = useRouter();

  
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
  }
  fetchHostId();
},[spaceId])

  if(session.data?.user.id==creatorId){
    router.push(`/dashboard/${spaceId}`)
  }
    return <div>
        <OldStreamView creatorId={creatorId} spaceId={spaceId} playVideo={false} />
    </div>
}