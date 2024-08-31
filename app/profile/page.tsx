"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Appbar } from "../components/Appbar";
import Link from 'next/link';

export default function Component() {
    const { data: session, update: updateSession, status } = useSession();
	const router = useRouter();
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
	const [loading, setLoading] = useState(true);

	useEffect(() => {
        if (status === "loading") return;
        if (!session?.user) {
            router.push('/api/auth/signin');
        } else {
            fetchUserData();
        }
    }, [session, status, router]);

	const fetchUserData = async () => {
		if (session?.user?.email) {
			const response = await fetch('/api/user');
			const data = await response.json();

			if (response.ok) {
				setUsername(data.user.username);
				setEmail(data.user.email);
			} else {
				setError(data.message || 'Error fetching user data.');
			}
		}
	};

    const handleSubmit = async (e: any) => {
        e.preventDefault();

        const response = await fetch('/api/user', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email }),
        });

        const data = await response.json();

        if (response.ok) {
            await updateSession({
                ...session,
                user: {
                    ...session?.user,
                    username: data.user.username,
                },
            });

            setSuccess('Profile updated successfully!');
            setError('');
        } else {
            setError(data.message || 'Error updating profile.');
            setSuccess('');
        }
    };

    if (!session?.user.id) {
        return <h1>Please Log in....</h1>
    }

    return (
        <>
            <div className="flex flex-col min-h-screen bg-[rgb(10,10,10)]">
                <Appbar />
                <div className="container mx-auto p-2">
                    <div className="max-w-sm mx-auto my-24 bg-white pb-10 pt-2 rounded shadow-xl">
						<div className="mb-10 mx-2 cursor-pointer border py-1 px-3 rounded-lg w-fit hover:border-black transition-all duration-300">
							<Link href='/dashboard'>Go Back</Link>
						</div>
                        <div className="text-center mb-8 px-5">
                            <h1 className="text-2xl font-bold text-black">
                                Update Profile
                            </h1>
                        </div>
                        <form onSubmit={handleSubmit} className='px-5'>
                            {error && <p className="text-red-500">{error}</p>}
                            {success && <p className="text-green-500">{success}</p>}
                            <div className="mt-5">
                                <label htmlFor="username" className="block text-gray-700">Username</label>
                                <input
                                    type="text"
                                    id="username"
                                    className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div className="mt-5">
                                <label htmlFor="email" className="block text-gray-700">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-transparent cursor-not-allowed"
                                    placeholder="Email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
									disabled
                                />
                            </div>
                            <div className="mt-10">
                                <input
                                    type="submit"
                                    value="Update Profile"
                                    className="py-3 bg-purple-600 hover:bg-purple-700 rounded text-white text-center w-full cursor-pointer"
                                />
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
}