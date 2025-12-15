import React from 'react';
import { createRoot } from 'react-dom/client';
import { Widget } from './Widget';

const script = document.currentScript;
const chatbotGroupId = script?.getAttribute('data-chatbot-group-id');
const apiBaseUrl = script?.getAttribute('data-api-origin') || '';

if (!chatbotGroupId) {
  console.error('Embed widget: "data-chatbot-group-id" attribute not on script tag.');
} else {
  const container = document.createElement('div');
  container.id = 'chatbot-embed-root';
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <Widget groupId={chatbotGroupId} apiBaseUrl={apiBaseUrl} />
    </React.StrictMode>
  );
}
