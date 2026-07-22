"use client";

import { useState, useEffect } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [faqs, setFaqs] = useState<FAQItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/faqs?active=true", { credentials: "same-origin" })
      .then((res) => res.json())
      .then((data) => {
        setFaqs(Array.isArray(data.faqs) ? data.faqs : []);
      })
      .catch(() => { /* silent */ })
      .finally(() => setLoading(false));
  }, []);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="py-20 md:py-28 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 scroll-reveal">
          <span className="inline-block px-4 py-1.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)] text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--color-primary)]">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to know about our products and services.
          </p>
        </div>

        <div className="space-y-4 scroll-reveal">
          {loading ? (
            [1, 2, 3, 4].map((i) => (
              <div key={i} className="border border-gray-200 rounded-xl p-5 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
              </div>
            ))
          ) : faqs.length === 0 ? (
            <p className="text-center text-gray-400 text-sm py-8">No FAQs available at the moment.</p>
          ) : (
            faqs.map((faq, index) => (
              <div
                key={faq.id}
                className={`border rounded-xl overflow-hidden transition-all duration-300 ${
                  openIndex === index
                    ? "border-[var(--color-primary-light)] shadow-md bg-[var(--color-light)]"
                    : "border-gray-200 hover:border-gray-300 bg-white"
                }`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-5 flex items-center justify-between gap-4 text-left"
                  aria-expanded={openIndex === index}
                >
                  <span
                    className={`font-semibold transition-colors ${
                      openIndex === index ? "text-[var(--color-primary)]" : "text-gray-800"
                    }`}
                  >
                    {faq.question}
                  </span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      openIndex === index
                        ? "bg-[var(--color-accent)] text-white rotate-180"
                        : "bg-gray-100 text-gray-500"
                    }`}
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    openIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
                  }`}
                >
                  <p className="px-6 pb-5 text-gray-600 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
