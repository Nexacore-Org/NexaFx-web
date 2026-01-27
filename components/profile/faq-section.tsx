"use client";

export function FAQSection() {
  const faqs = [
    {
      question: "Why do I need to verify my identity?",
      answer:
        "Verifying your identity helps keep the platform secure and ensures all users follow the same guidelines. It's also required to access certain features like withdrawals or higher limits.",
    },
    {
      question: "How long does verification take?",
      answer:
        "Most verifications are completed within a few minutes. In rare cases, it may take up to 24 hours.",
    },
    {
      question: "Can I use the platform without verifying?",
      answer:
        "Some features may be limited until you complete verification, such as withdrawals or large transactions.",
    },
  ];

  return (
    <div className="space-y-6 bg-transparent dark:bg-card/30 rounded-xl p-6">
      <h3 className="text-xl font-bold text-foreground">FAQs</h3>
      <div className="space-y-6">
        {faqs.map((faq, index) => (
          <div key={index} className="space-y-2">
            <h4 className="text-base font-semibold text-foreground">
              {faq.question}
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
