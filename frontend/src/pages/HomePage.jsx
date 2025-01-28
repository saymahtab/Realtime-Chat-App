import { useState } from "react";
import ChatContainer from "../components/ChatContainer";
import NoChatSelected from "../components/NoChatSelected";
import Sidebar from "../components/Sidebar";
import { useChatStore } from "../store/useChatStore";

const HomePage = () => {
  const { selectedUser } = useChatStore();
  const [isChatVisible, setIsChatVisible] = useState(false); // State for controlling visibility on small screens

  const handleSelectUser = () => setIsChatVisible(true); // Show chat on small screens
  const handleBackToSidebar = () => setIsChatVisible(false); // Show sidebar on small screens

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-14 sm:pt-16 sm:px-4">
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-8xl h-[calc(100vh-3.6rem)] sm:h-[calc(100vh-4.6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            {/* Sidebar */}
            <div
              className={`w-full lg:w-[22rem] ${
                isChatVisible ? "hidden lg:block" : "block"
              }`}
            >
              <Sidebar onSelectUser={handleSelectUser} />
            </div>

            {/* Chat Container or NoChatSelected */}
            <div
              className={`flex-1 ${
                isChatVisible ? "block" : "hidden lg:block"
              }`}
            >
              {!selectedUser ? (
                <NoChatSelected />
              ) : (
                <ChatContainer onBack={handleBackToSidebar} isChatVisible={isChatVisible}/>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
