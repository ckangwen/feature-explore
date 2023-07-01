import nodemailer from "nodemailer";
import { createSignUpEmailHtml } from "./signup-email";
import { siteConfig } from "@/config/site";

const MAX_AGE = 60 * 60 * 24 * 1; // 1 day

const transporter = nodemailer.createTransport({
  host: "smtp.office365.com",
  port: 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
  tls: {
    ciphers: "SSLv3",
  },
});

export const encodeMagicLinkToken = (email: string) => {
  return Buffer.from(
    JSON.stringify({
      email,
      exp: Date.now() + MAX_AGE * 1000,
    })
  ).toString("base64");
};

export const decodeMagicLinkToken = (token: string) => {
  try {
    const decoded = Buffer.from(token, "base64").toString("utf-8");
    const data: {
      email: string;
      exp: number;
    } = JSON.parse(decoded);

    const isValid = data.exp > Date.now();
    if (isValid) {
      return data.email;
    } else {
      return null;
    }
  } catch (e: any) {
    return null;
  }
};

export async function sendSignUpEmail(to: string) {
  const token = encodeMagicLinkToken(to);

  try {
    await transporter.sendMail({
      from: `${siteConfig.name} <${process.env.SMTP_USER}>`,
      to,
      subject: "邮箱验证",
      html: createSignUpEmailHtml({
        token,
      }),
    });
  } catch (e: any) {
    return {
      ok: false,
      message: e.message ?? "邮件发送失败",
    };
  }

  return {
    ok: true,
    message: "邮件发送成功，请注意查收",
  };
}
