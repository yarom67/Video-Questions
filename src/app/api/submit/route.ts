import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, employeeId, answer, isCorrect } = body;

        if (!name || !employeeId || !answer) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // Use centralized storage to save submission
        const newSubmission = {
            id: Date.now().toString(),
            name,
            employeeId,
            answer,
            isCorrect,
            timestamp: new Date().toISOString(),
        };

        await storage.saveSubmission(newSubmission);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Error processing submission:', error);
        return NextResponse.json({ error: 'Internal Server Error: ' + error.message }, { status: 500 });
    }
}
