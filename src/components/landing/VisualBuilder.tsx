import SectionHeader from '../ui/SectionHeader';

export default function VisualBuilder() {
  return (
    <section className="py-20 bg-dark">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <SectionHeader 
          eyebrow="Visual Builder"
          title="Powerful node-based construction"
        />

        <div className="rounded-xl bg-card border border-border overflow-hidden shadow-xl">
          <div className="bg-dark px-4 py-2 flex items-center">
            <div className="flex space-x-2">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 text-sm text-secondary">BeAI Node Constructor</div>
          </div>
          <div className="p-6 h-80 flex items-center justify-center">
            <div className="text-center text-secondary">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mx-auto mb-4 text-accent">
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 3.75H6A2.25 2.25 0 003.75 6v1.5M16.5 3.75H18A2.25 2.25 0 0120.25 6v1.5m0 9V18A2.25 2.25 0 0118 20.25h-1.5m-9 0H6A2.25 2.25 0 013.75 18v-1.5M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <p className="text-xl font-semibold text-primary">Visual Node Constructor Preview</p>
              <p className="mt-2">Connect nodes, define logic, and build your agent without coding</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 