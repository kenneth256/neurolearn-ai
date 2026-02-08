import { NextRequest, NextResponse } from 'next/server';
import { MasteryAnalyticsService } from '@/app/api/lib/services/m.service'; 

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ success: false, error: 'userId required' }, { status: 400 });
    }

    const data = await MasteryAnalyticsService.getAdaptiveQuizAnalytics(userId);
    return NextResponse.json({ success: true, data, timestamp: new Date() });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: (error as Error).message, timestamp: new Date() },
      { status: 500 }
    );
  }
}
