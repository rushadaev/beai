import SectionHeader from '../ui/SectionHeader';
import StepCard from '../ui/StepCard';

export default function HowItWorks() {
  const steps = [
    {
      number: 1,
      title: "Configure Your Agent System",
      description: "Define your system settings, context class, and create specialized agents with specific instructions."
    },
    {
      number: 2,
      title: "Add Tools & API Integrations",
      description: "Extend your agents with built-in tools, create custom API calls, and set up agent-to-agent handoffs."
    },
    {
      number: 3,
      title: "Test & Deploy",
      description: "Test your agent system with the built-in testing interface, then deploy with simple API endpoints."
    }
  ];

  return (
    <section id="how-it-works" className="py-20 bg-dark">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow="How It Works"
          title="Build your multi-agent system in three steps"
          description="Create sophisticated AI systems with powerful API integrations"
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