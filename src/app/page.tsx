import ChatbotAssistant from "@/components/ChatbotAssistant";

export default function Home() {
  return (
    <main style={{ padding: "2rem", maxWidth: 720, margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: 600 }}>RAG Assistant</h1>
      <p style={{ color: "#6b7280", marginTop: "0.5rem" }}>
        Configure your <code>.env</code> and start chatting. The widget is in the bottom-right corner.
      </p>
      <ChatbotAssistant />
    </main>
  );
}
