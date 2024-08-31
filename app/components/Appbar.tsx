"use client";
import { useState, useEffect } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
//@ts-ignore
import { Music } from "lucide-react";

export function Appbar() {
	const [username, setUsername] = useState('');
	const { data: session } = useSession();
	const router = useRouter();

	useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                const response = await fetch('/api/user');
                const data = await response.json();

                if (response.ok) {
                    setUsername(data.user.username);
                } else {
                    console.log(data.message || 'Error fetching user data.');
                }
            }
        };

        fetchUserData();
    }, [session]);

	return (
		<div className="flex justify-between px-20 pt-4">
			<div className="text-lg font-bold flex flex-col justify-center text-white">
				{session?.user ? <Link href="/dashboard">Muzer</Link> : <Link href="/">Muzer</Link>}
			</div>
			<div>
				{session?.user && <Button className="text-white bg-transparent hover:bg-transparent mr-4" onClick={() => router.push('/profile')}>{username}</Button>}
				{session?.user && <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signOut()}>Logout</Button>}
				{!session?.user && <Button className="bg-purple-600 text-white hover:bg-purple-700" onClick={() => signIn()}>Signin</Button>}
			</div>
		</div>
	);
}
