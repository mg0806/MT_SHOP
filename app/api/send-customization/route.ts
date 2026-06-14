import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

const escapeHtml = (value: unknown) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

export async function POST(req: Request) {
  const body = await req.json();
  const { name, email, artwork, frame, size, material, notes, phone } = body;

  if (!name || !email || !artwork) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const safe = {
    name: escapeHtml(name),
    email: escapeHtml(email),
    artwork: escapeHtml(artwork),
    frame: escapeHtml(frame),
    size: escapeHtml(size),
    material: escapeHtml(material),
    notes: escapeHtml(notes || "N/A"),
    phone: escapeHtml(phone),
  };
  try {
    const User = process.env.EMAIL_USER;
    const Pass = process.env.EMAIL_PASS;
    // console.log(User, Pass)
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"Art Store Support" <${process.env.EMAIL_USER}>`,
      replyTo: email,
      to: "usha2408gupta@gmail.com",
      subject: `New Customization Request from ${safe.name}`,
      html: `
  <div style="font-family: Arial, sans-serif; color: #333; padding: 20px; width: 100%; max-width: 600px; margin: auto; background-color: #f9f9f9; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
    <h2 style="font-size: 24px; color: #2c3e50; margin-bottom: 20px; text-align: center;">Customization Request Form</h2>
    
    <table style="width: 100%; border-collapse: collapse;">
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; width: 30%; font-weight: bold;">Name:</td>
        <td style="padding: 10px; width: 70%;">${safe.name}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Email:</td>
        <td style="padding: 10px;">${safe.email}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Phone Number:</td>
        <td style="padding: 10px;">${safe.phone}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Artwork:</td>
        <td style="padding: 10px;">${safe.artwork}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Frame:</td>
        <td style="padding: 10px;">${safe.frame}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Size:</td>
        <td style="padding: 10px;">${safe.size}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Material:</td>
        <td style="padding: 10px;">${safe.material}</td>
      </tr>
      <tr style="border-bottom: 1px solid #ddd;">
        <td style="padding: 10px; font-weight: bold;">Notes:</td>
        <td style="padding: 10px;">${safe.notes}</td>
      </tr>
    </table>
    
    <div style="border-top: 2px solid #f0f0f0; margin-top: 20px;"></div>
    
    <p style="font-size: 14px; color: #7f8c8d; margin-top: 20px; text-align: center;">
      This is an automated message from Art Store. Please do not reply to this email.
    </p>
  </div>
`,

    });

    return NextResponse.json({ message: "Email sent successfully!" }, { status: 200 });
  } catch (error) {
    console.error("Nodemailer error:", error);
    return NextResponse.json({ error: "Failed to send email" }, { status: 500 });
  }
}
