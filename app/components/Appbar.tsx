"use client";
import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
//@ts-ignore
import { Music } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@radix-ui/react-avatar";
// import {profile} from '@/public/profile.jpeg'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

export function Appbar() {
    const session = useSession();
    // console.log(session);

    return <div className="flex justify-between px-20 pt-4">
        <div className="text-lg font-bold flex flex-col justify-center text-white">
            Muzer
        </div>
        <div>
            {session.data?.user && <div className="flex gap-4 items-center">
                <Dialog >
                    <DialogTrigger>
                        <Avatar className="">
                            <AvatarImage className="w-16 h-16 rounded-full" src="/profile.jpeg" />
                            <AvatarFallback>Profile</AvatarFallback>
                        </Avatar>
                    </DialogTrigger>
                    <DialogContent className="bg-black text-white">
                        <DialogHeader>
                            <DialogTitle>Edit profile</DialogTitle>
                            <DialogDescription>
                                Make changes to your profile here. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="name" className="text-right">
                                    User Name
                                </label>
                                <Input
                                    id="name"
                                    defaultValue="360Parminder"
                                    className="col-span-3 bg-gray-800 text-white"
                                />
                            </div>
                            <div className="grid grid-cols-4 items-center gap-4">
                                <label htmlFor="username" className="text-right">
                                    Email
                                </label>
                                <Input
                                    id="username"
                                    defaultValue="360.parminder@gmail.com"
                                    className="col-span-3 bg-gray-800 text-white"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button className="bg-purple-600 text-white hover:bg-purple-700">
                                Save changes
                            </Button>
                            <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signOut()}>
                                Logout
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>




            </div>}
            {!session.data?.user && <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signIn()}>Signin</Button>}
        </div>
    </div>
}