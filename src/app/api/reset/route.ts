import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const submissionsPath = path.join(process.cwd(), 'data', 'submissions.json');

// POST: Clear all user submissions
export async function POST() {
    try {
        // Write empty array to file
        fs.writeFileSync(submissionsPath, JSON.stringify([], null, 2));

        return NextResponse.json({ success: true, message: 'All submissions cleared' });
    } catch (error) {
        console.error('Error resetting submissions:', error);
        return NextResponse.json({ error: 'Failed to reset submissions' }, { status: 500 });
    }
}

// GET: Return current submissions count
export async function GET() {
    try {
        if (!fs.existsSync(submissionsPath)) {
            return NextResponse.json({ count: 0 });
        }

        const fileContent = fs.readFileSync(submissionsPath, 'utf-8');
        const submissions = JSON.parse(fileContent);

        return NextResponse.json({ count: submissions.length, submissions });
    } catch (error) {
        console.error('Error reading submissions:', error);
        return NextResponse.json({ error: 'Failed to read submissions' }, { status: 500 });
    }
}
