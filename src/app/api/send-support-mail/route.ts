import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  const { name, email, subject, message } = await request.json();

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_PASS,
    },
  });

  const receiver = process.env.SUPPORT_RECEIVER || process.env.GMAIL_USER;

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: receiver, // 별도 수신자 지정
      subject: `[고객문의] ${subject}`,
      text: `이름: ${name}\n이메일: ${email}\n\n${message}`,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
  }
} 