interface IconProps {
  color?: string;
  size?: number;
  className?: string;
}

export const FileIcon = ({ className }: IconProps) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M3.5 14.625V3.375C3.5 2.87772 3.69754 2.40081 4.04917 2.04917C4.40081 1.69754 4.87772 1.5 5.375 1.5H14.75C14.9489 1.5 15.1397 1.57902 15.2803 1.71967C15.421 1.86032 15.5 2.05109 15.5 2.25V15.75C15.5 15.9489 15.421 16.1397 15.2803 16.2803C15.1397 16.421 14.9489 16.5 14.75 16.5H5.375C4.87772 16.5 4.40081 16.3025 4.04917 15.9508C3.69754 15.5992 3.5 15.1223 3.5 14.625ZM3.5 14.625C3.5 14.1277 3.69754 13.6508 4.04917 13.2992C4.40081 12.9475 4.87772 12.75 5.375 12.75H15.5"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.5 8.25H12.5"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.5 5.25H11"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
