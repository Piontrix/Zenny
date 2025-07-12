import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_PASS,
	},
});

export const sendOTPEmail = async (to, otp) => {
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
