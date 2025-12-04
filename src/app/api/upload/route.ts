import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'video' or 'image'

        if (!file) {
            return NextResponse.json({ error: 'No file provided' }, { status: 400 });
        }

        // Determine the folder based on type
        const folder = type === 'video' ? 'videos' : 'backgrounds';

        // Check if we should use Vercel Blob (Production) or Local FS (Development)
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            const filename = `${folder}/${type}_${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;

            // Upload to Vercel Blob
            const blob = await put(filename, file, {
                access: 'public',
            });

            // Return the appropriate URL field
            if (type === 'video') {
                return NextResponse.json({ success: true, videoUrl: blob.url });
            } else {
                return NextResponse.json({ success: true, backgroundImageUrl: blob.url });
            }
        } else {
            // Local File System Fallback
            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);

            const publicDir = path.join(process.cwd(), 'public', folder);

            // Ensure directory exists
            await mkdir(publicDir, { recursive: true });

            const filename = `${type}_${Date.now()}${path.extname(file.name)}`;
            const filepath = path.join(publicDir, filename);

            await writeFile(filepath, buffer);

            const publicUrl = `/${folder}/${filename}`;

            if (type === 'video') {
                return NextResponse.json({ success: true, videoUrl: publicUrl });
            } else {
                return NextResponse.json({ success: true, backgroundImageUrl: publicUrl });
            }
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}
