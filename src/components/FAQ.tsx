"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What makes Pili AdheSeal products different from regular sealants?",
    answer:
      "Our products are custom-formulated for specific industries and applications. Unlike off-the-shelf sealants, we engineer each formulation to match your exact requirements — whether it's extreme temperature resistance, chemical exposure, or specific substrate bonding.",
  },
  {
    question: "Can you customize products for our specific application?",
    answer:
      "Absolutely! Customization is our core strength. We adjust viscosity, cure time, flexibility, temperature resistance, chemical resistance, and more. Just tell us your application requirements and our chemists will develop the right formulation.",
  },
  {
    question: "What industries do you serve?",
    answer:
      "We serve Defense & Military, Construction, Automotive, Marine, Electronics & Manufacturing, and Aerospace. Each industry gets specialized formulations tested to meet sector-specific standards and certifications.",
  },
  {
    question: "What is the minimum order quantity?",
    answer:
      "MOQ varies depending on the product type and customization level. For standard products, we can accommodate smaller orders. For custom formulations, we typically require a minimum development batch. Contact our sales team for specific details.",
  },
  {
    question: "How long does the custom formulation process take?",
    answer:
      "From initial consultation to delivered product, the typical timeline is 4-8 weeks. This includes formulation development (1-2 weeks), testing and QA (1-2 weeks), and production (2-4 weeks). Rush orders can be accommodated for standard products.",
  },
  {
    question: "Do your products meet international standards?",
    answer:
      "Yes. Our products are developed in compliance with ISO 9001, ISO 14001, ASTM testing standards, and MIL-SPEC for military applications. We also hold DOST accreditation and DTI registration in the Philippines.",
  },
  {
    question: "Do you ship internationally?",
    answer:
      "Yes, we ship to select international markets. Domestic delivery within the Philippines is standard. For international orders, please contact our sales team to discuss logistics, lead times, and shipping options.",
  },
  {
    question: "Can I request a sample before placing a bulk order?",
    answer:
      "Yes! We provide product samples for evaluation. For standard products, samples can be shipped within 3-5 business days. For custom formulations, we provide prototype samples during the development phase for your approval before production.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

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
          {faqs.map((faq, index) => (
            <div
              key={index}
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
          ))}
        </div>
      </div>
    </section>
  );
}
