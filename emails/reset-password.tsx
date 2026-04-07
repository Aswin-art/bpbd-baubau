import {
  Body,
  Button,
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

interface ResetPasswordEmailProps {
  resetLink: string;
  userName?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

export const ResetPasswordEmail = ({
  resetLink,
  userName = "User",
}: ResetPasswordEmailProps) => (
  <Html>
    <Head />
    <Preview>Reset your SIMARS password</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src={`${baseUrl}/logo.png`}
            width="40"
            height="40"
            alt="SIMARS Logo"
          />
        </Section>
        <Heading style={h1}>Reset Your Password</Heading>
        <Text style={text}>Hi {userName},</Text>
        <Text style={text}>
          We received a request to reset your password for your SIMARS account.
          Click the button below to set a new password:
        </Text>
        <Section style={buttonSection}>
          <Button style={button} href={resetLink}>
            Reset Password
          </Button>
        </Section>
        <Text style={text}>Or copy and paste this link into your browser:</Text>
        <Link href={resetLink} style={link}>
          {resetLink}
        </Link>
        <Text style={textMuted}>
          This link will expire in 1 hour. If you didn&apos;t request a password
          reset, you can safely ignore this email.
        </Text>
        <Section style={footer}>
          <Text style={footerText}>
            © {new Date().getFullYear()} SIMARS - Veteran Academy of Sustainable
            Architecture
          </Text>
          <Text style={footerText}>UPN &quot;Veteran&quot; Jawa Timur</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

ResetPasswordEmail.PreviewProps = {
  resetLink: "https://example.com/reset-password?token=abc123",
  userName: "Archimedes",
} as ResetPasswordEmailProps;

export default ResetPasswordEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#666666",
  margin: "0 auto",
  padding: "40px 20px",
  marginBottom: "64px",
  borderRadius: "8px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const logoSection = {
  textAlign: "center" as const,
  marginBottom: "24px",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  textAlign: "center" as const,
  margin: "30px 0",
};

const text = {
  color: "#525f7f",
  fontSize: "16px",
  lineHeight: "24px",
  textAlign: "left" as const,
  marginBottom: "16px",
};

const textMuted = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "20px",
  textAlign: "left" as const,
  marginTop: "24px",
};

const buttonSection = {
  textAlign: "center" as const,
  marginTop: "32px",
  marginBottom: "32px",
};

const button = {
  backgroundColor: "#FF3300",
  borderRadius: "6px",
  color: "#666666",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 32px",
};

const link = {
  color: "#FF3300",
  fontSize: "14px",
  textDecoration: "underline",
  wordBreak: "break-all" as const,
};

const footer = {
  borderTop: "1px solid #e6ebf1",
  marginTop: "32px",
  paddingTop: "24px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  margin: "4px 0",
};
