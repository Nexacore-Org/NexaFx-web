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

export const ShieldIcon = ({ className }: IconProps) => (
  <svg
    width="19"
    height="18"
    className={className}
    viewBox="0 0 19 18"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14.75 8.25H4.25C3.42157 8.25 2.75 8.92157 2.75 9.75V15C2.75 15.8284 3.42157 16.5 4.25 16.5H14.75C15.5784 16.5 16.25 15.8284 16.25 15V9.75C16.25 8.92157 15.5784 8.25 14.75 8.25Z"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5.75 8.25V5.25C5.75 4.25544 6.14509 3.30161 6.84835 2.59835C7.55161 1.89509 8.50544 1.5 9.5 1.5C10.4946 1.5 11.4484 1.89509 12.1517 2.59835C12.8549 3.30161 13.25 4.25544 13.25 5.25V8.25"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const BellIcon = ({ className }: IconProps) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    stroke-width="2"
    stroke-linecap="round"
    stroke-linejoin="round"
    className={className}
  >
    <path d="M10.268 21a2 2 0 0 0 3.464 0" />
    <path d="M3.262 15.326A1 1 0 0 0 4 17h16a1 1 0 0 0 .74-1.673C19.41 13.956 18 12.499 18 8A6 6 0 0 0 6 8c0 4.499-1.411 5.956-2.738 7.326" />
  </svg>
);

export const DeleteIcon = ({ className }: IconProps) => (
  <svg
    width="17"
    height="17"
    viewBox="0 0 17 17"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.42383 4.61523H14.0804"
      stroke="white"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.7869 4.61523V13.6814C12.7869 14.329 12.1393 14.9766 11.4917 14.9766H5.01588C4.36829 14.9766 3.7207 14.329 3.7207 13.6814V4.61523"
      stroke="white"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5.66211 4.61476V3.31959C5.66211 2.672 6.3097 2.02441 6.95728 2.02441H9.54763C10.1952 2.02441 10.8428 2.672 10.8428 3.31959V4.61476"
      stroke="white"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.95898 7.85254V11.7381"
      stroke="white"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.54883 7.85254V11.7381"
      stroke="white"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const DeleteBLackIcon = ({ className }: IconProps) => (
  <svg
    width="17"
    height="17"
    className={className}
    viewBox="0 0 17 17"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M2.42383 4.61523H14.0804"
      stroke="black"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.7869 4.61523V13.6814C12.7869 14.329 12.1393 14.9766 11.4917 14.9766H5.01588C4.36829 14.9766 3.7207 14.329 3.7207 13.6814V4.61523"
      stroke="black"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5.66211 4.61476V3.31959C5.66211 2.672 6.3097 2.02441 6.95728 2.02441H9.54763C10.1952 2.02441 10.8428 2.672 10.8428 3.31959V4.61476"
      stroke="black"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M6.95898 7.85254V11.7381"
      stroke="black"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M9.54883 7.85254V11.7381"
      stroke="black"
      stroke-width="1.1009"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);

export const IdCardIcon = ({ className }: IconProps) => (
  <svg
    width="19"
    height="18"
    viewBox="0 0 19 18"
    className={className}
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M12.5 7.5H14"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M12.5 10.5H14"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M5.12695 11.2494C5.28156 10.8099 5.56878 10.4293 5.94897 10.16C6.32916 9.89072 6.78356 9.74609 7.24945 9.74609C7.71535 9.74609 8.16975 9.89072 8.54994 10.16C8.93013 10.4293 9.21735 10.8099 9.37195 11.2494"
      stroke="#E58600"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M7.25 9.75C8.07843 9.75 8.75 9.07843 8.75 8.25C8.75 7.42157 8.07843 6.75 7.25 6.75C6.42157 6.75 5.75 7.42157 5.75 8.25C5.75 9.07843 6.42157 9.75 7.25 9.75Z"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <path
      d="M15.5 3.75H3.5C2.67157 3.75 2 4.42157 2 5.25V12.75C2 13.5784 2.67157 14.25 3.5 14.25H15.5C16.3284 14.25 17 13.5784 17 12.75V5.25C17 4.42157 16.3284 3.75 15.5 3.75Z"
      stroke="black"
      stroke-width="1.5"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
  </svg>
);
