import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";


export default function useRedirect() {
    const session = useSession();
    const router = useRouter();

    useEffect(() => {
        if (session.status === "authenticated") {
            router.push("/home")
        } else {
            router.push("/")
        }
    }, [session])
}