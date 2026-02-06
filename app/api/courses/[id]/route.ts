import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 
import { JwtPayload } from "../generate/route";
import { verifyToken } from "../../lib/auth/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> } 
) {
  try {
    const { id: courseId } = await params;

    
    const token = req.cookies.get("auth-token")?.value;
    if (!token) return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    
    const payload = verifyToken(token) as JwtPayload;
    if (!payload?.userId) return NextResponse.json({ success: false, message: "Invalid token" }, { status: 401 });

   
    
    const enrollment = await prisma.course.findUnique({
      where: { id : courseId},
      include: {
        modules: true,
        creator: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            avatar: true,
          },
        },
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { success: false, message: "You are not enrolled in this course" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: enrollment });
  } catch (error) {
    console.error("Enrollment Check Error:", error);
    return NextResponse.json({ success: false, message: "Internal Server Error" }, { status: 500 });
  }
}