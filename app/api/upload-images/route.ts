import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/actions/getCurrentUser';

if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    console.warn(
        'Cloudinary environment variables are not fully configured. Uploads may fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.'
    );
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request: NextRequest) {
    try {
        const currentUser = await getCurrentUser();
        if (!currentUser || currentUser.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const formData = await request.formData();
        const fileItems = formData.getAll('files');
        const files = fileItems.filter((item): item is File => item instanceof File);

        if (!files.length) {
            return NextResponse.json({ error: 'No files provided' }, { status: 400 });
        }
        if (files.length > 10) {
            return NextResponse.json({ error: 'Too many files' }, { status: 400 });
        }

        const uploadedUrls: string[] = [];

        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                return NextResponse.json({ error: 'Only image uploads are allowed' }, { status: 400 });
            }
            if (file.size > 5 * 1024 * 1024) {
                return NextResponse.json({ error: 'Each image must be 5MB or smaller' }, { status: 400 });
            }

            const buffer = Buffer.from(await file.arrayBuffer());

            const result = await new Promise<any>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    {
                        folder: 'products',
                        resource_type: 'image',
                        upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET,
                    },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );

                uploadStream.end(buffer);
            });

            uploadedUrls.push(result.secure_url);
        }

        return NextResponse.json({ urls: uploadedUrls });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
