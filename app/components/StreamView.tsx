"use client"
import { useState, useEffect, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { ChevronUp, ChevronDown, Share2, Play, Trash2, X } from "lucide-react"
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { Appbar } from './Appbar'
import LiteYouTubeEmbed from 'react-lite-youtube-embed'
import 'react-lite-youtube-embed/dist/LiteYouTubeEmbed.css'
import { YT_REGEX } from '../lib/utils'
import YouTubePlayer from 'youtube-player'
import { useSession } from "next-auth/react"
import type { Session } from "next-auth"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"

interface Video {
    id: string
    type: string
    url: string
    extractedId: string
    title: string
    smallImg: string
    bigImg: string
    active: boolean
    userId: string
    upvotes: number
    haveUpvoted: boolean
}

interface CustomSession extends Omit<Session, 'user'> {
    user: {
        id: string;
        name?: string | null;
        email?: string | null;
        image?: string | null;
    };
}

const REFRESH_INTERVAL_MS = 10 * 1000

export default function StreamView({
    creatorId,
    playVideo = false
}: {
    creatorId: string
    playVideo: boolean
}) {
    const [inputLink, setInputLink] = useState('')
    const [queue, setQueue] = useState<Video[]>([])
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
    const [loading, setLoading] = useState(false)
    const [playNextLoader, setPlayNextLoader] = useState(false)
    const videoPlayerRef = useRef<HTMLDivElement>(null)
    const { data: session } = useSession() as { data: CustomSession | null }
    const [creatorUserId, setCreatorUserId] = useState<string | null>(null)
    const [isCreator, setIsCreator] = useState(false)
    const [isEmptyQueueDialogOpen, setIsEmptyQueueDialogOpen] = useState(false)

    async function refreshStreams() {
        try {
            const res = await fetch(`/api/streams/?creatorId=${creatorId}`, {
                credentials: "include"
            })
            const json = await res.json()
            if (json.streams && Array.isArray(json.streams)) {
                setQueue(json.streams.length > 0 
                    ? json.streams.sort((a: any, b: any) => b.upvotes - a.upvotes)
                    : [])
            } else {
                setQueue([])
            }
            
            setCurrentVideo(video => {
                if (video?.id === json.activeStream?.stream?.id) {
                    return video
                }
                return json.activeStream?.stream || null
            })

            // Set the creator's ID
            setCreatorUserId(json.creatorUserId)
            setIsCreator(json.isCreator)
        } catch (error) {
            console.error("Error refreshing streams:", error)
            setQueue([])
            setCurrentVideo(null)
        }
    }

    useEffect(() => {
        refreshStreams()
        const interval = setInterval(refreshStreams, REFRESH_INTERVAL_MS)
        return () => clearInterval(interval)
    }, [creatorId])

    useEffect(() => {
        if (!videoPlayerRef.current || !currentVideo) return

        const player = YouTubePlayer(videoPlayerRef.current)
        player.loadVideoById(currentVideo.extractedId)
        player.playVideo()

        const eventHandler = (event: { data: number }) => {
            if (event.data === 0) {
                playNext()
            }
        }
        player.on('stateChange', eventHandler)

        return () => {
            player.destroy()
        }
    }, [currentVideo, videoPlayerRef])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inputLink.trim()) {
            toast.error("YouTube link cannot be empty")
            return
        }
        if (!inputLink.match(YT_REGEX)) {
            toast.error("Invalid YouTube URL format")
            return
        }
        setLoading(true)
        try {
            const res = await fetch("/api/streams/", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    creatorId,
                    url: inputLink
                })
            })
            const data = await res.json()
            if (!res.ok) {
                throw new Error(data.message || "An error occurred")
            }
            setQueue([...queue, data])
            setInputLink('')
            toast.success("Song added to queue successfully")
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("An unexpected error occurred")
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVote = (id: string, isUpvote: boolean) => {
        setQueue(queue.map(video => 
            video.id === id 
                ? { 
                    ...video, 
                    upvotes: isUpvote ? video.upvotes + 1 : video.upvotes - 1,
                    haveUpvoted: !video.haveUpvoted
                } 
                : video
        ).sort((a, b) => b.upvotes - a.upvotes))

        fetch(`/api/streams/${isUpvote ? "upvote" : "downvote"}`, {
            method: "POST",
            body: JSON.stringify({
                streamId: id
            })
        })
    }

    const playNext = async () => {
        if (queue.length > 0) {
            try {
                setPlayNextLoader(true)
                const data = await fetch('/api/streams/next', {
                    method: "GET",
                })
                const json = await data.json()
                setCurrentVideo(json.stream)
                setQueue(q => q.filter(x => x.id !== json.stream?.id))
            } catch(e) {
                console.error("Error playing next song:", e)
            } finally {
                setPlayNextLoader(false)
            }
        }
    }

    const handleShare = () => {
        const shareableLink = `${window.location.origin}/creator/${creatorId}`
        navigator.clipboard.writeText(shareableLink).then(() => {
            toast.success('Link copied to clipboard!')
        }, (err) => {
            console.error('Could not copy text: ', err)
            toast.error('Failed to copy link. Please try again.')
        })
    }

    const emptyQueue = async () => {
        try {
            const res = await fetch("/api/streams/empty-queue", {
                method: "POST"
            });
            const data = await res.json();
            if (res.ok) {
                toast.success(data.message);
                refreshStreams();
                setIsEmptyQueueDialogOpen(false);
            } else {
                toast.error(data.message || "Failed to empty queue");
            }
        } catch (error) {
            console.error("Error emptying queue:", error);
            toast.error("An error occurred while emptying the queue");
        }
    }

    const removeSong = async (streamId: string) => {
        try {
            const res = await fetch(`/api/streams/remove?streamId=${streamId}`, {
                method: "DELETE",
            })
            if (res.ok) {
                toast.success("Song removed successfully")
                refreshStreams()
            } else {
                toast.error("Failed to remove song")
            }
        } catch (error) {
            toast.error("An error occurred while removing the song")
        }
    }

    return (
        <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-900 to-black text-gray-200">
            <Appbar />
            <div className='flex justify-center px-4 py-8'>
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 w-full max-w-7xl">
                    <div className='lg:col-span-2 space-y-6'>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
                            <h2 className="text-3xl font-bold text-white">Upcoming Songs</h2>
                            <div className="flex space-x-2">
                                <Button onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-700 text-white transition-colors">
                                    <Share2 className="mr-2 h-4 w-4" /> Share
                                </Button>
                                {isCreator && (
                                    <Button 
                                        onClick={() => setIsEmptyQueueDialogOpen(true)} 
                                        className="bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                    >
                                        <Trash2 className="mr-2 h-4 w-4" /> Empty Queue
                                    </Button>
                                )}
                            </div>
                        </div>
                        {queue.length === 0 ? (
                            <Card className="bg-gray-800 border-gray-700 shadow-lg">
                                <CardContent className="p-6">
                                    <p className="text-center py-8 text-gray-400">No videos in queue</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {queue.map((video) => (
                                    <Card key={video.id} className="bg-gray-800 border-gray-700 shadow-lg hover:shadow-xl transition-shadow">
                                        <CardContent className="p-4 flex items-center space-x-4">
                                            <img 
                                                src={video.smallImg}
                                                alt={`Thumbnail for ${video.title}`}
                                                className="w-32 h-24 object-cover rounded-md"
                                            />
                                            <div className="flex-grow">
                                                <h3 className="font-semibold text-white text-lg mb-2">{video.title}</h3>
                                                <div className="flex items-center space-x-2">
                                                    <Button 
                                                        variant="outline" 
                                                        size="sm"
                                                        onClick={() => handleVote(video.id, !video.haveUpvoted)}
                                                        className="flex items-center space-x-1 bg-gray-700 text-white border-gray-600 hover:bg-gray-600 transition-colors"
                                                    >
                                                        {video.haveUpvoted ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                                                        <span>{video.upvotes}</span>
                                                    </Button>
                                                    {isCreator && (
                                                        <Button 
                                                            variant="outline" 
                                                            size="sm"
                                                            onClick={() => removeSong(video.id)}
                                                            className="bg-gray-700 hover:bg-gray-600 text-white transition-colors"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                    <div className='space-y-6'>
                        <Card className="bg-gray-800 border-gray-700 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-2xl font-bold text-white">Add a song</h2>
                                <form onSubmit={handleSubmit} className="space-y-3">
                                    <Input
                                        type="text"
                                        placeholder="Paste YouTube link here"
                                        value={inputLink}
                                        onChange={(e) => setInputLink(e.target.value)}
                                        className="bg-gray-700 text-white border-gray-600 placeholder-gray-400"
                                    />
                                    <Button disabled={loading} type="submit" className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                                        {loading ? "Loading..." : "Add to Queue"}
                                    </Button>
                                </form>
                                {inputLink && inputLink.match(YT_REGEX) && !loading && (
                                    <div className="mt-4">
                                        <LiteYouTubeEmbed title="" id={inputLink.split("?v=")[1]} />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                        <Card className="bg-gray-800 border-gray-700 shadow-lg">
                            <CardContent className="p-6 space-y-4">
                                <h2 className="text-2xl font-bold text-white">Now Playing</h2>
                                {currentVideo ? (
                                    <div>
                                        {playVideo ? (
                                            <div ref={videoPlayerRef} className='w-full aspect-video' />
                                        ) : (
                                            <>
                                                <img 
                                                    src={currentVideo.bigImg} 
                                                    className="w-full aspect-video object-cover rounded-md"
                                                    alt={currentVideo.title}
                                                />
                                                <p className="mt-2 text-center font-semibold text-white">{currentVideo.title}</p>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <p className="text-center py-8 text-gray-400">No video playing</p>
                                )}
                                {playVideo && (
                                    <Button disabled={playNextLoader} onClick={playNext} className="w-full bg-purple-600 hover:bg-purple-700 text-white transition-colors">
                                        <Play className="mr-2 h-4 w-4" /> {playNextLoader ? "Loading..." : "Play next"}
                                    </Button>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
            <ToastContainer 
                position="top-right"
                autoClose={3000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="dark"
            />
            <Dialog open={isEmptyQueueDialogOpen} onOpenChange={setIsEmptyQueueDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Empty Queue</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to empty the queue? This will remove all songs from the queue. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEmptyQueueDialogOpen(false)}>Cancel</Button>
                        <Button onClick={emptyQueue} className="bg-red-600 hover:bg-red-700 text-white">Empty Queue</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}