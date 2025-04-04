import SectionHeader from '../ui/SectionHeader';
import StepCard from '../ui/StepCard';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Design Your Agent",
      description: "Use our visual node constructor to design your agent's workflow with simple drag-and-drop tools."
    },
    {
      number: 2,
      title: "Add Tools & Knowledge",
      description: "Connect pre-built nodes for different functionalities and add your custom knowledge sources."
    },
    {
      number: 3,
      title: "Deploy Anywhere",
      description: "Deploy your agent to your website or Telegram bot with a simple embed code or integration."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow="How It Works"
          title="Create your AI agent in three simple steps"
          description="No coding required - just drag, drop, and deploy"
        />

        <div className="mt-16">
          <div className="grid gap-10 md:grid-cols-3">
            {steps.map((step, index) => (
              <StepCard
                key={index}
                number={step.number}
                title={step.title}
                description={step.description}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
} 