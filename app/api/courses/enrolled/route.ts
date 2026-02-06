import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma"; 
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate user from the auth-token cookie
    const token = req.cookies.get("auth-token")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { learnerId: number };

    const enrollments = await prisma.enrollment.findMany({
      where: {
        learnerId: decoded.learnerId,
      },
      include: {
        course: {
          include: {
            _count: {
              select: { modules: true } // Useful for "X of Y modules" display
            },
            modules: {
              include: {
                progress: {
                  where: { learnerId: decoded.learnerId }
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

    // 3. Clean up the response structure for the frontend
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