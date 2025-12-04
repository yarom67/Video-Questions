import { NextResponse } from 'next/server';
import { put, head, del } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const SUBMISSIONS_KEY = 'submissions.json';
const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');

// POST: Clear all user submissions
export async function POST() {
    try {
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Delete from Blob
            const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${SUBMISSIONS_KEY}`;
            try {
                await del(blobUrl);
            } catch {
                // File might not exist, that's okay
            }
        } else {
            // Clear Local FS
            const dataDir = path.dirname(submissionsPath);
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir, { recursive: true });
            }
            fs.writeFileSync(submissionsPath, JSON.stringify([], null, 2));
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
        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Read from Blob
            const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${SUBMISSIONS_KEY}`;
            try {
                await head(blobUrl);
                const response = await fetch(blobUrl);
                const submissions = await response.json();
                return NextResponse.json({ count: submissions.length, submissions });
            } catch {
                // File doesn't exist
                return NextResponse.json({ count: 0, submissions: [] });
            }
        } else {
            // Read from Local FS
            if (!fs.existsSync(submissionsPath)) {
                return NextResponse.json({ count: 0, submissions: [] });
            }
            const fileContent = fs.readFileSync(submissionsPath, 'utf-8');
            const submissions = JSON.parse(fileContent);
            return NextResponse.json({ count: submissions.length, submissions });
        }
    } catch (error) {
        console.error('Error reading submissions:', error);
        return NextResponse.json({ error: 'Failed to read submissions' }, { status: 500 });
    }
}
