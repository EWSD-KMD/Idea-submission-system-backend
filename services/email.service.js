import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "url";
import handlebars from "handlebars";
import nodemailer from "nodemailer";

class EmailService {
  #transporter;
  constructor(transporter) {
    this.#transporter = transporter;
  }

  compileTemplate(templatePath, data) {
    const __dirname = dirname(fileURLToPath(import.meta.url));
    const actualPath = resolve(__dirname, templatePath);
    console.log("actualPath", actualPath);
    const source = readFileSync(actualPath, "utf8");
    const template = handlebars.compile(source);
    return template(data);
  }

  async sendEmail({ fromEmail, toEmails, subject, htmlEmailContent }) {
    for (const toEmail of toEmails) {
      const mailOptions = {
        from: fromEmail,
        to: toEmail,
        subject,
        html: htmlEmailContent,
      };
      const info = await this.#transporter.sendMail(mailOptions);
      console.log("Email sent: " + info.response);
    }
  }
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GOOGLE_MAIL,
    pass: process.env.GOOGLE_APP_PASSWORD,
  },
});

export const emailService = new EmailService(transporter);
