// app/api/logoHandler/route.ts

import { S3Client, DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { NextRequest, NextResponse } from 'next/server';

const s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(req: NextRequest) {
    try {
        const formData = await req.formData();

        const file: File | null = formData.get('file') as unknown as File;
        const previousUrl: string | null = formData.get('previousLogoUrl') as string | null;

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        // Step 1: Delete previous logo if URL is provided
        if (previousUrl) {
            try {
                const prevKey = new URL(previousUrl).pathname.slice(1);
                await s3.send(new DeleteObjectCommand({
                    Bucket: process.env.AWS_BUCKET_NAME!,
                    Key: prevKey,
                }));
            } catch (deleteErr) {
                console.warn('Previous logo deletion failed:', deleteErr);
            }
        }

        // Step 2: Upload new logo
        const fileExtension = file.name.split('.').pop();
        const uniqueKey = `logos/${uuidv4()}.${fileExtension}`;
        const buffer = Buffer.from(await file.arrayBuffer());

        await s3.send(new PutObjectCommand({
            Bucket: process.env.AWS_BUCKET_NAME!,
            Key: uniqueKey,
            Body: buffer,
            ContentType: file.type,
        }));

        const newFileUrl = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${uniqueKey}`;

        return NextResponse.json({ url: newFileUrl }, { status: 200 });

    } catch (err) {
        console.log('Logo Handler Error:', err);
        return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
    }
}
