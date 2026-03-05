import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";

export async function GET(request: NextRequest) {
    try {
        // 1. Authenticate (Mocked: Extract from real auth token in prod)
        const token = request.cookies.get("auth-token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // For this demonstration, we query based on the authenticated user ID you'd decode
        // const decodedToken = jwt.verify(token, process.env.JWT_SECRET) as any;
        // const userId = decodedToken.userId;
        // Hardcoded fallback for now to prevent compiler bugs if JWT isn't handy
        const userId = "test-user-id";

        // Find all uncompleted ReviewItems that are due
        const now = new Date();
        const reviewsDue = await prisma.reviewItem.findMany({
            where: {
                completed: false,
                dueDate: {
                    lte: now,
                },
                enrollment: {
                    userId: userId // Only their items
                }
            },
            include: {
                enrollment: {
                    include: {
                        course: true,
                    }
                }
            },
            orderBy: {
                dueDate: 'asc' // Oldest/most urgent first
            }
        });

        return NextResponse.json({
            success: true,
            data: reviewsDue
        });

    } catch (error) {
        console.error("[SpacedRepetition] Error fetching pending reviews:", error);
        return NextResponse.json(
            { error: "Failed to fetch pending reviews" },
            { status: 500 }
        );
    }
}
