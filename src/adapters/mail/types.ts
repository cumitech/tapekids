export type MailMessage = {
  to: string;
  subject: string;
  text: string;
  html: string;
};

export type MailAdapter = {
  send(message: MailMessage): Promise<void>;
};
