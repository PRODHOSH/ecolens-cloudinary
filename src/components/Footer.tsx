export default function Footer() {
  return (
    <footer className="mt-auto bg-ec-surface-dark text-ec-on-dark-soft">
      <div className="ec-container py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div className="md:w-1/3">
            <p className="ec-display text-xl font-semibold text-ec-on-dark">
              EcoLens
            </p>
            <p className="mt-3 text-sm text-ec-on-dark-soft">
              Optimize your media. Reduce your carbon footprint.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
            {[
              {
                title: "Product",
                links: ["Overview", "How it works", "Security"],
              },
              {
                title: "Features",
                links: ["Optimization", "Insights", "Carbon impact"],
              },
              {
                title: "Docs",
                links: ["SDK", "API", "Guides"],
              },
              {
                title: "GitHub",
                links: ["Repository", "Issues", "Releases"],
              },
              {
                title: "Contact",
                links: ["Support", "Partners", "hello@ecolens.app"],
              },
            ].map((group) => (
              <div key={group.title}>
                <p className="text-xs uppercase tracking-[0.2em] text-ec-on-dark-soft">
                  {group.title}
                </p>
                <ul className="mt-4 space-y-2 text-sm">
                  {group.links.map((link) => (
                    <li key={link}>
                      <span className="text-ec-on-dark-soft">{link}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 flex flex-col gap-4 border-t border-ec-surface-dark-elevated pt-6 text-xs text-ec-on-dark-soft md:flex-row md:items-center md:justify-between">
          <span>Powered by Cloudinary</span>
          <span>(c) EcoLens</span>
        </div>
      </div>
    </footer>
  );
}
