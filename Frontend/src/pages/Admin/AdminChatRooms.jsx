import { useEffect, useState } from "react";
import ChatRoomCard from "../../components/Chat/ChatRoomCard";
import { useAuth } from "../../context/AuthContext";
import useAdminChatActions from "../../hooks/useAdminChatActions";
import LoaderSpinner from "../../components/common/LoaderSpinner"; // ✅

const AdminChatRooms = () => {
  const { user } = useAuth();
  const { chatRooms, fetchRooms, handleFreeze, handleEnd, handleUnfreeze, handleUnend } = useAdminChatActions();
  const [loading, setLoading] = useState(true); // ✅ loading state

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      await fetchRooms();
      setLoading(false);
    };
    if (user?.role === "admin") {
      load();
    }
  }, [user, fetchRooms]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">All Chat Rooms</h2>

      {loading ? (
        <div className="flex justify-center mt-12">
          <LoaderSpinner size="lg" />
        </div>
      ) : chatRooms.length === 0 ? (
        <p>No chat rooms found</p>
      ) : (
        <div className="space-y-4">
          {chatRooms.map((room) => (
            <ChatRoomCard
              key={room._id}
              room={room}
              onFreeze={handleFreeze}
              onEnd={handleEnd}
              onUnfreeze={handleUnfreeze}
              onUnend={handleUnend}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminChatRooms;
