import { NextRequest, NextResponse } from 'next/server';
import { trackPageView } from '@/lib/actions/analytics.actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      sessionCartId,
      path,
      referrer,
      eventType,
      eventData,
      timeOnPage,
      scrollDepth,
      screenWidth,
      screenHeight,
      deviceType,
      browserLang,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      utmTerm,
    } = body;

    if (!sessionCartId) {
      return NextResponse.json({ error: 'Missing sessionCartId' }, { status: 400 });
    }

    // Resolve client IP (works behind proxies like Vercel)
    const forwardedFor = request.headers.get('x-forwarded-for');
    const ip = forwardedFor?.split(',')[0].trim() || request.headers.get('x-real-ip') || '::1';

    // Get geo data from Vercel headers (automatically populated by Vercel)
    const country = request.headers.get('x-vercel-ip-country') || null;
    const region = request.headers.get('x-vercel-ip-country-region') || null;
    const cityHeader = request.headers.get('x-vercel-ip-city');
    const city = cityHeader ? decodeURIComponent(cityHeader) : null;

    await trackPageView({
      sessionCartId,
      path: path || '/',
      referrer: referrer || null,
      country,
      region,
      city,
      userAgent: request.headers.get('user-agent') || null,
      ip,
      eventType: eventType || 'pageview',
      eventData: eventData || null,
      timeOnPage: timeOnPage || null,
      scrollDepth: scrollDepth || null,
      screenWidth: screenWidth || null,
      screenHeight: screenHeight || null,
      deviceType: deviceType || null,
      browserLang: browserLang || null,
      utmSource: utmSource || null,
      utmMedium: utmMedium || null,
      utmCampaign: utmCampaign || null,
      utmContent: utmContent || null,
      utmTerm: utmTerm || null,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Analytics tracking error:', error);
    return NextResponse.json({ error: 'Failed to track analytics' }, { status: 500 });
  }
}
