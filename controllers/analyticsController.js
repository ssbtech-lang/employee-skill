const User = require("../models/User");
const Skill = require("../models/Skill");
const EmployeeProfile = require("../models/EmployeeProfile");
const Certification = require("../models/Certification");

/**
 * GET /api/analytics/summary
 *
 * Returns high-level dashboard statistics.
 *
 * Access:
 * Manager, HR, L&D
 */
const getAnalyticsSummary = async (req, res) => {
  try {
    const [
      totalEmployees,
      totalSkills,
      uniqueSkillsResult,
      totalCertifications,
      resumeParsedEmployees,
      totalProfiles,
    ] = await Promise.all([
      User.countDocuments({
        role: "employee",
      }),

      Skill.countDocuments(),

      Skill.aggregate([
        {
          $match: {
            skillName: {
              $exists: true,
              $ne: "",
            },
          },
        },
        {
          $group: {
            _id: {
              $toLower: "$skillName",
            },
          },
        },
        {
          $count: "count",
        },
      ]),

      Certification.countDocuments(),

      EmployeeProfile.countDocuments({
        resumeParsed: true,
      }),

      EmployeeProfile.countDocuments(),
    ]);

    const uniqueSkills =
      uniqueSkillsResult.length > 0
        ? uniqueSkillsResult[0].count
        : 0;

    const resumeParsedPercentage =
      totalProfiles > 0
        ? Number(
            (
              (resumeParsedEmployees / totalProfiles) *
              100
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,
      summary: {
        totalEmployees,
        totalProfiles,
        totalSkills,
        uniqueSkills,
        totalCertifications,
        resumeParsedEmployees,
        resumeNotParsedEmployees:
          totalProfiles - resumeParsedEmployees,
        resumeParsedPercentage,
      },
    });
  } catch (error) {
    console.error(
      "Analytics summary error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve analytics summary",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET /api/analytics/top-skills
 *
 * Query:
 * limit=10
 *
 * Returns the most common skills in the organisation.
 *
 * Access:
 * Manager, HR, L&D
 */
const getTopSkills = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const topSkills = await Skill.aggregate([
      {
        $match: {
          skillName: {
            $exists: true,
            $type: "string",
            $ne: "",
          },
        },
      },

      /*
       * Normalise names so React, react and REACT are
       * treated as the same skill.
       */
      {
        $project: {
          userId: 1,
          normalizedSkillName: {
            $toLower: {
              $trim: {
                input: "$skillName",
              },
            },
          },
          proficiencyLevel: 1,
          yearsOfExperience: {
            $ifNull: [
              "$yearsOfExperience",
              0,
            ],
          },
          endorsementCount: {
            $ifNull: [
              "$endorsementCount",
              0,
            ],
          },
          source: 1,
        },
      },

      /*
       * Prevent duplicate skill records belonging to the
       * same employee from artificially increasing counts.
       */
      {
        $group: {
          _id: {
            skillName:
              "$normalizedSkillName",
            userId: "$userId",
          },

          maximumExperience: {
            $max: "$yearsOfExperience",
          },

          totalEndorsements: {
            $max: "$endorsementCount",
          },

          sources: {
            $addToSet: "$source",
          },
        },
      },

      /*
       * Group all employees belonging to one skill.
       */
      {
        $group: {
          _id: "$_id.skillName",

          employeeCount: {
            $sum: 1,
          },

          averageExperience: {
            $avg: "$maximumExperience",
          },

          totalEndorsements: {
            $sum: "$totalEndorsements",
          },

          resumeBackedEmployeeCount: {
            $sum: {
              $cond: [
                {
                  $in: [
                    "resume",
                    "$sources",
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },

      {
        $sort: {
          employeeCount: -1,
          averageExperience: -1,
          _id: 1,
        },
      },

      {
        $limit: limit,
      },

      {
        $project: {
          _id: 0,

          skillName: "$_id",

          employeeCount: 1,

          averageExperience: {
            $round: [
              "$averageExperience",
              2,
            ],
          },

          totalEndorsements: 1,

          resumeBackedEmployeeCount: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: topSkills.length,
      limit,
      data: topSkills,
    });
  } catch (error) {
    console.error(
      "Top skills analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve top skills analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET /api/analytics/departments
 *
 * Returns department-wise employee and skill distribution.
 */
const getDepartmentAnalytics = async (req, res) => {
  try {
    const departmentData = await EmployeeProfile.aggregate([
      /*
       * Ignore profiles that do not have a department.
       */
      {
        $match: {
          department: {
            $exists: true,
            $type: "string",
            $ne: "",
          },
        },
      },

      /*
       * Normalize department names so Engineering,
       * engineering and ENGINEERING are grouped together.
       */
      {
        $project: {
          userId: 1,

          originalDepartment: {
            $trim: {
              input: "$department",
            },
          },

          normalizedDepartment: {
            $toLower: {
              $trim: {
                input: "$department",
              },
            },
          },
        },
      },

      /*
       * Prevent duplicate profile records from counting
       * the same user twice.
       */
      {
        $group: {
          _id: {
            department: "$normalizedDepartment",
            userId: "$userId",
          },

          displayDepartment: {
            $first: "$originalDepartment",
          },
        },
      },

      /*
       * Group all employees by department.
       */
      {
        $group: {
          _id: "$_id.department",

          department: {
            $first: "$displayDepartment",
          },

          employeeCount: {
            $sum: 1,
          },

          employeeIds: {
            $push: "$_id.userId",
          },
        },
      },

      /*
       * Fetch skills belonging to employees in each department.
       *
       * Mongoose normally stores the Skill model in the
       * "skills" collection.
       */
      {
        $lookup: {
          from: "skills",

          let: {
            departmentEmployeeIds: "$employeeIds",
          },

          pipeline: [
            {
              $match: {
                $expr: {
                  $in: [
                    "$userId",
                    "$$departmentEmployeeIds",
                  ],
                },
              },
            },

            {
              $match: {
                skillName: {
                  $exists: true,
                  $type: "string",
                  $ne: "",
                },
              },
            },

            {
              $project: {
                userId: 1,
                skillName: 1,
                proficiencyLevel: 1,
                yearsOfExperience: {
                  $ifNull: [
                    "$yearsOfExperience",
                    0,
                  ],
                },

                normalizedSkillName: {
                  $toLower: {
                    $trim: {
                      input: "$skillName",
                    },
                  },
                },
              },
            },
          ],

          as: "departmentSkills",
        },
      },

      /*
       * Create department summary values.
       */
      {
        $project: {
          _id: 0,

          department: 1,
          employeeCount: 1,

          totalSkillRecords: {
            $size: "$departmentSkills",
          },

          uniqueSkills: {
            $size: {
              $setUnion: [
                "$departmentSkills.normalizedSkillName",
                [],
              ],
            },
          },

          averageSkillsPerEmployee: {
            $cond: [
              {
                $gt: [
                  "$employeeCount",
                  0,
                ],
              },

              {
                $round: [
                  {
                    $divide: [
                      {
                        $size: "$departmentSkills",
                      },
                      "$employeeCount",
                    ],
                  },
                  2,
                ],
              },

              0,
            ],
          },
        },
      },

      {
        $sort: {
          employeeCount: -1,
          department: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      count: departmentData.length,
      data: departmentData,
    });
  } catch (error) {
    console.error(
      "Department analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve department analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET /api/analytics/certifications
 *
 * Query:
 * limit=10
 *
 * Returns certification summary and most common certifications.
 */
const getCertificationAnalytics = async (req, res) => {
  try {
    const requestedLimit = Number(req.query.limit);

    const limit =
      Number.isInteger(requestedLimit) &&
      requestedLimit > 0
        ? Math.min(requestedLimit, 50)
        : 10;

    const currentDate = new Date();

    const [
      totalCertifications,
      verifiedCertifications,
      pendingCertifications,
      unverifiedCertifications,
      rejectedCertifications,
      expiredCertifications,
      uniqueCertificationResult,
      topCertifications,
    ] = await Promise.all([
      Certification.countDocuments(),

      Certification.countDocuments({
        verificationStatus: "verified",
      }),

      Certification.countDocuments({
        verificationStatus: "pending",
      }),

      Certification.countDocuments({
        verificationStatus: "unverified",
      }),

      Certification.countDocuments({
        verificationStatus: "rejected",
      }),

      Certification.countDocuments({
        doesNotExpire: {
          $ne: true,
        },

        expiryDate: {
          $ne: null,
          $lt: currentDate,
        },
      }),

      Certification.aggregate([
        {
          $match: {
            certificationName: {
              $exists: true,
              $type: "string",
              $ne: "",
            },
          },
        },

        {
          $group: {
            _id: {
              $toLower: {
                $trim: {
                  input: "$certificationName",
                },
              },
            },
          },
        },

        {
          $count: "count",
        },
      ]),

      Certification.aggregate([
        {
          $match: {
            certificationName: {
              $exists: true,
              $type: "string",
              $ne: "",
            },
          },
        },

        {
          $project: {
            userId: 1,

            originalCertificationName: {
              $trim: {
                input: "$certificationName",
              },
            },

            normalizedCertificationName: {
              $toLower: {
                $trim: {
                  input: "$certificationName",
                },
              },
            },

            issuingOrganization: 1,
            verificationStatus: 1,
          },
        },

        /*
         * Count an employee once per certification name.
         */
        {
          $group: {
            _id: {
              certificationName:
                "$normalizedCertificationName",
              userId: "$userId",
            },

            displayCertificationName: {
              $first:
                "$originalCertificationName",
            },

            issuingOrganization: {
              $first: "$issuingOrganization",
            },

            verificationStatuses: {
              $addToSet:
                "$verificationStatus",
            },
          },
        },

        {
          $group: {
            _id:
              "$_id.certificationName",

            certificationName: {
              $first:
                "$displayCertificationName",
            },

            issuingOrganizations: {
              $addToSet:
                "$issuingOrganization",
            },

            employeeCount: {
              $sum: 1,
            },

            verifiedEmployeeCount: {
              $sum: {
                $cond: [
                  {
                    $in: [
                      "verified",
                      "$verificationStatuses",
                    ],
                  },
                  1,
                  0,
                ],
              },
            },
          },
        },

        {
          $sort: {
            employeeCount: -1,
            certificationName: 1,
          },
        },

        {
          $limit: limit,
        },

        {
          $project: {
            _id: 0,
            certificationName: 1,
            issuingOrganizations: 1,
            employeeCount: 1,
            verifiedEmployeeCount: 1,
          },
        },
      ]),
    ]);

    const uniqueCertifications =
      uniqueCertificationResult.length > 0
        ? uniqueCertificationResult[0].count
        : 0;

    const activeCertifications = Math.max(
      totalCertifications -
        expiredCertifications,
      0
    );

    return res.status(200).json({
      success: true,

      summary: {
        totalCertifications,
        uniqueCertifications,
        activeCertifications,
        expiredCertifications,
        verifiedCertifications,
        pendingCertifications,
        unverifiedCertifications,
        rejectedCertifications,
      },

      limit,
      topCertifications,
    });
  } catch (error) {
    console.error(
      "Certification analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve certification analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

/**
 * GET /api/analytics/resume-stats
 *
 * Returns profile and resume completion statistics.
 */
const getResumeStats = async (req, res) => {
  try {
    const [
      totalEmployees,
      totalProfiles,
      resumeParsedProfiles,
      resumeNotParsedProfiles,
      profilesWithResumeFile,
    ] = await Promise.all([
      User.countDocuments({
        role: "employee",
      }),

      EmployeeProfile.countDocuments(),

      EmployeeProfile.countDocuments({
        resumeParsed: true,
      }),

      EmployeeProfile.countDocuments({
        $or: [
          {
            resumeParsed: false,
          },
          {
            resumeParsed: {
              $exists: false,
            },
          },
        ],
      }),

      EmployeeProfile.countDocuments({
        resumeFileName: {
          $exists: true,
          $type: "string",
          $ne: "",
        },
      }),
    ]);

    const employeesWithoutProfile = Math.max(
      totalEmployees - totalProfiles,
      0
    );

    const profileCompletionPercentage =
      totalEmployees > 0
        ? Number(
            (
              (totalProfiles /
                totalEmployees) *
              100
            ).toFixed(2)
          )
        : 0;

    const resumeParsedPercentageOfEmployees =
      totalEmployees > 0
        ? Number(
            (
              (resumeParsedProfiles /
                totalEmployees) *
              100
            ).toFixed(2)
          )
        : 0;

    const resumeParsedPercentageOfProfiles =
      totalProfiles > 0
        ? Number(
            (
              (resumeParsedProfiles /
                totalProfiles) *
              100
            ).toFixed(2)
          )
        : 0;

    return res.status(200).json({
      success: true,

      data: {
        totalEmployees,
        totalProfiles,
        employeesWithoutProfile,

        resumeParsedProfiles,
        resumeNotParsedProfiles,
        profilesWithResumeFile,

        profileCompletionPercentage,
        resumeParsedPercentageOfEmployees,
        resumeParsedPercentageOfProfiles,
      },
    });
  } catch (error) {
    console.error(
      "Resume analytics error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to retrieve resume analytics",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  getAnalyticsSummary,
  getTopSkills,
  getDepartmentAnalytics,
  getCertificationAnalytics,
  getResumeStats,
};