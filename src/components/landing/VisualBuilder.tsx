import SectionHeader from '../ui/SectionHeader';

export default function VisualBuilder() {
  return (
    <section className="py-20 bg-dark">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow="Agent Constructor"
          title="Build powerful multi-agent systems"
        />

        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xl">
          <div className="bg-dark px-4 py-2 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-sm text-secondary">BeAI Agent Constructor</div>
          </div>
          <div className="p-6 h-80 flex items-center justify-center">
            <div className="text-center text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 16.875h3.375m0 0h3.375m-3.375 0V13.5m0 3.375v3.375M6 10.5h2.25a2.25 2.25 0 002.25-2.25V6a2.25 2.25 0 00-2.25-2.25H6A2.25 2.25 0 003.75 6v2.25A2.25 2.25 0 006 10.5zm0 9.75h2.25A2.25 2.25 0 0010.5 18v-2.25a2.25 2.25 0 00-2.25-2.25H6a2.25 2.25 0 00-2.25 2.25V18A2.25 2.25 0 006 20.25zm9.75-9.75H18a2.25 2.25 0 002.25-2.25V6A2.25 2.25 0 0018 3.75h-2.25A2.25 2.25 0 0013.5 6v2.25a2.25 2.25 0 002.25 2.25z" />
              </svg>
              <p className="text-xl font-semibold text-primary">Agent Construction Interface</p>
              <p className="mt-2">Configure multi-agent systems, API integrations, and custom tools without coding</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 