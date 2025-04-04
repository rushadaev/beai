interface FaqItemProps {
  question: string;
  answer: string;
}

export default function FaqItem({ question, answer }: FaqItemProps) {
  return (
    <div className="rounded-lg border border-border-dark bg-bg-card p-6">
      <h3 className="text-lg font-bold text-text-primary">{question}</h3>
      <p className="mt-2 text-text-secondary">{answer}</p>
    </div>
  );
} 