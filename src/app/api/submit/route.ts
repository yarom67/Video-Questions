import { NextResponse } from 'next/server';
import { redis } from '@/lib/redis';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, employeeId, answer, isCorrect } = body;

        if (!name || !employeeId || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Get existing submissions
        const existingData = await redis.get('submissions');
        let submissions = [];
        if (existingData) {
            submissions = JSON.parse(existingData);
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

        // Save back to Redis
        await redis.set('submissions', JSON.stringify(submissions));

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing submission:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
