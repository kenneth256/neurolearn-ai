// ============================================
// app/api/auth/register/route.ts
// ============================================
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma'; 
import { registerSchema } from '../../lib/auth/validator';
import {
  createErrorResponse,
  createSuccessResponse,
  generateToken,
  hashPassword,
} from '../../lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

  
    const validationResult = registerSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { email, password, firstName, secondName, bio, avatar, role } = validationResult.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return createErrorResponse('User with this email already exists', 409);
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

   
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: firstName,
        secondName,
        bio: bio || null,
        avatar: avatar || null,
        role: role || 'LEARNER',
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        secondName: true,
        bio: true,
        avatar: true,
        role: true,
        createdAt: true,
      },
    });

    
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    return createSuccessResponse(
      {
        user,
        token,
        message: 'User registered successfully',
      },
      201
    );
  } catch (error) {
    console.error('Registration error:', error);
    return createErrorResponse('Failed to register user', 500);
  }
}