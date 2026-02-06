import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../lib/prisma"; 

export async function GET() {
  try {
   
    const courses = await prisma.course.findMany({
      include: {
        
        _count: {
          select: { modules: true }
        }
      },
      orderBy: {
        createdAt: "desc", 
      },
    });

    return NextResponse.json({
      success: true,
      count: courses.length,
      courses,
    });
    
  } catch (error) {
    console.error("Error fetching all courses:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch courses",
      },
      { status: 500 }
    );
  }
}