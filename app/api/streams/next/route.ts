import db from '@/app/lib/db';
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await getServerSession();
  // TODO: You can get rid of the db call here
  const user = await db.user.findFirst({
    where: {
      email: session?.user?.email ?? '',
    },
  });

  if (!user) {
    return NextResponse.json(
      {
        message: 'Unauthenticated',
      },
      {
        status: 403,
      },
    );
  }
  console.log('before first call');

  const mostUpvotedStream = await db.stream.findFirst({
    where: {
      userId: user.id,
      played: false,
    },
    orderBy: {
      upvotes: {
        _count: 'desc',
      },
    },
  });
  console.log('after first call');
  console.log(mostUpvotedStream?.id);

  await Promise.all([
    db.currentStream.upsert({
      where: {
        userId: user.id,
      },
      update: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
      },
      create: {
        userId: user.id,
        streamId: mostUpvotedStream?.id,
      },
    }),
    db.stream.update({
      where: {
        id: mostUpvotedStream?.id ?? '',
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
