import Session from "../../../shared-db/collections/sessionModel.js";

export const createOrGetSession = async (creatorId, editorId, groupId) => {
	try {
		let session = await Session.findOne({ creatorId, editorId });

		if (!session) {
			session = await Session.create({
				creatorId,
				editorId,
				groupId,
				startedAt: new Date(),
			});
			console.log("✅ New session created");
		} else {
			console.log("ℹ️ Existing session reused");
		}

		return session;
	} catch (err) {
		console.error("❌ Error creating/retrieving session:", err);
		throw err;
	}
};
