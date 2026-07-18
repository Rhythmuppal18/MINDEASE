import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="mt-16 w-full border-t border-white/[0.08] px-4 py-8"
    >
      <div className="mx-auto max-w-7xl">
        {/* Top row: 3 balanced columns */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 sm:items-center">
          {/* Left: Branding */}
          <div className="text-left">
            <p className="font-display text-base font-bold tracking-[0.2em] text-white">
              MIND<span className="text-neon-cyan">EASE</span>
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.25em] text-slate-400">
              Mental Wellness Companion Dashboard
            </p>
          </div>

          {/* Center: Team Name */}
          <div className="text-center">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Team</p>
            <p className="mt-1 font-display text-sm font-semibold text-slate-200">
              Error 404: Exit Not Found
            </p>
          </div>

          {/* Right: Members — all on one horizontal line */}
          <div className="text-right">
            <p className="text-[11px] uppercase tracking-[0.25em] text-slate-400">Members</p>
            <p className="mt-1 text-sm font-medium text-slate-200">
              Heemanshu Singh&nbsp;·&nbsp;Rhythm Uppal&nbsp;·&nbsp;Pehoo Angrish
            </p>
          </div>
        </div>

        {/* Problem Statement details */}
        <div className="mt-8 border-t border-white/[0.04] pt-6 text-center text-xs text-slate-400 max-w-3xl mx-auto space-y-1.5">
          <p>
            <span className="font-semibold text-slate-200">Problem Code:</span> MED-01
          </p>
          <p>
            <span className="font-semibold text-slate-200">Title:</span> Mental Wellness Companion Dashboard
          </p>
          <p className="leading-relaxed">
            <span className="font-semibold text-slate-200">Problem Statement:</span> Design a calming and interactive platform for mood tracking, wellness activities, guided support resources, and personalized self‑care insights.
          </p>
        </div>

        {/* Bottom row: fine print */}
        <p className="mt-6 text-center text-[11px] uppercase tracking-[0.25em] text-slate-500">
          No account needed · Session data saved locally on your device
        </p>
      </div>
    </motion.footer>
  );
}
