import { useState } from 'react';
import { DeepChat } from 'deep-chat-react';

interface WidgetProps {
  chatbotId: string;
}

interface DeepChatRequestBody {
  messages: {
    text: string;
    role: 'user' | 'assistant' | 'system';
  }[];
}

interface DeepChatResponseSignals {
  onResponse: (response: { text?: string; error?: string; role: 'assistant' }) => void;
}

export function Widget({ chatbotId }: WidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);

  const chatHandler = async (body: DeepChatRequestBody, signals: DeepChatResponseSignals) => {
    const userMessage = body.messages[body.messages.length - 1].text;

    try {
      const response = await fetch(`http://localhost:3000/api/chatbots/${chatbotId}/prompt`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          conversation_id: conversationId, // Sends null to indicate first message
        }),
      });

      if (!response.ok) {
        throw new Error('API request failed');
      }

      const data = await response.json();

      if (data.conversation_id) {
        setConversationId(data.conversation_id);
      }

      signals.onResponse({ text: data.reply, role: 'assistant' });
    } catch (error) {
      console.error(error);
      signals.onResponse({
        error: 'Sorry, I had trouble connecting.',
        role: 'assistant',
      });
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999 }}>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          style={{
            width: '60px',
            height: '60px',
            borderRadius: '50%',
            backgroundColor: '#0070f3',
            color: 'white',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            boxShadow: '0 4px 14px 0 rgba(0, 118, 255, 0.39)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        ></button>
      )}

      {/*Chat panel*/}
      {isOpen && (
        <div
          style={{
            width: '350px',
            height: '500px',
            boxShadow: '0 5px 40px rgba(0,0,0,0.15)',
            borderRadius: '10px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: 'white',
          }}
        >
          {/*Header*/}
          <div
            style={{
              padding: '10px',
              backgroundColor: '#f9f9f9',
              borderBottom: '1px solid #eee',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <p style={{ margin: 0, fontWeight: 'bold' }}>Chat Assistant</p>
            <button
              onClick={() => setIsOpen(false)}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '20px',
                cursor: 'pointer',
                color: '#888',
              }}
            >
              ✕
            </button>
          </div>

          {/*Entire component*/}
          <div style={{ flex: 1, position: 'relative' }}>
            <DeepChat
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
              connect={{ handler: chatHandler }}
              introMessage={{ text: 'Hello! How can I help you today?' }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
