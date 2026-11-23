const Unit = require('../models/Unit');
const Candidate = require('../models/Candidate');

// Get all units
exports.getUnits = async (req, res) => {
  try {
    const units = await Unit.find().sort({ code: 1, name: 1 });
    return res.status(200).json({
      success: true,
      count: units.length,
      units,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch units',
      error: error.message,
    });
  }
};

// Add a new unit
exports.addUnit = async (req, res) => {
  try {
    const { name, code } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required',
      });
    }

    const existingUnit = await Unit.findOne({
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingUnit) {
      return res.status(400).json({
        success: false,
        message: `Unit "${name.trim()}" already exists.`,
      });
    }

    const newUnit = new Unit({
      name: name.trim(),
      code: code ? code.trim().toUpperCase() : '',
      active: true,
    });

    await newUnit.save();

    return res.status(201).json({
      success: true,
      message: `Unit "${newUnit.name}" created successfully.`,
      unit: newUnit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to create unit',
      error: error.message,
    });
  }
};

// Update an existing unit
exports.updateUnit = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, code, active } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Unit name is required',
      });
    }

    const existingName = await Unit.findOne({
      _id: { $ne: id },
      name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
    });

    if (existingName) {
      return res.status(400).json({
        success: false,
        message: `Another unit with name "${name.trim()}" already exists.`,
      });
    }

    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
      });
    }

    const oldName = unit.name;
    unit.name = name.trim();
    if (code !== undefined) unit.code = code.trim().toUpperCase();
    if (active !== undefined) unit.active = active;

    await unit.save();

    // If unit name changed, also update candidates registered under old name
    if (oldName !== unit.name) {
      await Candidate.updateMany({ unit: oldName }, { unit: unit.name });
    }

    return res.status(200).json({
      success: true,
      message: `Unit updated to "${unit.name}".`,
      unit,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update unit',
      error: error.message,
    });
  }
};

// Delete a unit
exports.deleteUnit = async (req, res) => {
  try {
    const { id } = req.params;

    const unit = await Unit.findById(id);
    if (!unit) {
      return res.status(404).json({
        success: false,
        message: 'Unit not found',
      });
    }

    // Check if any candidates are registered in this unit
    const candidateCount = await Candidate.countDocuments({ unit: unit.name });

    await Unit.findByIdAndDelete(id);

    return res.status(200).json({
      success: true,
      message: `Unit "${unit.name}" deleted successfully.${
        candidateCount > 0 ? ` (Note: ${candidateCount} existing candidate record(s) retain this unit label).` : ''
      }`,
      deletedId: id,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to delete unit',
      error: error.message,
    });
  }
};
