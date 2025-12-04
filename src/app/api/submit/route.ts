import { NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';

const SUBMISSIONS_KEY = 'submissions.json';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, employeeId, answer, isCorrect } = body;

        if (!name || !employeeId || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Read existing submissions from Blob
        let submissions = [];
        const blobUrl = `${process.env.BLOB_READ_WRITE_TOKEN ? 'https://' + process.env.BLOB_STORE_ID + '.public.blob.vercel-storage.com/' + SUBMISSIONS_KEY : ''}`;

        if (blobUrl) {
            try {
                await head(blobUrl);
                const response = await fetch(blobUrl);
                submissions = await response.json();
            } catch {
                // File doesn't exist yet, start with empty array
                submissions = [];
            }
        }

        // Add new submission
        const newSubmission = {
            id: Date.now().toString(),
            name,
            employeeId,
            answer,
            isCorrect,
            timestamp: new Date().toISOString(),
        };

        submissions.push(newSubmission);

        // Write back to Blob
        await put(SUBMISSIONS_KEY, JSON.stringify(submissions, null, 2), {
            access: 'public',
            contentType: 'application/json',
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing submission:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
