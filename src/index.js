import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { marked } from "marked";
// import { GoogleGenAI } from "@google/genai"; // uncomment if installed via npm

const API_KEY = process.env.REACT_APP_API_KEY;

function ChatAssistant() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, type: "user" };
    setChatMessages((prev) => [...prev, userMessage]);
    setChatInput("");
    setLoading(true);

    try {
      // Example: POST to your backend endpoint /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: chatInput }),
      });

      const data = await response.json();
      const modelMessage = { text: data.reply, type: "model" };
      setChatMessages((prev) => [...prev, modelMessage]);
    } catch (err) {
      console.error(err);
      setChatMessages((prev) => [
        ...prev,
        { text: "Sorry, something went wrong.", type: "model" },
      ]);
    } finally {
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
