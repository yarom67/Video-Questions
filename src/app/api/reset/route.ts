import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

// POST: Clear all user submissions
export async function POST() {
    try {
        await storage.resetSubmissions();

        return NextResponse.json({ success: true, message: 'All submissions cleared' });
    } catch (error) {
        console.error('Error resetting submissions:', error);
        return NextResponse.json({ error: 'Failed to reset submissions' }, { status: 500 });
    }
}

// GET: Return current submissions count and data
export async function GET() {
    try {
        const submissions = await storage.getSubmissions();

        return NextResponse.json({ count: submissions.length, submissions });
    } catch (error) {
        console.error('Error reading submissions:', error);
        return NextResponse.json({ error: 'Failed to read submissions' }, { status: 500 });
    }
}
