export const validateProfileUpdate = (form) => {
    const errors = []

    const firstName = form.firstName?.trim()
    const lastName = form.lastName?.trim()
    const contactNumber = form.contactNumber?.trim()

    if (!firstName) errors.push('First name cannot be empty.')
    if (!lastName) errors.push('Last name cannot be empty.')
    if (!contactNumber) {
        errors.push('Contact number cannot be empty.')
    } else {
        // Phone number regex: digits only, 7-15 characters
        const phoneRegex = /^[0-9]{7,15}$/
        if (!phoneRegex.test(contactNumber)) {
            errors.push('Please enter a valid contact number (digits only, 7-15 characters).')
        }
    }

    if (form.skills.some(s => !s.trim())) errors.push('All skills must be non-empty.')

    if (form.services.some(s => !s.type?.trim() || s.yearsOfExp < 0 || s.feeRate < 0)) {
        errors.push('All services must have type, experience, and fee.')
    }

    return errors
}



export const validateRegistration = (form) => {
    const errors = []

    // Trimmed values
    const firstName = form.firstName?.trim()
    const lastName = form.lastName?.trim()
    const username = form.username?.trim()
    const email = form.email?.trim()
    const password = form.password || ''
    const confirmPassword = form.confirmPassword || ''
    const contactNumber = form.contactNumber?.trim()

    // First & Last Name
    if (!firstName) errors.push('First name cannot be empty.')
    if (!lastName) errors.push('Last name cannot be empty.')

    // Username
    if (!username) errors.push('Username cannot be empty.')

    // Email
    if (!email) {
        errors.push('Email cannot be empty.')
    } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) errors.push('Invalid email format.')
    }

    // Password
    if (!password) errors.push('Password cannot be empty.')
    else if (password.length < 6) errors.push('Password must be at least 6 characters.')
    // Optional: stronger password checks here

    // Confirm Password
    if (password !== confirmPassword) errors.push('Passwords do not match.')

    // Contact Number
    if (!contactNumber) {
        errors.push('Contact number cannot be empty.')
    } else {
        const phoneRegex = /^[0-9]{7,15}$/
        if (!phoneRegex.test(contactNumber)) errors.push('Contact number must be 7-15 digits.')
    }

    return errors
}

