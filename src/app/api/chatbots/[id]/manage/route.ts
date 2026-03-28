import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { chatbot } from '@/db/schema';
import { eq, and } from 'drizzle-orm';


// Get a specific chatbot for authenticated user
export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const params = await context.params;
    const chatbotData = await db.query.chatbot.findFirst({
      where: and(
        eq(chatbot.id, params.id),
        eq(chatbot.userId, session.user.id)
      ),
    });

    if (!chatbotData) {
      return NextResponse.json({ error: 'Chatbot not found' }, { status: 404 });
    }

    return NextResponse.json({ chatbot: chatbotData });
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
