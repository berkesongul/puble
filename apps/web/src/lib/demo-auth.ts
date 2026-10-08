export type DemoUser = {
  name: string;
  email: string;
  initials: string;
};

export const AUTH_EVENT = "puble-auth-change";
export const SESSION_KEY = "puble.demo.session";

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toLocaleUpperCase("tr-TR"))
    .join("") || "PU";
}

export function createDemoSession(name: string, email: string): DemoUser {
  const user = {
    name: name.trim() || email.split("@")[0] || "Puble Kullanıcısı",
    email: email.trim().toLowerCase(),
    initials: getInitials(name || email.split("@")[0]),
  };

  window.localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
  return user;
}

export function readDemoSession(): DemoUser | null {
  try {
    const value = window.localStorage.getItem(SESSION_KEY);
    return value ? (JSON.parse(value) as DemoUser) : null;
  } catch {
    return null;
  }
}

export function clearDemoSession() {
  window.localStorage.removeItem(SESSION_KEY);
  window.dispatchEvent(new Event(AUTH_EVENT));
}
