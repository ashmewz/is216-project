// helpers for common checks
const isEmpty = (str) => !str?.trim()
const isValidPhone = (phone) => /^[0-9]{7,15}$/.test(phone)
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

/**
 * Validate volunteer registration form
 */
export const validateRegistration = (form) => {
  const errors = []

  if (isEmpty(form.firstName)) errors.push('First name cannot be empty.')
  if (isEmpty(form.lastName)) errors.push('Last name cannot be empty.')
  if (isEmpty(form.username)) errors.push('Username cannot be empty.')

  if (isEmpty(form.email)) errors.push('Email cannot be empty.')
  else if (!isValidEmail(form.email)) errors.push('Invalid email format.')

  if (!form.password) errors.push('Password cannot be empty.')
  else if (form.password.length < 6) errors.push('Password must be at least 6 characters.')

  if (form.password !== form.confirmPassword) errors.push('Passwords do not match.')

  if (isEmpty(form.contactNumber)) errors.push('Contact number cannot be empty.')
  else if (!isValidPhone(form.contactNumber))
    errors.push('Contact number must be 7-15 digits.')

  return errors
}

/**
 * Validate login form
 */
export const validateLogin = (form) => {
  const errors = []

  if (isEmpty(form.email)) errors.push('Email cannot be empty.')
  else if (!isValidEmail(form.email)) errors.push('Please enter a valid email address.')

  if (isEmpty(form.password)) errors.push('Password cannot be empty.')

  return errors
}

/**
 * Validate profile update form
 */
export const validateProfileUpdate = (form) => {
  const errors = []

  if (isEmpty(form.firstName)) errors.push('First name cannot be empty.')
  if (isEmpty(form.lastName)) errors.push('Last name cannot be empty.')

  if (isEmpty(form.contactNumber)) errors.push('Contact number cannot be empty.')
  else if (!isValidPhone(form.contactNumber))
    errors.push('Please enter a valid contact number (digits only, 7-15 characters).')

  if (form.skills.some((s) => !s.trim())) errors.push('All skills must be non-empty.')

  if (form.services.some((s) => !s.type?.trim() || s.yearsOfExp < 0 || s.feeRate < 0))
    errors.push('All services must have type, experience, and fee.')

  return errors
}
