"use client"
import { useEffect, useState } from 'react'
import StreamView from '../components/StreamView'

export default function Component() {
    const [creatorId, setCreatorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUserData() {
            try {
                const response = await fetch("/api/user");
                const data = await response.json();
                setCreatorId(data.user?.id || null);
            } catch (e) {
                console.error("Error fetching user data:", e);
            } finally {
                setLoading(false);
            }
        }

        fetchUserData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    return <StreamView creatorId={creatorId} playVideo={true} />;
}
