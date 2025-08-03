import rateLimit from "express-rate-limit";

export const supportFormLimiter = rateLimit({
	windowMs: 60 * 1000,
	max: 3,
	message: "Too many submissions. Please wait a bit.",
});
