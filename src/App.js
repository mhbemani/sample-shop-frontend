import React, { useEffect, useState, useRef } from "react";

// Replace this import with your package if using @google/genai in JS
// For example, if you eventually use a backend endpoint for the API, adjust accordingly
// import { GoogleGenAI } from "@google/genai"; 

function App() {
  const [products, setProducts] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    fetch("https://sample-shop-backend-tbrn.onrender.com/api/products/")
      .then((res) => res.json())
      .then((data) => setProducts(data))
      .catch((err) => console.error(err));
  }, []);

  // Scroll to bottom on new message
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
      // 👇 Replace this with actual call to your Google AI endpoint
      // If using Python backend, create an endpoint /api/chat that calls Google AI
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
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Simple Shop</h1>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: "20px",
          marginTop: "20px",
        }}
      >
        {products.length > 0 ? (
          products.map((product) => (
            <div
              key={product.id}
              style={{
                border: "1px solid #ccc",
                borderRadius: "10px",
                padding: "10px",
                textAlign: "center",
                boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src={product.image_url}
                alt={product.name}
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderRadius: "8px",
                }}
              />
              <h3>{product.name}</h3>
              <p>{product.description}</p>
              <p style={{ fontWeight: "bold", color: "green" }}>
                ${product.price}
              </p>
            </div>
          ))
        ) : (
          <p>No products found</p>
        )}
      </div>

      {/* Chat Assistant */}
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
        }}
      >
        <div
          style={{
            flex: 1,
            padding: "10px",
            overflowY: "auto",
          }}
        >
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
            >
              {msg.text}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <div
          style={{
            display: "flex",
            borderTop: "1px solid #ccc",
            padding: "5px",
          }}
        >
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={handleKeyPress}
            style={{
              flex: 1,
              padding: "8px",
              borderRadius: "20px",
              border: "1px solid #ccc",
            }}
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
    </div>
  );
}

export default App;
