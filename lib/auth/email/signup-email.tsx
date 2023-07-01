import { siteConfig } from "@/config/site";
/* eslint-disable react/no-unescaped-entities */
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import { render } from "@react-email/render";

const verifyUrl = `${
  process.env.NODE_ENV === "production"
    ? process.env.VERCEL_URL
    : "http://localhost:3000"
}/api/auth/verify`;

interface SignUpEmailProps {
  token?: string;
}

function SignUpEmail({ token }: SignUpEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>邮箱验证</Preview>
      <Body
        style={{
          backgroundColor: "#ffffff",
          fontFamily:
            '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
        }}
      >
        <Container
          style={{
            margin: "0 auto",
            padding: "20px 25px 48px",
          }}
        >
          <Img src={siteConfig.logo} width={48} height={48} alt="Logo" />
          <Heading
            style={{
              fontSize: "28px",
              fontWeight: "bold",
              marginTop: "48px",
            }}
          >
            🪄 请验证您的邮箱
          </Heading>
          <Section
            style={{
              margin: "24px 0",
            }}
          >
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              您正在注册或绑定{siteConfig.name}
              账号，如果不是您本人操作，请忽略此邮件。
            </Text>
            <Text
              style={{
                fontSize: "16px",
                lineHeight: "26px",
              }}
            >
              <Link
                style={{
                  color: "#FF6363",
                }}
                href={`${verifyUrl}?token=${token}`}
              >
                点击验证邮箱
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function createSignUpEmailHtml(props: SignUpEmailProps) {
  return render(<SignUpEmail {...props} />);
}