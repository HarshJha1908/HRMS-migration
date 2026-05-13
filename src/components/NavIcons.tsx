import type { SVGProps } from "react";

const baseProps: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
};

export const IconUser = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="8" r="4" />
    <path d="M4 21c0-4.4 3.6-8 8-8s8 3.6 8 8" />
  </svg>
);

export const IconCalendar = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M16 3v4M8 3v4M3 10h18" />
  </svg>
);

export const IconBriefcase = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="7" width="18" height="13" rx="2" />
    <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" />
    <path d="M3 13h18" />
  </svg>
);

export const IconCheckCircle = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8 12.5l2.5 2.5L16 9.5" />
  </svg>
);

export const IconUsers = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 20c0-3.6 2.9-6.5 6.5-6.5s6.5 2.9 6.5 6.5" />
    <circle cx="17" cy="9" r="2.5" />
    <path d="M21.5 18.5c0-2.5-2-4.5-4.5-4.5" />
  </svg>
);

export const IconChart = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
  </svg>
);

export const IconDocument = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" />
    <path d="M14 3v5h5" />
    <path d="M9 13h6M9 17h4" />
  </svg>
);

export const IconBook = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z" />
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
  </svg>
);

export const IconWallet = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18" />
    <circle cx="16.5" cy="14.5" r="1.2" fill="currentColor" stroke="none" />
  </svg>
);

export const IconHospital = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <rect x="4" y="4" width="16" height="17" rx="2" />
    <path d="M12 8v8M8 12h8" />
  </svg>
);

export const IconLink = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1.5 1.5" />
    <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1.5-1.5" />
  </svg>
);

export const IconReport = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M5 3h11l4 4v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
    <path d="M9 13l2.5 2.5L16 11" />
  </svg>
);

export const IconSettings = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
  </svg>
);

export const IconSearch = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" />
  </svg>
);

export const IconPuzzle = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M10 3h4a1 1 0 0 1 1 1v2a2 2 0 0 0 4 0 1 1 0 0 1 1 1v4a1 1 0 0 1-1 1 2 2 0 0 0 0 4 1 1 0 0 1 1 1v3a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1 2 2 0 0 0-4 0 1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-4a1 1 0 0 1 1-1 2 2 0 0 0 0-4 1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" />
  </svg>
);

export const IconHome = (props: SVGProps<SVGSVGElement>) => (
  <svg {...baseProps} {...props}>
    <path d="M3 11l9-8 9 8" />
    <path d="M5 10v10a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V10" />
  </svg>
);
