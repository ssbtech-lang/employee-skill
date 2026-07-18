const mongoose = require("mongoose");
const Certification = require("../models/Certification");
const {
  validateCertificationData,
} = require("../utils/certificationValidation");

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const normalizeCertificationInput = (body) => {
  const allowedFields = [
    "certificationName",
    "issuingOrganization",
    "issueDate",
    "expiryDate",
    "doesNotExpire",
    "credentialId",
    "credentialUrl",
    "verificationStatus",
    "skills",
  ];

  const data = {};

  allowedFields.forEach((field) => {
    if (body[field] !== undefined) {
      data[field] = body[field];
    }
  });

  if (typeof data.certificationName === "string") {
    data.certificationName = data.certificationName.trim();
  }

  if (typeof data.issuingOrganization === "string") {
    data.issuingOrganization = data.issuingOrganization.trim();
  }

  if (typeof data.credentialId === "string") {
    data.credentialId = data.credentialId.trim() || null;
  }

  if (typeof data.credentialUrl === "string") {
    data.credentialUrl = data.credentialUrl.trim() || null;
  }

  if (Array.isArray(data.skills)) {
    data.skills = [
      ...new Set(
        data.skills
          .filter((skill) => typeof skill === "string")
          .map((skill) => skill.trim())
          .filter(Boolean)
      ),
    ];
  }

  if (data.doesNotExpire === true) {
    data.expiryDate = null;
  }

  return data;
};

/**
 * POST /api/certifications
 * Creates a certification for the currently authenticated user.
 */
const createCertification = async (req, res) => {
  try {
    const certificationData = normalizeCertificationInput(req.body);

    const validationErrors = validateCertificationData(certificationData);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Certification validation failed",
        errors: validationErrors,
      });
    }

    const certification = await Certification.create({
      ...certificationData,
      userId: req.user._id,
      source: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Certification added successfully",
      certification,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This certification already exists for your account",
      });
    }

    console.error(error);

    return res.status(500).json({
        success:false,
        message:error.message
    });
    // console.error("Create certification error:", error);

    // return res.status(500).json({
    //   success: false,
    //   message: "Unable to create certification",
    // });
  }
};

/**
 * GET /api/certifications
 * Returns certifications belonging to the current user.
 */
const getMyCertifications = async (req, res) => {
  try {
    const certifications = await Certification.find({
      userId: req.user._id,
    }).sort({
      issueDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: certifications.length,
      certifications,
    });
  } catch (error) {
    console.error("Get certifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve certifications",
    });
  }
};

/**
 * GET /api/certifications/user/:userId
 * Intended for manager, HR and L&D discovery views.
 */
const getCertificationsByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid user ID",
      });
    }

    const certifications = await Certification.find({
      userId,
    }).sort({
      issueDate: -1,
      createdAt: -1,
    });

    return res.status(200).json({
      success: true,
      count: certifications.length,
      certifications,
    });
  } catch (error) {
    console.error("Get user certifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve employee certifications",
    });
  }
};

/**
 * GET /api/certifications/:id
 */
const getCertificationById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certification ID",
      });
    }

    const certification = await Certification.findById(id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: "Certification not found",
      });
    }

    const isOwner =
      certification.userId.toString() === req.user._id.toString();

    const privilegedRoles = ["manager", "hr", "ld"];
    const hasPrivilegedRole = privilegedRoles.includes(req.user.role);

    if (!isOwner && !hasPrivilegedRole) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to view this certification",
      });
    }

    return res.status(200).json({
      success: true,
      certification,
    });
  } catch (error) {
    console.error("Get certification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to retrieve certification",
    });
  }
};

/**
 * PUT /api/certifications/:id
 */
const updateCertification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certification ID",
      });
    }

    const certification = await Certification.findById(id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: "Certification not found",
      });
    }

    if (certification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own certifications",
      });
    }

    const updateData = normalizeCertificationInput(req.body);

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({
        success: false,
        message: "No valid certification fields were provided",
      });
    }

    const mergedData = {
      certificationName:
        updateData.certificationName ?? certification.certificationName,
      issuingOrganization:
        updateData.issuingOrganization ?? certification.issuingOrganization,
      issueDate: updateData.issueDate ?? certification.issueDate,
      expiryDate:
        updateData.expiryDate !== undefined
          ? updateData.expiryDate
          : certification.expiryDate,
      doesNotExpire:
        updateData.doesNotExpire !== undefined
          ? updateData.doesNotExpire
          : certification.doesNotExpire,
      credentialId:
        updateData.credentialId !== undefined
          ? updateData.credentialId
          : certification.credentialId,
      credentialUrl:
        updateData.credentialUrl !== undefined
          ? updateData.credentialUrl
          : certification.credentialUrl,
      skills:
        updateData.skills !== undefined
          ? updateData.skills
          : certification.skills,
    };

    const validationErrors = validateCertificationData(mergedData, false);

    if (validationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Certification validation failed",
        errors: validationErrors,
      });
    }

    Object.assign(certification, updateData);

    await certification.save();

    return res.status(200).json({
      success: true,
      message: "Certification updated successfully",
      certification,
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: "This certification already exists for your account",
      });
    }

    console.error("Update certification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to update certification",
    });
  }
};

/**
 * DELETE /api/certifications/:id
 */
const deleteCertification = async (req, res) => {
  try {
    const { id } = req.params;

    if (!isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid certification ID",
      });
    }

    const certification = await Certification.findById(id);

    if (!certification) {
      return res.status(404).json({
        success: false,
        message: "Certification not found",
      });
    }

    if (certification.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own certifications",
      });
    }

    await certification.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Certification deleted successfully",
    });
  } catch (error) {
    console.error("Delete certification error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to delete certification",
    });
  }
};

module.exports = {
  createCertification,
  getMyCertifications,
  getCertificationsByUser,
  getCertificationById,
  updateCertification,
  deleteCertification,
};