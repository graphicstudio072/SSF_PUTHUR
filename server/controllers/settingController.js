const Setting = require('../models/Setting');

const DEFAULT_TICKET_TEMPLATE_CONFIG = {
  qr: { x: 74, y: 58, size: 22 },
  name: { x: 8, y: 42, fontSize: 28, color: '#111827', align: 'left', fontWeight: '700' },
  ticketId: { x: 8, y: 54, fontSize: 20, color: '#0F5132', align: 'left', fontWeight: '700' },
  unit: { x: 8, y: 65, fontSize: 20, color: '#374151', align: 'left', fontWeight: '600' },
};

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
      headingColor: setting.headingColor || '#111827',
      ticketTemplateUrl: setting.ticketTemplateUrl || '',
      ticketTemplateConfig: setting.ticketTemplateConfig || DEFAULT_TICKET_TEMPLATE_CONFIG,
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
      headingColor,
      ticketTemplateUrl,
      ticketTemplateConfig,
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
    if (headingColor !== undefined) setting.headingColor = headingColor.trim() || '#111827';
    if (ticketTemplateUrl !== undefined) setting.ticketTemplateUrl = ticketTemplateUrl.trim();
    if (ticketTemplateConfig !== undefined) {
      setting.ticketTemplateConfig = {
        qr: { ...DEFAULT_TICKET_TEMPLATE_CONFIG.qr, ...(ticketTemplateConfig.qr || {}) },
        name: { ...DEFAULT_TICKET_TEMPLATE_CONFIG.name, ...(ticketTemplateConfig.name || {}) },
        ticketId: { ...DEFAULT_TICKET_TEMPLATE_CONFIG.ticketId, ...(ticketTemplateConfig.ticketId || {}) },
        unit: { ...DEFAULT_TICKET_TEMPLATE_CONFIG.unit, ...(ticketTemplateConfig.unit || {}) },
      };
    }
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

// Upload Website Logo (Admin protected - stored persistently in MongoDB as Base64 Data URI)
exports.uploadLogo = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No logo image file uploaded.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    setting.logoUrl = fileUrl;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Logo uploaded and saved persistently!',
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

// Upload Event Poster (Admin protected - stored persistently in MongoDB as Base64 Data URI)
exports.uploadPoster = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No poster image file uploaded.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    setting.posterUrl = fileUrl;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Event Poster uploaded and saved persistently!',
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

// Upload Custom Ticket Template Background (Admin protected - stored persistently in MongoDB)
exports.uploadTicketTemplate = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No ticket template image uploaded.' });
    }

    const base64 = req.file.buffer.toString('base64');
    const fileUrl = `data:${req.file.mimetype};base64,${base64}`;

    let setting = await Setting.findOne();
    if (!setting) setting = new Setting();
    setting.ticketTemplateUrl = fileUrl;
    await setting.save();

    return res.status(200).json({
      success: true,
      message: 'Ticket template uploaded and saved persistently!',
      ticketTemplateUrl: fileUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to upload ticket template',
      error: error.message,
    });
  }
};
