// CashFree SDK utility functions

let cashfree = null;

// Initialize CashFree SDK
export const initializeCashfree = () => {
	if (typeof window !== "undefined" && window.Cashfree) {
		cashfree = window.Cashfree({ mode: "sandbox" }); // Use "production" for live
		console.log("CashFree SDK initialized");
		return cashfree;
	} else {
		console.error("CashFree SDK not available");
		return null;
	}
};

// Get CashFree instance
export const getCashfree = () => {
	if (!cashfree) {
		return initializeCashfree();
	}
	return cashfree;
};

// Launch CashFree checkout
export const launchCashfreeCheckout = async (paymentSessionId, returnUrl = null) => {
	try {
		const cf = getCashfree();
		if (!cf) {
			throw new Error("CashFree SDK not initialized");
		}

		const checkoutOptions = {
			paymentSessionId: paymentSessionId,
			redirectTarget: "_blank", // Open in new tab
		};

		// Add return URL if provided
		if (returnUrl) {
			checkoutOptions.returnUrl = returnUrl;
		}

		console.log("Launching CashFree checkout with options:", checkoutOptions);

		const result = await cf.checkout(checkoutOptions);

		if (result.error) {
			console.error("CashFree checkout error:", result.error.message);
			throw new Error(result.error.message);
		} else if (result.redirect) {
			console.log("Redirecting to CashFree checkout...");
		}

		return result;
	} catch (error) {
		console.error("CashFree checkout failed:", error);
		throw error;
	}
};

// Check if CashFree SDK is available
export const isCashfreeAvailable = () => {
	return typeof window !== "undefined" && window.Cashfree;
};
