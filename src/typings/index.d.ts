interface EmailTemplate {
  subject: string;
  emailContent: string;
}

interface EmailContent {
  subject: string;
  salutation: string;
  messageBody: string;
  footer?: string;
}

interface EmailRendererProps {
  subject: string;
  salutation?: string;
  message: string;
  footer?: string;
}

interface SendEmailParams {
  to: string;
  subject: string;
  text: string;
  html: string;
}

interface TestCase {
  caseId: string;
  query: string;
  session: { userId: string };
}
