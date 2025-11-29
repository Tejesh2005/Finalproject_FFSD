import React, { useEffect, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { Link } from 'react-router-dom';
import ChatListItem from '../../components/chat/ChatListItem';

export default function ChatListAuctionManager({ onSelect, selectedId }) {
  const [chats, setChats] = useState([]);

  const storedUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch (e) { return null; }
  })();
  const currentUserId = storedUser?._id || storedUser?.id || null;

  useEffect(() => {
    (async () => {
      try {
        const res = await axiosInstance.get('/chat/my-chats');
        setChats(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, []);

  return (
    <div className="p-4 h-full">
      <h2 className="text-2xl font-semibold mb-4">Assigned Mechanics</h2>
      <div className="space-y-3 overflow-auto" style={{ maxHeight: 'calc(100vh - 140px)' }}>
        {chats.map(chat => {
          const isSelected = String(selectedId) === String(chat._id);
          if (onSelect) {
            return (
              <div key={chat._id}>
                <ChatListItem chat={chat} onClick={onSelect} isSelected={isSelected} viewerIsBuyer={false} currentUserId={currentUserId} />
              </div>
            );
          }

          return (
            <Link key={chat._id} to={`/auction-manager/chats/${chat._id}`}>
              <ChatListItem chat={chat} isSelected={isSelected} viewerIsBuyer={false} currentUserId={currentUserId} />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
