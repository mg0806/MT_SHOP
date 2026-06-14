import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import { getCurrentUser } from '@/actions/getCurrentUser';

if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
) {
    console.warn(
        'Cloudinary environment variables are not fully configured. Delete calls may fail until CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are set.'
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

        const { urls }: { urls: string[] } = await request.json();

        if (!urls || !Array.isArray(urls) || urls.length === 0) {
            return NextResponse.json({ error: 'No URLs provided' }, { status: 400 });
        }
        if (urls.length > 25) {
            return NextResponse.json({ error: 'Too many URLs' }, { status: 400 });
        }

        const deletePromises: Promise<void>[] = [];

        for (const url of urls) {
            if (typeof url !== 'string') continue;

            let parsedUrl: URL;
            try {
                parsedUrl = new URL(url);
            } catch {
                return NextResponse.json({ error: 'Invalid URL' }, { status: 400 });
            }
            const expectedHost = `res.cloudinary.com`;
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

            if (
                parsedUrl.hostname !== expectedHost ||
                !cloudName ||
                !parsedUrl.pathname.startsWith(`/${cloudName}/image/upload/`)
            ) {
                return NextResponse.json({ error: 'Invalid Cloudinary URL' }, { status: 400 });
            }

            const publicIdMatch = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-zA-Z]+)?$/);
            const publicId = publicIdMatch ? publicIdMatch[1] : null;

            if (!publicId) continue;

            deletePromises.push(
                new Promise<void>((resolve, reject) => {
                    cloudinary.uploader.destroy(publicId, (error, result) => {
                        if (error) reject(error);
                        else resolve();
                    });
                })
            );
        }

        await Promise.all(deletePromises);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json({ error: 'Delete failed' }, { status: 500 });
    }
}
