import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { marked } from "marked";
import { GoogleGenAI } from "@google/genai";

// Read API key from environment
const API_KEY = process.env.REACT_APP_API_KEY;

function ChatAssistant() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, type: "user" };
    setChatMessages((prev) => [...prev, userMessage]);
    setLoading(true);

    try {
      // Initialize AI client
      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction:
            "You are a friendly assistant for our product pages. Answer concisely in casual english when asked about product specs, shipping, and returns.",
        },
      });

      // Send user message and receive streamed response
      const responseStream = await chat.sendMessageStream({ message: chatInput });

      const modelMessageDiv = { text: "", type: "model" };
      setChatMessages((prev) => [...prev, modelMessageDiv]);

      let fullResponse = "";
      for await (const chunk of responseStream) {
        fullResponse += chunk.text;
        setChatMessages((prev) => {
          // Update the last message with streamed text
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { text: fullResponse, type: "model" };
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", type: "model" },
      ]);
    } finally {
      setChatInput("");
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "300px",
        maxHeight: "400px",
        backgroundColor: "#fff",
        border: "1px solid #ccc",
        borderRadius: "10px",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      <div style={{ flex: 1, padding: "10px", overflowY: "auto" }}>
        {chatMessages.map((msg, idx) => (
          <div
            key={idx}
            style={{
              backgroundColor: msg.type === "user" ? "#7b61ff" : "#f1f1f1",
              color: msg.type === "user" ? "#fff" : "#000",
              borderRadius: "20px",
              padding: "8px 12px",
              margin: "5px 0",
              alignSelf: msg.type === "user" ? "flex-end" : "flex-start",
              maxWidth: "80%",
            }}
            dangerouslySetInnerHTML={
              msg.type === "model" ? { __html: marked.parse(msg.text) } : undefined
            }
          >
            {msg.type === "user" ? msg.text : null}
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>
      <div style={{ display: "flex", borderTop: "1px solid #ccc", padding: "5px" }}>
        <input
          type="text"
          value={chatInput}
          onChange={(e) => setChatInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ flex: 1, padding: "8px", borderRadius: "20px", border: "1px solid #ccc" }}
          placeholder="Ask about products..."
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          style={{
            marginLeft: "5px",
            padding: "8px 12px",
            borderRadius: "20px",
            backgroundColor: "#7b61ff",
            color: "#fff",
            border: "none",
            cursor: "pointer",
          }}
        >
          Send
        </button>
      </div>
    </div>
  );
}

// Main render
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    <ChatAssistant />
  </React.StrictMode>
);

reportWebVitals();
