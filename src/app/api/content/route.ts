import { NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';

const CONTENT_KEY = 'content.json';

// GET: Return current quiz content
export async function GET() {
    try {
        // Try to fetch from Blob
        const blobUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? 'https://' + process.env.BLOB_STORE_ID + '.public.blob.vercel-storage.com/' + CONTENT_KEY : ''}`;

        if (!blobUrl) {
            // Return default content if Blob is not configured
            return NextResponse.json({
                videoUrl: '',
                backgroundImageUrl: '',
                questions: []
            });
        }

        try {
            await head(blobUrl);
            const response = await fetch(blobUrl);
            const content = await response.json();
            return NextResponse.json(content);
        } catch {
            // File doesn't exist yet, return default
            return NextResponse.json({
                videoUrl: '',
                backgroundImageUrl: '',
                questions: []
            });
        }
    } catch (error) {
        console.error('Error reading content:', error);
        return NextResponse.json({ error: 'Failed to read content' }, { status: 500 });
    }
}

// POST: Update quiz content
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { videoUrl, backgroundImageUrl, questions } = body;

        if (!videoUrl || !questions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const content = { videoUrl, backgroundImageUrl: backgroundImageUrl || '', questions };

        // Upload to Blob
        await put(CONTENT_KEY, JSON.stringify(content, null, 2), {
            access: 'public',
            contentType: 'application/json',
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
