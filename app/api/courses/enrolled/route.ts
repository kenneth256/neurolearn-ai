import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 
import jwt from "jsonwebtoken";
import { createErrorResponse } from "../../lib/auth/auth";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: NextRequest) {
  try {
    
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { learnerId: number };
    if (!decoded) return createErrorResponse("Invalid token", 401);

    const userIdString = String(decoded.learnerId);

  const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userIdString
      },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true } 
            },
            modules: {
              include: {
                _count: { select: { lessons: true } },
                moduleProgress: {
                  where: {
                    userId: userIdString
                  }
                }
              }
            }
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc'
      }
    });

  
    const enrolledCourses = enrollments.map((e) => ({
      enrollmentId: e.id,
      enrolledAt: e.enrolledAt,
      ...e.course,
    }));

    return NextResponse.json(enrolledCourses, { status: 200 });
  } catch (error) {
    console.error("Enrolled courses fetch error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}