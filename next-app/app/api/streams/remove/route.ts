import { authOptions } from "@/lib/auth-options";
import db from "@/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const RemoveStreamSchema = z.object({
  streamId: z.string(),
});

export async function DELETE(req: NextRequest) {
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

  try {
    const { searchParams } = new URL(req.url);
    const streamId = searchParams.get("streamId");

    if (!streamId) {
      return NextResponse.json(
        {
          message: "Stream ID is required",
        },
        {
          status: 400,
        },
      );
    }

    await db.stream.delete({
      where: {
        id: streamId,
        userId: user.id,
      },
    });

    return NextResponse.json({
      message: "Song removed successfully",
    });
  } catch (e) {
    return NextResponse.json(
      {
        message: "Error while removing the song",
      },
      {
        status: 400,
      },
    );
  }
}
