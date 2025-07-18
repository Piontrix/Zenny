import crypto from "crypto";

export const generateOTPData = () => {
	const otp = Math.floor(100000 + Math.random() * 900000).toString();
	const otpHash = crypto.createHash("sha256").update(otp).digest("hex");
	const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

	return { otp, otpHash, otpExpires };
};
