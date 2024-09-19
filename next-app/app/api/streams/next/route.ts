import { authOptions } from "@/lib/auth-options";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    return NextResponse.json(
      {
        message: "Unauthenticated",
      },
      {
        status: 403,
      },
    );
  }
  const user = session.user;
  const spaceId = req.nextUrl.searchParams.get("spaceId");

  const mostUpvotedStream = await db.stream.findFirst({
    where: {
      userId: user.id,
      played: false,
      spaceId:spaceId
    },
    orderBy: {
      upvotes: {
        _count: "desc",
      },
    },
  });

  await Promise.all([
    db.currentStream.upsert({
      where: {
        spaceId:spaceId as string
      },
      update: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
        spaceId:spaceId
      },
      create: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
        spaceId:spaceId 
      },
    }),
    db.stream.update({
      where: {
        id: mostUpvotedStream?.id ?? "",
      },
      data: {
        played: true,
        playedTs: new Date(),
      },
    }),
  ]);

  return NextResponse.json({
    stream: mostUpvotedStream,
  });
}
