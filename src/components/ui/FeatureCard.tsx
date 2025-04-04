import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export default function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-8 transition-transform hover:transform hover:scale-105">
      <div className="mb-4 h-12 w-12 rounded-md bg-dark border border-accent/30 p-2 text-accent">
        {icon}
      </div>
      <h3 className="mb-2 text-xl font-bold text-primary">{title}</h3>
      <p className="text-secondary">{description}</p>
    </div>
  );
} 