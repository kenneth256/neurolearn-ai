
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '../../lib/prisma';
import { loginSchema } from '../../lib/auth/validator';
import {
  createErrorResponse,
  
  generateToken,
  verifyPassword,
} from '../../lib/auth/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

   
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return createErrorResponse(
        'Validation failed',
        400,
        validationResult.error.flatten().fieldErrors
      );
    }

    const { email, password } = validationResult.data;

  
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        firstName: true,
        secondName: true,
        bio: true,
        avatar: true,
        role: true,
        password: true,
        createdAt: true,
      },
    });

    if (!user) {
      return createErrorResponse('Invalid credentials', 401);
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);

    if (!isPasswordValid) {
      return createErrorResponse('Invalid credentials', 401);
    }

 
    const { password: _, ...userWithoutPassword } = user;

   
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Create response with token in HTTP-only cookie
    const response = NextResponse.json({
      success: true,
      user: userWithoutPassword,
      token,
      message: 'Login successful',
    });

    
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, 
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return createErrorResponse('Login failed', 500);
  }
}