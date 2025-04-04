interface SectionHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
}

export default function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="text-center mb-16">
      <h2 className="text-base font-semibold uppercase tracking-wide text-accent">
        {eyebrow}
      </h2>
      <p className="mt-2 text-3xl font-bold text-primary sm:text-4xl">
        {title}
      </p>
      {description && (
        <p className="mt-4 max-w-2xl mx-auto text-xl text-secondary">
          {description}
        </p>
      )}
    </div>
  );
} 