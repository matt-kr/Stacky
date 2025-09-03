export default function ChatInput() {
  return (
    <form className="chat-input-form">
      <input
        type="text"
        className="chat-input"
        placeholder="Ask Stacky anything..."
      />
      <button type="submit" className="send-button">Send</button>
    </form>
  );
}