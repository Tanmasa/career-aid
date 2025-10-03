'use client';

import type { CSSProperties, FormEvent } from 'react';
import { useEffect, useRef, useState } from 'react';

import type { MessageLog } from '@/lib/prompt';

export type ChatMessage = MessageLog & { id?: number; created_at?: string };

type Props = {
  initialMessages: ChatMessage[];
};

const containerStyle: CSSProperties = {
  width: '100%',
  maxWidth: '800px',
  background: '#fff',
  padding: '2rem',
  borderRadius: '12px',
  boxShadow: '0 12px 32px rgba(31, 41, 55, 0.08)',
  display: 'grid',
  gap: '1.5rem',
  height: '80vh'
};

const messagesStyle: CSSProperties = {
  overflowY: 'auto',
  display: 'grid',
  gap: '0.75rem'
};

const formStyle: CSSProperties = {
  display: 'flex',
  gap: '0.75rem'
};

const inputStyle: CSSProperties = {
  flex: 1,
  border: '1px solid #d1d5db',
  borderRadius: '999px',
  padding: '0.75rem 1.25rem'
};

const bubbleBase: CSSProperties = {
  padding: '0.75rem 1rem',
  borderRadius: '16px',
  maxWidth: '80%',
  lineHeight: 1.5
};

const userBubble: CSSProperties = {
  ...bubbleBase,
  justifySelf: 'end',
  background: '#2563eb',
  color: '#fff'
};

const assistantBubble: CSSProperties = {
  ...bubbleBase,
  justifySelf: 'start',
  background: '#e5f0ff',
  color: '#111827'
};

const subtleText: CSSProperties = {
  fontSize: '0.9rem',
  color: '#6b7280'
};

export const ChatClient = ({ initialMessages }: Props) => {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed) return;

    setError(null);
    setInput('');
    const userMessage: ChatMessage = { role: 'user', content: trimmed };
    setMessages((prev) => [...prev, userMessage]);
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data: { reply: string } = await response.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (err) {
      console.error(err);
      setError('応答の取得に失敗しました。時間を置いて再度お試しください。');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section style={containerStyle}>
      <header>
        <h1 style={{ margin: '0 0 0.25rem', fontSize: '1.75rem' }}>AIキャリアチャット</h1>
        <p style={subtleText}>アンケートで共有された内容を踏まえて、進路の悩みを一緒に考えます。</p>
      </header>

      <div ref={listRef} style={messagesStyle}>
        {messages.length === 0 ? (
          <p style={subtleText}>こんにちは！アンケート内容をもとにお話ししましょう。</p>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}-${message.created_at ?? ''}`}
              style={message.role === 'user' ? userBubble : assistantBubble}
            >
              {message.content}
            </div>
          ))
        )}
      </div>

      {error && <p style={{ ...subtleText, color: '#b91c1c' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={formStyle}>
        <input
          name="message"
          placeholder="相談したいことを入力してください"
          value={input}
          onChange={(event) => setInput(event.target.value)}
          style={inputStyle}
          autoComplete="off"
          disabled={isSending}
        />
        <button type="submit" disabled={isSending}>
          {isSending ? '送信中…' : '送信'}
        </button>
      </form>
    </section>
  );
};
