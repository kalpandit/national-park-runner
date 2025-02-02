import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import Markdown from "react-markdown";

interface Message {
  text: string;
  sender: "user" | "bot";
}

const Chatbot: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([
    { text: "Hello! How can I assist you today?", sender: "bot" },
  ]);
  const [input, setInput] = useState<string>("");
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://127.0.0.1:6464/expert_chatbot", {
        message: input,
        previous_messages: JSON.stringify(messages),
      });

      const botMessage: Message = { text: response.data.reply, sender: "bot" };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.log(error);
      const errorMessage: Message = { text: "⚠️ Error: Unable to fetch response.", sender: "bot" };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg hover:bg-green-600"
      >
        {isOpen ? "Close Chat" : "Open Chat"}
      </button>
      {isOpen && (
        <div className="w-full min-w-lg max-w-3xl mx-auto bg-white border border-gray-200 shadow-lg rounded-xl overflow-hidden flex flex-col mt-2 absolute bottom-12 right-0">
          <div className="h-96 overflow-y-auto p-4 bg-gray-50" style={{ scrollbarWidth: "thin" }}>
            {messages.map((msg, index) => (
              <div key={index} className={`flex ${msg.sender === "bot" ? "justify-start" : "justify-end"} mb-2`}>
                <div
                  className={`px-4 py-2 rounded-xl max-w-xs ${
                    msg.sender === "bot" ? "bg-gray-300 text-gray-800" : "bg-green-500 text-white"
                  }`}
                >
                  <Markdown>
                    {msg.text.replace(/\n/g, "  \n")}
                  </Markdown>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <div className="flex items-center border-t border-gray-300 p-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Type a message..."
              className="flex-grow px-4 py-2 border border-gray-300 text-black rounded-l-md focus:outline-none"
            />
            <button
              onClick={sendMessage}
              className="bg-green-500 text-white px-4 py-2 rounded-r-md hover:bg-green-600 transition"
              disabled={loading}
            >
              {loading ? "..." : "Send"} 
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;