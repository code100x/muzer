import OldStreamView from "@/components/OldStreamView";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

// Use this when using old stream view for spaces
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
        <OldStreamView creatorId={creatorId} spaceId={spaceId} playVideo={false} />
    </div>
}