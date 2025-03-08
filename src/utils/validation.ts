
export const validateEmail = (email: string): string | null => {
  if (!email) {
    return "Email is required";
  }
  return null;
};

export const validateUsername = (username: string): string | null => {
  if (!username) {
    return "Username is required";
  }
  if (username.length < 3) {
    return "Username should be at least 3 characters";
  }
  return null;
};

export const validatePassword = (password: string): string | null => {
  if (!password) {
    return "Password is required";
  }
  if (password.length < 6) {
    return "Password should be at least 6 characters";
  }
  return null;
};

export const validateConfirmPassword = (password: string, confirmPassword: string): string | null => {
  if (password !== confirmPassword) {
    return "Passwords don't match";
  }
  return null;
};
