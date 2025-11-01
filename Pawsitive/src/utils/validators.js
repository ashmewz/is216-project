// helpers for common checks
const isEmpty = (str) => !str?.trim()
const isValidPhone = (phone) => /^[0-9]{7,15}$/.test(phone)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
const isValidUsername = (username) => /^[a-z0-9_]+$/.test(username);
// only lowercase letters, numbers, and underscores

/**
 * Validate volunteer registration form
 */
export const validateRegistration = (form) => {
  const errors = {};

  if (isEmpty(form.firstName)) errors.firstName = 'First name cannot be empty.';
  if (isEmpty(form.lastName)) errors.lastName = 'Last name cannot be empty.';

  if (isEmpty(form.username)) {
    errors.username = 'Username cannot be empty.';
  } else if (!isValidUsername(form.username)) {
    errors.username = 'Username must be lowercase, no spaces, and only letters, numbers, or underscores.';
  }

  if (isEmpty(form.email)) errors.email = 'Email cannot be empty.';
  else if (!isValidEmail(form.email)) errors.email = 'Invalid email format.';

  if (isEmpty(form.password)) errors.password = 'Password cannot be empty.';
  else if (form.password.length < 6) errors.password = 'Password must be at least 6 characters.';

  if (isEmpty(form.confirmPassword)) errors.confirmPassword = 'Confirm Password cannot be empty';

  if (form.password !== form.confirmPassword) errors.confirmPassword = 'Passwords do not match.';

  if (isEmpty(form.contactNumber)) errors.contactNumber = 'Contact number cannot be empty.';
  else if (!isValidPhone(form.contactNumber))
    errors.contactNumber = 'Contact number must be 7-15 digits.';

  return errors;
};

/**
 * Validate login form
 */
export const validateLogin = (form) => {
  const errors = {};

  if (isEmpty(form.email)) errors.email = 'Email cannot be empty.';
  else if (!isValidEmail(form.email)) errors.email = 'Please enter a valid email address.';

  if (isEmpty(form.password)) errors.password = 'Password cannot be empty.';

  return errors;
};

/**
 * Validate profile update form
 */

export const validateProfileUpdate = (form) => {
  const errors = {};

  // First name
  if (isEmpty(form.firstName)) {
    errors.firstName = 'First name cannot be empty.';
  }

  // Last name
  if (isEmpty(form.lastName)) {
    errors.lastName = 'Last name cannot be empty.';
  }

  // Contact number
  if (isEmpty(form.contactNumber)) {
    errors.contactNumber = 'Contact number cannot be empty.';
  } else if (!isValidPhone(form.contactNumber)) {
    errors.contactNumber = 'Please enter a valid phone number (8-15 digits).';
  }

  // Skills
  if (Array.isArray(form.skills) && form.skills.some(s => isEmpty(s))) {
    errors.skills = 'All skills must be non-empty.';
  }

  // Services
  if (
    Array.isArray(form.services) &&
    form.services.some(
      s => isEmpty(s.type) || s.yearsOfExp == null || s.yearsOfExp < 0 || s.feeRate == null || s.feeRate < 0
    )
  ) {
    errors.services = 'All services must have type, experience, and fee.';
  }


  return errors;
};

export const validateCatReport = (form) => {
  const errors = {};

  if (isEmpty(form.name)) errors.name = "Cat name cannot be empty.";
  if (isEmpty(form.location)) errors.location = "Location cannot be empty.";
  if (isEmpty(form.description)) errors.description = "Description cannot be empty.";
  if (!form.status) errors.status = "Please select Lost or Found.";

  return errors;
};

export const validatePost = (form) => {
  const errors = {};

  if (!form.description?.trim()) errors.description = "Description cannot be empty.";

  return errors;
};


export const validateComment = (form) => {
  const errors = {};

  if (!form.comment || !form.comment.trim()) {
    errors.comment = "Comment cannot be empty.";
  }

  return errors;
};
