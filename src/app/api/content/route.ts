import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// GET: Return current quiz content
export async function GET() {
    try {
        // Fetch media and questions separately
        const [mediaConfig, questions] = await Promise.all([
            storage.getMediaConfig(),
            storage.getQuestions()
        ]);

        return NextResponse.json({
            videoUrl: mediaConfig?.videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
            backgroundImageUrl: mediaConfig?.backgroundImageUrl || '/default-bg.jpg',
            videoType: mediaConfig?.videoType || 'upload',
            questions: questions || []
        });
    } catch (error) {
        console.error('Error reading content:', error);
        return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
    }
}

// POST: Update quiz content
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { videoUrl, backgroundImageUrl, videoType, questions } = body;

        // Save Media if provided
        if (videoUrl !== undefined || backgroundImageUrl !== undefined || videoType !== undefined) {
            await storage.saveMediaConfig({
                videoUrl,
                backgroundImageUrl,
                videoType
            });
        }

        // Save Questions if provided
        if (questions !== undefined) {
            await storage.saveQuestions(questions);
        }

        // Also call legacy saveContent to keep file backup in sync
        await storage.saveContent({
            videoUrl,
            backgroundImageUrl,
            videoType,
            questions
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
