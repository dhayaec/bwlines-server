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
