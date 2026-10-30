"use client";

import { motion } from "framer-motion";

// Marlowe's word-by-word headline: each word rises and un-blurs as it scrolls into view.
export default function WordReveal({ words, className }: { words: { text: string; accent?: boolean }[]; className?: string }) {
  return (
    <motion.h2
      className={className}
      initial="hide"
      whileInView="show"
      viewport={{ once: true, amount: 0.4 }}
      transition={{ staggerChildren: 0.07, delayChildren: 0.05 }}
    >
      {words.map((w, i) => (
        <motion.span
          key={i}
          className={"inline-block " + (w.accent ? "text-accent" : "")}
          variants={{ hide: { opacity: 0, y: 14, filter: "blur(6px)" }, show: { opacity: 1, y: 0, filter: "blur(0px)" } }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {w.text}
          {i < words.length - 1 ? " " : ""}
        </motion.span>
      ))}
    </motion.h2>
  );
}
