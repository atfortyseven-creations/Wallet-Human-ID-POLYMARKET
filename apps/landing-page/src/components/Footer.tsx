export default function Footer() {
  return (
    <footer className="bg-parchment pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center md:items-start gap-8 border-t-2 border-ink/10 pt-12">
        <div className="text-center md:text-left">
          <h2 className="text-3xl font-serif font-bold text-ink mb-2">Ledger Network</h2>
          <p className="text-ink/60 max-w-sm">
            The privacy layer for Ethereum. Build, transact, and interact with the world, on your terms.
          </p>
        </div>
        
        <div className="flex gap-12 text-center md:text-left">
          <div>
            <h4 className="font-bold text-ink mb-4">Developers</h4>
            <ul className="space-y-2 text-ink/70">
              <li><a href="#" className="hover:text-orchid transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-orchid transition-colors">Github</a></li>
              <li><a href="#" className="hover:text-orchid transition-colors">Grants</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink mb-4">Community</h4>
            <ul className="space-y-2 text-ink/70">
              <li><a href="#" className="hover:text-chartreuse transition-colors text-ink">Twitter / X</a></li>
              <li><a href="#" className="hover:text-chartreuse transition-colors text-ink">Discord</a></li>
              <li><a href="#" className="hover:text-chartreuse transition-colors text-ink">Blog</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-ink mb-4">Legal & Compliance</h4>
            <ul className="space-y-2 text-ink/70">
              <li><a href="/legal/privacy-policy" className="hover:text-orchid transition-colors">Privacy Policy</a></li>
              <li><a href="/legal/terms-of-service" className="hover:text-orchid transition-colors">Terms of Service</a></li>
              <li><a href="/legal/dpa" className="hover:text-orchid transition-colors">Data Processing Agreement</a></li>
            </ul>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto mt-16 text-center text-ink/40 text-sm">
        © {new Date().getFullYear()} Ledger Network. All rights reserved.
      </div>
    </footer>
  );
}
