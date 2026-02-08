import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/api/lib/prisma";
import { requireAuth } from "@/app/api/lib/auth/auth";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { courseId, availableTime, learningStyle, deadline } = await req.json();

  
    const userId = String(user.userId); 

    const enrollment = await prisma.enrollment.create({
      data: {
        userId,
        courseId,
        availableTime: availableTime || "Flexible", 
        learningStyle: learningStyle || "Visual",   
        deadline: deadline || "No deadline",       
        status: "ACTIVE",
      },
    });

    return NextResponse.json({ success: true, enrollment });
  } catch (error) {
    return NextResponse.json({ error: "Failed to enroll" }, { status: 500 });
  }
}