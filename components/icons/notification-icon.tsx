export const NotificationIcon = (props: React.ComponentPropsWithoutRef<"svg">) => (
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" {...props}>
    <path
      d="M13.5 6C13.5 4.80653 13.0259 3.66193 12.182 2.81802C11.3381 1.97411 10.1935 1.5 9 1.5C7.80653 1.5 6.66193 1.97411 5.81802 2.81802C4.97411 3.66193 4.5 4.80653 4.5 6C4.5 11.25 2.25 12.75 2.25 12.75H15.75C15.75 12.75 13.5 11.25 13.5 6Z"
      stroke={props.color || "#321D00"}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M10.73 15.75C10.5512 16.0581 10.2929 16.3151 9.98394 16.4939C9.67498 16.6726 9.32551 16.7667 8.97 16.7667C8.61449 16.7667 8.26502 16.6726 7.95606 16.4939C7.6471 16.3151 7.38883 16.0581 7.21 15.75"
      stroke="#E58600"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);
