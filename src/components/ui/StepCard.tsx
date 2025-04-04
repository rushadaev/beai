interface StepCardProps {
  number: number;
  title: string;
  description: string;
}

export default function StepCard({ number, title, description }: StepCardProps) {
  return (
    <div className="relative text-center">
      <div className="flex justify-center">
        <div className="rounded-full bg-card border border-border p-4 text-accent h-16 w-16 flex items-center justify-center text-2xl font-bold">
          {number}
        </div>
      </div>
      <h3 className="mt-6 text-xl font-bold text-primary">{title}</h3>
      <p className="mt-4 text-secondary">{description}</p>
    </div>
  );
} 