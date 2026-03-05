import { NextRequest, NextResponse } from "next/server";
import { processSpacedRepetitionReview } from "../../lib/spacedRepetition/service";

export async function POST(request: NextRequest) {
    try {
        const token = request.cookies.get("auth-token")?.value;
        if (!token) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Auth bypass for mock/dev
        const userId = "test-user-id";

        const body = await request.json();
        const { reviewItemId, quality } = body;

        if (!reviewItemId || quality === undefined) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        if (quality < 0 || quality > 5) {
            return NextResponse.json({ error: "Quality must be between 0 and 5" }, { status: 400 });
        }

        // Process the review
        const result = await processSpacedRepetitionReview(reviewItemId, userId, quality);

        return NextResponse.json({
            success: true,
            data: result
        });

    } catch (error: any) {
        console.error("[SpacedRepetition] Error submitting review:", error);
        return NextResponse.json(
            { error: error?.message || "Failed to submit review" },
            { status: 500 }
        );
    }
}
