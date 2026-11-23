const Setting = require('../models/Setting');

// Get public website & event settings (strips adminPin)
exports.getSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();

    if (!setting) {
      setting = new Setting();
      await setting.save();
    }

    // Return sanitized object without PIN
    const safeSettings = {
      eventName: setting.eventName,
      eventSubtitle: setting.eventSubtitle,
      eventTheme: setting.eventTheme,
      eventDate: setting.eventDate,
      eventTime: setting.eventTime,
      venue: setting.venue,
      sectorName: setting.sectorName,
      logoUrl: setting.logoUrl,
      posterUrl: setting.posterUrl,
      theme: setting.theme || 'white-green',
      contactPhone: setting.contactPhone,
      contactEmail: setting.contactEmail,
      updatedAt: setting.updatedAt,
    };

    return res.status(200).json({
      success: true,
      settings: safeSettings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to load settings',
      error: error.message,
    });
  }
};

// Update text & theme settings (Admin protected)
exports.updateSettings = async (req, res) => {
  try {
    let setting = await Setting.findOne();
    if (!setting) {
      setting = new Setting();
    }

    const {
      eventName,
      eventSubtitle,
      eventTheme,
      eventDate,
      eventTime,
      venue,
      sectorName,
      theme,
      contactPhone,
      contactEmail,
      logoUrl,
      posterUrl,
    } = req.body;

    if (eventName !== undefined) setting.eventName = eventName.trim();
    if (eventSubtitle !== undefined) setting.eventSubtitle = eventSubtitle.trim();
    if (eventTheme !== undefined) setting.eventTheme = eventTheme.trim();
    if (eventDate !== undefined) setting.eventDate = eventDate.trim();
    if (eventTime !== undefined) setting.eventTime = eventTime.trim();
    if (venue !== undefined) setting.venue = venue.trim();
    if (sectorName !== undefined) setting.sectorName = sectorName.trim();
    if (theme !== undefined) setting.theme = theme;
    if (contactPhone !== undefined) setting.contactPhone = contactPhone.trim();
    if (contactEmail !== undefined) setting.contactEmail = contactEmail.trim();
    if (logoUrl !== undefined) setting.logoUrl = logoUrl.trim();
    if (posterUrl !== undefined) setting.posterUrl = posterUrl.trim();

    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Settings updated successfully.',
      settings: setting,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message,
    });
  }
};

// Upload Website Logo (Admin protected)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo image file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    setting.logoUrl = fileUrl;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Logo uploaded and updated successfully!',
      logoUrl: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload logo image',
      error: error.message,
    });
  }
};

// Upload Event Poster (Admin protected)
exports.uploadPoster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No poster image file uploaded.' });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    setting.posterUrl = fileUrl;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Event Poster uploaded and updated successfully!',
      posterUrl: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload poster image',
      error: error.message,
    });
  }
};
