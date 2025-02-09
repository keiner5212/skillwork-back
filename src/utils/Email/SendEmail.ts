import nodemailer from 'nodemailer';
import { config } from "dotenv";
import { createDebugger } from '../debugConfig';

config();
const log = createDebugger('mailer');
const logError = log.extend('error');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

export const fromDefault = 'Skillwork <' + process.env.EMAIL_USER + '>';

// verify connection configuration
transporter.verify(function (error, success) {
    if (error) {
        logError(error);
    } else {
        log("Server is ready");
    }
});

interface MailOptions {
    from: string;
    to: string;
    subject: string;
    text: string;
}

export const sendMail = async (mailOptions: MailOptions): Promise<[boolean, any]> => {
    try {
        const options = {
            from: mailOptions.from,
            to: mailOptions.to,
            subject: mailOptions.subject,
            html: `
            <h1>Skillwork</h1>
            <p>Hello from Skillwork, you have a new message:</p>
            <br>
            <p>${mailOptions.text}</p>
            <br>
            <p>Regards,</p>
            <p>Skillwork Team</p>
            `
        }
        const info = await transporter.sendMail(options);
        log('Emael sended to: ' + mailOptions.to + ' with response: ' + info.response);
        return [true, info];
    } catch (error) {
        logError("Error sending email: " + error);
        return [false, error];
    }
};
