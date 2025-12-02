import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatListSeller from './ChatListSeller';
import ChatRoomSeller from './ChatRoomSeller';

export default function ChatPageSeller() {
  const { chatId: chatIdFromParam } = useParams();
  const navigate = useNavigate();
  const [selectedChatId, setSelectedChatId] = useState(chatIdFromParam || null);

  useEffect(() => {
    setSelectedChatId(chatIdFromParam || null);
  }, [chatIdFromParam]);

  const handleSelect = (id) => {
    setSelectedChatId(id);
    navigate(`/seller/chats/${id}`);
  };

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      <aside className="w-80 border-r">
        <ChatListSeller onSelect={handleSelect} selectedId={selectedChatId} />
      </aside>
      <main className="flex-1">
        <ChatRoomSeller chatIdProp={selectedChatId} />
      </main>
    </div>
  );
}
