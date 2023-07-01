import db from "db";
import { redirect } from "next/navigation";
import { SignUpEmailErrorCode } from "auth/error-code";
import { decodeMagicLinkToken } from "auth/email/send-email";

async function handler(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  const redirectTo = (code: SignUpEmailErrorCode) => {
    return redirect(`/signin?code=${code}`);
  };

  if (!token) {
    return redirectTo(SignUpEmailErrorCode.InvalidEmailLink);
  }

  const email = decodeMagicLinkToken(token);

  if (!email) {
    return redirectTo(SignUpEmailErrorCode.InvalidEmailLink);
  }

  const existUser = await db.user.findFirst({
    where: {
      email,
    },
  });
  if (!existUser) {
    return redirectTo(SignUpEmailErrorCode.InvalidEmailLink);
  }

  await db.user.update({
    where: {
      email: email!,
    },
    data: {
      emailVerified: new Date(),
    },
  });

  return redirect("/signin");
}

export { handler as GET };
