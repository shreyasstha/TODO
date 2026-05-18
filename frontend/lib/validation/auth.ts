export type AuthMode = "login" | "register";

export interface AuthFieldErrors {
  username?: string;
  password?: string;
  confirmPassword?: string;
}

export interface AuthValidationResult {
  valid: boolean;
  errors: AuthFieldErrors;
}

const USERNAME_MIN = 3;
const USERNAME_MAX = 50;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const LOGIN_PASSWORD_MIN = 6;
const REGISTER_PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export function validateUsername(username: string): string | undefined {
  const trimmed = username.trim();

  if (!trimmed) {
    return "Username is required.";
  }
  if (trimmed.length < USERNAME_MIN) {
    return `Username must be at least ${USERNAME_MIN} characters.`;
  }
  if (trimmed.length > USERNAME_MAX) {
    return `Username must be ${USERNAME_MAX} characters or fewer.`;
  }
  if (!USERNAME_PATTERN.test(trimmed)) {
    return "Username may only contain letters, numbers, and underscores.";
  }
  if (/^\d/.test(trimmed)) {
    return "Username cannot start with a number.";
  }
  return undefined;
}

export function validateLoginPassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < LOGIN_PASSWORD_MIN) {
    return `Password must be at least ${LOGIN_PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  }
  if (/\s/.test(password)) {
    return "Password cannot contain spaces.";
  }
  return undefined;
}

export function validateRegisterPassword(password: string): string | undefined {
  if (!password) {
    return "Password is required.";
  }
  if (password.length < REGISTER_PASSWORD_MIN) {
    return `Password must be at least ${REGISTER_PASSWORD_MIN} characters.`;
  }
  if (password.length > PASSWORD_MAX) {
    return `Password must be ${PASSWORD_MAX} characters or fewer.`;
  }
  if (/\s/.test(password)) {
    return "Password cannot contain spaces.";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must include at least one lowercase letter.";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must include at least one uppercase letter.";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must include at least one number.";
  }
  if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return "Password must include at least one special character.";
  }
  return undefined;
}

export function validateConfirmPassword(
  password: string,
  confirmPassword: string
): string | undefined {
  if (!confirmPassword) {
    return "Please confirm your password.";
  }
  if (password !== confirmPassword) {
    return "Passwords do not match.";
  }
  return undefined;
}

export function validateAuthForm(
  mode: AuthMode,
  username: string,
  password: string,
  confirmPassword = ""
): AuthValidationResult {
  const errors: AuthFieldErrors = {};

  const usernameError = validateUsername(username);
  if (usernameError) errors.username = usernameError;

  const passwordError =
    mode === "register"
      ? validateRegisterPassword(password)
      : validateLoginPassword(password);
  if (passwordError) errors.password = passwordError;

  if (mode === "register") {
    const confirmError = validateConfirmPassword(password, confirmPassword);
    if (confirmError) errors.confirmPassword = confirmError;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function getPasswordHints(mode: AuthMode): string[] {
  if (mode === "login") {
    return [
      // `At least ${LOGIN_PASSWORD_MIN} characters`,
      // "No spaces allowed",
    ];
  }
  return [
    `At least ${REGISTER_PASSWORD_MIN} characters`,
    "One uppercase and one lowercase letter",
    "One number and one special character",
    "No spaces allowed",
  ];
}
