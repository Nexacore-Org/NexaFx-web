export const KycIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 20 20"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <circle cx="10" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
    <path
      d="M4 16.5C4 13.4624 6.46243 11 9.5 11H10.5C13.5376 11 16 13.4624 16 16.5V17H4V16.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
    <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 2" />
  </svg>
);
