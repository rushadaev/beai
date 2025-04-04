import SectionHeader from '../ui/SectionHeader';
import TabChat from '../ui/TabChat';

export default function Faq() {
  const demoExamples = [
    {
      title: "Customer Support",
      exchanges: [
        {
          user: "I need to create an agent that can answer questions about my product.",
          agent: "I can help with that! You can use the visual node constructor to design a workflow. Start by connecting a 'Knowledge Base' node and uploading your product documentation."
        },
        {
          user: "How will it understand product-specific questions?",
          agent: "You can train it by connecting a 'Custom Training' node to your knowledge base. This will enable it to understand context and provide accurate answers about your specific products."
        },
        {
          user: "Can I customize the responses?",
          agent: "Absolutely! You can add a 'Response Template' node to define specific formats for different types of questions. This helps maintain your brand voice and ensures consistency."
        }
      ]
    },
    {
      title: "Lead Generation",
      exchanges: [
        {
          user: "Can I create a bot that collects visitor information?",
          agent: "Absolutely! Start with a 'Conversation' node, then add a 'Form Collection' node to gather visitor details. You can customize what information to collect."
        },
        {
          user: "Where does the collected data go?",
          agent: "You can route it anywhere by connecting an 'Integration' node. Send leads directly to your CRM, email, or even Google Sheets - all without coding."
        },
        {
          user: "How can I qualify leads automatically?",
          agent: "Connect a 'Conditional Logic' node after your form collection. This lets you route different leads based on their responses – high-value prospects can be sent to sales while others receive automated follow-ups."
        }
      ]
    },
    {
      title: "No-Code Workflow",
      exchanges: [
        {
          user: "I don't know how to code. Can I still build a useful agent?",
          agent: "Definitely! BeAI is designed specifically for non-technical users. The drag-and-drop interface lets you build sophisticated agents without writing a single line of code."
        },
        {
          user: "How do I test if my agent is working correctly?",
          agent: "The platform includes a built-in testing environment. You can chat with your agent instantly and make adjustments until it behaves exactly as you want."
        },
        {
          user: "What if I need help building my agent?",
          agent: "We provide templates for common use cases that you can customize. Plus, our support team is available to help you create the perfect agent for your specific needs."
        }
      ]
    }
  ];

  return (
    <section id="faq" className="py-20 bg-dark">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow="Interactive Demo"
          title="See How Agents Work"
          description="Explore real conversation examples of what your AI agents can do"
        />

        <div className="mt-12">
          <TabChat demos={demoExamples} />
        </div>
      </div>
    </section>
  );
} 