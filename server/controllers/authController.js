const jwt = require('jsonwebtoken');
const Setting = require('../models/Setting');

// Default fallback PIN
const DEFAULT_PIN = process.env.ADMIN_PIN || '7860';

// Verify Admin PIN & return JWT
exports.verifyPin = async (req, res) => {
  try {
    const { pin } = req.body;

    if (!pin) {
      return res.status(400).json({ success: false, message: 'PIN is required' });
    }

    // Retrieve setting from database
    let setting = await Setting.findOne();
    const correctPin = (setting && setting.adminPin) ? setting.adminPin : DEFAULT_PIN;

    if (String(pin).trim() !== String(correctPin).trim()) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Admin PIN. Please check and try again.',
      });
    }

    const secret = process.env.JWT_SECRET || 'ssf_puthur_sector_secret_key_2026_super_secure';
    const token = jwt.sign(
      { role: 'admin', authenticatedAt: new Date().toISOString() },
      secret,
      { expiresIn: '24h' }
    );

    return res.status(200).json({
      success: true,
      message: 'PIN verified successfully. Welcome, Administrator!',
      token,
      expiresIn: '24h',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Server error verifying PIN',
      error: error.message,
    });
  }
};

// Check if current session token is valid
exports.verifySession = async (req, res) => {
  return res.status(200).json({
    success: true,
    valid: true,
    message: 'Admin session is active',
  });
};

// Update Admin PIN
exports.changePin = async (req, res) => {
  try {
    const { currentPin, newPin } = req.body;

    if (!newPin || String(newPin).trim().length < 4) {
      return res.status(400).json({
        success: false,
        message: 'New PIN must be at least 4 digits/characters.',
      });
    }

    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    const currentSavedPin = setting.adminPin || DEFAULT_PIN;
    if (String(currentPin).trim() !== String(currentSavedPin).trim()) {
      return res.status(401).json({
        success: false,
        message: 'Current PIN is incorrect.',
      });
    }

    setting.adminPin = String(newPin).trim();
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Admin PIN updated successfully.',
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update PIN',
      error: error.message,
    });
  }
};
