import StreamView from "@/app/components/StreamView";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/app/lib/authOptions";

export default async function Creator({
    params: {
        creatorId,
        spaceId
    }
}: {
    params: {
        creatorId: string;
        spaceId:string
    }
}) {

    return <div>
        <StreamView creatorId={creatorId} spaceId={spaceId} playVideo={false} />
    </div>
}