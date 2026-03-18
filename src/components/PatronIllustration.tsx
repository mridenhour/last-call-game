import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Circle, Rect, Ellipse, Path, G, Polygon,
} from 'react-native-svg';
import { AIPatron } from '../game/aiTypes';

interface PatronIllustrationProps {
  patron: AIPatron;
  size?: number;
}

// ── Style categories ─────────────────────────────────────────────────────────

type ClothingStyle = 'vip' | 'formal' | 'smart' | 'casual' | 'scruffy' | 'disheveled';

function getClothingStyle(sobriety: number): ClothingStyle {
  if (sobriety >= 85) return 'vip';
  if (sobriety >= 70) return 'formal';
  if (sobriety >= 50) return 'smart';
  if (sobriety >= 32) return 'casual';
  if (sobriety >= 16) return 'scruffy';
  return 'disheveled';
}

// Palette per clothing style
const STYLE_PALETTE: Record<ClothingStyle, { top: string; bottom: string; accent: string; label: string }> = {
  vip:        { top: '#111', bottom: '#222', accent: '#FFD700', label: 'VIP' },
  formal:     { top: '#1A2240', bottom: '#1A2240', accent: '#8899CC', label: 'Formal' },
  smart:      { top: '#2A4060', bottom: '#334D44', accent: '#66AACC', label: 'Smart Casual' },
  casual:     { top: '#44335A', bottom: '#2A3A55', accent: '#8866AA', label: 'Casual' },
  scruffy:    { top: '#4A3322', bottom: '#3A3322', accent: '#887766', label: 'Scruffy' },
  disheveled: { top: '#3A2A18', bottom: '#2A2218', accent: '#AA7744', label: 'Disheveled' },
};

// Skin tones — pick by name hash
const SKIN_TONES = ['#FDDBB4', '#F0C08A', '#C8885A', '#A0623A', '#7A4228'];
const HAIR_COLORS = ['#1A1008', '#3A2010', '#6A4020', '#8B6040', '#C8A060', '#888888', '#CC4422'];

function nameHash(name: string): number {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffff;
  return h;
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function PatronIllustration({ patron, size = 160 }: PatronIllustrationProps) {
  const style = getClothingStyle(patron.sobriety);
  const palette = STYLE_PALETTE[style];

  const hash = nameHash(patron.name);
  const skin = SKIN_TONES[hash % SKIN_TONES.length];
  const hair = HAIR_COLORS[(hash >> 3) % HAIR_COLORS.length];
  const isMale = patron.gender === 'male';
  const isVeryDrunk = patron.sobriety < 20;

  // Scale factor — all coordinates designed for viewBox 100x180
  const vw = 100;
  const vh = 180;

  // Body tilt for very drunk
  const tiltDeg = isVeryDrunk ? 8 : 0;

  return (
    <View style={[styles.container, { width: size, height: size * (vh / vw) }]}>
      <Svg width={size} height={size * (vh / vw)} viewBox={`0 0 ${vw} ${vh}`}>

        {/* Shadow ellipse */}
        <Ellipse cx={50} cy={172} rx={28} ry={5} fill="rgba(0,0,0,0.35)" />

        <G rotation={tiltDeg} origin="50,110">

          {/* ── Legs ── */}
          {isMale ? (
            <>
              <Rect x={36} y={118} width={12} height={42} rx={5} fill={palette.bottom} />
              <Rect x={52} y={118} width={12} height={42} rx={5} fill={palette.bottom} />
              {/* Shoes */}
              <Ellipse cx={42} cy={160} rx={9} ry={5} fill="#1A1A1A" />
              <Ellipse cx={58} cy={160} rx={9} ry={5} fill="#1A1A1A" />
            </>
          ) : (
            <>
              {/* Skirt/pants for female */}
              <Path d={`M36,118 Q50,130 64,118 L60,160 L40,160 Z`} fill={palette.bottom} />
              <Ellipse cx={42} cy={160} rx={7} ry={4} fill="#1A1A1A" />
              <Ellipse cx={58} cy={160} rx={7} ry={4} fill="#1A1A1A" />
            </>
          )}

          {/* ── Body / Torso ── */}
          {isMale ? (
            <Path d="M28,80 L72,80 L68,120 L32,120 Z" fill={palette.top} />
          ) : (
            <Path d="M32,80 L68,80 L65,120 L35,120 Z" fill={palette.top} />
          )}

          {/* VIP / Formal lapels */}
          {(style === 'vip' || style === 'formal') && (
            <>
              <Path d="M50,82 L44,100 L50,96 L56,100 Z" fill="#EEE" />
              <Path d="M50,82 L44,100" stroke={palette.accent} strokeWidth={1} />
              <Path d="M50,82 L56,100" stroke={palette.accent} strokeWidth={1} />
            </>
          )}

          {/* Smart casual collar */}
          {style === 'smart' && (
            <Path d="M45,80 L50,88 L55,80" stroke="#AAC" strokeWidth={1.5} fill="none" />
          )}

          {/* Scruffy / disheveled rumpled lines */}
          {(style === 'scruffy' || style === 'disheveled') && (
            <>
              <Path d="M38,90 Q45,95 42,105" stroke="rgba(0,0,0,0.25)" strokeWidth={1} fill="none" />
              <Path d="M58,88 Q53,96 56,106" stroke="rgba(0,0,0,0.25)" strokeWidth={1} fill="none" />
            </>
          )}

          {/* ── Arms ── */}
          {isVeryDrunk ? (
            // Drunk arms: one raised, one flailed
            <>
              <Rect x={14} y={76} width={16} height={9} rx={4} fill={skin} transform="rotate(-40,22,80)" />
              <Rect x={70} y={88} width={16} height={9} rx={4} fill={skin} transform="rotate(20,78,92)" />
            </>
          ) : (
            <>
              <Rect x={16} y={80} width={14} height={32} rx={6} fill={palette.top} />
              <Rect x={70} y={80} width={14} height={32} rx={6} fill={palette.top} />
              {/* Hands */}
              <Circle cx={23} cy={113} r={6} fill={skin} />
              <Circle cx={77} cy={113} r={6} fill={skin} />
            </>
          )}

          {/* ── Neck ── */}
          <Rect x={44} y={58} width={12} height={22} rx={4} fill={skin} />

          {/* ── Head ── */}
          <Ellipse cx={50} cy={38} rx={22} ry={26} fill={skin} />

          {/* ── Hair ── */}
          {isMale ? (
            <Path
              d={`M28,32 Q28,8 50,10 Q72,8 72,32 Q65,20 50,22 Q35,20 28,32 Z`}
              fill={hair}
            />
          ) : (
            <>
              {/* Female: longer hair */}
              <Path
                d={`M28,32 Q26,10 50,8 Q74,10 72,32 Q65,18 50,20 Q35,18 28,32 Z`}
                fill={hair}
              />
              <Path
                d={`M28,32 Q22,50 26,68 Q30,56 32,64 Q34,72 38,68 Q36,54 38,48`}
                fill={hair}
              />
              <Path
                d={`M72,32 Q78,50 74,68 Q70,56 68,64 Q66,72 62,68 Q64,54 62,48`}
                fill={hair}
              />
            </>
          )}

          {/* ── Eyes ── */}
          {isVeryDrunk ? (
            // Drunk: squinted / swirly eyes
            <>
              <Path d="M38,36 Q41,33 44,36" stroke="#333" strokeWidth={2} fill="none" strokeLinecap="round" />
              <Path d="M56,36 Q59,33 62,36" stroke="#333" strokeWidth={2} fill="none" strokeLinecap="round" />
            </>
          ) : (
            <>
              <Ellipse cx={41} cy={37} rx={4} ry={4.5} fill="white" />
              <Ellipse cx={59} cy={37} rx={4} ry={4.5} fill="white" />
              <Circle cx={42} cy={37} r={2.5} fill="#333" />
              <Circle cx={60} cy={37} r={2.5} fill="#333" />
              {/* Eye shine */}
              <Circle cx={43} cy={36} r={0.8} fill="white" />
              <Circle cx={61} cy={36} r={0.8} fill="white" />
            </>
          )}

          {/* ── Mouth ── */}
          {isVeryDrunk ? (
            <Path d="M44,50 Q50,54 56,50" stroke="#AA4444" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ) : patron.sobriety >= 60 ? (
            // Neutral/slight smile
            <Path d="M44,50 Q50,54 56,50" stroke="#AA6666" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          ) : (
            // Flat / slight frown
            <Path d="M44,52 Q50,50 56,52" stroke="#AA6666" strokeWidth={1.5} fill="none" strokeLinecap="round" />
          )}

          {/* ── Accessories ── */}
          {style === 'vip' && (
            // Bow tie
            <Path d="M46,78 L50,82 L54,78 L50,74 Z" fill={palette.accent} />
          )}
          {style === 'formal' && (
            // Tie
            <Path d="M48,80 L50,100 L52,80 L50,76 Z" fill={palette.accent} />
          )}
          {(style === 'scruffy' || style === 'disheveled') && (
            // Stubble dots
            <>
              <Circle cx={43} cy={56} r={1} fill="rgba(0,0,0,0.2)" />
              <Circle cx={47} cy={58} r={1} fill="rgba(0,0,0,0.2)" />
              <Circle cx={53} cy={58} r={1} fill="rgba(0,0,0,0.2)" />
              <Circle cx={57} cy={56} r={1} fill="rgba(0,0,0,0.2)" />
            </>
          )}

          {/* VIP accent collar pin */}
          {style === 'vip' && (
            <Circle cx={50} cy={84} r={2} fill={palette.accent} />
          )}

        </G>
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'flex-end' },
});
