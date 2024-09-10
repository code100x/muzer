import StreamView from "@/components/StreamView";
import { authOptions } from "@/lib/auth-options";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";

export default async function Component() {
  const session = await getServerSession(authOptions);
  if (!session?.user.id) redirect("/");

  return <StreamView creatorId={session.user.id} playVideo={true} />;
}

export const dynamic = "auto";
