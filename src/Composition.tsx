import React from "react";
import {
  AbsoluteFill,
  Audio,
  Easing,
  Sequence,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

/* ------------------------------------------------------------------ */
/* CONFIG – edit text, colours and numbers here                        */
/* ------------------------------------------------------------------ */
export const FPS = 30;
export const TOTAL_FRAMES = 900; // 30 seconds
export const WIDTH = 1080; // 9:16 vertical
export const HEIGHT = 1920;

const BRAND = "Webinex Solutions";
const WEBSITE = "www.webinexsolutions.com"; // <- change to your real site
const PHONE = "8383899651";
const AUDIO_FILE = "music.wav"; // put your file inside the /public folder

const C = {
  bg: "#070B1F",
  primary: "#4F7CFF",
  accent: "#00E5C3",
  hot: "#FF5C8A",
  gold: "#FFB547",
  text: "#FFFFFF",
  muted: "#A9B4D6",
};

const FONT = `"Poppins","Inter","Segoe UI",Helvetica,Arial,sans-serif`;

// Scene timing (frames @30fps)
const T = {
  intro: { from: 0, dur: 90 }, // 0–3s
  hook: { from: 90, dur: 105 }, // 3–6.5s
  services: { from: 195, dur: 120 }, // 4 x 4s (6.5s–22.5s)
  stats: { from: 675, dur: 120 }, // 22.5–26.5s
  cta: { from: 795, dur: 105 }, // 26.5–30s
};

type Service = {
  kind: "web" | "seo" | "smo" | "ppc";
  title: string;
  desc: string;
  bullets: string[];
  color: string;
};

const SERVICES: Service[] = [
  {
    kind: "web",
    title: "Website Design & Development",
    desc: "Fast, modern, mobile-first websites that turn visitors into customers.",
    bullets: ["Custom UI / UX Design", "WordPress, React & E-commerce", "Speed & Security Optimised"],
    color: C.primary,
  },
  {
    kind: "seo",
    title: "SEO",
    desc: "Rank higher on Google and get organic traffic that keeps growing.",
    bullets: ["Keyword & Competitor Research", "On-Page & Technical SEO", "Local SEO & Link Building"],
    color: C.accent,
  },
  {
    kind: "smo",
    title: "Social Media Optimization",
    desc: "Build a loyal community and a brand people love to follow.",
    bullets: ["Content & Creative Design", "Instagram, Facebook, LinkedIn", "Engagement & Growth Strategy"],
    color: C.hot,
  },
  {
    kind: "ppc",
    title: "PPC Advertising",
    desc: "Smart paid campaigns that bring leads and sales from day one.",
    bullets: ["Google & Meta Ads", "Conversion Tracking", "Maximum ROI, Less Waste"],
    color: C.gold,
  },
];

// NOTE: placeholder numbers – replace with your real achievements
const STATS = [
  { value: 250, suffix: "+", label: "Projects Delivered" },
  { value: 150, suffix: "+", label: "Happy Clients" },
  { value: 98, suffix: "%", label: "Client Satisfaction" },
  { value: 5, suffix: "x", label: "Average Traffic Growth" },
];

/* ------------------------------------------------------------------ */
/* HELPERS                                                             */
/* ------------------------------------------------------------------ */
const useSpring = (delay = 0, damping = 14, stiffness = 120) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return spring({ frame: frame - delay, fps, config: { damping, stiffness } });
};

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

const useCount = (to: number, start = 0, len = 45) => {
  const frame = useCurrentFrame();
  return Math.round(
    interpolate(frame, [start, start + len], [0, to], {
      ...clamp,
      easing: Easing.out(Easing.cubic),
    })
  );
};

const SceneFade: React.FC<{ duration: number; children: React.ReactNode }> = ({
  duration,
  children,
}) => {
  const frame = useCurrentFrame();
  const opacity = interpolate(frame, [0, 10, duration - 10, duration], [0, 1, 1, 0], clamp);
  return <AbsoluteFill style={{ opacity }}>{children}</AbsoluteFill>;
};

const glass: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.14)",
  borderRadius: 28,
  backdropFilter: "blur(14px)",
  boxShadow: "0 30px 80px rgba(0,0,0,0.35)",
};

const VIS_W = 900;
const VIS_H = 520;

/* ------------------------------------------------------------------ */
/* BACKGROUND (runs for the whole video)                               */
/* ------------------------------------------------------------------ */
const Blob: React.FC<{
  size: number;
  color: string;
  x: number;
  y: number;
  phase: number;
}> = ({ size, color, x, y, phase }) => {
  const frame = useCurrentFrame();
  const dx = Math.sin(frame / 60 + phase) * 120;
  const dy = Math.cos(frame / 75 + phase) * 160;
  return (
    <div
      style={{
        position: "absolute",
        left: x + dx,
        top: y + dy,
        width: size,
        height: size,
        borderRadius: "50%",
        background: color,
        filter: "blur(150px)",
        opacity: 0.45,
      }}
    />
  );
};

const Background: React.FC = () => {
  const frame = useCurrentFrame();
  const gridShift = (frame * 0.6) % 80;
  return (
    <AbsoluteFill style={{ background: C.bg }}>
      <Blob size={720} color={C.primary} x={-250} y={-100} phase={0} />
      <Blob size={700} color={C.accent} x={500} y={1100} phase={2} />
      <Blob size={560} color={C.hot} x={450} y={300} phase={4} />
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "80px 80px",
          backgroundPosition: `${gridShift}px ${gridShift}px`,
        }}
      />
    </AbsoluteFill>
  );
};

const ProgressBar: React.FC = () => {
  const frame = useCurrentFrame();
  const pct = (frame / TOTAL_FRAMES) * 100;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        height: 10,
        width: `${pct}%`,
        background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
      }}
    />
  );
};

/* Persistent "DM us now" strip shown during services + stats */
const DmStrip: React.FC = () => {
  const frame = useCurrentFrame();
  const p = useSpring(0);
  const pulse = 1 + Math.sin(frame / 6) * 0.02;
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 230,
        display: "flex",
        justifyContent: "center",
        opacity: p,
        transform: `translateY(${(1 - p) * 60}px) scale(${pulse})`,
      }}
    >
      <div
        style={{
          ...glass,
          borderRadius: 60,
          padding: "20px 46px",
          fontSize: 38,
          fontWeight: 700,
          display: "flex",
          gap: 18,
          alignItems: "center",
        }}
      >
        <span style={{ color: C.accent }}>DM US NOW</span>
        <span style={{ color: C.muted }}>•</span>
        <span>{PHONE}</span>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 1 – INTRO                                                     */
/* ------------------------------------------------------------------ */
const Logo: React.FC<{ size?: number }> = ({ size = 190 }) => {
  const s = useSpring(0, 10, 100);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.28,
        background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: size * 0.6,
        fontWeight: 800,
        color: "#fff",
        transform: `scale(${s}) rotate(${(1 - s) * -90}deg)`,
        boxShadow: `0 0 80px ${C.primary}88`,
      }}
    >
      W
    </div>
  );
};

const AnimatedWord: React.FC<{ word: string; size: number; start: number; color?: string }> = ({
  word,
  size,
  start,
  color = C.text,
}) => {
  const frame = useCurrentFrame();
  return (
    <div style={{ display: "flex", gap: 4 }}>
      {word.split("").map((l, i) => {
        const p = interpolate(frame, [start + i * 2, start + 12 + i * 2], [0, 1], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <span
            key={i}
            style={{
              fontSize: size,
              fontWeight: 800,
              letterSpacing: 6,
              color,
              opacity: p,
              transform: `translateY(${(1 - p) * 50}px)`,
              display: "inline-block",
            }}
          >
            {l}
          </span>
        );
      })}
    </div>
  );
};

const Intro: React.FC = () => {
  const tag = useSpring(48);
  const [w1, w2] = BRAND.toUpperCase().split(" ");
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 30 }}>
      <Logo />
      <div style={{ height: 20 }} />
      <AnimatedWord word={w1} size={150} start={16} />
      <AnimatedWord word={w2} size={112} start={30} color={C.accent} />
      <div
        style={{
          fontSize: 38,
          color: C.muted,
          letterSpacing: 6,
          marginTop: 20,
          opacity: tag,
          transform: `translateY(${(1 - tag) * 30}px)`,
          fontWeight: 500,
          textAlign: "center",
        }}
      >
        DESIGN • DEVELOP • DOMINATE
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 2 – HOOK                                                      */
/* ------------------------------------------------------------------ */
const Hook: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const lines = [
    ["Is", "your", "website"],
    ["really", "working"],
    ["for", "you?"],
  ];
  let idx = 0;
  const sub = useSpring(55);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", padding: "0 60px" }}>
      <div style={{ fontSize: 118, fontWeight: 800, textAlign: "center", lineHeight: 1.2 }}>
        {lines.map((line, li) => (
          <div key={li}>
            {line.map((w) => {
              const i = idx++;
              const hot = w === "really" || w === "you?";
              const p = spring({ frame: frame - i * 6, fps, config: { damping: 12, stiffness: 140 } });
              return (
                <span
                  key={w + i}
                  style={{
                    display: "inline-block",
                    marginRight: 26,
                    opacity: p,
                    transform: `translateY(${(1 - p) * 60}px) scale(${0.8 + p * 0.2})`,
                    color: hot ? C.hot : C.text,
                  }}
                >
                  {w}
                </span>
              );
            })}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 70,
          fontSize: 48,
          color: C.muted,
          textAlign: "center",
          opacity: sub,
          transform: `translateY(${(1 - sub) * 30}px)`,
        }}
      >
        Let’s turn clicks into
        <br />
        <span style={{ color: C.accent, fontWeight: 800, fontSize: 64 }}>customers.</span>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 3 – SERVICES                                                  */
/* ------------------------------------------------------------------ */
const WebVisual: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const card = useSpring(5);
  const hero = useSpring(15);
  return (
    <div style={{ ...glass, width: VIS_W, height: VIS_H, padding: 28, transform: `scale(${card})` }}>
      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        {["#FF5F57", "#FEBC2E", "#28C840"].map((c) => (
          <div key={c} style={{ width: 16, height: 16, borderRadius: 8, background: c }} />
        ))}
        <div style={{ flex: 1, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.1)", marginLeft: 16 }} />
      </div>
      <div
        style={{
          height: 180,
          borderRadius: 18,
          background: `linear-gradient(120deg, ${color}, ${C.accent})`,
          transform: `scaleX(${hero})`,
          transformOrigin: "left",
          marginBottom: 20,
          padding: 26,
        }}
      >
        <div style={{ width: "55%", height: 22, borderRadius: 11, background: "rgba(255,255,255,0.85)" }} />
        <div style={{ width: "35%", height: 14, borderRadius: 7, background: "rgba(255,255,255,0.5)", marginTop: 14 }} />
        <div style={{ width: 120, height: 36, borderRadius: 18, background: "#fff", marginTop: 20 }} />
      </div>
      <div style={{ display: "flex", gap: 18 }}>
        {[0, 1, 2].map((i) => {
          const p = spring({ frame: frame - 30 - i * 8, fps: FPS, config: { damping: 12 } });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 200,
                borderRadius: 16,
                background: "rgba(255,255,255,0.08)",
                transform: `translateY(${(1 - p) * 60}px)`,
                opacity: p,
                padding: 16,
              }}
            >
              <div style={{ width: 50, height: 50, borderRadius: 14, background: color, opacity: 0.9 }} />
              <div style={{ width: "80%", height: 12, borderRadius: 6, background: "rgba(255,255,255,0.4)", marginTop: 18 }} />
              <div style={{ width: "55%", height: 10, borderRadius: 5, background: "rgba(255,255,255,0.2)", marginTop: 10 }} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const SeoVisual: React.FC<{ color: string }> = ({ color }) => {
  const frame = useCurrentFrame();
  const card = useSpring(5);
  const badge = useSpring(70, 8, 160);
  const query = "best web company";
  const typed = query.slice(0, Math.max(0, Math.floor((frame - 10) / 2)));
  const draw = interpolate(frame, [25, 85], [0, 1], { ...clamp, easing: Easing.out(Easing.cubic) });
  return (
    <div style={{ ...glass, width: VIS_W, height: VIS_H, padding: 30, transform: `scale(${card})`, position: "relative" }}>
      <div
        style={{
          height: 70,
          borderRadius: 35,
          background: "rgba(255,255,255,0.1)",
          display: "flex",
          alignItems: "center",
          padding: "0 30px",
          fontSize: 30,
          color: C.text,
        }}
      >
        <span style={{ color: C.muted, marginRight: 14, fontWeight: 700 }}>Q</span>
        {typed}
        <span style={{ opacity: frame % 20 < 10 ? 1 : 0, color }}>|</span>
      </div>
      <svg viewBox="0 0 700 360" style={{ width: "100%", marginTop: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <line key={i} x1="0" x2="700" y1={60 + i * 90} y2={60 + i * 90} stroke="rgba(255,255,255,0.08)" />
        ))}
        <path
          d="M20 330 C 140 320, 200 250, 300 230 S 480 120, 680 30"
          fill="none"
          stroke={color}
          strokeWidth="10"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          strokeDashoffset={1 - draw}
        />
      </svg>
      <div
        style={{
          position: "absolute",
          right: 36,
          top: 140,
          padding: "14px 28px",
          borderRadius: 40,
          background: color,
          color: "#04121A",
          fontWeight: 800,
          fontSize: 36,
          transform: `scale(${badge})`,
          boxShadow: `0 0 50px ${color}99`,
        }}
      >
        #1 on Google
      </div>
    </div>
  );
};

const SmoVisual: React.FC<{ color: string }> = ({ color }) => {
  const card = useSpring(5);
  const frame = useCurrentFrame();
  const items = [
    { label: "Followers", to: 12400, fmt: (n: number) => `+${(n / 1000).toFixed(1)}K` },
    { label: "Likes", to: 48000, fmt: (n: number) => `${Math.round(n / 1000)}K` },
    { label: "Shares", to: 9200, fmt: (n: number) => `${(n / 1000).toFixed(1)}K` },
  ];
  return (
    <div
      style={{
        ...glass,
        width: VIS_W,
        height: VIS_H,
        padding: 36,
        transform: `scale(${card})`,
        display: "flex",
        flexDirection: "column",
        gap: 22,
        justifyContent: "center",
      }}
    >
      {items.map((it, i) => {
        const p = spring({ frame: frame - 10 - i * 10, fps: FPS, config: { damping: 12 } });
        const n = interpolate(frame, [20 + i * 10, 80 + i * 10], [0, it.to], {
          ...clamp,
          easing: Easing.out(Easing.cubic),
        });
        return (
          <div
            key={it.label}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 24,
              padding: "20px 28px",
              borderRadius: 24,
              background: "rgba(255,255,255,0.08)",
              transform: `translateX(${(1 - p) * 140}px)`,
              opacity: p,
            }}
          >
            <div
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                background: `linear-gradient(135deg, ${color}, ${C.gold})`,
                boxShadow: `0 0 30px ${color}88`,
                transform: `scale(${1 + Math.sin((frame + i * 10) / 6) * 0.06})`,
              }}
            />
            <div style={{ flex: 1, fontSize: 36, color: C.muted, fontWeight: 500 }}>{it.label}</div>
            <div style={{ fontSize: 56, fontWeight: 800, color: C.text }}>{it.fmt(n)}</div>
          </div>
        );
      })}
    </div>
  );
};

const PpcVisual: React.FC<{ color: string }> = ({ color }) => {
  const card = useSpring(5);
  const frame = useCurrentFrame();
  const bars = [0.25, 0.4, 0.35, 0.6, 0.78, 1];
  const roi = useCount(320, 30, 50);
  return (
    <div style={{ ...glass, width: VIS_W, height: VIS_H, padding: 36, transform: `scale(${card})` }}>
      <div style={{ fontSize: 30, color: C.muted, fontWeight: 500 }}>Campaign Performance</div>
      <div style={{ fontSize: 84, fontWeight: 800, color, marginTop: 6 }}>ROI +{roi}%</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 22, height: 260, marginTop: 20 }}>
        {bars.map((b, i) => {
          const p = spring({ frame: frame - 12 - i * 6, fps: FPS, config: { damping: 14 } });
          return (
            <div
              key={i}
              style={{
                flex: 1,
                height: 260 * b * p,
                borderRadius: 14,
                background:
                  i === bars.length - 1 ? `linear-gradient(180deg, ${color}, ${C.hot})` : "rgba(255,255,255,0.18)",
                boxShadow: i === bars.length - 1 ? `0 0 40px ${color}88` : undefined,
              }}
            />
          );
        })}
      </div>
    </div>
  );
};

const Visual: React.FC<{ s: Service }> = ({ s }) => {
  switch (s.kind) {
    case "web":
      return <WebVisual color={s.color} />;
    case "seo":
      return <SeoVisual color={s.color} />;
    case "smo":
      return <SmoVisual color={s.color} />;
    default:
      return <PpcVisual color={s.color} />;
  }
};

const ServiceScene: React.FC<{ s: Service; index: number }> = ({ s, index }) => {
  const enter = useSpring(0);
  const frame = useCurrentFrame();
  return (
    <AbsoluteFill
      style={{
        alignItems: "center",
        justifyContent: "flex-start",
        padding: "170px 90px 0",
        gap: 30,
      }}
    >
      <div style={{ width: "100%", transform: `translateY(${(1 - enter) * -80}px)`, opacity: enter }}>
        <div style={{ fontSize: 110, fontWeight: 800, color: s.color, opacity: 0.4, lineHeight: 1 }}>
          0{index + 1}
        </div>
        <div style={{ fontSize: s.title.length > 20 ? 78 : 110, fontWeight: 800, lineHeight: 1.05, marginTop: 4 }}>
          {s.title}
        </div>
        <div style={{ width: 120, height: 8, borderRadius: 4, background: s.color, margin: "22px 0" }} />
        <div style={{ fontSize: 32, color: C.muted, lineHeight: 1.4 }}>{s.desc}</div>
        <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 16 }}>
          {s.bullets.map((b, i) => {
            const p = interpolate(frame, [30 + i * 10, 44 + i * 10], [0, 1], clamp);
            return (
              <div
                key={b}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 18,
                  fontSize: 34,
                  fontWeight: 600,
                  opacity: p,
                  transform: `translateX(${(1 - p) * 40}px)`,
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 19,
                    background: s.color,
                    color: "#04121A",
                    fontSize: 22,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  ✓
                </div>
                {b}
              </div>
            );
          })}
        </div>
      </div>
      <div style={{ marginTop: 10, transform: `translateY(${(1 - enter) * 160}px)`, opacity: enter }}>
        <Visual s={s} />
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 4 – STATS                                                     */
/* ------------------------------------------------------------------ */
const StatCard: React.FC<{ stat: (typeof STATS)[number]; i: number }> = ({ stat, i }) => {
  const p = useSpring(i * 8);
  const n = useCount(stat.value, 10 + i * 8, 50);
  return (
    <div
      style={{
        ...glass,
        width: 450,
        padding: "50px 16px",
        textAlign: "center",
        transform: `translateY(${(1 - p) * 100}px) scale(${0.85 + p * 0.15})`,
        opacity: p,
      }}
    >
      <div
        style={{
          fontSize: 110,
          fontWeight: 800,
          background: `linear-gradient(135deg, ${C.primary}, ${C.accent})`,
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        {n}
        {stat.suffix}
      </div>
      <div style={{ fontSize: 30, color: C.muted, marginTop: 8, fontWeight: 500 }}>{stat.label}</div>
    </div>
  );
};

const Stats: React.FC = () => {
  const head = useSpring(0);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 60, paddingBottom: 150 }}>
      <div
        style={{
          fontSize: 88,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.1,
          padding: "0 60px",
          opacity: head,
          transform: `translateY(${(1 - head) * 40}px)`,
        }}
      >
        Results that
        <br />
        <span style={{ color: C.accent }}>speak for themselves</span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 30, width: 930, justifyContent: "center" }}>
        {STATS.map((s, i) => (
          <StatCard key={s.label} stat={s} i={i} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* SCENE 5 – CTA                                                       */
/* ------------------------------------------------------------------ */
const Cta: React.FC = () => {
  const frame = useCurrentFrame();
  const a = useSpring(0);
  const b = useSpring(10);
  const c = useSpring(22);
  const d = useSpring(36);
  const e = useSpring(52);
  const pulse = 1 + Math.sin(frame / 5) * 0.035;
  const chips = ["Web Design", "Development", "SEO", "SMO", "PPC", "Branding"];
  return (
    <AbsoluteFill
      style={{ alignItems: "center", justifyContent: "center", gap: 34, padding: "0 70px", paddingBottom: 120 }}
    >
      <div style={{ transform: `scale(${a})` }}>
        <Logo size={140} />
      </div>
      <div
        style={{
          fontSize: 100,
          fontWeight: 800,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: b,
          transform: `translateY(${(1 - b) * 50}px)`,
        }}
      >
        Let’s Grow Your
        <br />
        <span style={{ color: C.accent }}>Business</span>
      </div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: 14,
          justifyContent: "center",
          opacity: c,
          transform: `translateY(${(1 - c) * 30}px)`,
        }}
      >
        {chips.map((ch) => (
          <div
            key={ch}
            style={{
              padding: "12px 26px",
              borderRadius: 30,
              border: `2px solid ${C.primary}`,
              background: "rgba(79,124,255,0.15)",
              fontSize: 28,
              fontWeight: 600,
            }}
          >
            {ch}
          </div>
        ))}
      </div>
      <div
        style={{
          marginTop: 10,
          padding: "30px 70px",
          borderRadius: 70,
          background: `linear-gradient(90deg, ${C.hot}, ${C.gold})`,
          fontSize: 78,
          fontWeight: 800,
          color: "#1A0A12",
          transform: `scale(${d * pulse})`,
          boxShadow: `0 0 80px ${C.hot}99`,
          letterSpacing: 2,
        }}
      >
        DM US NOW!
      </div>
      <div style={{ textAlign: "center", opacity: e, transform: `translateY(${(1 - e) * 30}px)` }}>
        <div style={{ fontSize: 34, color: C.muted, marginBottom: 6 }}>Call / WhatsApp</div>
        <div
          style={{
            fontSize: 96,
            fontWeight: 800,
            letterSpacing: 3,
            background: `linear-gradient(90deg, ${C.primary}, ${C.accent})`,
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          {PHONE}
        </div>
        <div style={{ fontSize: 34, color: C.text, fontWeight: 600, marginTop: 14 }}>{WEBSITE}</div>
      </div>
    </AbsoluteFill>
  );
};

/* ------------------------------------------------------------------ */
/* MAIN COMPOSITION                                                    */
/* ------------------------------------------------------------------ */
export const WebinexPromo: React.FC = () => {
  return (
    <AbsoluteFill style={{ fontFamily: FONT, color: C.text }}>
      <Background />

      {/* Background music: fades in, fades out in the last 1.5s */}
      <Audio
        src={staticFile(AUDIO_FILE)}
        volume={(f) =>
          interpolate(f, [0, 20, TOTAL_FRAMES - 45, TOTAL_FRAMES], [0, 0.8, 0.8, 0], clamp)
        }
      />

      <Sequence from={T.intro.from} durationInFrames={T.intro.dur}>
        <SceneFade duration={T.intro.dur}>
          <Intro />
        </SceneFade>
      </Sequence>

      <Sequence from={T.hook.from} durationInFrames={T.hook.dur}>
        <SceneFade duration={T.hook.dur}>
          <Hook />
        </SceneFade>
      </Sequence>

      {SERVICES.map((s, i) => (
        <Sequence
          key={s.kind}
          from={T.services.from + i * T.services.dur}
          durationInFrames={T.services.dur}
        >
          <SceneFade duration={T.services.dur}>
            <ServiceScene s={s} index={i} />
          </SceneFade>
        </Sequence>
      ))}

      <Sequence from={T.stats.from} durationInFrames={T.stats.dur}>
        <SceneFade duration={T.stats.dur}>
          <Stats />
        </SceneFade>
      </Sequence>

      {/* DM strip across services + stats */}
      <Sequence from={T.services.from} durationInFrames={T.cta.from - T.services.from}>
        <DmStrip />
      </Sequence>

      <Sequence from={T.cta.from} durationInFrames={T.cta.dur}>
        <SceneFade duration={T.cta.dur}>
          <Cta />
        </SceneFade>
      </Sequence>

      <ProgressBar />
    </AbsoluteFill>
  );
};