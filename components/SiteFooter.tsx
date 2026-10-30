import { profile } from "@/lib/content";
import LiveReaders from "@/components/LiveReaders";

const pill = "inline-flex items-center gap-2.5 rounded-full px-[26px] py-[17px] text-[16px] font-medium no-underline transition-transform hover:-translate-y-px";
const circle = "grid h-[46px] w-[46px] place-items-center rounded-full border border-line bg-paper text-ink transition-transform hover:-translate-y-px";

const icons = {
  mail: "M3 5h18v14H3zM3 6l9 7 9-7",
  linkedin: "M5 9h3v10H5zM6.5 4.5a1.7 1.7 0 110 3.4 1.7 1.7 0 010-3.4zM11 9h3v1.5c.6-1 1.7-1.8 3.3-1.8 2.7 0 3.7 1.7 3.7 4.3V19h-3v-5.3c0-1.3-.4-2.2-1.7-2.2s-2 .9-2 2.3V19h-3z",
  github:
    "M12 .3a12 12 0 00-3.8 23.4c.6.1.8-.3.8-.6v-2c-3.3.7-4-1.6-4-1.6-.6-1.4-1.4-1.8-1.4-1.8-1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1.1 1.8 2.8 1.3 3.5 1 .1-.8.4-1.3.8-1.6-2.7-.3-5.5-1.3-5.5-5.9 0-1.3.5-2.4 1.2-3.2-.1-.3-.5-1.5.1-3.2 0 0 1-.3 3.3 1.2a11.5 11.5 0 016 0c2.300-1.5 3.3-1.2 3.3-1.2.7 1.700.2 2.9.1 3.2.8.8 1.2 1.9 1.2 3.2 0 4.600-2.8 5.600-5.5 5.9.4.400.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0012 .3",
  up: "M12 19V5M6 11l6-6 6 6",
  arrow: "M7 17L17 7M8 7h9v9",
};

function Icon({ d, fill = false }: { d: string; fill?: boolean }) {
  return (
    <svg aria-hidden width="18" height="18" viewBox="0 0 24 24" fill={fill ? "currentColor" : "none"} stroke={fill ? "none" : "currentColor"} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

export default function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-deep sm:rounded-[40px]">
        <div className="relative z-[1] flex flex-col items-center gap-9 px-5 pb-8 pt-20 sm:px-10 sm:pt-28">
          <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper px-[18px] py-2.5 text-[15px] text-ink">
            <span aria-hidden className="h-2 w-2 rounded-full bg-accent" />
            Open to AI engineering roles
          </span>

          <h2 className="font-serif text-balance text-center text-[44px] font-normal leading-[1.02] tracking-[-0.035em] text-ink sm:text-[72px] lg:text-[96px]">
            Let’s build <span className="text-accent">something good.</span>
          </h2>

          <div className="flex flex-wrap justify-center gap-3">
            <a href={"mailto:" + profile.links.email} className={pill + " bg-ink text-paper"}>
              <Icon d={icons.mail} />
              {profile.links.email}
            </a>
            <a href="/#ask" className={pill + " border border-line bg-paper text-ink"}>
              Ask my portfolio
              <Icon d={icons.arrow} />
            </a>
          </div>

          <div className="flex gap-3.5">
            <a href={profile.links.linkedin} target="_blank" rel="noreferrer" aria-label="LinkedIn" className={circle}>
              <Icon d={icons.linkedin} fill />
            </a>
            <a href={profile.links.github} target="_blank" rel="noreferrer" aria-label="GitHub" className={circle}>
              <Icon d={icons.github} fill />
            </a>
          </div>

          <div className="mt-6 flex w-full flex-col items-center gap-4 border-t border-line pt-7 sm:flex-row sm:justify-between">
            <span className="t-note uppercase tracking-[0.1em]">© 2026 {profile.name}</span>
            <LiveReaders />
            <span className="flex items-center gap-4">
              <span className="t-note uppercase tracking-[0.1em]">{profile.location}, NY</span>
              <a href="#top" aria-label="Back to top" className={circle + " !h-10 !w-10"}>
                <Icon d={icons.up} />
              </a>
            </span>
          </div>
        </div>

        {/* Oversized name, cropped by the card like Marlowe's. */}
        <div aria-hidden className="pointer-events-none relative -mt-2 h-[7vw] select-none overflow-hidden">
          <span
            className="block whitespace-nowrap text-center font-serif text-[11vw] leading-[0.95] tracking-[-0.04em] text-ink"
            style={{ opacity: 0.09 }}
          >
            Adam Toshkhujayev
          </span>
        </div>
      </div>
    </footer>
  );
}
