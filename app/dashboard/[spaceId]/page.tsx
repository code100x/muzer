"use client"
import { useSession } from 'next-auth/react'
import StreamView from '@/app/components/StreamView'
import useRedirect from '@/app/hooks/useRedirect';

export default function Component({params}:{params:{spaceId:string}}) {
    const session = useSession();
 
    if (session.status === "loading") {
        return <div>Loading...</div>;
    }

    if (!session.data?.user.id) {
        return <h1>Please Log in....</h1>;
    }

    return <StreamView creatorId={session.data.user.id} spaceId={params.spaceId} playVideo={true} />;
}

export const dynamic = 'auto'