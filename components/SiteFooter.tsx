import { profile } from "@/lib/content";
import LiveReaders from "@/components/LiveReaders";
import FooterAction from "@/components/FooterAction";
import Reveal from "@/components/Reveal";
import WordReveal from "@/components/WordReveal";

export default function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-4 px-2 pb-2 sm:px-4 sm:pb-4">
      <div className="relative mx-auto max-w-[1440px] overflow-hidden rounded-[28px] bg-deep sm:rounded-[40px]">
        <div className="relative z-[1] flex flex-col items-center gap-9 px-5 pb-8 pt-20 sm:px-10 sm:pt-28">
          <Reveal y={12}>
            <span className="inline-flex items-center gap-2.5 rounded-full border border-line bg-paper px-[18px] py-2.5 text-[15px] text-ink">
              <span aria-hidden className="footer-pulse h-[7px] w-[7px] rounded-full bg-accent" />
              Open to AI engineering roles
            </span>
          </Reveal>

          <WordReveal
            className="font-serif text-balance text-center text-[44px] font-normal leading-[1.02] tracking-[-0.035em] text-ink sm:text-[72px] lg:text-[96px]"
            words={[{ text: "Let’s" }, { text: "build" }, { text: "something", accent: true }, { text: "good.", accent: true }]}
          />

          <Reveal delay={0.15} y={16}>
            <div className="flex flex-wrap justify-center gap-3">
              <FooterAction kind="primary" glyph="mail" label={profile.links.email} href={"mailto:" + profile.links.email} />
              <FooterAction kind="secondary" glyph="arrow" iconSide="right" label="Ask my portfolio" href="/#ask" />
            </div>
          </Reveal>

          <Reveal delay={0.25} y={16}>
            <div className="flex gap-3">
              <FooterAction kind="icon" glyph="linkedin" label="LinkedIn" href={profile.links.linkedin} newTab />
              <FooterAction kind="icon" glyph="github" label="GitHub" href={profile.links.github} newTab />
            </div>
          </Reveal>

          <Reveal delay={0.1} y={0} className="mt-6 w-full">
            <div className="flex w-full flex-col items-center gap-4 border-t border-line pt-7 sm:flex-row sm:justify-between">
              <span className="t-note flex-1 uppercase tracking-[0.1em]">© 2026 {profile.name}</span>
              <LiveReaders />
              <span className="flex flex-1 items-center justify-end gap-3.5">
                <span className="t-note uppercase tracking-[0.1em]">{profile.location}, NY</span>
                <FooterAction kind="icon" size="small" glyph="up" label="Back to top" backToTop />
              </span>
            </div>
          </Reveal>
        </div>

        {/* Oversized name rises into view, cropped by the card like Marlowe's. */}
        <Reveal y={60} className="pointer-events-none relative -mt-2 select-none" >
          <div aria-hidden className="h-[7vw] overflow-hidden">
            <span className="block whitespace-nowrap text-center font-serif text-[11vw] leading-[0.95] tracking-[-0.04em] text-ink" style={{ opacity: 0.09 }}>
              Adam Toshkhujayev
            </span>
          </div>
        </Reveal>
      </div>
    </footer>
  );
}
