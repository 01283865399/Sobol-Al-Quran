'use client';

import * as React from 'react';
import Link from 'next/link';
import { Bot, Loader2, Plus, Send, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { PageLayout } from '@/components/page-layout';
import {
  chatApiErrorSchema,
  chatApiResponseSchema,
  chatStreamEventSchema,
  type ChatSource,
} from '@/lib/chat-types';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  answerType?: 'generated' | 'notice';
  sources?: ChatSource[];
}

const suggestions = [
  'ما أبرز معاني الصبر في القرآن؟',
  'كيف أبحث عن سورة وأبدأ التلاوة في الموقع؟',
  'كيف أستمع إلى إذاعة القرآن الكريم؟',
];

function renderAssistantContent(content: string): React.ReactNode {
  return content.split(/(\[[^\]]+\]\(\/[A-Za-z0-9._/-]+\))/g).map((part, index) => {
    const match = /^\[([^\]]+)\]\((\/[A-Za-z0-9._/-]+)\)$/.exec(part);
    if (match?.[2].includes('..')) return part;
    return match ? (
      <Link
        key={index}
        href={match[2]}
        className="font-semibold text-accent underline underline-offset-4"
      >
        {match[1]}
      </Link>
    ) : (
      part
    );
  });
}

export default function ChatPage() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState('');
  const [error, setError] = React.useState('');
  const [isSending, setIsSending] = React.useState(false);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const log = logRef.current;
    log?.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }, [messages, isSending]);

  const sendMessage = async (rawMessage: string) => {
    const content = rawMessage.trim();
    if (!content || isSending) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content,
    };
    const assistantMessageId = crypto.randomUUID();
    let receivedAssistantText = false;
    const nextMessages = [...messages, userMessage].slice(-50);
    const requestMessages = nextMessages.map(({ role, content: messageContent }) => ({
      role,
      content: messageContent,
    }));

    setMessages(nextMessages);
    setInput('');
    setError('');
    setIsSending(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: requestMessages }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json();
        const apiError = chatApiErrorSchema.safeParse(payload);
        setMessages((current) => current.filter((message) => message.id !== userMessage.id));
        setInput(content);
        setError(
          apiError.success
            ? apiError.data.error.message
            : 'تعذر إكمال الطلب. أعد المحاولة بعد قليل.'
        );
        return;
      }

      if (response.headers.get('content-type')?.includes('text/event-stream')) {
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error('missing_response_stream');
        }

        const decoder = new TextDecoder();
        let buffer = '';
        let completed = false;
        let streamError = '';

        const handleEvent = (frame: string) => {
          const data = frame
            .split('\n')
            .filter((line) => line.startsWith('data:'))
            .map((line) => line.slice(5).trimStart())
            .join('\n');
          if (!data) return;

          let eventPayload: unknown;
          try {
            eventPayload = JSON.parse(data);
          } catch {
            throw new Error('invalid_stream_event');
          }
          const event = chatStreamEventSchema.safeParse(eventPayload);
          if (!event.success) {
            throw new Error('invalid_stream_event');
          }

          if (event.data.type === 'delta') {
            receivedAssistantText = true;
            const streamedMessage: ChatMessage = {
              id: assistantMessageId,
              role: 'assistant',
              content: event.data.text,
              answerType: 'generated',
            };
            setMessages((current) => {
              const existing = current.some((message) => message.id === assistantMessageId);
              if (existing) {
                return current.map((message) =>
                  message.id === assistantMessageId
                    ? { ...message, content: message.content + streamedMessage.content }
                    : message
                );
              }
              return [...current, streamedMessage].slice(-50);
            });
          } else if (event.data.type === 'done') {
            completed = true;
          } else {
            streamError = event.data.error.message;
          }
        };

        while (true) {
          const { value, done } = await reader.read();
          buffer += decoder.decode(value, { stream: !done }).replace(/\r\n/g, '\n');

          let boundary = buffer.indexOf('\n\n');
          while (boundary !== -1) {
            handleEvent(buffer.slice(0, boundary));
            buffer = buffer.slice(boundary + 2);
            boundary = buffer.indexOf('\n\n');
          }

          if (done) {
            if (buffer.trim()) handleEvent(buffer);
            break;
          }
          if (streamError) break;
        }

        if (streamError) {
          if (!receivedAssistantText) {
            setMessages((current) =>
              current.filter(
                (message) =>
                  message.id !== userMessage.id && message.id !== assistantMessageId
              )
            );
            setInput(content);
          }
          setError(streamError);
          return;
        }
        if (!completed) {
          throw new Error('incomplete_response_stream');
        }
        return;
      }

      const payload: unknown = await response.json();
      const result = chatApiResponseSchema.safeParse(payload);
      if (!result.success) {
        setMessages((current) => current.filter((message) => message.id !== userMessage.id));
        setInput(content);
        setError('وصل رد غير صالح من الخادم. أعد المحاولة.');
        return;
      }

      const assistantMessage: ChatMessage = {
        id: assistantMessageId,
        role: 'assistant',
        content: result.data.answer,
        answerType: result.data.answerType,
        sources: result.data.sources,
      };
      setMessages((current) => [...current, assistantMessage].slice(-50));
    } catch {
      if (receivedAssistantText) {
        setError('انقطع الاتصال أثناء استلام الرد. أعد المحاولة لإكمال المحادثة.');
      } else {
        setMessages((current) =>
          current.filter(
            (message) => message.id !== userMessage.id && message.id !== assistantMessageId
          )
        );
        setInput(content);
        setError('تعذر الاتصال بالخادم. تحقق من اتصالك ثم أعد المحاولة.');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void sendMessage(input);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(input);
    }
  };

  const startNewConversation = () => {
    setMessages([]);
    setInput('');
    setError('');
  };

  return (
    <PageLayout>
      <div className="assistant-chat-page w-full px-4 py-7 lg:px-8 lg:py-10">
        <div className="assistant-chat__intro">
          <div className="assistant-chat__intro-icon" aria-hidden="true">
            <Sparkles />
          </div>
          <div>
            <p className="assistant-chat__eyebrow">مساعد سُبُل الذكي</p>
            <h1 className="font-kufi">اسأل، وتعلّم، واستكشف</h1>
            <p className="assistant-chat__intro-copy">
              مساحة هادئة لأسئلتك العامة والإرشاد إلى خدمات الموقع.
            </p>
          </div>
        </div>

        <section className="assistant-chat min-w-0 overflow-hidden">
          <div className="assistant-chat__header">
            <div className="assistant-chat__identity">
              <div className="assistant-chat__avatar" aria-hidden="true">
                <Bot />
              </div>
              <div className="min-w-0">
                <h2 className="font-kufi font-bold">المساعد الإسلامي</h2>
                <p>إجابات تعليمية مباشرة</p>
              </div>
            </div>
            <div className="assistant-chat__header-actions">
              <span className="assistant-chat__online">
                <span aria-hidden="true" />
                جاهز للمساعدة
              </span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={startNewConversation}
                disabled={isSending || messages.length === 0}
                className="assistant-chat__new-button shrink-0 gap-2"
              >
                <Plus className="h-4 w-4" aria-hidden="true" />
                محادثة جديدة
              </Button>
            </div>
          </div>

          <div
            ref={logRef}
            role="log"
            aria-label="سجل المحادثة"
            aria-live="polite"
            aria-relevant="additions text"
            className="assistant-chat__log max-h-[62vh] min-h-[380px] space-y-5 overflow-y-auto p-5 sm:p-7"
          >
            {messages.length === 0 ? (
              <div className="assistant-chat__welcome">
                <div className="assistant-chat__welcome-icon" aria-hidden="true">
                  <Sparkles />
                </div>
                <p className="assistant-chat__welcome-label">مرحبًا بك</p>
                <h3 className="font-kufi">كيف أستطيع مساعدتك اليوم؟</h3>
                <p className="assistant-chat__welcome-copy">
                  اسأل عن موضوع عام أو عن طريقة استخدام خدمات سُبُل. اختر سؤالًا مقترحًا أو اكتب سؤالك مباشرة.
                </p>
                <div className="assistant-chat__suggestions">
                  {suggestions.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => void sendMessage(suggestion)}
                      disabled={isSending}
                      className="assistant-chat__suggestion"
                    >
                      <Sparkles aria-hidden="true" />
                      {suggestion}
                    </button>
                  ))}
                </div>
                <p className="assistant-chat__source-note">
                  <ShieldCheck aria-hidden="true" />
                  لا يُغني عن سؤال أهل العلم، ولا تُوثَّق الاقتباسات تلقائيًا.
                </p>
              </div>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`assistant-chat__message assistant-chat__message--${message.role}`}
                >
                  {message.role === 'assistant' && (
                    <div className="assistant-chat__message-avatar" aria-hidden="true">
                      <Bot />
                    </div>
                  )}
                  <div className="assistant-chat__bubble">
                    <p className="assistant-chat__message-label">
                      {message.role === 'user' ? 'أنت' : 'المساعد'}
                    </p>
                    <p dir="auto" className="whitespace-pre-wrap break-words">
                      {message.role === 'assistant'
                        ? renderAssistantContent(message.content)
                        : message.content}
                    </p>
                    {message.sources && message.sources.length > 0 && (
                      <nav aria-label="روابط ذات صلة" className="mt-4 flex flex-wrap gap-2">
                        {message.sources.map((source) => (
                          <Link
                            key={`${source.url}-${source.title}`}
                            href={source.url}
                            className="inline-flex min-h-9 items-center rounded-full border border-accent/20 bg-accent/5 px-3 py-1.5 text-sm text-primary transition-colors hover:border-accent/50 hover:bg-accent/10"
                          >
                            {source.title}
                          </Link>
                        ))}
                      </nav>
                    )}
                  </div>
                </article>
              ))
            )}

            {isSending && (
              <div role="status" className="assistant-chat__typing">
                <div className="assistant-chat__message-avatar" aria-hidden="true">
                  <Bot />
                </div>
                <div className="assistant-chat__typing-bubble">
                  <span className="assistant-chat__typing-dots" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>يكتب الرد الآن</span>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
                </div>
              </div>
            )}
          </div>

          <div className="assistant-chat__composer-wrap">
            {error && (
              <p role="alert" className="assistant-chat__error">
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} className="assistant-chat__composer">
              <label htmlFor="chat-message" className="sr-only">
                اكتب سؤالك
              </label>
              <Textarea
                id="chat-message"
                dir="auto"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="اكتب سؤالك هنا…"
                maxLength={MAX_MESSAGE_LENGTH}
                rows={2}
                disabled={isSending}
                className="assistant-chat__textarea min-h-[60px] resize-y font-cairo leading-7"
              />
              <Button
                type="submit"
                disabled={isSending || !input.trim()}
                className="assistant-chat__send h-12 shrink-0 gap-2"
              >
                {isSending ? (
                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="h-4 w-4" aria-hidden="true" />
                )}
                إرسال
              </Button>
            </form>
            <div className="assistant-chat__composer-meta">
              <span>
                <kbd>Enter</kbd> للإرسال
                <span aria-hidden="true"> · </span>
                <kbd>Shift + Enter</kbd> لسطر جديد
              </span>
              <span>{input.length} / {MAX_MESSAGE_LENGTH}</span>
            </div>
          </div>
        </section>
        <p className="assistant-chat__disclaimer">
          <ShieldCheck aria-hidden="true" />
          الإجابات للمعلومات العامة، وليست فتوى أو بديلًا عن الرجوع إلى مصدر موثوق.
        </p>
      </div>
    </PageLayout>
  );
}

const MAX_MESSAGE_LENGTH = 1600;
