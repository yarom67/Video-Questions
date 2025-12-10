import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const type = formData.get('type') as string; // 'video' or 'image'

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Upload to Vercel Blob
        const blob = await put(file.name, file, {
            access: 'public',
        });

        // Get current media config to preserve existing values
        const currentMedia = await storage.getMediaConfig();

        if (type === 'image') {
            // Save background image URL to Redis immediately
            await storage.saveMediaConfig({
                ...currentMedia,
                backgroundImageUrl: blob.url
            });
            return NextResponse.json({ success: true, backgroundImageUrl: blob.url });
        } else if (type === 'question-image') {
            // Just return the URL, don't update global config
            return NextResponse.json({ success: true, url: blob.url });
        } else {
            // Save video URL to Redis immediately
            await storage.saveMediaConfig({
                ...currentMedia,
                videoUrl: blob.url,
                videoType: 'upload'
            });
            return NextResponse.json({ success: true, videoUrl: blob.url });
        }
    } catch (error) {
        console.error('Error uploading file:', error);
        return NextResponse.json({ error: 'Failed to upload file' }, { status: 500 });
    }
}

