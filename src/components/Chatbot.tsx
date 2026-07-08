"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  options?: string[];
}

const botResponses: Record<string, { reply: string; options?: string[] }> = {
  // Greetings
  greeting: {
    reply: "Hi! 👋 Welcome to Pili AdheSeal Inc. I'm here to help you find the right bonding solution. What can I help you with?",
    options: ["Products Info", "Custom Formulation", "Request a Quote", "Contact Sales", "Industries We Serve"],
  },
  // Products
  "products info": {
    reply: "We have 4 core product lines:\n\n🛡️ **Pili Seal** — Waterproof, UV-resistant sealant\n🔗 **Pili Adhesive** — Industrial-strength bonding\n🔄 **Pili Hybrid Sealant** — Elastic sealing + strong adhesion\n🧪 **Pili Glue** — Fast-bonding, clear finish\n\nEach can be customized per industry. Which product interests you?",
    options: ["Pili Seal", "Pili Adhesive", "Pili Hybrid Sealant", "Pili Glue", "Back to Menu"],
  },
  "pili seal": {
    reply: "**Pili Seal** is our flagship sealant — designed for watertight, airtight barriers.\n\n✅ Waterproof\n✅ UV Resistant\n✅ Flexible Cure\n✅ Available for: Construction, Defense, Marine, Aerospace\n\nWant to request a custom formulation or get a quote?",
    options: ["Request a Quote", "Custom Formulation", "Other Products", "Back to Menu"],
  },
  "pili adhesive": {
    reply: "**Pili Adhesive** is engineered for permanent bonding across diverse substrates.\n\n✅ High Tensile Strength\n✅ Fast Setting\n✅ Multi-Surface (metal, wood, plastic, composites)\n✅ Available for: Manufacturing, Defense, Automotive\n\nInterested in a specific application?",
    options: ["Request a Quote", "Custom Formulation", "Other Products", "Back to Menu"],
  },
  "pili hybrid sealant": {
    reply: "**Pili Hybrid Sealant** combines sealing and adhesion in one product.\n\n✅ Elastic Bonding\n✅ Paintable\n✅ No Shrinkage\n✅ Ideal for: Dynamic joints, vibration-prone environments\n✅ Available for: Construction, Automotive, Aerospace\n\nWould you like more details?",
    options: ["Request a Quote", "Custom Formulation", "Other Products", "Back to Menu"],
  },
  "pili glue": {
    reply: "**Pili Glue** is our versatile, fast-bonding solution.\n\n✅ Quick Bond\n✅ Clear Finish\n✅ Customizable Viscosity\n✅ Available for: Electronics, Manufacturing, General Use\n\nNeed it for a specific application?",
    options: ["Request a Quote", "Custom Formulation", "Other Products", "Back to Menu"],
  },
  "other products": {
    reply: "Here are our core products again:\n\n🛡️ Pili Seal\n🔗 Pili Adhesive\n🔄 Pili Hybrid Sealant\n🧪 Pili Glue\n\nWhich one would you like to know more about?",
    options: ["Pili Seal", "Pili Adhesive", "Pili Hybrid Sealant", "Pili Glue", "Back to Menu"],
  },
  // Custom Formulation
  "custom formulation": {
    reply: "We specialize in custom formulations! 🧬\n\nOur chemists can adjust:\n• Viscosity & cure time\n• Temperature resistance\n• Chemical resistance\n• Flexibility & hardness\n• Color & appearance\n\nThe process:\n1️⃣ Consultation — Tell us your needs\n2️⃣ Formulation — We engineer it\n3️⃣ Testing — Rigorous QA\n4️⃣ Production — Delivered to you\n\nWant to start the process?",
    options: ["Contact Sales", "Request a Quote", "Industries We Serve", "Back to Menu"],
  },
  // Quote
  "request a quote": {
    reply: "To prepare a quote, we'll need:\n\n📋 Product type (Seal, Adhesive, Hybrid, Glue)\n📋 Application/Industry\n📋 Volume needed\n📋 Any special requirements\n\nYou can fill out our contact form or reach us directly:\n\n📧 info@piliadheseal.com\n📞 +63 (XXX) XXX-XXXX\n\nWould you like me to direct you to the contact form?",
    options: ["Go to Contact Form", "Industries We Serve", "Back to Menu"],
  },
  "go to contact form": {
    reply: "I'll redirect you to our contact section where you can send your inquiry directly! 📝\n\nJust scroll down to the Contact section or click the link below. Our team typically responds within 24 hours.",
    options: ["Back to Menu", "Products Info"],
  },
  // Contact
  "contact sales": {
    reply: "Here's how to reach our sales team:\n\n📧 Email: info@piliadheseal.com\n📞 Phone: +63 (XXX) XXX-XXXX\n📍 Location: BatStateU STEER Hub, Batangas, Philippines\n\n⏰ Office Hours: Mon-Fri, 8AM-5PM\n\nOr use our contact form on this page!",
    options: ["Go to Contact Form", "Products Info", "Back to Menu"],
  },
  // Industries
  "industries we serve": {
    reply: "We customize products for these industries:\n\n🛡️ Defense & Military\n🏗️ Construction\n🚗 Automotive\n🚢 Marine\n💻 Electronics & Manufacturing\n✈️ Aerospace\n\nEach industry gets a specialized formulation. Which sector are you in?",
    options: ["Defense & Military", "Construction", "Automotive", "Marine", "Electronics", "Aerospace", "Back to Menu"],
  },
  "defense & military": {
    reply: "For **Defense & Military**, we offer:\n\n• Extreme temperature resistance (-40°C to 200°C)\n• Chemical & fuel resistance\n• MIL-SPEC compliance\n• Structural integrity under stress\n\nProducts: Pili Seal for Defense, Pili Adhesive for Defense\n\nReady to discuss your requirements?",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  "construction": {
    reply: "For **Construction**, we provide:\n\n• Weatherproof sealing\n• Joint movement accommodation\n• UV & ozone resistance\n• 20+ year durability\n\nProducts: Pili Seal for Construction, Pili Hybrid Sealant for Construction\n\nNeed a specific solution?",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  "automotive": {
    reply: "For **Automotive**, we deliver:\n\n• Vibration dampening\n• Oil & fuel resistance\n• Temperature cycling endurance\n• Body panel & windshield bonding\n\nProducts: Pili Hybrid Sealant for Automotive, Pili Adhesive for Automotive",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  "marine": {
    reply: "For **Marine**, we engineer:\n\n• Saltwater resistance\n• Anti-corrosion properties\n• Constant water immersion tolerance\n• Hull & deck sealing\n\nProducts: Pili Seal for Marine, Pili Glue for Marine",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  "electronics": {
    reply: "For **Electronics & Manufacturing**, we offer:\n\n• Precision application\n• PCB component encapsulation\n• Controlled cure profiles\n• Clean room compatible\n\nProducts: Pili Glue for Electronics, Pili Adhesive for Manufacturing",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  "aerospace": {
    reply: "For **Aerospace**, we provide:\n\n• Lightweight, high-strength bonding\n• Fuel tank sealing\n• Composite joining\n• Extreme altitude performance\n\nProducts: Pili Seal for Aerospace, Pili Hybrid Sealant for Aerospace",
    options: ["Request a Quote", "Custom Formulation", "Back to Menu"],
  },
  // Back to menu
  "back to menu": {
    reply: "No problem! How else can I help you?",
    options: ["Products Info", "Custom Formulation", "Request a Quote", "Contact Sales", "Industries We Serve"],
  },
};

function getBotResponse(input: string): { reply: string; options?: string[] } {
  const normalized = input.toLowerCase().trim();

  // Direct match
  if (botResponses[normalized]) {
    return botResponses[normalized];
  }

  // Keyword matching
  if (normalized.includes("hi") || normalized.includes("hello") || normalized.includes("hey") || normalized.includes("good")) {
    return botResponses["greeting"];
  }
  if (normalized.includes("product") || normalized.includes("what do you sell") || normalized.includes("offer")) {
    return botResponses["products info"];
  }
  if (normalized.includes("seal") && !normalized.includes("hybrid")) {
    return botResponses["pili seal"];
  }
  if (normalized.includes("adhesive") || normalized.includes("bond")) {
    return botResponses["pili adhesive"];
  }
  if (normalized.includes("hybrid")) {
    return botResponses["pili hybrid sealant"];
  }
  if (normalized.includes("glue")) {
    return botResponses["pili glue"];
  }
  if (normalized.includes("custom") || normalized.includes("formul")) {
    return botResponses["custom formulation"];
  }
  if (normalized.includes("quote") || normalized.includes("price") || normalized.includes("cost") || normalized.includes("how much")) {
    return botResponses["request a quote"];
  }
  if (normalized.includes("contact") || normalized.includes("email") || normalized.includes("phone") || normalized.includes("call")) {
    return botResponses["contact sales"];
  }
  if (normalized.includes("industr") || normalized.includes("sector") || normalized.includes("who")) {
    return botResponses["industries we serve"];
  }
  if (normalized.includes("defense") || normalized.includes("military")) {
    return botResponses["defense & military"];
  }
  if (normalized.includes("construct") || normalized.includes("building")) {
    return botResponses["construction"];
  }
  if (normalized.includes("auto") || normalized.includes("car") || normalized.includes("vehicle")) {
    return botResponses["automotive"];
  }
  if (normalized.includes("marine") || normalized.includes("ship") || normalized.includes("boat")) {
    return botResponses["marine"];
  }
  if (normalized.includes("electron") || normalized.includes("pcb") || normalized.includes("manufactur")) {
    return botResponses["electronics"];
  }
  if (normalized.includes("aero") || normalized.includes("aircraft") || normalized.includes("plane")) {
    return botResponses["aerospace"];
  }
  if (normalized.includes("thank")) {
    return { reply: "You're welcome! 😊 If you need anything else, I'm here to help. Have a great day!", options: ["Back to Menu"] };
  }

  // Default fallback
  return {
    reply: "I'm not sure I understood that. Let me show you what I can help with:",
    options: ["Products Info", "Custom Formulation", "Request a Quote", "Contact Sales", "Industries We Serve"],
  };
}

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi! 👋 Welcome to Pili AdheSeal Inc. I'm here to help you find the right bonding solution. What can I help you with?",
      sender: "bot",
      options: ["Products Info", "Custom Formulation", "Request a Quote", "Contact Sales", "Industries We Serve"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    // Add user message
    const userMsg: Message = {
      id: Date.now(),
      text: text.trim(),
      sender: "user",
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      const response = getBotResponse(text);
      const botMsg: Message = {
        id: Date.now() + 1,
        text: response.reply,
        sender: "bot",
        options: response.options,
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
    }, 800 + Math.random() * 500);
  };

  const handleOptionClick = (option: string) => {
    if (option === "Go to Contact Form") {
      handleSend(option);
      setTimeout(() => {
        document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
      }, 500);
      return;
    }
    handleSend(option);
  };

  return (
    <>
      {/* Chat Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-[var(--color-accent)] to-[var(--color-primary)] text-white shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 flex items-center justify-center"
        aria-label={isOpen ? "Close chat" : "Open chat"}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
        {/* Notification dot */}
        {!isOpen && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-white animate-pulse" />
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] h-[520px] max-h-[calc(100vh-8rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-fade-in-scale">
          {/* Header */}
          <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-accent)] px-5 py-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div className="flex-1">
              <div className="text-white font-semibold text-sm">Pili AdheSeal Assistant</div>
              <div className="text-white/70 text-xs flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-400" />
                Online
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white/70 hover:text-white transition-colors"
              aria-label="Close chat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50">
            {messages.map((msg) => (
              <div key={msg.id}>
                <div
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line ${
                      msg.sender === "user"
                        ? "bg-[var(--color-accent)] text-white rounded-br-md"
                        : "bg-white text-gray-700 shadow-sm border border-gray-100 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
                {/* Quick reply options */}
                {msg.sender === "bot" && msg.options && (
                  <div className="mt-2 flex flex-wrap gap-1.5 pl-1">
                    {msg.options.map((option) => (
                      <button
                        key={option}
                        onClick={() => handleOptionClick(option)}
                        className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-accent)]/30 text-[var(--color-accent)] hover:bg-[var(--color-accent)] hover:text-white transition-colors duration-200 font-medium"
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white rounded-2xl rounded-bl-md px-4 py-3 shadow-sm border border-gray-100">
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="px-4 py-3 border-t border-gray-100 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[var(--color-accent)]/50 focus:border-transparent outline-none text-sm transition"
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-10 h-10 rounded-xl bg-[var(--color-accent)] text-white flex items-center justify-center hover:bg-[var(--color-primary)] disabled:opacity-40 disabled:hover:bg-[var(--color-accent)] transition-colors"
                aria-label="Send message"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
