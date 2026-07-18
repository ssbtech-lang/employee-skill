const isValidDate = (value) => {
  if (!value) {
    return false;
  }

  const date = new Date(value);
  return !Number.isNaN(date.getTime());
};

const isValidUrl = (value) => {
  if (!value) {
    return true;
  }

  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol);
  } catch (error) {
    return false;
  }
};

const validateCertificationData = (data, isUpdate = false) => {
  const errors = [];

  if (!isUpdate || data.certificationName !== undefined) {
    if (
      typeof data.certificationName !== "string" ||
      !data.certificationName.trim()
    ) {
      errors.push("Certification name is required");
    }
  }

  if (!isUpdate || data.issuingOrganization !== undefined) {
    if (
      typeof data.issuingOrganization !== "string" ||
      !data.issuingOrganization.trim()
    ) {
      errors.push("Issuing organization is required");
    }
  }

  if (!isUpdate || data.issueDate !== undefined) {
    if (!isValidDate(data.issueDate)) {
      errors.push("A valid issue date is required");
    }
  }

  if (data.expiryDate && !isValidDate(data.expiryDate)) {
    errors.push("Expiry date must be a valid date");
  }

  if (
    data.issueDate &&
    data.expiryDate &&
    new Date(data.expiryDate) < new Date(data.issueDate)
  ) {
    errors.push("Expiry date cannot be earlier than issue date");
  }

  if (data.credentialUrl && !isValidUrl(data.credentialUrl)) {
    errors.push("Credential URL must be a valid HTTP or HTTPS URL");
  }

  if (data.skills !== undefined && !Array.isArray(data.skills)) {
    errors.push("Skills must be provided as an array");
  }

  return errors;
};

module.exports = {
  validateCertificationData,
};