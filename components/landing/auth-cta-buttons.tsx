import Link from "next/link";

interface AuthCTAButtonsProps {
  className?: string;
  signInClassName?: string;
  signUpClassName?: string;
  signInFirst?: boolean;
}

export function AuthCTAButtons({
  className = "",
  signInClassName = "",
  signUpClassName = "",
  signInFirst = false,
}: AuthCTAButtonsProps) {
  const signInLink = (
    <Link href="/sign-in" className={signInClassName}>
      Sign In
    </Link>
  );

  const signUpLink = (
    <Link href="/signup" className={signUpClassName}>
      Sign Up
    </Link>
  );

  return (
    <div className={className}>
      {signInFirst ? signInLink : signUpLink}
      {signInFirst ? signUpLink : signInLink}
    </div>
  );
}