import { useState, useRef, useEffect } from 'react';

const FAQ = [
  { q: 'How do I book a consultation?', a: 'Go to Consultations → Book Consultation, select a doctor and schedule your video call. It\'s free and instant!' },
  { q: 'How does medicine delivery work?', a: 'After your doctor creates a prescription, the pharmacy reviews it. Once accepted, you can place an order and track delivery in real-time on the map.' },
  { q: 'Can I buy medicines without prescription?', a: 'Yes! Go to the Medicine Shop to browse 100+ OTC medicines. Add to cart and checkout directly — no prescription needed.' },
  { q: 'How do I track my order?', a: 'Go to My Orders and click "Track Live" on any active order. You\'ll see the delivery partner\'s location on a live map, just like Blinkit!' },
  { q: 'How do I upload a prescription?', a: 'Go to Prescriptions → Upload, and upload a photo or PDF of your prescription. The pharmacy will review it and you can order medicines.' },
  { q: 'Is the video consultation free?', a: 'Yes, all video consultations on MediExpress are currently free. You only pay for medicines.' },
  { q: 'How long does delivery take?', a: 'Typically 10-30 minutes depending on your location. You can track the delivery partner in real-time!' },
  { q: 'What payment methods are accepted?', a: 'We accept Cash on Delivery (COD). Online payment options coming soon!' },
];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hi! 👋 I\'m MediBot. How can I help you today?', time: new Date() },
  ]);
  const [input, setInput] = useState('');
  const [showFaq, setShowFaq] = useState(true);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleFaq = (faq) => {
    setShowFaq(false);
    setMessages(prev => [
      ...prev,
      { from: 'user', text: faq.q, time: new Date() },
    ]);
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: faq.a, time: new Date() }]);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg = input.trim();
    setInput('');
    setShowFaq(false);
    setMessages(prev => [...prev, { from: 'user', text: userMsg, time: new Date() }]);

    // Simple keyword matching
    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let response = 'I\'m not sure about that. Try asking about consultations, orders, prescriptions, or delivery. You can also reach our support at support@mediexpress.in';

      if (lower.includes('consult') || lower.includes('doctor') || lower.includes('video'))
        response = FAQ[0].a;
      else if (lower.includes('deliver') || lower.includes('track') || lower.includes('map'))
        response = FAQ[3].a;
      else if (lower.includes('medicine') || lower.includes('buy') || lower.includes('shop') || lower.includes('otc'))
        response = FAQ[2].a;
      else if (lower.includes('prescri') || lower.includes('upload'))
        response = FAQ[4].a;
      else if (lower.includes('pay') || lower.includes('cost') || lower.includes('price'))
        response = FAQ[7].a;
      else if (lower.includes('free'))
        response = FAQ[5].a;
      else if (lower.includes('time') || lower.includes('long') || lower.includes('fast'))
        response = FAQ[6].a;
      else if (lower.includes('hi') || lower.includes('hello') || lower.includes('hey'))
        response = 'Hello! 😊 How can I help you with MediExpress today?';
      else if (lower.includes('thank'))
        response = 'You\'re welcome! 😊 Anything else I can help with?';

      setMessages(prev => [...prev, { from: 'bot', text: response, time: new Date() }]);
    }, 800);
  };

  return (
    <>
      {/* Chat button */}
      <button onClick={() => setOpen(!open)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 ${open ? 'bg-gray-600 hover:bg-gray-700 rotate-0' : 'bg-practo-blue hover:bg-practo-blue-dark animate-bounce'}`}
        style={{ animationDuration: '2s' }}>
        {open ? (
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18 18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.625 12a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fadeInUp">
          {/* Header */}
          <div className="bg-practo-blue p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">🤖</div>
            <div>
              <p className="text-white font-semibold text-sm">MediBot</p>
              <p className="text-white/70 text-xs flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span> Online</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50" style={{ maxHeight: 300 }}>
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${msg.from === 'user' ? 'bg-practo-blue text-white rounded-br-md' : 'bg-white text-practo-navy border border-gray-200 rounded-bl-md shadow-sm'}`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* FAQ suggestions */}
            {showFaq && (
              <div className="space-y-1.5">
                <p className="text-xs text-practo-gray font-medium">Quick questions:</p>
                {FAQ.slice(0, 5).map((faq, i) => (
                  <button key={i} onClick={() => handleFaq(faq)}
                    className="block w-full text-left px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs text-practo-navy hover:border-practo-blue hover:bg-practo-blue-light transition-all">
                    {faq.q}
                  </button>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t border-gray-200 bg-white">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type a message..." className="flex-1 px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm text-practo-navy placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-practo-blue/30" />
              <button onClick={handleSend} disabled={!input.trim()} className="px-4 py-2.5 bg-practo-blue text-white rounded-xl hover:bg-practo-blue-dark transition-all disabled:opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" /></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
