export function validateName(value: string): string {
  const trimmed = value.trim();

  if (!trimmed) {
    return "Name is required.";
  }

  if (/\d/.test(trimmed)) {
    return "Name cannot contain numbers.";
  }

  const letters = trimmed.match(/\p{L}/gu) ?? [];

  if (letters.length < 2) {
    return "Name must contain at least 2 letters.";
  }

  if (!/^[\p{L}\s'-]+$/u.test(trimmed)) {
    return "Name can only contain letters, spaces, apostrophes, and hyphens.";
  }

  return "";
}

export function validateEmail(value: string): string {
  const trimmed = value.trim().toLowerCase();

  if (!trimmed) {
    return "Email is required.";
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!emailPattern.test(trimmed)) {
    return "Please enter a valid email address.";
  }

  return "";
}