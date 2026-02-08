import { NextRequest, NextResponse } from 'next/server';
import { StruggleAnalyticsService } from '../../lib/services/s.service'; 

export async function GET(request: NextRequest) {
  try {
    const enrollmentId = request.nextUrl.searchParams.get('enrollmentId');
    if (!enrollmentId) {
      return NextResponse.json({ success: false, error: 'enrollmentId required' }, { status: 400 });
    }

    const data = await StruggleAnalyticsService.getMoodImpactAnalysis(enrollmentId);
    return NextResponse.json({ success: true, data, timestamp: new Date() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message, timestamp: new Date() },
      { status: 500 }
    );
  }
}
