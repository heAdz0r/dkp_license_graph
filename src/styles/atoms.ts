// src/styles/atoms.ts
/**
 * Атомарные CSS классы для композиционного стиля
 * Используя этот подход, мы значительно сокращаем дублирование кода
 * и улучшаем консистентность интерфейса
 */

export const atoms = {
  // Flex layout helpers
  flex: { display: "flex" },
  flexCenter: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  flexBetween: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  flexColumn: { display: "flex", flexDirection: "column" },
  flexWrap: { flexWrap: "wrap" },
  itemsCenter: { alignItems: "center" },
  itemsStart: { alignItems: "flex-start" },
  itemsEnd: { alignItems: "flex-end" },
  justifyCenter: { justifyContent: "center" },
  justifyBetween: { justifyContent: "space-between" },
  justifyEnd: { justifyContent: "flex-end" },

  // Gaps
  gap1: { gap: 1 },
  gap2: { gap: 2 },
  gap3: { gap: 3 },

  // Margins & Paddings
  m0: { m: 0 },
  m1: { m: 1 },
  m2: { m: 2 },
  m3: { m: 3 },
  m4: { m: 4 },

  mt0: { mt: 0 },
  mt1: { mt: 1 },
  mt2: { mt: 2 },
  mt3: { mt: 3 },
  mt4: { mt: 4 },

  mb0: { mb: 0 },
  mb1: { mb: 1 },
  mb2: { mb: 2 },
  mb3: { mb: 3 },
  mb4: { mb: 4 },

  ml0: { ml: 0 },
  ml1: { ml: 1 },
  ml2: { ml: 2 },
  ml3: { ml: 3 },
  ml4: { ml: 4 },

  mr0: { mr: 0 },
  mr1: { mr: 1 },
  mr2: { mr: 2 },
  mr3: { mr: 3 },
  mr4: { mr: 4 },

  mx0: { mx: 0 },
  mx1: { mx: 1 },
  mx2: { mx: 2 },
  mx3: { mx: 3 },
  mx4: { mx: 4 },

  my0: { my: 0 },
  my1: { my: 1 },
  my2: { my: 2 },
  my3: { my: 3 },
  my4: { my: 4 },

  p0: { p: 0 },
  p1: { p: 1 },
  p2: { p: 2 },
  p3: { p: 3 },
  p4: { p: 4 },

  px0: { px: 0 },
  px1: { px: 1 },
  px2: { px: 2 },
  px3: { px: 3 },
  px4: { px: 4 },

  py0: { py: 0 },
  py1: { py: 1 },
  py2: { py: 2 },
  py3: { py: 3 },
  py4: { py: 4 },

  // Typography
  textCenter: { textAlign: "center" },
  textLeft: { textAlign: "left" },
  textRight: { textAlign: "right" },
  truncate: {
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  fontBold: { fontWeight: 700 },
  fontSemibold: { fontWeight: 600 },
  fontMedium: { fontWeight: 500 },
  fontNormal: { fontWeight: 400 },
  uppercase: { textTransform: "uppercase" },
  capitalize: { textTransform: "capitalize" },

  // Display
  block: { display: "block" },
  inlineBlock: { display: "inline-block" },
  hidden: { display: "none" },

  // Positioning
  relative: { position: "relative" },
  absolute: { position: "absolute" },
  fixed: { position: "fixed" },
  sticky: { position: "sticky" },

  // Size
  w100: { width: "100%" },
  h100: { height: "100%" },
  wAuto: { width: "auto" },
  hAuto: { height: "auto" },
  minW0: { minWidth: 0 },
  minH0: { minHeight: 0 },

  // Borders & Radiuses
  rounded: { borderRadius: 1 },
  roundedSm: { borderRadius: "4px" },
  roundedMd: { borderRadius: "8px" },
  roundedLg: { borderRadius: "12px" },
  roundedFull: { borderRadius: "9999px" },
  border: { border: "1px solid" },
  borderTop: { borderTop: "1px solid" },
  borderBottom: { borderBottom: "1px solid" },

  // Colors
  bgPrimary: { bgcolor: "primary.main" },
  bgPrimaryLight: { bgcolor: "primary.light" },
  bgGray50: { bgcolor: "grey.50" },
  bgGray100: { bgcolor: "grey.100" },
  bgTransparent: { bgcolor: "transparent" },
  bgWhite: { bgcolor: "white" },

  // Effects
  shadow: { boxShadow: 1 },
  shadowMd: { boxShadow: 2 },
  shadowLg: { boxShadow: 3 },
  noShadow: { boxShadow: "none" },

  // Transitions and transforms
  transition: { transition: "all 0.2s ease-in-out" },
  transitionFast: { transition: "all 0.1s ease-in-out" },
  transitionSlow: { transition: "all 0.3s ease-in-out" },

  // Misc
  overflowHidden: { overflow: "hidden" },
  cursorPointer: { cursor: "pointer" },
  zIndex1: { zIndex: 1 },
  zIndex10: { zIndex: 10 },
  zIndex100: { zIndex: 100 },
};

// Функция-помощник для комбинирования атомарных стилей
export const combine = (...styles: Record<string, any>[]) =>
  styles.reduce((acc, style) => ({ ...acc, ...style }), {});

export default atoms;
