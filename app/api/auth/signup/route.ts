import db from "db";
import { hashPassword } from "auth/helpers";
import { UserAuthSchema } from "auth/schema";
import { sendSignUpEmail } from "@/lib/auth/email/send-email";

const EMAIL_RE = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

async function handler(req: Request) {
  const body: UserAuthSchema = await req.json();
  const { email, password } = body;

  const cleanEmail = email.toLowerCase();

  if (!EMAIL_RE.test(cleanEmail)) {
    return new Response(
      JSON.stringify({
        ok: false,
        message: "Invalid email",
      })
    );
  }

  if (!password || password.trim().length < 7) {
    return new Response(
      JSON.stringify({
        message: "Password should be at least 7 characters long.",
        ok: false,
      })
    );
  }

  const existingUser = await db.user.findFirst({
    where: {
      email: cleanEmail,
    },
  });

  if (existingUser && existingUser.emailVerified) {
    return new Response(
      JSON.stringify({
        message: "该邮箱已被注册",
        ok: false,
      })
    );
  }

  const hashedPassword = await hashPassword(password);

  const newUser = await db.user.upsert({
    where: { email: cleanEmail },
    update: {
      email: cleanEmail,
      password: hashedPassword,
    },
    create: {
      email: cleanEmail,
      password: hashedPassword,
    },
  });



  const emailRes = await sendSignUpEmail(cleanEmail);

  return new Response(
    JSON.stringify({
      ...emailRes,
      data: newUser,
    })
  );
}

export { handler as POST };
