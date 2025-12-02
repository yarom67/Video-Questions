import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (!file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Create videos directory if it doesn't exist
        const videosDir = path.join(process.cwd(), 'public', 'videos');
        const fs = require('fs');
        if (!fs.existsSync(videosDir)) {
            fs.mkdirSync(videosDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `video_${timestamp}.${extension}`;
        const filepath = path.join(videosDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Return public URL
        const videoUrl = `/videos/${filename}`;

        return NextResponse.json({ success: true, videoUrl });
    } catch (error) {
        console.error('Error uploading video:', error);
        return NextResponse.json({ error: 'Failed to upload video' }, { status: 500 });
    }
}
