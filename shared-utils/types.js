// Type definitions for the Creator-Editor Platform

/**
 * @typedef {Object} User
 * @property {string} id - Unique user identifier
 * @property {string} type - User type (admin, creator, editor)
 * @property {string} email - User email
 * @property {string} name - User display name
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Creator
 * @property {string} id - Unique creator identifier
 * @property {string} name - Creator name
 * @property {string} email - Creator email
 * @property {string} telegramUsername - Telegram username
 * @property {string} telegramId - Telegram user ID
 * @property {Date} createdAt - Account creation date
 */

/**
 * @typedef {Object} Editor
 * @property {string} id - Unique editor identifier
 * @property {string} name - Editor name
 * @property {string} email - Editor email
 * @property {string} telegramUsername - Telegram username
 * @property {string} telegramId - Telegram user ID
 * @property {string} status - Editor status (active, inactive, suspended)
 * @property {Array<string>} tags - Editor specializations
 * @property {Array<string>} badges - Editor badges
 * @property {Array<string>} portfolioLinks - YouTube/Cloudinary links
 * @property {string} bio - Editor description
 * @property {number} rating - Average rating
 * @property {number} completedProjects - Number of completed projects
 * @property {Date} createdAt - Account creation date
 * @property {Date} updatedAt - Last update date
 */

/**
 * @typedef {Object} Session
 * @property {string} id - Unique session identifier
 * @property {string} creatorId - Creator ID
 * @property {string} editorId - Editor ID
 * @property {string} groupId - Telegram group chat ID
 * @property {string} groupTitle - Group chat title
 * @property {string} status - Chat status (active, frozen, ended)
 * @property {Date} createdAt - Session creation date
 * @property {Date} endedAt - Session end date
 */

/**
 * @typedef {Object} Payment
 * @property {string} id - Unique payment identifier
 * @property {string} sessionId - Associated session ID
 * @property {string} creatorId - Creator ID
 * @property {string} editorId - Editor ID
 * @property {string} razorpayOrderId - Razorpay order ID
 * @property {string} razorpayPaymentId - Razorpay payment ID
 * @property {number} amount - Payment amount in paise
 * @property {string} currency - Payment currency (INR)
 * @property {string} status - Payment status
 * @property {string} serviceType - Type of service purchased
 * @property {Date} createdAt - Payment creation date
 * @property {Date} completedAt - Payment completion date
 */

/**
 * @typedef {Object} Dispute
 * @property {string} id - Unique dispute identifier
 * @property {string} sessionId - Associated session ID
 * @property {string} creatorId - Creator ID
 * @property {string} editorId - Editor ID
 * @property {string} reason - Dispute reason
 * @property {string} description - Detailed description
 * @property {string} status - Dispute status (open, resolved, closed)
 * @property {string} resolution - Admin resolution
 * @property {Date} createdAt - Dispute creation date
 * @property {Date} resolvedAt - Dispute resolution date
 */

/**
 * @typedef {Object} Feedback
 * @property {string} id - Unique feedback identifier
 * @property {string} sessionId - Associated session ID
 * @property {string} creatorId - Creator ID
 * @property {string} editorId - Editor ID
 * @property {number} rating - Rating (1-5)
 * @property {string} comment - Feedback comment
 * @property {boolean} isPublic - Whether feedback is public
 * @property {Date} createdAt - Feedback creation date
 */

/**
 * @typedef {Object} SupportTicket
 * @property {string} id - Unique ticket identifier
 * @property {string} name - Requester name
 * @property {string} email - Requester email
 * @property {string} subject - Ticket subject
 * @property {string} message - Ticket message
 * @property {string} status - Ticket status (open, in_progress, resolved)
 * @property {Date} createdAt - Ticket creation date
 * @property {Date} resolvedAt - Ticket resolution date
 */

// Export types for documentation purposes
export const TYPES = {
	User: "User",
	Creator: "Creator",
	Editor: "Editor",
	Session: "Session",
	Payment: "Payment",
	Dispute: "Dispute",
	Feedback: "Feedback",
	SupportTicket: "SupportTicket",
};
