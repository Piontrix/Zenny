import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});
transporter.verify((error, success) => {
	if (error) {
		console.error("❌ Email transporter config error:", error);
	} else {
		console.log("✅ Email transporter is ready");
	}
});
export const sendOTPEmail = async (to, otp) => {
	console.log(process.env.EMAIL_USER);
	console.log(process.env.EMAIL_PASS);
	await transporter.sendMail({
		from: `"Zenny" <${process.env.EMAIL_USER}>`,
		to,
		subject: "Your OTP for Zenny Registration",
		html: `
      <p>Hello Creator 👋,</p>
      <p>Your OTP is: <strong>${otp}</strong></p>
      <p>This OTP is valid for 10 minutes.</p>
      <br/>
      <small>– Zenny Team</small>
    `,
	});
};

export const sendReminderEmail = async (to, chatRoomId) => {
	await transporter.sendMail({
		from: `"Zenny" <${process.env.EMAIL_USER}>`,
		to,
		subject: "You have unread messages on Zenny!",
		html: `
      <p>Hello,</p>
      <p>You have unread messages in your Zenny chat room. Please check your chat to stay updated.</p>
      <br/>
      <small>– Zenny Team</small>
    `,
	});
};
