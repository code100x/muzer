import { prismaClient } from "@/app/lib/db";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

export const GET = async (req: NextRequest) => {
    const session = await getServerSession();
    // TODO: You can get rid of the db call here 
    const user = await prismaClient.user.findFirst({
        where: {
            email: session?.user?.email ?? ""
        }
    });

    if (!user) {
        return NextResponse.json({
            message: "Unauthenticated"
        }, {
            status: 403
        })
    }
    return NextResponse.json({
        user
    });
}

export const PUT = async (req: NextRequest) => {
    const session = await getServerSession();

    if (!session) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { username, email } = await req.json();

    try {
        // Update the user using the email from the session
        const updatedUser = await prismaClient.user.update({
            where: { email: session.user.email! }, // Use the email as the unique identifier
            data: { username, email },
        });

        return NextResponse.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ message: 'Error updating profile' }, { status: 500 });
    }
};

// dont static render
export const dynamic = 'force-dynamic'
