import React, { useEffect, useState, useRef } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import reportWebVitals from "./reportWebVitals";
import { marked } from "marked";
import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.REACT_APP_API_KEY;

function ChatAssistant() {
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const sendMessage = async () => {
    if (!chatInput.trim()) return;

    const userMessage = { text: chatInput, type: "user" };
    // Add user message and model placeholder in one go
    setChatMessages((prev) => [
      ...prev,
      userMessage,
      { text: "", type: "model" },
    ]);
    const modelMessageIndex = chatMessages.length + 1;

    setChatInput("");
    setLoading(true);

    try {
      if (!API_KEY) {
        throw new Error("API key is not configured");
      }

      const ai = new GoogleGenAI({ apiKey: API_KEY });
      const chat = ai.chats.create({
        model: "gemini-2.5-flash",
        config: {
          systemInstruction:
            "You are a friendly assistant for our product pages. Answer concisely in casual english when asked about product specs, shipping, and returns.",
        },
      });

      const responseStream = await chat.sendMessageStream({ message: chatInput });

      // **FIXED CODE BLOCK**
      // We will now update the state safely within the loop
      for await (const chunk of responseStream) {
        setChatMessages((prev) => {
          const newMessages = [...prev];
          // Ensure the placeholder message exists before trying to update it
          if (newMessages[modelMessageIndex]) {
            // Append the new chunk text to the previous text for that message
            const updatedText = newMessages[modelMessageIndex].text + chunk.text;
            newMessages[modelMessageIndex] = {
              text: updatedText,
              type: "model",
            };
          }
          return newMessages;
        });
      }
    } catch (err) {
      console.error(err);
      // To prevent duplicate error messages, find the placeholder and replace it.
      setChatMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[modelMessageIndex] && newMessages[modelMessageIndex].text === "") {
          newMessages[modelMessageIndex] = { text: "Sorry, something went wrong.", type: "model" };
          return newMessages;
        }
        // If it wasn't there, just add the error message
        return [...prev, { text: "Sorry, something went wrong.", type: "model" }];
      });
    } finally {
      setLoading(false);
      scrollToBottom();
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
              wordWrap: "break-word",
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
          disabled={loading}
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

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <App />
    <ChatAssistant />
  </React.StrictMode>
);

reportWebVitals();
