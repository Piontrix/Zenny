import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axiosInstance from "../../api/axios";
import API from "../../constants/api";
import toast from "react-hot-toast";

const AdminAllEditors = () => {
  const [editors, setEditors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const fetchEditors = async () => {
      try {
        const { data } = await axiosInstance.get(API.GET_ALL_EDITORS);
        setEditors(data.data || []); // Based on your API response shape
      } catch (err) {
        console.error("Failed to fetch editors", err);
        setError("Something went wrong while fetching editors.");
      } finally {
        setLoading(false);
      }
    };

    fetchEditors();
  }, []);

  const handleDeleteEditor = async (editorId) => {
    try {
      const response = await axiosInstance.delete(API.ADMIN_DELETE_EDITOR(editorId));
      if (response.status === 200) {
        toast.success("Editor Deleted Successfully");

        // remove deleted editor from list
        setEditors((prev) => prev.filter((editor) => editor._id !== editorId));
      }
    } catch (err) {
      console.error("Failed to delete editor", err);
      toast.error("Failed to delete editor");
    }
  };

  const filteredEditors = editors.filter((editor) => editor.username?.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <p className="p-6 text-lg">Loading editors...</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-3xl font-extrabold text-rose-600">📂 All Editors</h2>
        <input
          type="text"
          placeholder="Search editor..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
        />
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEditors.length === 0 ? (
          <p className="text-gray-500 col-span-full">No editors found.</p>
        ) : (
          filteredEditors.map((editor) => (
            <div
              key={editor._id}
              className="bg-white border border-gray-200 shadow-md rounded-2xl p-5 flex flex-col justify-between hover:shadow-lg transition"
            >
              <div>
                <div>
                  <h3 className="text-xl font-semibold text-rose-700">{editor.username}</h3>
                  <button onClick={() => handleDeleteEditor(editor._id)}>Delete</button>
                </div>
                {editor.email && <p className="text-sm text-gray-500 mt-1">{editor.email}</p>}
                {editor.portfolio?.tiers?.length > 0 && (
                  <p className="text-xs text-rose-500 mt-2">Portfolio tiers: {editor.portfolio.tiers.length}</p>
                )}
              </div>
              <Link to={`/admin/dashboard/edit-structure/${editor._id}`} className="text-blue-600 underline">
                Edit Structure
              </Link>

              <Link
                to={`/admin/dashboard/edit-editor/${editor._id}`}
                className="mt-4 inline-block text-center bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-rose-700 transition"
              >
                Edit Portfolio
              </Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminAllEditors;
