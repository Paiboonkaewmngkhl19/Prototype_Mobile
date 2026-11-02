import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

const SPLASH = `${import.meta.env.BASE_URL}tv-features-test/Video/Splash_9x16.mp4`;
// The clip runs 3.85s: if it stalls on a slow connection, the app still opens
const MAX_MS = 6000;

// ─── Splash ───────────────────────────────────────────────────────────────────────────────────────────────────────
// Plays the AIS PLAY logo clip once over the app each time it's opened, then fades into the page underneath. It's
// cropped to fill the screen, which only trims the sides on a tall phone: the logo stays inside the visible area.
export default function SplashScreen({ muted }: { muted: boolean }) {
  const video = useRef<HTMLVideoElement>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setDone(true), MAX_MS);
    // Autoplay can be refused (iOS Low Power Mode): skip the splash instead of holding on a blank screen
    video.current?.play().catch(() => setDone(true));
    return () => clearTimeout(t);
  }, []);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="splash"
          className="absolute inset-0 z-[80] bg-black"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <video ref={video} src={SPLASH} autoPlay muted={muted} playsInline preload="auto"
            className="absolute inset-0 w-full h-full object-cover pointer-events-none"
            onEnded={() => setDone(true)} onError={() => setDone(true)} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
