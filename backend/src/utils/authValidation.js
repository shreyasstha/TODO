const USERNAME_MIN = 3;
const USERNAME_MAX = 50;
const USERNAME_PATTERN = /^[a-zA-Z0-9_]+$/;

const LOGIN_PASSWORD_MIN = 6;
const REGISTER_PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;

export function validateUsername(username) {
  const errors = {};

  if (typeof username !== "string" || !username.trim()) {
    errors.username = "Username is required.";
    return { valid: false, errors };
  }

  const trimmed = username.trim();

  if (trimmed.length < USERNAME_MIN) {
    errors.username = `Username must be at least ${USERNAME_MIN} characters.`;
  } else if (trimmed.length > USERNAME_MAX) {
    errors.username = `Username must be ${USERNAME_MAX} characters or fewer.`;
  } else if (!USERNAME_PATTERN.test(trimmed)) {
    errors.username = "Username may only contain letters, numbers, and underscores.";
  } else if (/^\d/.test(trimmed)) {
    errors.username = "Username cannot start with a number.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, username: trimmed, errors: {} };
}

export function validateLoginPassword(password) {
  const errors = {};

  if (typeof password !== "string" || !password) {
    errors.password = "Password is required.";
    return { valid: false, errors };
  }

  // if (password.length < LOGIN_PASSWORD_MIN) {
  //   errors.password = `Password must be at least ${LOGIN_PASSWORD_MIN} characters.`;
  // } else if (password.length > PASSWORD_MAX) {
  //   errors.password = `Password must be ${PASSWORD_MAX} characters or fewer.`;
  // } else if (/\s/.test(password)) {
  //   errors.password = "Password cannot contain spaces.";
  // }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, password, errors: {} };
}

export function validateRegisterPassword(password) {
  const errors = {};

  if (typeof password !== "string" || !password) {
    errors.password = "Password is required.";
    return { valid: false, errors };
  }

  if (password.length < REGISTER_PASSWORD_MIN) {
    errors.password = `Password must be at least ${REGISTER_PASSWORD_MIN} characters.`;
  } else if (password.length > PASSWORD_MAX) {
    errors.password = `Password must be ${PASSWORD_MAX} characters or fewer.`;
  } else if (/\s/.test(password)) {
    errors.password = "Password cannot contain spaces.";
  } else if (!/[a-z]/.test(password)) {
    errors.password = "Password must include at least one lowercase letter.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Password must include at least one uppercase letter.";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Password must include at least one number.";
  } else if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    errors.password = "Password must include at least one special character.";
  }

  if (Object.keys(errors).length > 0) {
    return { valid: false, errors };
  }

  return { valid: true, password, errors: {} };
}

function mergeErrors(...errorObjects) {
  return Object.assign({}, ...errorObjects);
}

export function validateLoginInput(username, password) {
  const usernameResult = validateUsername(username);
  const passwordResult = validateLoginPassword(password);

  if (!usernameResult.valid || !passwordResult.valid) {
    return {
      valid: false,
      errors: mergeErrors(usernameResult.errors, passwordResult.errors),
    };
  }

  return {
    valid: true,
    username: usernameResult.username,
    password: passwordResult.password,
    errors: {},
  };
}

export function validateRegisterInput(username, password) {
  const usernameResult = validateUsername(username);
  const passwordResult = validateRegisterPassword(password);

  if (!usernameResult.valid || !passwordResult.valid) {
    return {
      valid: false,
      errors: mergeErrors(usernameResult.errors, passwordResult.errors),
    };
  }

  return {
    valid: true,
    username: usernameResult.username,
    password: passwordResult.password,
    errors: {},
  };
}

export function formatValidationResponse(errors) {
  const messages = Object.values(errors);
  return {
    message: messages[0] || "Validation failed.",
    errors,
  };
}
