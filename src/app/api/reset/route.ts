import { NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob';

const SUBMISSIONS_KEY = 'submissions.json';

// POST: Clear all user submissions
export async function POST() {
    try {
        // Delete the submissions file from Blob
        const blobUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? 'https://' + process.env.BLOB_STORE_ID + '.public.blob.vercel-storage.com/' + SUBMISSIONS_KEY : ''}`;

        if (blobUrl) {
            try {
                await del(blobUrl);
            } catch {
                // File might not exist, that's okay
            }
        }

        return NextResponse.json({ success: true, message: 'All submissions cleared' });
    } catch (error) {
        console.error('Error resetting submissions:', error);
        return NextResponse.json({ error: 'Failed to reset submissions' }, { status: 500 });
    }
}

// GET: Return current submissions count and data
export async function GET() {
    try {
        const blobUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? 'https://' + process.env.BLOB_STORE_ID + '.public.blob.vercel-storage.com/' + SUBMISSIONS_KEY : ''}`;

        if (!blobUrl) {
            return NextResponse.json({ count: 0, submissions: [] });
        }

        try {
            await head(blobUrl);
            const response = await fetch(blobUrl);
            const submissions = await response.json();
            return NextResponse.json({ count: submissions.length, submissions });
        } catch {
            // File doesn't exist
            return NextResponse.json({ count: 0, submissions: [] });
        }
    } catch (error) {
        console.error('Error reading submissions:', error);
        return NextResponse.json({ error: 'Failed to read submissions' }, { status: 500 });
    }
}
