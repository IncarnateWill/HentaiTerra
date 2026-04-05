import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { content } = body;

        const webhookUrl = process.env.DISCORD_WEBHOOK_REPORT;

        if (!webhookUrl) {
            console.error('DISCORD_WEBHOOK_REPORT is not defined in environment variables');
            return NextResponse.json({ error: 'Configuration error' }, { status: 500 });
        }

        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ content })
        });

        if (response.ok) {
            return NextResponse.json({ success: true });
        } else {
            const errorText = await response.text();
            console.error('Discord report webhook failed:', errorText);
            return NextResponse.json({ error: 'Failed' }, { status: response.status });
        }
    } catch (error) {
        console.error('Error in report API:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
