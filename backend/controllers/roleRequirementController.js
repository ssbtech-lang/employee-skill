// Create Role Requirement
const RoleRequirement = require("../models/RoleRequirement");

const createRoleRequirement = async (req, res) => {
  try {
    const role = await RoleRequirement.create({
      roleName: req.body.roleName,
      department: req.body.department,
      description: req.body.description,
      requiredSkills: req.body.requiredSkills,
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: "Role requirement created successfully",
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get All Roles
const getAllRoleRequirements = async (req, res) => {
  try {
    const roles = await RoleRequirement.find({
      isActive: true,
    })
      .populate("createdBy", "name email")
      .sort({
        roleName: 1,
      });

    res.status(200).json({
      success: true,
      count: roles.length,
      roles,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Get Role By ID
const getRoleRequirement = async (req, res) => {
  try {
    const role = await RoleRequirement.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    res.status(200).json({
      success: true,
      role,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Update Role
const updateRoleRequirement = async (req, res) => {
  try {
    const role = await RoleRequirement.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const updatedRole =
      await RoleRequirement.findByIdAndUpdate(
        req.params.id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      role: updatedRole,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// Soft Delete
const deleteRoleRequirement = async (req, res) => {
  try {
    const role = await RoleRequirement.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    role.isActive = false;

    await role.save();

    res.status(200).json({
      success: true,
      message: "Role requirement removed",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
module.exports = {
  createRoleRequirement,
  getAllRoleRequirements,
  getRoleRequirement,
  updateRoleRequirement,
  deleteRoleRequirement,
};
