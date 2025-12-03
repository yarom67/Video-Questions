import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'video' or 'image'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Validate file type
        if (type === 'video' && !file.type.startsWith('video/')) {
            return NextResponse.json({ error: 'File must be a video' }, { status: 400 });
        }

        if (type === 'image' && !file.type.startsWith('image/')) {
            return NextResponse.json({ error: 'File must be an image' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Determine directory based on type
        const subDir = type === 'video' ? 'videos' : 'backgrounds';
        const uploadDir = path.join(process.cwd(), 'public', subDir);
        const fs = require('fs');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const extension = file.name.split('.').pop();
        const filename = `${type}_${timestamp}.${extension}`;
        const filepath = path.join(uploadDir, filename);

        // Save file
        await writeFile(filepath, buffer);

        // Return public URL
        const url = `/${subDir}/${filename}`;

        return NextResponse.json({ success: true, [type === 'video' ? 'videoUrl' : 'backgroundImageUrl']: url });
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
