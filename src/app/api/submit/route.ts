import { NextResponse } from 'next/server';
import { put, head } from '@vercel/blob';
import fs from 'fs';
import path from 'path';

const SUBMISSIONS_KEY = 'submissions.json';
const dataDir = path.join(process.cwd(), 'data');
const filePath = path.join(dataDir, 'submissions.json');

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, employeeId, answer, isCorrect } = body;

        if (!name || !employeeId || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        let submissions = [];

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Read from Blob
            const blobUrl = `https://${process.env.BLOB_STORE_ID}.public.blob.vercel-storage.com/${SUBMISSIONS_KEY}`;
            try {
                await head(blobUrl);
                const response = await fetch(blobUrl);
                submissions = await response.json();
            } catch {
                submissions = [];
            }
        } else {
            // Read from Local FS
            if (fs.existsSync(filePath)) {
                try {
                    const fileContent = fs.readFileSync(filePath, 'utf-8');
                    submissions = JSON.parse(fileContent);
                } catch {
                    submissions = [];
                }
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

        if (process.env.BLOB_READ_WRITE_TOKEN) {
            // Write to Blob
            await put(SUBMISSIONS_KEY, JSON.stringify(submissions, null, 2), {
                access: 'public',
                contentType: 'application/json',
            });
        } else {
            // Write to Local FS
            if (!fs.existsSync(dataDir)) {
                fs.mkdirSync(dataDir);
            }
            fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing submission:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
