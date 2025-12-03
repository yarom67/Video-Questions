import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const dataDir = path.join(process.cwd(), 'data');
const contentPath = path.join(dataDir, 'content.json');

// GET: Return current quiz content
export async function GET() {
    try {
        if (!fs.existsSync(contentPath)) {
            // Return default content if file doesn't exist
            return NextResponse.json({
                videoUrl: 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4',
                questions: []
            });
        }

        const fileContent = fs.readFileSync(contentPath, 'utf-8');
        const content = JSON.parse(fileContent);

        return NextResponse.json(content);
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

        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write content to file
        fs.writeFileSync(contentPath, JSON.stringify({ videoUrl, backgroundImageUrl: backgroundImageUrl || '', questions }, null, 2));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating content:', error);
        return NextResponse.json({ error: 'Failed to update content' }, { status: 500 });
    }
}
