export type User = {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
};

export function displayName(user: User): string {
  if (user.firstName && user.lastName) {
    return `${user.firstName} ${user.lastName}`;
  }
  return user.email.split("@")[0];
}

export type SessionStatus = "loading" | "authenticated" | "unauthenticated";

export function isAdmin(user: User): boolean {
  return user.email.endsWith("@nexacore.org");
}
