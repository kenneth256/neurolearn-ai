import { NextRequest, NextResponse } from 'next/server';
import { PerformanceAnalyticsService } from '@/app/api/lib/services/p.service'; 
import { AnalyticsResponse } from '@/app/api/lib/analytics/analytics'; 


export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: 'userId is required'
        } as AnalyticsResponse<never>,
        { status: 400 }
      );
    }

    const dashboard = await PerformanceAnalyticsService.getPerformanceDashboard(userId);

    return NextResponse.json({
      success: true,
      data: dashboard,
      timestamp: new Date()
    } as AnalyticsResponse<typeof dashboard>);

  } catch (error) {
    console.error('Performance dashboard error:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch performance dashboard',
        timestamp: new Date()
      } as AnalyticsResponse<never>,
      { status: 500 }
    );
  }
}