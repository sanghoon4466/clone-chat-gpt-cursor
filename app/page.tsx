'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  ArrowLeft,
  Phone,
  Info,
  Send,
  Plus,
  Camera,
  Image as ImageIcon,
  Mic,
  Smile,
  ThumbsUp,
} from 'lucide-react';

export default function Home() {
  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const [input, setInput] = useState('');
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 새 메시지가 추가될 때 자동 스크롤
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (input.trim() && status === 'ready') {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (input.trim() && status === 'ready') {
        sendMessage({ text: input });
        setInput('');
      }
    }
  };

  const handleThumbsUp = () => {
    if (status === 'ready') {
      sendMessage({ text: '👍' });
    }
  };

  const isLoading = status === 'submitted' || status === 'streaming';

  return (
    <div className="flex h-screen flex-col bg-white dark:bg-black">
      {/* 헤더 */}
      <header className="flex items-center justify-between border-b border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
              AI Assistant
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">
              {isLoading ? 'Typing...' : 'Online'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-purple-600 dark:text-purple-400"
          >
            <Phone className="h-5 w-5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 text-purple-600 dark:text-purple-400"
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </header>

      {/* 메시지 영역 */}
      <ScrollArea className="flex-1">
        <div ref={scrollAreaRef} className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          {messages.length === 0 ? (
            <div className="flex h-full min-h-[400px] items-center justify-center">
              <div className="text-center">
                <h2 className="mb-2 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
                  안녕하세요!
                </h2>
                <p className="text-zinc-600 dark:text-zinc-400">
                  무엇이든 물어보세요. 도와드리겠습니다.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] ${
                      message.role === 'user' ? 'ml-auto' : ''
                    }`}
                  >
                    <div
                      className={`rounded-2xl px-4 py-2.5 shadow-sm ${
                        message.role === 'user'
                          ? 'bg-purple-600 text-white dark:bg-purple-500'
                          : 'bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50'
                      }`}
                    >
                      <div className="space-y-1">
                        {message.parts.map((part, index) => {
                          if (part.type === 'text') {
                            return (
                              <div
                                key={index}
                                className="whitespace-pre-wrap break-words text-sm leading-relaxed"
                              >
                                {part.text}
                              </div>
                            );
                          }
                          return null;
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {/* 타이핑 인디케이터 */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="max-w-[85%] sm:max-w-[75%]">
                    <div className="rounded-2xl bg-zinc-100 px-4 py-3 shadow-sm dark:bg-zinc-800">
                      <div className="flex items-center gap-1">
                        <div className="flex gap-1">
                          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.3s]"></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400 [animation-delay:-0.15s]"></div>
                          <div className="h-2 w-2 animate-bounce rounded-full bg-zinc-400"></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 에러 메시지 */}
              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-red-800 dark:bg-red-900/20 dark:text-red-400">
                  <p className="text-sm">오류가 발생했습니다. 페이지를 새로고침해주세요.</p>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </ScrollArea>

      {/* 입력 영역 */}
      <div className="border-t border-zinc-200 bg-white px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex items-end gap-2">
            {/* 왼쪽 아이콘 버튼들 */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                disabled={status !== 'ready'}
              >
                <Plus className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                disabled={status !== 'ready'}
              >
                <Camera className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                disabled={status !== 'ready'}
              >
                <ImageIcon className="h-5 w-5" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                disabled={status !== 'ready'}
              >
                <Mic className="h-5 w-5" />
              </Button>
            </div>

            {/* 입력 필드 */}
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message"
              disabled={status !== 'ready'}
              className="min-h-[44px] max-h-[120px] resize-none rounded-2xl border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm focus-visible:ring-2 focus-visible:ring-purple-500/20 dark:border-zinc-700 dark:bg-zinc-900 dark:focus-visible:ring-purple-400/20"
              rows={1}
            />

            {/* 오른쪽 아이콘 버튼들 */}
            <div className="flex shrink-0 items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
                disabled={status !== 'ready'}
              >
                <Smile className="h-5 w-5" />
              </Button>
              {input.trim() ? (
                <Button
                  type="submit"
                  disabled={status !== 'ready' || !input.trim()}
                  className="h-9 w-9 shrink-0 bg-purple-600 text-white hover:bg-purple-700 dark:bg-purple-500 dark:hover:bg-purple-600"
                >
                  <Send className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleThumbsUp}
                  disabled={status !== 'ready'}
                  className="h-9 w-9 shrink-0 bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700"
                >
                  <ThumbsUp className="h-4 w-4" />
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
