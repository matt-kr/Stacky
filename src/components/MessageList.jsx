import Message from './Message';

//FAKE DATA
const mockMessages = [
  { id: 1, text: "Hey! What's up?", sender: 'user', timestamp: new Date() },
  { id: 2, text: "Hey there! Just another day at the startup grind 🚀", sender: 'assistant', timestamp: new Date() },
];

export default function MessageList() {
  return (
    <div className="message-list">
      {mockMessages.map(msg => <Message key={msg.id} message={msg} />)}
    </div>
  );
}