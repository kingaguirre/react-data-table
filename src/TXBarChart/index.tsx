"use client";

import React, {
  useRef,
  useState,
  useEffect,
  useMemo,
  ReactNode,
  KeyboardEvent,
} from "react";
import ReactDOM from "react-dom";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import styled, { keyframes, css } from "styled-components";

/* ===========================
   Types
   =========================== */
type Orientation = "vertical" | "horizontal";

export interface ISegments {
  title: string;
  value: number;
  currency?: string;
  arrowColor?: string;
}

export interface IData extends ISegments {
  color: string;
  popoverContent?: ReactNode;
  popoverTitle?: string;
}

export interface IProps {
  chartHeight?: number | string; // e.g. 450 | "450px"
  labels?: ISegments[];
  datasets?: IData[];
  popoverWidth?: number;
  bottomContent?: ReactNode;
  orientation?: Orientation;
}

/* ===========================
   Sample data (replace with yours)
   =========================== */
const SEGMENTS: ISegments[] = [
  { title: "A", value: 1000000, currency: "USD", arrowColor: "red" },
  { title: "B", value: 99000, currency: "USD", arrowColor: "#4B5563" },
  { title: "C", value: 30000, currency: "USD", arrowColor: "#4B5563" },
];

const DATA: IData[] = [
  // { title: "Sales", value: 99000, currency: "USD", color: "#60A5FA" },
  // { title: "Fees", value: 1000, currency: "USD", color: "#FDE68A" },

  // { title: "Sales", value: 90, currency: "USD", color: "#60A5FA" },
  // { title: "Fees", value: 20, currency: "USD", color: "#FDE68A" },
  // { title: "Refunds", value: 1000000, currency: "USD", color: "#FCA5A5" },
  // { title: "Other", value: 9950, currency: "USD", color: "#86EFAC" },

  { title: "Sales", value: 30, currency: "USD", color: "#60A5FA" },
  { title: "Refunds", value: 20, currency: "USD", color: "#FCA5A5" },
];

/* ===========================
   Utilities
   =========================== */
const toPixels = (v: number | string): number => {
  if (typeof v === "number") return v;
  if (typeof v === "string" && v.endsWith("px")) return parseFloat(v);
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

export const calculateHeights = (labels: ISegments[], values: IData[]) => {
  // Avoid Math.max(...[]) crash
  const maxLabelValue =
    labels.length > 0 ? Math.max(...labels.map((l) => l.value)) : 0;
  const sumValues = values.reduce((acc, v) => acc + v.value, 0);
  const maxValue = Math.max(maxLabelValue, sumValues) || 100;

  const sortedLabels = [...labels]
    .map((label) => ({
      ...label,
      height: `${(label.value / maxValue) * 100}%`,
    }))
    .sort((a, b) => b.value - a.value);

  // Build accumulated from the end
  let accumulatedHeight = 0;
  const calculatedDatasets = [...values]
    .reverse()
    .map((value) => {
      const heightPct = (value.value / maxValue) * 100;
      accumulatedHeight += heightPct;
      return {
        ...value,
        height: `${heightPct}%`,
        accumulatedHeight, // number in %
      } as IData & { height: string; accumulatedHeight: number };
    })
    .reverse();

  return { sortedLabels, calculatedDatasets };
};

// Safer stringify signature for deps (ignores React nodes)
const makeLabelsSignature = (labels: Array<ISegments & { height?: string }>) =>
  labels.map((l) => `${l.title}|${l.value}|${l.currency ?? ""}|${l.height ?? ""}`).join("~");

const makeDataSignature = (
  data: Array<IData & { height: string; accumulatedHeight: number }>
) =>
  data
    .map((d) => `${d.title}|${d.value}|${d.currency ?? ""}|${d.height}|${d.accumulatedHeight}`)
    .join("~");

/* ===========================
   Minimal Popover (inline)
   =========================== */
const PopoverContainer = styled.div<{ width: number; color?: string }>`
  width: ${({ width }) => width}px;
  max-width: 92vw;
  background: #fff;
  border: 1px solid var(--color-neutral, #d1d5db);
  border-left: 4px solid ${({ color }) => color ?? "#111827"};
  border-radius: 8px;
  box-shadow: 0 6px 30px rgba(0, 0, 0, 0.08);
  padding: 12px 14px;
  color: #111827;
  backdrop-filter: saturate(1.2);
`;

const PopoverTitle = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
`;

const CloseRow = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
  button {
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 12px;
    color: #6b7280;
  }
`;

const Popover: React.FC<{
  title: string;
  width: number;
  color?: string;
  onClose: () => void;
  children?: ReactNode;
}> = ({ title, width, color, onClose, children }) => {
  return (
    <PopoverContainer width={width} color={color} role="dialog" aria-label={title}>
      <PopoverTitle>{title}</PopoverTitle>
      <div>{children}</div>
      <CloseRow>
        <button onClick={onClose} aria-label="Close details">
          Close
        </button>
      </CloseRow>
    </PopoverContainer>
  );
};

/* ===========================
   Styled Components
   =========================== */
const BAR_VERTICAL_WIDTH = "32px";
const BAR_HORIZONTAL_WIDTH = "24px";

const Container = styled.div<{ orientation: Orientation; paddingTop: number }>`
  min-width: 360px;
  box-sizing: border-box;
  overflow: hidden;

  ${({ orientation, paddingTop }) =>
    orientation === "vertical"
      ? `
    padding: 30px 16px 16px;
    width: 100%;
  `
      : `
    width: calc(100% - 6px);
    padding: ${100 + (paddingTop ? paddingTop - 40 : 0)}px 4px 50px;
  `}

  * { box-sizing: border-box; }

  /* Scrollbars (WebKit) */
  *::-webkit-scrollbar-track {
    width: 10px;
    height: 10px;
    background-color: #f2f6f8;
    border: 1px solid var(--color-neutral-light, #e5e7eb);
  }
  *::-webkit-scrollbar {
    width: 10px;
    height: 10px;
    background-color: #f2f6f8;
    border: 1px solid var(--color-neutral-light, #e5e7eb);
  }
  *::-webkit-scrollbar-thumb {
    background-color: var(--color-neutral-light, #e5e7eb);
    border: 2px solid #f2f6f8;
    border-radius: 6px;
    transition: all 0.3s ease;
    height: 6px;
    width: 6px;
  }
  *::-webkit-scrollbar-thumb:hover {
    background-color: var(--color-neutral, #d1d5db);
  }

  /* Firefox */
  @-moz-document url-prefix() {
    scrollbar-color: var(--color-neutral-light, #e5e7eb) #fff;
    scrollbar-width: thin;
  }

  /* --- Segment label-container entrance animation --- */
  .label-container {
    /* Compose with base transform via CSS var in barStyles */
    --seg-anim-y: 10px;         /* initial slide distance */
    opacity: 0;
    transition: opacity .3s ease-out, transform .3s ease-out;
    will-change: opacity, transform;
  }

  &.is-mounted {
    .segment:before {
      opacity: 1;
      ${({ orientation }) => orientation === "vertical" ? `left: 0;` : ``}
    }

    .label-container {
      --seg-anim-y: 0px;
      opacity: 1;
    }
  }
`;

const ChartWrapper = styled.div<{ chartHeight: string | number; orientation: Orientation }>`
  margin: 0 auto;
  position: relative;
  width: ${({ orientation }) => (orientation === "vertical" ? BAR_VERTICAL_WIDTH : "100%")};
  height: ${({ chartHeight, orientation }) =>
    orientation === "vertical" ? chartHeight : BAR_HORIZONTAL_WIDTH};
  display: flex;
  flex-direction: ${({ orientation }) => (orientation === "vertical" ? "column" : "row-reverse")};
  justify-content: flex-end;
  flex-wrap: wrap;
  &:after {
    content: "";
    position: absolute;
    border: 1px solid var(--color-neutral, #d1d5db);
    inset: 0;
  }
`;

/**
 * barStyles: common layout for the immediate child "box" of a bar/segment.
 * IMPORTANT: transform uses CSS vars so we can add an animated translateY
 * without overriding the base positioning transforms.
 */
const barStyles = (
  height: string,
  contentAlign: "left" | "right" = "left",
  textAlign: "left" | "center" | "right" = "left",
  orientation: Orientation = "vertical"
) => `
  width: ${orientation === "vertical" ? "100%" : height || "auto"};
  height: ${orientation === "vertical" ? height || "auto" : "100%"};
  position: absolute;
  bottom: 0;
  left: 0;
  z-index: 0;

  > div {
    position: relative;
    text-align: ${textAlign};
    width: 140px;
    font-size: 10px;
    line-height: 14px;
    color: var(--color-neutral-dark, #6b7280);
    background-color: rgba(255, 255, 255, 0.7);

    ${
      orientation === "vertical"
        ? `
      /* Base transform broken into vars so we can compose animation: */
      --seg-base-x: ${contentAlign === "left" ? "-100%" : `calc(${BAR_VERTICAL_WIDTH} + 20px)`};
      --seg-base-y: -50%;
    `
        : `
      --seg-base-x: -50%;
      --seg-base-y: 100%;
    `
    }

    /* Compose base transform + animated translateY */
    transform: translate(var(--seg-base-x), var(--seg-base-y)) translateY(var(--seg-anim-y, 0));

    ${orientation === "vertical" ? `padding-right: 12px;` : `bottom: 0; padding-top: 6px; left: 50%; text-align: center;`}

    > p { margin: 0; }
    > b { color: var(--color-neutral-darker, #374151); }
  }
`;

const Segment = styled.div<{
  height: string;
  orientation: Orientation;
  arrowColor?: string;
  zIndex: number;
  horizontalOffset: number;
}>`
  ${({ height, orientation }) => barStyles(height, "left", "left", orientation)}
  z-index: ${({ zIndex }) => zIndex};

  ${({ orientation }) =>
    orientation === "horizontal"
      ? `
    &.horizontal-bar-chart-left {
      > div {
        text-align: center;
        /* keep animation composition */
        --seg-base-x: 100%;
        --seg-base-y: -100%;
      }
    }
    &.horizontal-bar-chart-right {
      > div {
        text-align: right;
        --seg-base-x: 0;
        --seg-base-y: -100%;
      }
    }
    > div {
      background-color: white;
      position: absolute;
      display: block;
      height: fit-content;
      right: 0;
      left: auto;
      margin: 0; padding: 0; top: 0;

      /* place above bar and compose animated Y */
      --seg-base-x: 50%;
      --seg-base-y: calc(-100% - 60px);
    }
  `
      : ""}

  &:not(:first-child) {
    ${({ orientation }) =>
      orientation === "vertical" ? `border-top: 1px dashed #111;` : `border-right: 1px dashed transparent;`}
  }

  ${({ orientation, arrowColor, horizontalOffset }) =>
    orientation === "horizontal"
      ? `
    &:after {
      content: '';
      position: absolute;
      top: 24px;
      height: ${horizontalOffset + 55 + 24}px;
      border-right: 1px dashed ${arrowColor || "var(--color-neutral-dark, #6b7280)"};
      right: 0;
      transform: translateY(-100%);
    }
  `
      : ``}

  &:before {
    z-index: 1;
    content: "";
    position: absolute;
    top: 0;
    width: 0px; height: 0px;
    border-top: 5px solid transparent;
    border-bottom: 5px solid transparent;
    border-left: 7px solid ${({ arrowColor }) => arrowColor || "var(--color-neutral-dark, #6b7280)"};
    opacity: 0;
    transition: all .3s ease;
    ${({ orientation, horizontalOffset }) =>
      orientation === "vertical"
        ? `
      left: -8px;
      transform: translate(-130%, -50%);
    `
        : `
      right: 0;
      transform: rotate(-90deg) translate(calc(100% + ${horizontalOffset + 55}px), 3px);
    `}
  }
`;

const grow = (height: string, orientation: Orientation = "vertical") => keyframes`
  from { ${orientation === "vertical" ? "height: 0;" : "width: 0;"} }
  to   { ${orientation === "vertical" ? `height: ${height};` : `width: ${height};`} }
`;

const DataBar = styled.div<{ height: string; color: string; orientation: Orientation }>`
  ${({ height, color, orientation }) => css`
    ${barStyles(height, "right", "left", orientation)}
    position: relative;
    align-self: flex-end;
    background-color: ${color};
    z-index: 10;
    animation: ${grow(height, orientation)} 0.6s ease-out forwards;

    /* Data labels shouldn't animate Y by default */
    > div {
      --seg-anim-y: 0;
      ${orientation === "vertical" ? `top: 50%;` : `bottom: 0;`}
      outline: none;
      /* 🔥 add this to animate vertical label shifts */
      transition: top .25s ease;
      will-change: top;
    }
    > div > b { color: ${color}; }

    ${orientation === "vertical"
      ? ""
      : `
      &.horizontal-bar-text-top {
        > div {
          padding: 0;
          /* overrides base transform, animation var is 0 here anyway */
          transform: translate(-50%, calc(-100% - 12px));
        }
        &:after { top: -4px; }
      }
      &.text-align-left {
        > div {
          transform: translate(0, 100%);
          text-align: left;
        }
        &.horizontal-bar-text-top {
          > div { transform: translate(0, calc(-100% - 12px)); }
        }
      }
    `}

    &:after {
      z-index: 2;
      content: "";
      position: absolute;
      background-color: ${color};
      border-radius: 2px;
      ${orientation === "vertical"
        ? `right: -6px; top: 1px; bottom: 1px; width: 2px;`
        : `left: 1px; right: 1px; height: 2px; bottom: -4px;`}
    }
  `}
`;

const BottomContent = styled.div`
  text-align: center;
  padding: 24px 16px 0;
`;

/* ===========================
   Component
   =========================== */
export const TXBarChart: React.FC<IProps> = (props) => {
  const {
    chartHeight = "450px",
    labels = SEGMENTS,
    datasets = DATA,
    popoverWidth = 500,
    bottomContent,
    orientation = "vertical",
  } = props;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const [containerWidth, setContainerWidth] = useState<number>(0);

  // Label/Data DOM refs
  const labelRefs = useRef<Array<HTMLDivElement | null>>([]);
  const valueRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Offsets (computed)
  const [labelBottomValues, setLabelBottomValues] = useState<number[]>([]);
  const [horizontalLabelOffsetTop, setHorizontalLabelOffsetTop] = useState<number[]>([]);

  // Popover
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [popoverTarget, setPopoverTarget] = useState<HTMLElement | null>(null);
  const [popoverNode, setPopoverNode] = useState<ReactNode | null>(null);

  const [dataLabelDeltaPx, setDataLabelDeltaPx] = useState<number[]>([]);

  // animate segment labels immediately (in parallel with data animation)
  const [segAnimOn, setSegAnimOn] = useState(false);

  // Compute bars
  const { sortedLabels, calculatedDatasets } = useMemo(
    () => calculateHeights(labels, datasets),
    [labels, datasets]
  );

  // Dependency signatures (avoid ReactNode churn)
  const labelsSig = useMemo(() => makeLabelsSignature(sortedLabels as any), [sortedLabels]);
  const dataSig = useMemo(() => makeDataSignature(calculatedDatasets as any), [calculatedDatasets]);

  // Observe container width (more reliable than reading once)
  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;
    const ro = new ResizeObserver((entries) => {
      const cr = entries[0].contentRect;
      setContainerWidth(cr.width);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
  if (orientation !== "vertical" || calculatedDatasets.length === 0) return;

  const raf = requestAnimationFrame(() => {
    const chartPx = toPixels(chartHeight);
    const GAP = 4; // px between label boxes

    type Row = {
      i: number;
      centerAbs: number; // center if delta=0 (px from bottom)
      boxH: number;      // label box height
      delta: number;     // +up, -down (px)
    };

    // Build rows in top->bottom order. Bottom is last index.
    const rows: Row[] = calculatedDatasets.map((d, i) => {
      const hPct = parseFloat(d.height || "0");
      const hPx  = chartPx * (hPct / 100);
      const accPct = Number((d as any).accumulatedHeight) || 0;
      const bottomPx = chartPx * ((accPct - hPct) / 100);
      const centerAbs = bottomPx + hPx / 2;

      const el = valueRefs.current[i]?.querySelector(".data-details") as HTMLElement | null;
      const boxH = Math.max(el?.clientHeight ?? 0, 14); // guard a sane min

      return { i, centerAbs, boxH, delta: 0 };
    });

    if (!rows.length) { setDataLabelDeltaPx([]); return; }
    const last = rows.length - 1;

    // 0) Pin bottom label
    rows[last].delta = 0;

    // 1) Upward pass: enforce spacing vs label below (push UP only)
    for (let i = last - 1; i >= 0; i--) {
      const above = rows[i];
      const below = rows[i + 1];

      const belowFinal = below.centerAbs + below.delta;
      const requiredMinCenter = belowFinal + (below.boxH + above.boxH) / 2 + GAP;

      const curCenter = above.centerAbs + above.delta;
      const need = requiredMinCenter - curCenter;
      if (need > 0) above.delta += need;
    }

    // 2) Top cluster correction: if any labels overflow the top, push that contiguous
    //    top cluster DOWN together (just enough), without violating spacing to the label below.
    const overflow = (r: Row) => r.centerAbs + r.delta + r.boxH / 2 - chartPx;

    // find first top index that overflows
    let t = -1;
    for (let i = 0; i < rows.length; i++) {
      if (overflow(rows[i]) > 0) { t = i; break; }
    }

    if (t !== -1) {
      // extend to the last overflowing index (contiguous top cluster)
      let j = t;
      while (j + 1 < rows.length && overflow(rows[j + 1]) > 0) j++;

      // required shift to bring the whole cluster in-bounds
      let maxOverflow = 0;
      for (let k = t; k <= j; k++) maxOverflow = Math.max(maxOverflow, overflow(rows[k]));

      // spacing limit vs the label just BELOW the cluster (if any)
      let spacingLimit = Infinity;
      if (j + 1 < rows.length) {
        const clusterBottom = rows[j];
        const below = rows[j + 1];
        const belowFinal = below.centerAbs + below.delta;
        const requiredAfter =
          belowFinal + (below.boxH + clusterBottom.boxH) / 2 + GAP;
        const currentBottomCenter = clusterBottom.centerAbs + clusterBottom.delta;
        spacingLimit = Math.max(0, currentBottomCenter - requiredAfter);
      }

      // bottom-bound limit for labels in the cluster (don’t cross chart bottom)
      let bottomMargin = Infinity;
      for (let k = t; k <= j; k++) {
        const r = rows[k];
        bottomMargin = Math.min(bottomMargin, (r.centerAbs + r.delta) - r.boxH / 2);
      }
      bottomMargin = Math.max(0, bottomMargin);

      const shiftDown = Math.min(maxOverflow, spacingLimit, bottomMargin);
      if (shiftDown > 0) {
        for (let k = t; k <= j; k++) rows[k].delta -= shiftDown;
      }
    }

    setDataLabelDeltaPx(rows.map(r => r.delta));
  });

  return () => cancelAnimationFrame(raf);
}, [dataSig, labelsSig, orientation, chartHeight]);

  // ✅ Add this memo (near other memos/effects)
  const segsReady = useMemo(() => {
    const mounted =
      sortedLabels.length > 0 &&
      sortedLabels.every((_, i) => !!labelRefs.current[i]);       // all boxes mounted
    const positioned =
      orientation === "vertical"
        ? labelBottomValues.length === sortedLabels.length        // vertical offsets ready
        : horizontalLabelOffsetTop.length === sortedLabels.length;// horizontal offsets ready
    return mounted && positioned;
  }, [sortedLabels, orientation, labelBottomValues, horizontalLabelOffsetTop]);

  // 🔄 Replace your existing segAnimOn effect with this one
  useEffect(() => {
    if (!segsReady) return;                // wait until everything is mounted & positioned
    setSegAnimOn(false);                   // ensure initial hidden state
    const id = requestAnimationFrame(() => setSegAnimOn(true)); // flip next frame → animate all
    return () => cancelAnimationFrame(id);
  }, [segsReady]);

  /* --------- Helpers --------- */
  const shouldShowOnRight = (target: HTMLElement | null): boolean => {
    if (!target) return true;
    const { right } = target.getBoundingClientRect();
    return right + popoverWidth < window.innerWidth;
  };

  const getPopOverContainerStyle = (target: HTMLElement) => {
    const panelOnRight = shouldShowOnRight(target);
    const rect = target.getBoundingClientRect();
    const leftOffset = panelOnRight ? target.clientWidth : -16;
    return {
      position: "absolute" as const,
      top: rect.top + window.scrollY + target.clientHeight / 2,
      left: leftOffset + rect.left + window.scrollX,
    };
  };

  const getSegmentClassName = (_segmentHeight: string, orientation: Orientation) => {
    let position = "";
    const segmentHeight = parseFloat(_segmentHeight || "0");
    if (orientation === "vertical") {
      if (segmentHeight < 10) position = "bottom";
      else if (segmentHeight > 90) position = "top";
    } else {
      if (segmentHeight < 10) position = "left";
      else if (segmentHeight > 90) position = "right";
    }
    return `${orientation}-bar-chart-${position}`;
  };

  const getPosition = (label: { height: string }) => {
    const barWidth = (parseFloat(label.height) / 100) * containerWidth;
    return containerWidth - barWidth > 40 ? "bottom" : "top";
  };

  // Text placement for horizontal bars (DATA)
  const valueContainerRightValues = (
    data: { height: string; accumulatedHeight: number },
    isTop = true
  ) => {
    const barWidth = (parseFloat(data.height) / 100) * containerWidth;
    const barTotalWidth = (parseFloat(String(data.accumulatedHeight)) / 100) * containerWidth;

    const isLeft = barTotalWidth < 140 / 2;
    const isRight = containerWidth - barTotalWidth < 140 / 2 && barWidth < 140 / 2;

    return {
      textAlign: (isLeft ? "left" : isRight ? "right" : "center") as const,
      transform: `translate(${isLeft ? 0 : isRight ? "-100%" : "-50%"}, ${
        isTop ? "calc(-100% - 12px)" : "calc(100% - 6px)"
      })`,
    };
  };

  const labelContainerRightValues = (data: { height: string }, index: number) => {
    const barWidth = (parseFloat(data.height) / 100) * containerWidth;
    const isRight = containerWidth - barWidth < 140 / 2;
    const isLeft = barWidth < 140 / 2;
    const x = `calc(${isLeft ? "100% - 2px" : isRight ? "2px" : "50%"})`;
    return {
      textAlign: (isLeft ? "left" : isRight ? "right" : "center") as const,
      transform: `translate(${x}, calc(-100% - ${60 + (horizontalLabelOffsetTop[index] ?? 0)}px))`,
    };
  };

  const getHorizontalPaddingTop = () =>
    horizontalLabelOffsetTop?.reduce((sum, cur) => sum + cur, 0) || 0;

  /* --------- Compute label offsets (vertical & horizontal) --------- */
  useEffect(() => {
    if (sortedLabels.length === 0) return;

    const calcVertical = () => {
      const newBottoms = sortedLabels.map((_, i) => {
        const curH = labelRefs.current[i]?.clientHeight || 0;
        const curBoxH =
          (labelRefs.current[i]?.querySelector(".label-container") as HTMLElement | null)
            ?.clientHeight || 0;
        const nextH = labelRefs.current[i + 1]?.clientHeight || 0;
        const nextBoxH =
          (labelRefs.current[i + 1]?.querySelector(".label-container") as HTMLElement | null)
            ?.clientHeight || 0;

        const diff = curH - nextH;
        return diff < nextBoxH ? nextBoxH / 2 + curBoxH / 2 : 0;
      });
      setLabelBottomValues(newBottoms);
    };

    const calcHorizontal = () => {
      let accHeight = 0;
      const newVals = sortedLabels.map((_, i) => {
        const curW = labelRefs.current[i]?.clientWidth || 0;
        const prevTextH =
          (labelRefs.current[i - 1]?.querySelector(".label-container") as HTMLElement | null)
            ?.clientHeight || 0;
        const prevW = labelRefs.current[i - 1]?.clientWidth || 0;

        accHeight += prevTextH;
        const offsetTop = prevW - curW > 140 || (prevW === 0 && i === 0) ? 0 : accHeight + 12 * i;
        return offsetTop;
      });
      setHorizontalLabelOffsetTop(newVals);
    };

    const timeout = setTimeout(() => {
      calcVertical();
      calcHorizontal();
    }, 600);
    return () => clearTimeout(timeout);
  }, [labelsSig, orientation, containerWidth]); // recalc when labels, orientation or width changes

  /* --------- Popover events (outside click, esc, resize) --------- */
  useEffect(() => {
    if (!isPopoverOpen) return;

    const onDocClick = (e: MouseEvent) => {
      if (popoverTarget && e.target instanceof Node && !popoverTarget.contains(e.target)) {
        setIsPopoverOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e as any).key === "Escape") setIsPopoverOpen(false);
    };
    let resizeTimer: number | undefined;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        // Force a tiny tick; style() recomputes on next paint
        setPopoverNode((n) => (n ? React.cloneElement(<div /> as any) && n : n));
      }, 120);
    };

    window.addEventListener("click", onDocClick, { capture: true });
    window.addEventListener("keydown", onKey as any);
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("click", onDocClick, { capture: true } as any);
      window.removeEventListener("keydown", onKey as any);
      window.removeEventListener("resize", onResize);
      if (resizeTimer) window.clearTimeout(resizeTimer);
    };
  }, [isPopoverOpen, popoverTarget, popoverWidth]);

  /* --------- Handlers --------- */
  const handleValueClick = (data: IData, target: HTMLElement) => {
    const title = data.popoverTitle ?? "Details";
    setPopoverNode(
      <Popover title={title} width={popoverWidth} color={data.color} onClose={() => setIsPopoverOpen(false)}>
        {data.popoverContent}
      </Popover>
    );
    setPopoverTarget(target);
    setIsPopoverOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLElement>, data: IData, target: HTMLElement) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleValueClick(data, target);
    }
  };

  const handleContainerKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      event.stopPropagation();
    }
  };

  /* ===========================
     Render
     =========================== */
  return (
    <Container
      paddingTop={getHorizontalPaddingTop()}
      className={`chart-container ${segAnimOn ? 'is-mounted' : ''}`}
      orientation={orientation}
      ref={containerRef}
    >
      <ChartWrapper chartHeight={chartHeight} orientation={orientation}>
        {/* Segments (background) */}
        {sortedLabels.map((label, i) => {
          const base = labelBottomValues[i] ?? 0;
          const verticalOffset = base + (base > 0 ? (labelBottomValues[i + 1] ?? 0) : 0);
          return (
            <Segment
              key={`${label.value}-${label.title}-${i}`}
              height={label.height as string}
              orientation={orientation}
              arrowColor={label.arrowColor}
              data-testid={`segment-element-${i}`}
              className={`segment ${getSegmentClassName(label.height as string, orientation)}`}
              ref={(el) => (labelRefs.current[i] = el)}
              horizontalOffset={horizontalLabelOffsetTop[i] ?? 0}
              zIndex={horizontalLabelOffsetTop.length - i}
            >
              <div
                className="label-container"
                style={
                  orientation === 'vertical'
                    ? ({ [getPosition(label)]: verticalOffset } as React.CSSProperties)
                    : ({ ...labelContainerRightValues(label, i) } as React.CSSProperties)
                }
              >
                <p>{label.title}</p>
                <b>{label.currency || 'USD'}</b>
              </div>
            </Segment>
          );
        })}

        {/* Data bars (foreground) */}
        {calculatedDatasets.map((d, i) => (
          <DataBar
            key={`${d.value}-${d.title}-${i}`}
            height={d.height}
            orientation={orientation}
            color={d.color}
            data-testid={`data-element-${i}`}
            className={`data-bar ${orientation}-bar-text-${i % 2 === 0 ? "top" : "bottom"} ${
              parseFloat(d.height) < 10 ? "text-align-left" : ""
            }`}
            ref={(el) => (valueRefs.current[i] = el)}
          >
            <Tippy
              content="Click to see more details"
              disabled={!d.popoverContent}
              interactive
              trigger="mouseenter focus"
              hideOnClick={false}
              placement={orientation === "vertical" ? "right" : "bottom"}
              appendTo={() => document.body}
            >
              <div
                className="data-details"
                role={d.popoverContent ? "button" : undefined}
                aria-label={d.popoverTitle ?? d.title}
                aria-haspopup={d.popoverContent ? "dialog" : undefined}
                aria-expanded={d.popoverContent ? isPopoverOpen : undefined}
                tabIndex={d.popoverContent ? 0 : -1}
                style={
                  orientation === "vertical"
                    ? ({ top: `calc(50% - ${(dataLabelDeltaPx[i] ?? 0).toFixed(2)}px)` } as React.CSSProperties)
                    : (valueContainerRightValues(d as any, i % 2 === 0) as React.CSSProperties)
                }
                onKeyDown={(e) => d.popoverContent && handleKeyDown(e, d, e.currentTarget)}
                onClick={(e) => {
                  if (!d.popoverContent) return;
                  e.stopPropagation();
                  handleValueClick(d, e.currentTarget as HTMLElement);
                }}
              >
                <p>{d.title}</p>
                <b>{d.currency || "USD"}</b>
              </div>
            </Tippy>
          </DataBar>
        ))}
      </ChartWrapper>

      {bottomContent && <BottomContent>{bottomContent}</BottomContent>}

      {isPopoverOpen &&
        popoverTarget &&
        ReactDOM.createPortal(
          <div
            style={getPopOverContainerStyle(popoverTarget)}
            onClick={(e) => e.stopPropagation()}
            tabIndex={0}
            onKeyDown={handleContainerKeyDown}
          >
            {popoverNode}
          </div>,
          document.body
        )}
    </Container>
  );
};
