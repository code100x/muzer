import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";

export async function GET(req: NextRequest) {
  //   const session = await getServerSession();

  //   const user = await prismaClient.user.findFirst({
  //     where: {
  //       email: session?.user?.email ?? "",
  //     },
  //   });

  //   if (!user) {
  //     return NextResponse.json(
  //       {
  //         message: "Unauthenticated",
  //       },
  //       {
  //         status: 403,
  //       }
  //     );
  //   }

  const url = new URL(req.url);
  const query = url.searchParams.get("video");

  return NextResponse.json({
    message: "Success",
    data: query,
  });
}
