export default function SleepArcChart() {
  const cx = 90,
    cy = 90,
    r = 70;
  const strokeW = 14;
  const circumference = 2 * Math.PI * r;
  // 8h sleep out of 24h = 33%
  const sleepFraction = 8 / 24;
  const dash = sleepFraction * circumference;

  return (
    <svg
      width="180"
      height="180"
      viewBox="0 0 180 180"
      style={{ flexShrink: 0 }}
    >
      {/* Track */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="rgba(255,255,255,0.06)"
        strokeWidth={strokeW}
      />
      {/* Sleep arc (indigo) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#sleepGrad)"
        strokeWidth={strokeW}
        strokeDasharray={`${dash} ${circumference - dash}`}
        strokeDashoffset={circumference * 0.25}
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 8px rgba(99,102,241,0.6))' }}
      />
      {/* Wake arc (cyan) */}
      <circle
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke="url(#wakeGrad)"
        strokeWidth={strokeW}
        strokeDasharray={`${circumference - dash - 8} ${dash + 8}`}
        strokeDashoffset={circumference * 0.25 - dash - 4}
        strokeLinecap="round"
        opacity="0.35"
      />
      {/* Center */}
      <text
        x={cx}
        y={cy - 8}
        textAnchor="middle"
        fill="#e8eeff"
        fontSize="22"
        fontWeight="800"
        fontFamily="Syne, sans-serif"
      >
        8h
      </text>
      <text
        x={cx}
        y={cy + 12}
        textAnchor="middle"
        fill="rgba(200,216,255,0.5)"
        fontSize="10"
        fontFamily="DM Sans, sans-serif"
      >
        sleep window
      </text>

      {/* Start dot */}
      <circle
        cx={cx}
        cy={cy - r}
        r="5"
        fill="#6366f1"
        style={{ filter: 'drop-shadow(0 0 4px #6366f1)' }}
      />
      <text
        x={cx + 10}
        y={cy - r + 4}
        fill="rgba(200,216,255,0.6)"
        fontSize="9"
        fontFamily="DM Sans, sans-serif"
      >
        10 PM
      </text>

      {/* End dot */}
      <circle
        cx={cx}
        cy={cy - r}
        r="5"
        fill="#06b6d4"
        style={{
          filter: 'drop-shadow(0 0 4px #06b6d4)',
          transform: `rotate(${sleepFraction * 360}deg)`,
          transformOrigin: `${cx}px ${cy}px`,
        }}
      />

      <defs>
        <linearGradient id="sleepGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
        <linearGradient id="wakeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
    </svg>
  );
}
