import StreamView from "@/app/components/StreamView";

export default function Creator({
    params: {
        creatorId,
		userId
    }
}: {
    params: {
        creatorId: string;
		userId: string;
    }
}) {
    return <div>
        <StreamView creatorId={creatorId} playVideo={false} userId={userId} />
    </div>
}