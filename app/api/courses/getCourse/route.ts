import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

/**
 * Extracts and verifies the user ID from the JWT token in cookies
 * @param req - The incoming Next.js request
 * @returns The user ID if valid, null otherwise
 */
function extractUserIdFromToken(req: NextRequest): string | null {
  try {
    // Try cookie first
    let token = req.cookies.get("auth-token")?.value;
    
    // Fallback to Authorization header
    if (!token) {
      const authHeader = req.headers.get("authorization");
      token = authHeader?.replace("Bearer ", "");
    }
    
    // Try localStorage token (from our auth system)
    if (!token) {
      token = req.cookies.get("authToken")?.value;
    }
    
    if (!token) {
      console.log("No auth token found");
      return null;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    return decoded.userId;
  } catch (error) {
    console.error("Token verification error:", error);
    return null;
  }
}

/**
 * GET endpoint to fetch all available courses with enrollment and progress information
 * for the authenticated user. Frontend can filter by creator if needed.
 */
export async function GET(req: NextRequest) {
  try {
    // Extract and verify user ID from JWT token
    const userId = extractUserIdFromToken(req);

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: "Authentication required. Please log in.",
        },
        { status: 401 }
      );
    }

    // Fetch all courses with user-specific enrollment and progress data
    const courses = await prisma.course.findMany({
      include: {
        creator: {
          select: {
            id: true,
            firstName: true,
            secondName: true,
            avatar: true,
          },
        },
        modules: {
          orderBy: {
            moduleNumber: "asc",
          },
          include: {
            moduleProgress: {
              where: {
                userId: userId,
              },
            },
          },
        },
        enrollments: {
          where: {
            userId: userId,
          },
        },
        _count: {
          select: {
            modules: true,
            enrollments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform courses with progress statistics and enrollment info
    const coursesWithDetails = courses.map((course) => {
      const totalModules = course.modules.length;
      const completedModules = course.modules.filter(
        (module) =>
          module.moduleProgress.length > 0 &&
          module.moduleProgress[0].status === "COMPLETED"
      ).length;
      const inProgressModules = course.modules.filter(
        (module) =>
          module.moduleProgress.length > 0 &&
          module.moduleProgress[0].status === "IN_PROGRESS"
      ).length;

      const progressPercentage =
        totalModules > 0 ? Math.round((completedModules / totalModules) * 100) : 0;

      const isEnrolled = course.enrollments.length > 0;

      return {
        id: course.id,
        title: course.title,
        description: course.description,
        subject: course.subject,
        level: course.level,
        thumbnail: course.thumbnail,
        isPublished: course.isPublished,
        isPublic: course.isPublic,
        createdAt: course.createdAt,
        updatedAt: course.updatedAt,
        creator: course.creator,
        isEnrolled,
        enrolledAt: course.enrollments[0]?.enrolledAt || null,
        modules: course.modules.map((module) => ({
          id: module.id,
          moduleNumber: module.moduleNumber,
          moduleName: module.moduleName,
          learningObjectives: module.learningObjectives,
          estimatedHours: module.estimatedHours,
          status: module.moduleProgress[0]?.status || "LOCKED",
          completedAt: module.moduleProgress[0]?.completedAt || null,
          masteryScore: module.moduleProgress[0]?.masteryScore || 0,
        })),
        stats: {
          totalModules,
          completedModules,
          inProgressModules,
          notStartedModules: totalModules - completedModules - inProgressModules,
          progressPercentage,
          totalEnrollments: course._count.enrollments,
          averageRating: course.averageRating,
          totalReviews: course.totalReviews,
        },
      };
    });

    return NextResponse.json({
      success: true,
      courses: coursesWithDetails,
      count: coursesWithDetails.length,
      userId, // Include userId so frontend can filter created courses
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}