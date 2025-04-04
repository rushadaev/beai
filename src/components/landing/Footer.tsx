export default function Footer() {
  return (
    <footer className="bg-dark py-12 border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="md:flex md:items-center md:justify-between">
          <div className="flex justify-center md:order-2 space-x-6">
            <span className="text-sm text-secondary">© 2024 BeAI. All rights reserved.</span>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <span className="text-2xl font-bold text-primary">
              <span className="text-accent">Be</span>AI
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
} 