import { NavLink, Outlet } from "react-router-dom";

const AdminDashboard = () => {
	return (
		<div className="flex min-h-screen bg-roseclub-paper">
			{/* Sidebar */}
			<aside className="w-52 bg-roseclub-light text-white p-4">
				<h2 className="text-xl font-bold mb-6 text-roseclub-dark">Admin Panel</h2>
				<nav className="space-y-3">
					<NavLink
						to="/admin/dashboard/register-editor"
						className={({ isActive }) =>
							`block px-3 py-2 rounded-md text-sm font-medium ${
								isActive ? "bg-white text-roseclub-dark" : "hover:bg-white/20"
							}`
						}
					>
						Register Editor
					</NavLink>

					<NavLink
						to="/admin/dashboard/chat-rooms"
						className={({ isActive }) =>
							`block px-3 py-2 rounded-md text-sm font-medium ${
								isActive ? "bg-white text-roseclub-dark" : "hover:bg-white/20"
							}`
						}
					>
						View Chat Rooms
					</NavLink>

					<NavLink
						to="/admin/dashboard/all-editors"
						className={({ isActive }) =>
							`block px-3 py-2 rounded-md text-sm font-medium ${
								isActive ? "bg-white text-roseclub-dark" : "hover:bg-white/20"
							}`
						}
					>
						All Editors
					</NavLink>

					<NavLink
						to="/admin/dashboard/support-tickets"
						className={({ isActive }) =>
							`block px-3 py-2 rounded-md text-sm font-medium ${
								isActive ? "bg-white text-roseclub-dark" : "hover:bg-white/20"
							}`
						}
					>
						View Support Tickets
					</NavLink>
				</nav>
			</aside>

			{/* Right Panel */}
			<main className="flex-1 p-6 overflow-y-auto">
				<Outlet />
			</main>
		</div>
	);
};

export default AdminDashboard;
