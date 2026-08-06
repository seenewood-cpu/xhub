'use client';

export default function HeroGraphic() {
  return (
    <section className="hero-section relative z-10 overflow-hidden">
      {/* Layered gradient background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0D0F1A] via-[#1A1040] to-[#0D0F1A]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(108,99,255,0.25)_0%,transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(208,255,20,0.12)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_60%_80%,rgba(255,107,107,0.12)_0%,transparent_50%)]" />
      </div>

      {/* SVG Artwork */}
      <div className="absolute inset-0 flex items-center justify-center">
        <svg
          className="w-full h-full"
          viewBox="0 0 1200 700"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
          preserveAspectRatio="xMidYMid slice"
        >
          {/* Large rotating ring */}
          <g opacity="0.15">
            <circle cx="600" cy="350" r="280" stroke="url(#grad1)" strokeWidth="1" strokeDasharray="8 12">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 600 350"
                to="360 600 350"
                dur="60s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Medium ring */}
          <g opacity="0.2">
            <circle cx="600" cy="350" r="200" stroke="url(#grad2)" strokeWidth="1.5" strokeDasharray="4 8">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 600 350"
                to="0 600 350"
                dur="45s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Inner ring */}
          <g opacity="0.25">
            <circle cx="600" cy="350" r="120" stroke="url(#grad3)" strokeWidth="1" strokeDasharray="2 6">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 600 350"
                to="360 600 350"
                dur="30s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Orbiting dots - outer */}
          <g opacity="0.6">
            <circle cx="600" cy="70" r="4" fill="#6C63FF">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 600 350"
                to="360 600 350"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="600" cy="70" r="3" fill="#D0FF14">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="120 600 350"
                to="480 600 350"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="600" cy="70" r="3" fill="#FF6B6B">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="240 600 350"
                to="600 600 350"
                dur="20s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Orbiting dots - inner */}
          <g opacity="0.5">
            <circle cx="600" cy="230" r="3" fill="#BFA2DB">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="360 600 350"
                to="0 600 350"
                dur="15s"
                repeatCount="indefinite"
              />
            </circle>
            <circle cx="600" cy="230" r="2.5" fill="#6C63FF">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="180 600 350"
                to="540 600 350"
                dur="15s"
                repeatCount="indefinite"
              />
            </circle>
          </g>

          {/* Abstract geometric shapes */}
          {/* Triangle */}
          <g opacity="0.12" transform="translate(180, 180)">
            <polygon points="0,60 52,-20 -52,-20" stroke="#6C63FF" strokeWidth="1" fill="none">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="40s"
                repeatCount="indefinite"
              />
            </polygon>
          </g>

          {/* Hexagon */}
          <g opacity="0.1" transform="translate(950, 200)">
            <polygon points="0,-40 35,-20 35,20 0,40 -35,20 -35,-20" stroke="#D0FF14" strokeWidth="1" fill="none">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="-360"
                dur="50s"
                repeatCount="indefinite"
              />
            </polygon>
          </g>

          {/* Diamond */}
          <g opacity="0.1" transform="translate(250, 500)">
            <polygon points="0,-30 30,0 0,30 -30,0" stroke="#FF6B6B" strokeWidth="1" fill="none">
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0"
                to="360"
                dur="35s"
                repeatCount="indefinite"
              />
            </polygon>
          </g>

          {/* Floating lines */}
          <g opacity="0.08">
            <line x1="100" y1="100" x2="300" y2="150" stroke="#6C63FF" strokeWidth="1">
              <animate attributeName="y1" values="100;120;100" dur="8s" repeatCount="indefinite" />
              <animate attributeName="y2" values="150;130;150" dur="8s" repeatCount="indefinite" />
            </line>
            <line x1="900" y1="500" x2="1100" y2="450" stroke="#D0FF14" strokeWidth="1">
              <animate attributeName="y1" values="500;480;500" dur="10s" repeatCount="indefinite" />
              <animate attributeName="y2" values="450;470;450" dur="10s" repeatCount="indefinite" />
            </line>
          </g>

          {/* Scattered dots */}
          <g opacity="0.3">
            <circle cx="150" cy="150" r="2" fill="#6C63FF">
              <animate attributeName="opacity" values="0.3;0.7;0.3" dur="4s" repeatCount="indefinite" />
            </circle>
            <circle cx="1050" cy="120" r="1.5" fill="#D0FF14">
              <animate attributeName="opacity" values="0.2;0.6;0.2" dur="5s" repeatCount="indefinite" />
            </circle>
            <circle cx="200" cy="550" r="2" fill="#FF6B6B">
              <animate attributeName="opacity" values="0.3;0.5;0.3" dur="6s" repeatCount="indefinite" />
            </circle>
            <circle cx="1000" cy="580" r="1.5" fill="#BFA2DB">
              <animate attributeName="opacity" values="0.2;0.5;0.2" dur="4.5s" repeatCount="indefinite" />
            </circle>
            <circle cx="400" cy="80" r="1" fill="#6C63FF">
              <animate attributeName="opacity" values="0.2;0.4;0.2" dur="7s" repeatCount="indefinite" />
            </circle>
            <circle cx="800" cy="620" r="1.5" fill="#D0FF14">
              <animate attributeName="opacity" values="0.15;0.35;0.15" dur="5.5s" repeatCount="indefinite" />
            </circle>
          </g>

          {/* Central glow pulse */}
          <circle cx="600" cy="350" r="60" fill="url(#centerGlow)" opacity="0.4">
            <animate attributeName="r" values="60;80;60" dur="4s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="0.4;0.2;0.4" dur="4s" repeatCount="indefinite" />
          </circle>

          {/* Gradient definitions */}
          <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#6C63FF" />
              <stop offset="100%" stopColor="#D0FF14" />
            </linearGradient>
            <linearGradient id="grad2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#D0FF14" />
              <stop offset="100%" stopColor="#FF6B6B" />
            </linearGradient>
            <linearGradient id="grad3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#BFA2DB" />
            </linearGradient>
            <radialGradient id="centerGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#6C63FF" stopOpacity="1" />
              <stop offset="100%" stopColor="#6C63FF" stopOpacity="0" />
            </radialGradient>
          </defs>
        </svg>
      </div>

      <div className="hero-fade-top" />
      <div className="hero-fade-bottom" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pb-16 pt-[28vh]">
        <div className="max-w-3xl mx-auto text-center">
          {/* Logo mark */}
          <div className="mb-8 flex justify-center">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-indigo via-lavender to-cyber rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo/30 rotate-3 hover:rotate-0 transition-transform duration-500">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
              <div className="absolute -inset-3 bg-gradient-to-r from-indigo via-cyber to-coral rounded-3xl opacity-20 blur-xl animate-pulse" />
            </div>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold mb-6 leading-[1.1]">
            <span className="gradient-text-animated">V HUB</span>
          </h1>

          <p className="text-xl sm:text-2xl text-[var(--text-secondary)] mb-10 max-w-xl mx-auto leading-relaxed">
            Your personal video menu.
            <br />
            <span className="text-[var(--text-muted)]">Watch. Share. Enjoy.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="#all-videos"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-abyss rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.2)]"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
              Start Watching
            </a>
            <a
              href="#browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[var(--bg-card)] text-[var(--text-primary)] rounded-xl font-semibold text-lg border border-[var(--border)] hover:bg-[var(--bg-card-hover)] hover:border-indigo/30 transition-all duration-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
              Browse Library
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
