import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, employeeId, answer, isCorrect } = body;

        if (!name || !employeeId || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const dataDir = path.join(process.cwd(), 'data');
        const filePath = path.join(dataDir, 'submissions.json');

        // Ensure data directory exists
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir);
        }

        // Read existing data
        let submissions = [];
        if (fs.existsSync(filePath)) {
            const fileContent = fs.readFileSync(filePath, 'utf-8');
            try {
                submissions = JSON.parse(fileContent);
            } catch (e) {
                console.error('Error parsing submissions file:', e);
                // If file is corrupt, start fresh or handle error. For simplicity, start fresh.
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

        // Write back to file
        fs.writeFileSync(filePath, JSON.stringify(submissions, null, 2));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing submission:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
