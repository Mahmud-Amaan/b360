import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { chatbot, chatbotAnalytics } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id: chatbotId } = await params;
    const userId = session.user.id;

    // Verify chatbot belongs to user
    const userChatbot = await db
      .select()
      .from(chatbot)
      .where(and(
        eq(chatbot.id, chatbotId),
        eq(chatbot.userId, userId)
      ))
      .limit(1);

    if (userChatbot.length === 0) {
      return NextResponse.json(
        { error: 'Chatbot not found' },
        { status: 404 }
      );
    }

    // Get chatbot analytics
    const [analyticsData] = await db
      .select()
      .from(chatbotAnalytics)
      .where(eq(chatbotAnalytics.chatbotId, chatbotId))
      .limit(1);

    // Use chatbot analytics if available, otherwise default to 0
    const totalMessages = analyticsData?.messageCount || 0;

    return NextResponse.json({
      totalMessages: totalMessages,
    });

  } catch (error) {
    console.error('Error fetching chatbot analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
