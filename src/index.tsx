/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Chat } from '@google/genai';
import { marked } from 'marked';

// اینجا API Key خودت رو از محیط بخون
const API_KEY = process.env.REACT_APP_API_KEY;


const chatContainer = document.getElementById('chat-container') as HTMLElement;
const chatHistory = document.getElementById('chat-history') as HTMLElement;
const chatForm = document.getElementById('chat-form') as HTMLFormElement;
const chatInput = document.getElementById('chat-input') as HTMLInputElement;
const sendButton = chatForm.querySelector('button') as HTMLButtonElement;
const loadingIndicator = document.getElementById(
  'loading-indicator',
) as HTMLElement;

let chat: Chat;

function appendMessage(text: string, type: 'user' | 'model') {
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${type}-message`;

  // رندر مارک‌داون برای پاسخ مدل
  if (type === 'model') {
    messageDiv.innerHTML = marked.parse(text) as string;
  } else {
    messageDiv.textContent = text;
  }

  chatHistory.appendChild(messageDiv);
  chatContainer.scrollTop = chatContainer.scrollHeight;
  return messageDiv;
}

async function main() {
  if (!API_KEY) {
    appendMessage('Error: API key is not configured.', 'model');
    return;
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction:
        'You are a friendly assistant for our product pages. Answer concisely in casual english when asked about product specs, shipping, and returns.',
    },
  });

  appendMessage(
    "Hello! I'm your friendly product assistant. How can I help you today?",
    'model',
  );

  chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const message = chatInput.value.trim();
    if (!message) return;

    appendMessage(message, 'user');
    chatInput.value = '';

    chatInput.disabled = true;
    sendButton.disabled = true;
    loadingIndicator.style.display = 'block';

    try {
      const responseStream = await chat.sendMessageStream({ message });

      const modelMessageDiv = appendMessage('', 'model');
      let fullResponse = '';
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        modelMessageDiv.innerHTML = marked.parse(fullResponse) as string;
        chatContainer.scrollTop = chatContainer.scrollHeight;
      }
    } catch (error) {
      console.error(error);
      appendMessage('Sorry, something went wrong. Please try again.', 'model');
    } finally {
      chatInput.disabled = false;
      sendButton.disabled = false;
      loadingIndicator.style.display = 'none';
      chatInput.focus();
    }
  });
}

main();
