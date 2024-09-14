import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";

export default function useRedirect() {
  const session = useSession();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (session.status === "unauthenticated") {
      router.push("/");
     }// else if (!pathname.includes("creator")) {
    //   router.push("/dashboard");  // If using websocket with StreamView 
    // }
    // } else if (!pathname.includes("creator")) {
    //   router.push("/home");              // If using spaces with old stream view to go to home where all the spaces are
    // }
  }, [session]);
}
