import React, { useEffect, useRef, useState } from 'react';
import axiosInstance from '../../utils/axiosInstance.util';
import { useParams } from 'react-router-dom';
import ChatBubble from '../../components/chat/ChatBubble';
import MessageInput from '../../components/chat/MessageInput';
import ChatHeader from '../../components/chat/ChatHeader';

export default function ChatRoomAuctionManager({ chatIdProp }) {
  const { chatId: chatIdFromParam } = useParams();
  const chatId = chatIdProp || chatIdFromParam;
  const [chat, setChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [lastFetchedAt, setLastFetchedAt] = useState(null);
  const messagesRef = useRef();
  const scrollContainerRef = useRef(null);
  const initialLoadRef = useRef(true);
  const isSendingRef = useRef(false);
  const isSwitchingChatRef = useRef(false);

  const [myUserId, setMyUserId] = useState(null);
  useEffect(() => {
    if (!chatId) return;
    isSwitchingChatRef.current = true;
    (async () => {
      try {
        const res = await axiosInstance.get(`/chat/${chatId}`);
        const payload = res.data.data || {};
        setChat(payload.chat || null);
        setMyUserId(payload.myUserId || null);
      } catch (err) {
        console.error(err);
      } finally {
        isSwitchingChatRef.current = false;
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId) return;
    (async () => {
      try {
        const res = await axiosInstance.get(`/chat/${chatId}/messages`);
        setMessages(res.data.data || []);
      } catch (err) {
        console.error(err);
      }
    })();
  }, [chatId]);

  useEffect(() => {
    if (!chatId || !myUserId) return;
    const hasUnread = messages.some(m => !m.read && m.sender && m.sender._id !== myUserId);
    if (!hasUnread) return;

    (async () => {
      try {
        const res = await axiosInstance.post(`/chat/${chatId}/mark-read`);
        const updated = res.data?.updated || 0;
        setMessages(prev => prev.map(m => (m.sender && m.sender._id !== myUserId ? { ...m, read: true } : m)));
        try { window.dispatchEvent(new CustomEvent('chatRead', { detail: { chatId, updated } })); } catch (e) {}
      } catch (err) {
        console.error('mark-read failed', err);
      }
    })();
  }, [messages, chatId, myUserId]);

  useEffect(() => {
    if (!chatId) return;
    let mounted = true;
    const fetchInitial = async () => {
      try {
        const res = await axiosInstance.get(`/chat/${chatId}/messages`);
        if (!mounted) return;
        const msgs = res.data.data || [];
        setMessages(msgs);
        if (msgs.length) {
          const latestMs = msgs.reduce((acc, m) => Math.max(acc, new Date(m.updatedAt || m.createdAt).getTime()), 0);
          setLastFetchedAt(new Date(latestMs).toISOString());
        } else setLastFetchedAt(new Date().toISOString());
      } catch (err) {
        console.error(err);
      }
    };

    fetchInitial();

    const id = setInterval(async () => {
      try {
        if (!lastFetchedAt) return;
        const res = await axiosInstance.get(`/chat/${chatId}/messages?since=${encodeURIComponent(lastFetchedAt)}`);
        const newMsgs = res.data.data || [];
        if (newMsgs.length) {
          setMessages(prev => [...prev, ...newMsgs]);
          const latestMs = newMsgs.reduce((acc, m) => Math.max(acc, new Date(m.updatedAt || m.createdAt).getTime()), 0);
          setLastFetchedAt(new Date(latestMs).toISOString());
        }
      } catch (err) {
        console.error(err);
      }
    }, 3000);

    return () => { mounted = false; clearInterval(id); };
  }, [chatId, lastFetchedAt]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const shouldAutoScroll = () => {
      const threshold = 150;
      return el.scrollHeight - (el.scrollTop + el.clientHeight) < threshold;
    };

    if (initialLoadRef.current) {
      messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
      initialLoadRef.current = false;
      return;
    }

    if (isSendingRef.current || isSwitchingChatRef.current) return;

    if (shouldAutoScroll()) {
      messagesRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSend = async (content) => {
    if (!chatId) return;
    try {
      isSendingRef.current = true;
      const res = await axiosInstance.post(`/chat/${chatId}/message`, { content });
      if (res.data?.data) {
        const msg = res.data.data;
        setMessages(prev => [...prev, msg]);
        setLastFetchedAt(msg.createdAt);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => { isSendingRef.current = false; }, 200);
    }
  };

  const expired = chat && new Date() > new Date(chat.expiresAt);

  if (!chatId) {
    return (
      <div className="p-6 text-center text-gray-500">Select a mechanic from the left to view messages.</div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <ChatHeader chat={chat} otherUser={chat?.mechanic} carName={chat?.inspectionTask?.vehicleName} rentalPeriod={''} currentUserId={myUserId} />
      <div ref={scrollContainerRef} className="p-4 flex-1 overflow-auto flex flex-col">
        {messages.map(m => (
          <ChatBubble key={m._id} message={m} isOwn={myUserId && m.sender && m.sender._id === myUserId} />
        ))}
        <div ref={messagesRef} />
      </div>
      {expired ? <div className="p-2 text-center text-sm text-gray-600">Chat expired and is read-only</div> : <MessageInput onSend={handleSend} disabled={expired} />}
    </div>
  );
}
