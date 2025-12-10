
import { NextResponse } from 'next/server';
import { storage } from '@/lib/storage';

export async function GET() {
    try {
        const current = await storage.getContent();

        // Keep everything but clear the background image if it is the fake one
        if (current.backgroundImageUrl && current.backgroundImageUrl.includes('test.com')) {
            await storage.saveContent({
                ...current,
                backgroundImageUrl: ''
            });
            return NextResponse.json({ success: true, message: 'Fixed background image URL' });
        }

        return NextResponse.json({ success: true, message: 'No fix needed', current });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
