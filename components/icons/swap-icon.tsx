export const SwapIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    {/* Circular arrow path - top curved arrow going right */}
    <path
      d="M13.5 3.5L16 6L13.5 8.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M16 6H7C4.79086 6 3 7.79086 3 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Circular arrow path - bottom curved arrow going left */}
    <path
      d="M6.5 16.5L4 14L6.5 11.5"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M4 14H13C15.2091 14 17 12.2091 17 10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
