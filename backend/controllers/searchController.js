const Skill = require("../models/Skill");
const EmployeeProfile = require("../models/EmployeeProfile");
const User = require("../models/User");
// const Skill = require("../models/Skill");
// const EmployeeProfile = require("../models/EmployeeProfile");
const Certification = require("../models/Certification");
const calculateTrustScore = require("../utils/trustScore");

const {
  PROFICIENCY_SCORES,
  escapeRegex,
  parseSkills,
  calculateSkillScore,
} = require("../utils/searchUtils");

const levelScore = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4,
};

const searchEmployees = async (req, res) => {
  try {
    const { skill, minYears, proficiencyLevel } = req.query;

    const filter = {};

    if (skill) {
      filter.skillName = {
        $regex: skill,
        $options: "i",
      };
    }

    if (minYears) {
      filter.yearsOfExperience = {
        $gte: Number(minYears),
      };
    }

    if (proficiencyLevel) {
      filter.proficiencyLevel = proficiencyLevel;
    }

    const skills = await Skill.find(filter)
      .populate("userId", "name email role");

    // Group skills by userId
    const userSkillsMap = {};
    skills.forEach(skill => {
      const userId = skill.userId._id.toString();
      if (!userSkillsMap[userId]) {
        userSkillsMap[userId] = {
          user: skill.userId,
          skills: [],
          totalScore: 0
        };
      }
      
      let score = 0;
      score += levelScore[skill.proficiencyLevel] || 0;
      score += skill.yearsOfExperience || 0;
      score += skill.endorsementCount || 0;
      if (skill.source === "resume") score += 2;
      if (skill.source === "endorsed") score += 3;
      
      userSkillsMap[userId].skills.push({
        skillName: skill.skillName,
        category: skill.category,
        proficiencyLevel: skill.proficiencyLevel,
        yearsOfExperience: skill.yearsOfExperience,
        source: skill.source,
        endorsementCount: skill.endorsementCount,
        _id: skill._id
      });
      userSkillsMap[userId].totalScore += score;
    });

    // Get profiles for users
    const userIds = Object.keys(userSkillsMap);
    const profiles = await EmployeeProfile.find({
      userId: { $in: userIds }
    });

    const profileMap = {};
    profiles.forEach(profile => {
      profileMap[profile.userId.toString()] = profile;
    });

    // Build results
    const results = Object.values(userSkillsMap).map(item => ({
    employee: item.user,
    profile: profileMap[item.user._id.toString()] || null,
    skills: item.skills,
    matchScore: Math.round(item.totalScore / item.skills.length * 10) / 10
}));

    // const results = skills.map((s) => {
    //   let score = 0;

    //   score += levelScore[s.proficiencyLevel] || 0;
    //   score += s.yearsOfExperience || 0;
    //   score += s.endorsementCount || 0;

    //   if (s.source === "resume") score += 2;
    //   if (s.source === "endorsed") score += 3;

    //   return {
    //     employee: s.userId,
    //     matchedSkill: {
    //       skillName: s.skillName,
    //       category: s.category,
    //       proficiencyLevel: s.proficiencyLevel,
    //       yearsOfExperience: s.yearsOfExperience,
    //       source: s.source,
    //       endorsementCount: s.endorsementCount,
    //     },
    //     matchScore: score,
    //   };
    // });

    results.sort((a, b) => b.matchScore - a.matchScore);

    res.status(200).json({
      count: results.length,
      results,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};


const advancedEmployeeSearch = async (req, res) => {
  try {
    const {
      skills,
      matchMode = "any",
      department,
      designation,
      location,
      education,
      certification,
      minExperience,
      maxExperience,
      minProficiency,
      page = 1,
      limit = 10,
    } = req.query;

    const requestedSkills = parseSkills(skills);

    const normalizedMatchMode =
      String(matchMode).toLowerCase() === "all"
        ? "all"
        : "any";

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(
      Math.max(Number(limit) || 10, 1),
      50
    );

    const minimumExperience =
      minExperience !== undefined
        ? Number(minExperience)
        : 0;

    const maximumExperience =
      maxExperience !== undefined
        ? Number(maxExperience)
        : Number.MAX_SAFE_INTEGER;

    if (
      Number.isNaN(minimumExperience) ||
      minimumExperience < 0
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Minimum experience must be a valid non-negative number",
      });
    }

    if (
      Number.isNaN(maximumExperience) ||
      maximumExperience < minimumExperience
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Maximum experience must be greater than or equal to minimum experience",
      });
    }

    const normalizedProficiency =
      minProficiency?.toLowerCase();

    if (
      normalizedProficiency &&
      !PROFICIENCY_SCORES[normalizedProficiency]
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Proficiency must be beginner, intermediate, advanced or expert",
      });
    }

    const minimumProficiencyScore =
      PROFICIENCY_SCORES[normalizedProficiency] || 0;

    const hasAtLeastOneFilter =
      requestedSkills.length > 0 ||
      department ||
      designation ||
      location ||
      education ||
      certification ||
      minExperience !== undefined ||
      maxExperience !== undefined ||
      minProficiency;

    if (!hasAtLeastOneFilter) {
      return res.status(400).json({
        success: false,
        message:
          "Provide at least one search filter",
      });
    }

    /*
     * 1. PROFILE FILTERING
     */
    const profileQuery = {};

    if (department) {
      profileQuery.department = new RegExp(
        `^${escapeRegex(department.trim())}$`,
        "i"
      );
    }

    if (designation) {
      profileQuery.designation = new RegExp(
        escapeRegex(designation.trim()),
        "i"
      );
    }

    if (location) {
      profileQuery.location = new RegExp(
        escapeRegex(location.trim()),
        "i"
      );
    }

    if (education) {
      profileQuery.education = new RegExp(
        escapeRegex(education.trim()),
        "i"
      );
    }

    let allowedUserIds = null;

    if (Object.keys(profileQuery).length > 0) {
      const matchingProfiles =
        await EmployeeProfile.find(profileQuery)
          .select("userId")
          .lean();

      allowedUserIds = new Set(
        matchingProfiles.map((profile) =>
          profile.userId.toString()
        )
      );

      if (allowedUserIds.size === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalResults: 0,
          page: pageNumber,
          totalPages: 0,
          results: [],
        });
      }
    }

    /*
     * 2. CERTIFICATION FILTERING
     */
    if (certification) {
      const matchingCertifications =
        await Certification.find({
          certificationName: new RegExp(
            escapeRegex(certification.trim()),
            "i"
          ),
        })
          .select("userId")
          .lean();

      const certifiedUserIds = new Set(
        matchingCertifications.map((item) =>
          item.userId.toString()
        )
      );

      if (allowedUserIds === null) {
        allowedUserIds = certifiedUserIds;
      } else {
        allowedUserIds = new Set(
          [...allowedUserIds].filter((userId) =>
            certifiedUserIds.has(userId)
          )
        );
      }

      if (allowedUserIds.size === 0) {
        return res.status(200).json({
          success: true,
          count: 0,
          totalResults: 0,
          page: pageNumber,
          totalPages: 0,
          results: [],
        });
      }
    }

    /*
     * 3. SKILL FILTERING
     */
    const skillQuery = {
      yearsOfExperience: {
        $gte: minimumExperience,
        $lte: maximumExperience,
      },
    };

    if (requestedSkills.length > 0) {
      skillQuery.$or = requestedSkills.map(
        (skillName) => ({
          skillName: new RegExp(
            `^${escapeRegex(skillName)}$`,
            "i"
          ),
        })
      );
    }

    if (allowedUserIds !== null) {
      skillQuery.userId = {
        $in: [...allowedUserIds],
      };
    }

    let matchingSkills = [];

    if (
      requestedSkills.length > 0 ||
      minExperience !== undefined ||
      maxExperience !== undefined ||
      minProficiency
    ) {
      matchingSkills = await Skill.find(skillQuery).lean();
    } else {
      matchingSkills = await Skill.find({
        userId: {
          $in: [...allowedUserIds],
        },
      }).lean();
    }

    if (minimumProficiencyScore > 0) {
      matchingSkills = matchingSkills.filter(
        (skill) => {
          const score =
            PROFICIENCY_SCORES[
              String(
                skill.proficiencyLevel || ""
              ).toLowerCase()
            ] || 0;

          return score >= minimumProficiencyScore;
        }
      );
    }

    /*
     * 4. GROUP SKILLS BY EMPLOYEE
     */
    const groupedEmployees = new Map();

    for (const skill of matchingSkills) {
      const userId = skill.userId.toString();

      if (!groupedEmployees.has(userId)) {
        groupedEmployees.set(userId, {
          matchedSkills: [],
          matchedSkillNames: new Set(),
          skillScore: 0,
        });
      }

      const employeeData =
        groupedEmployees.get(userId);

      employeeData.matchedSkills.push({
        _id: skill._id,
        skillName: skill.skillName,
        category: skill.category,
        proficiencyLevel:
          skill.proficiencyLevel,
        yearsOfExperience:
          skill.yearsOfExperience,
        source: skill.source,
        endorsementCount:
          skill.endorsementCount || 0,
        individualScore:
          calculateSkillScore(skill),
      });

      employeeData.matchedSkillNames.add(
        String(skill.skillName).toLowerCase()
      );

      employeeData.skillScore +=
        calculateSkillScore(skill);
    }

    /*
     * Preserve employees found only through profile or certification
     * filters, even when they have no skills.
     */
    if (
      allowedUserIds !== null &&
      requestedSkills.length === 0
    ) {
      for (const userId of allowedUserIds) {
        if (!groupedEmployees.has(userId)) {
          groupedEmployees.set(userId, {
            matchedSkills: [],
            matchedSkillNames: new Set(),
            skillScore: 0,
          });
        }
      }
    }

    /*
     * 5. ALL-SKILLS MATCHING
     */
    const normalizedRequestedSkills =
      requestedSkills.map((skill) =>
        skill.toLowerCase()
      );

    let employeeEntries = [
      ...groupedEmployees.entries(),
    ];

    if (
      normalizedMatchMode === "all" &&
      normalizedRequestedSkills.length > 0
    ) {
      employeeEntries = employeeEntries.filter(
        ([, data]) =>
          normalizedRequestedSkills.every(
            (skillName) =>
              data.matchedSkillNames.has(skillName)
          )
      );
    }

    const employeeIds = employeeEntries.map(
      ([userId]) => userId
    );

    if (employeeIds.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        totalResults: 0,
        page: pageNumber,
        totalPages: 0,
        results: [],
      });
    }

    /*
     * 6. FETCH USER, PROFILE AND CERTIFICATIONS
     */
    const [
      users,
      profiles,
      employeeCertifications,
    ] = await Promise.all([
      User.find({
        _id: {
          $in: employeeIds,
        },
        role: "employee",
      })
        .select("name email role")
        .lean(),

      EmployeeProfile.find({
        userId: {
          $in: employeeIds,
        },
      }).lean(),

      Certification.find({
        userId: {
          $in: employeeIds,
        },
      })
        .select(
          "userId certificationName issuingOrganization issueDate expiryDate verificationStatus"
        )
        .lean(),
    ]);

    const userMap = new Map(
      users.map((user) => [
        user._id.toString(),
        user,
      ])
    );

    const profileMap = new Map(
      profiles.map((profile) => [
        profile.userId.toString(),
        profile,
      ])
    );

    const certificationMap = new Map();

    for (const item of employeeCertifications) {
      const userId = item.userId.toString();

      if (!certificationMap.has(userId)) {
        certificationMap.set(userId, []);
      }

      certificationMap.get(userId).push(item);
    }

    /*
     * 7. BUILD RANKED RESULTS
     */
    let results = employeeEntries
      .filter(([userId]) =>
        userMap.has(userId)
      )
      .map(([userId, data]) => {
        const certifications =
          certificationMap.get(userId) || [];

        const matchedSkillCount =
          data.matchedSkillNames.size;

        const coverageBonus =
          requestedSkills.length > 1
            ? matchedSkillCount * 2
            : 0;

        const certificationBonus =
          certification &&
          certifications.some((item) =>
            item.certificationName
              .toLowerCase()
              .includes(
                certification.toLowerCase()
              )
          )
            ? 2
            : 0;

        const matchScore =
          data.skillScore +
          coverageBonus +
          certificationBonus;

        const trustScore = calculateTrustScore({
           matchedSkills: data.matchedSkills,
            certifications,
          });

        return {
          employee: userMap.get(userId),
          profile:
            profileMap.get(userId) || null,
          matchedSkills: data.matchedSkills,
          certifications,
          trustScore,
          matchedSkillCount,
          requestedSkillCount:
            requestedSkills.length,
          matchPercentage:
            requestedSkills.length > 0
              ? Math.round(
                  (matchedSkillCount /
                    requestedSkills.length) *
                    100
                )
              : null,
          scoreBreakdown: {
            skillScore: data.skillScore,
            skillCoverageBonus:
              coverageBonus,
            certificationBonus,
          },
          matchScore,
        };
      });

    results.sort(
      (first, second) =>
        second.matchScore -
        first.matchScore
    );

    /*
     * 8. PAGINATION
     */
    const totalResults = results.length;
    const totalPages = Math.ceil(
      totalResults / pageLimit
    );
    //logic for pagination
    const startIndex =
      (pageNumber - 1) * pageLimit;

    results = results.slice(
      startIndex,
      startIndex + pageLimit
    );

    return res.status(200).json({
      success: true,
      count: results.length,
      totalResults,
      page: pageNumber,
      limit: pageLimit,
      totalPages,
      matchMode: normalizedMatchMode,
      appliedFilters: {
        skills: requestedSkills,
        department: department || null,
        designation: designation || null,
        location: location || null,
        education: education || null,
        certification:
          certification || null,
        minExperience:
          minExperience !== undefined
            ? minimumExperience
            : null,
        maxExperience:
          maxExperience !== undefined
            ? maximumExperience
            : null,
        minProficiency:
          normalizedProficiency || null,
      },
      results,
    });
  } catch (error) {
    console.error(
      "Advanced employee search error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Unable to complete advanced employee search",
      error:
        process.env.NODE_ENV === "development"
          ? error.message
          : undefined,
    });
  }
};

module.exports = {
  searchEmployees,
  advancedEmployeeSearch,
};