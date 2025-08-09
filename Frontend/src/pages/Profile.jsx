import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import PaymentHistory from "../components/PaymentHistory";
import ProfileMenu from "../components/ProfileMenu";

const Profile = () => {
	const { user, loading: authLoading } = useAuth();
	const [selectedMenu, setSelectedMenu] = useState("paymentHistory");

	if (authLoading) {
		return (
			<div className="flex justify-center items-center h-screen">
				<div className="loader">Loading...</div>
			</div>
		);
	}

	if (!user) {
		return <p className="p-6 text-center text-red-500">Please login to view your profile.</p>;
	}

	return (
		<div className="max-w-7xl mx-auto px-4 py-8 md:flex md:space-x-6">
			<ProfileMenu onSelect={setSelectedMenu} />

			<main className="flex-1 bg-white rounded-lg shadow p-6 mt-6 md:mt-0">
				{selectedMenu === "paymentHistory" && <PaymentHistory />}
				{/* Render other sections depending on selectedMenu */}
			</main>
		</div>
	);
};

export default Profile;
