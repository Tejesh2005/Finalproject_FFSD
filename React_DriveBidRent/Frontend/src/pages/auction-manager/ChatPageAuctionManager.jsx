import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListAuctionManager from './ChatListAuctionManager';
import ChatRoomAuctionManager from './ChatRoomAuctionManager';

export default function ChatPageAuctionManager() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => { setSelectedChatId(chatIdFromParam || null); }, [chatIdFromParam]);

  const handleSelect = (id) => { setSelectedChatId(id); navigate(`/auction-manager/chats/${id}`); };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <aside className="w-80 border-r">
        <ChatListAuctionManager onSelect={handleSelect} selectedId={selectedChatId} />
      </aside>
      <main className="flex-1">
        <ChatRoomAuctionManager chatIdProp={selectedChatId} />
      </main>
    </div>
  );
}
