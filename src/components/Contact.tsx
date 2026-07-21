interface ContactData {
  heading?: string;
  subheading?: string;
  linkedin?: string;
  facebook?: string;
  instagram?: string;
}

const defaults: ContactData = {
  heading: "Contact Us",
  subheading: "Connect with us on social media or reach out directly.",
  linkedin: "https://www.linkedin.com/company/piliadheseal/",
  facebook: "https://www.facebook.com/piliadheseal",
  instagram: "https://www.instagram.com/piliadheseal",
};

export default function Contact({ data }: { data?: ContactData | null }) {
  const d = { ...defaults, ...data };

  return (
    <section id="contact" className="py-20 md:py-28 bg-[var(--color-light)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-[var(--color-primary)]">
            {d.heading}
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            {d.subheading}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <a href={d.linkedin} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#0077b5]/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#0077b5]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">LinkedIn</h3>
            <p className="text-gray-600 text-center">Follow us on LinkedIn</p>
          </a>

          <a href={d.facebook} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#1877f2]/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#1877f2]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Facebook</h3>
            <p className="text-gray-600 text-center">Follow us on Facebook</p>
          </a>

          <a href={d.instagram} target="_blank" rel="noopener noreferrer" className="flex flex-col items-center p-8 bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
            <div className="w-16 h-16 rounded-full bg-[#e4405f]/10 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-[#e4405f]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Instagram</h3>
            <p className="text-gray-600 text-center">Follow us on Instagram</p>
          </a>
        </div>
      </div>
    </section>
  );
}
