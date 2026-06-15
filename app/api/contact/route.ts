import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const stripHeaderControls = (value: unknown) => String(value ?? "").replace(/[\r\n]/g, " ").trim();
const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export async function POST(req: Request) {
    try {
        const { name, email, message } = await req.json();
        const safeName = stripHeaderControls(name);
        const safeEmail = stripHeaderControls(email).toLowerCase();
        const safeMessage = String(message ?? "").trim();

        if (!safeName || !safeEmail || !safeMessage || !isValidEmail(safeEmail)) {
            return NextResponse.json({ success: false, message: "Missing required fields." }, { status: 400 });
        }

        // Email Transporter Setup
        const transporter = nodemailer.createTransport({
            service: "gmail", // You can also use "hotmail", "yahoo", etc.
            auth: {
                user: process.env.EMAIL_USER, // Your email
                pass: process.env.EMAIL_PASS, // Your email app password
            },
        });

        // Email Options
        const mailOptions = {
            from: `"MTShop Contact" <${process.env.EMAIL_USER}>`,
            replyTo: safeEmail,
            to: process.env.EMAIL_USER, // Change this to your email
            subject: `User complaint from MTShop: ${safeName}`,
            text: `Name: ${safeName}\nEmail: ${safeEmail}\nMessage: ${safeMessage}`,
        };

        // Send Email
        await transporter.sendMail(mailOptions);

        return NextResponse.json({ success: true, message: "Email sent successfully!" }, { status: 200 });
    } catch (error) {
        console.error("Error sending email:", error);
        return NextResponse.json({ success: false, message: "Failed to send email." }, { status: 500 });
    }
}
