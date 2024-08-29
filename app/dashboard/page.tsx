import 'react-toastify/dist/ReactToastify.css';

import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css';

import StreamView from '../components/StreamView';

export interface Video {
    id: string;
    type: string;
    url: string;
    extractedId: string;
    title: string;
    smallImg: string;
    bigImg: string;
    active: boolean;
    userId: string;
    upvotes: number;
    haveUpvoted: boolean;
}

export default async function Component() {
    try {
        const data = await fetch('/api/user').then((res) => res.json());

        return <StreamView creatorId={data.user.id} playVideo={true} />;
    } catch (e) {
        console.log(e);
        return null;
    }
}

export const dynamic = 'auto';
