// DESIGN.md → Tailwind CSS 设计令牌映射
// 基于 template/DESIGN.md 的完整设计系统

export const DESIGN_TOKENS = {
  colors: {
    // 品牌 & 主色
    primary: "#5645d4",
    "primary-pressed": "#4534b3",
    "primary-deep": "#3a2a99",
    "on-primary": "#ffffff",

    // 品牌深蓝（Hero背景）
    "brand-navy": "#0a1530",
    "brand-navy-deep": "#070f24",
    "brand-navy-mid": "#1a2a52",

    // 链接蓝
    "link-blue": "#0075de",
    "link-blue-pressed": "#005bab",

    // 品牌色光谱
    "brand-orange": "#dd5b00",
    "brand-orange-deep": "#793400",
    "brand-pink": "#ff64c8",
    "brand-pink-deep": "#a02e6d",
    "brand-purple": "#7b3ff2",
    "brand-purple-300": "#d6b6f6",
    "brand-purple-800": "#391c57",
    "brand-teal": "#2a9d99",
    "brand-green": "#1aae39",
    "brand-yellow": "#f5d75e",
    "brand-brown": "#523410",

    // 卡片底色（Pastel）
    "card-tint-peach": "#ffe8d4",
    "card-tint-rose": "#fde0ec",
    "card-tint-mint": "#d9f3e1",
    "card-tint-lavender": "#e6e0f5",
    "card-tint-sky": "#dcecfa",
    "card-tint-yellow": "#fef7d6",
    "card-tint-yellow-bold": "#f9e79f",
    "card-tint-cream": "#f8f5e8",
    "card-tint-gray": "#f0eeec",

    // 表面色
    canvas: "#ffffff",
    surface: "#f6f5f4",
    "surface-soft": "#fafaf9",

    // 分割线
    hairline: "#e5e3df",
    "hairline-soft": "#ede9e4",
    "hairline-strong": "#c8c4be",

    // 文字色
    "ink-deep": "#000000",
    ink: "#1a1a1a",
    charcoal: "#37352f",
    slate: "#5d5b54",
    steel: "#787671",
    stone: "#a4a097",
    muted: "#bbb8b1",

    // 深色表面上的文字
    "on-dark": "#ffffff",
    "on-dark-muted": "#a4a097",

    // 语义色
    "semantic-success": "#1aae39",
    "semantic-warning": "#dd5b00",
    "semantic-error": "#e03131",
  },

  typography: {
    "hero-display": { fontFamily: "Notion Sans", fontSize: "80px", fontWeight: 600, lineHeight: 1.05, letterSpacing: "-2px" },
    "display-lg": { fontFamily: "Notion Sans", fontSize: "56px", fontWeight: 600, lineHeight: 1.10, letterSpacing: "-1px" },
    "heading-1": { fontFamily: "Notion Sans", fontSize: "48px", fontWeight: 600, lineHeight: 1.15, letterSpacing: "-0.5px" },
    "heading-2": { fontFamily: "Notion Sans", fontSize: "36px", fontWeight: 600, lineHeight: 1.20, letterSpacing: "-0.5px" },
    "heading-3": { fontFamily: "Notion Sans", fontSize: "28px", fontWeight: 600, lineHeight: 1.25 },
    "heading-4": { fontFamily: "Notion Sans", fontSize: "22px", fontWeight: 600, lineHeight: 1.30 },
    "heading-5": { fontFamily: "Notion Sans", fontSize: "18px", fontWeight: 600, lineHeight: 1.40 },
    subtitle: { fontFamily: "Notion Sans", fontSize: "18px", fontWeight: 400, lineHeight: 1.50 },
    "body-md": { fontFamily: "Notion Sans", fontSize: "16px", fontWeight: 400, lineHeight: 1.55 },
    "body-md-medium": { fontFamily: "Notion Sans", fontSize: "16px", fontWeight: 500, lineHeight: 1.55 },
    "body-sm": { fontFamily: "Notion Sans", fontSize: "14px", fontWeight: 400, lineHeight: 1.50 },
    "body-sm-medium": { fontFamily: "Notion Sans", fontSize: "14px", fontWeight: 500, lineHeight: 1.50 },
    caption: { fontFamily: "Notion Sans", fontSize: "13px", fontWeight: 400, lineHeight: 1.40 },
    "caption-bold": { fontFamily: "Notion Sans", fontSize: "13px", fontWeight: 600, lineHeight: 1.40 },
    "button-md": { fontFamily: "Notion Sans", fontSize: "14px", fontWeight: 500, lineHeight: 1.30 },
  },

  rounded: { xs: "4px", sm: "6px", md: "8px", lg: "12px", xl: "16px", xxl: "20px", xxxl: "24px", full: "9999px" },

  spacing: { xxs: "4px", xs: "8px", sm: "12px", md: "16px", lg: "20px", xl: "24px", xxl: "32px", xxxl: "40px", section: "64px", "section-lg": "96px", hero: "120px" },
} as const;
