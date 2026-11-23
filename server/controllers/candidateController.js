const Candidate = require('../models/Candidate');
const Unit = require('../models/Unit');

// Generate unique ticket ID format: SSF-PUT-XXXXXX
const generateTicketId = () => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `SSF-PUT-${randomDigits}`;
};

// Extract clean ticket ID from raw scan input (JSON, URL, or plain ID)
const extractTicketId = (raw) => {
  if (!raw) return '';
  const trimmed = String(raw).trim();

  // If JSON string
  if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
    try {
      const parsed = JSON.parse(trimmed);
      if (parsed.ticketId) return String(parsed.ticketId).trim().toUpperCase();
    } catch (e) {
      // not valid JSON, continue
    }
  }

  // If URL with ticketId query param or path
  if (trimmed.includes('ticketId=')) {
    const match = trimmed.match(/ticketId=([A-Z0-9_-]+)/i);
    if (match && match[1]) return match[1].toUpperCase();
  }

  // Regex pattern for SSF-PUT-XXXXXX
  const patternMatch = trimmed.match(/SSF-PUT-[A-Z0-9]+/i);
  if (patternMatch) return patternMatch[0].toUpperCase();

  return trimmed.toUpperCase();
};

// Register a candidate (Public route)
exports.registerCandidate = async (req, res) => {
  try {
    const { name, phone, unit } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Candidate full name is required' });
    }

    if (!phone || !phone.trim()) {
      return res.status(400).json({ success: false, message: 'Mobile number is required' });
    }

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number',
      });
    }

    if (!unit || !unit.trim()) {
      return res.status(400).json({ success: false, message: 'Please select your Unit' });
    }

    // Check if candidate with this mobile number already registered
    const existing = await Candidate.findOne({ phone: cleanedPhone });
    if (existing) {
      return res.status(200).json({
        success: true,
        alreadyRegistered: true,
        message: `Candidate already registered with mobile number ${cleanedPhone}. Here is your existing ticket.`,
        candidate: existing,
      });
    }

    // Generate unique ticket ID
    let ticketId = generateTicketId();
    let collision = await Candidate.findOne({ ticketId });
    while (collision) {
      ticketId = generateTicketId();
      collision = await Candidate.findOne({ ticketId });
    }

    const candidate = new Candidate({
      name: name.trim(),
      phone: cleanedPhone,
      unit: unit.trim(),
      ticketId,
      attended: false,
      checkInTime: null,
    });

    await candidate.save();

    return res.status(201).json({
      success: true,
      alreadyRegistered: false,
      message: 'Registration successful! Your event ticket has been generated.',
      candidate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to complete registration',
      error: error.message,
    });
  }
};

// Fetch candidate by ticket ID (Public or Admin)
exports.getCandidateByTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const cleanId = extractTicketId(ticketId);

    const candidate = await Candidate.findOne({ ticketId: cleanId });
    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Ticket ID "${cleanId}" not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      candidate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching ticket details',
      error: error.message,
    });
  }
};

// Check-In Candidate via QR Scan or Ticket ID (Admin protected)
exports.checkInCandidate = async (req, res) => {
  try {
    const { ticketId } = req.body;

    if (!ticketId) {
      return res.status(400).json({
        success: false,
        message: 'Ticket ID is required for check-in.',
      });
    }

    const cleanId = extractTicketId(ticketId);
    const candidate = await Candidate.findOne({ ticketId: cleanId });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        message: `Invalid Ticket! No candidate found matching ID: ${cleanId}`,
      });
    }

    // Check if already checked in
    if (candidate.attended) {
      const formattedDate = candidate.checkInTime
        ? new Date(candidate.checkInTime).toLocaleString('en-IN', {
            dateStyle: 'medium',
            timeStyle: 'short',
          })
        : 'Earlier';

      return res.status(200).json({
        success: false,
        alreadyAttended: true,
        candidate,
        message: `⚠️ ALREADY CHECKED IN! This ticket was previously verified on ${formattedDate}.`,
      });
    }

    // Mark check-in
    candidate.attended = true;
    candidate.checkInTime = new Date();
    await candidate.save();

    return res.status(200).json({
      success: true,
      alreadyAttended: false,
      candidate,
      message: `✅ Check-In Successful! Welcome, ${candidate.name} (${candidate.unit}).`,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to process check-in',
      error: error.message,
    });
  }
};

// Get all candidates (Admin protected with search and filtering)
exports.getAllCandidates = async (req, res) => {
  try {
    const { unit, attended, search } = req.query;
    const filter = {};

    if (unit && unit !== 'all') {
      filter.unit = unit;
    }

    if (attended !== undefined && attended !== 'all') {
      filter.attended = attended === 'true';
    }

    if (search && search.trim()) {
      const q = search.trim();
      filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { phone: { $regex: q, $options: 'i' } },
        { ticketId: { $regex: q, $options: 'i' } },
      ];
    }

    const candidates = await Candidate.find(filter).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to fetch candidates',
      error: error.message,
    });
  }
};

// Unit-Wise Attendance Report & Stats
exports.getAttendanceStats = async (req, res) => {
  try {
    const units = await Unit.find().sort({ code: 1, name: 1 });
    const allCandidates = await Candidate.find().sort({ name: 1 });

    const totalRegistered = allCandidates.length;
    const totalAttended = allCandidates.filter((c) => c.attended).length;
    const totalPending = totalRegistered - totalAttended;
    const overallPercentage =
      totalRegistered > 0 ? ((totalAttended / totalRegistered) * 100).toFixed(1) : 0;

    // Build breakdown for each unit
    const unitStats = units.map((u) => {
      const unitCandidates = allCandidates.filter((c) => c.unit.toLowerCase() === u.name.toLowerCase());
      const attendedList = unitCandidates.filter((c) => c.attended);
      const pendingList = unitCandidates.filter((c) => !c.attended);
      const percentage =
        unitCandidates.length > 0
          ? ((attendedList.length / unitCandidates.length) * 100).toFixed(1)
          : 0;

      return {
        unitId: u._id,
        unitName: u.name,
        unitCode: u.code,
        total: unitCandidates.length,
        attendedCount: attendedList.length,
        pendingCount: pendingList.length,
        percentage,
        attendees: attendedList,
        absentees: pendingList,
      };
    });

    // Check for candidates with custom unit names not currently in units table
    const knownUnitNames = new Set(units.map((u) => u.name.toLowerCase()));
    const otherCandidates = allCandidates.filter(
      (c) => !knownUnitNames.has(c.unit.toLowerCase())
    );

    if (otherCandidates.length > 0) {
      const otherAttended = otherCandidates.filter((c) => c.attended);
      unitStats.push({
        unitId: 'other',
        unitName: 'Other / Unassigned',
        unitCode: 'OTH',
        total: otherCandidates.length,
        attendedCount: otherAttended.length,
        pendingCount: otherCandidates.length - otherAttended.length,
        percentage: ((otherAttended.length / otherCandidates.length) * 100).toFixed(1),
        attendees: otherAttended,
        absentees: otherCandidates.filter((c) => !c.attended),
      });
    }

    return res.status(200).json({
      success: true,
      stats: {
        totalRegistered,
        totalAttended,
        totalPending,
        overallPercentage,
        unitStats,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to calculate attendance statistics',
      error: error.message,
    });
  }
};

// Reset Attendance status (Admin only helper)
exports.toggleCandidateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const candidate = await Candidate.findById(id);

    if (!candidate) {
      return res.status(404).json({ success: false, message: 'Candidate not found' });
    }

    candidate.attended = !candidate.attended;
    candidate.checkInTime = candidate.attended ? new Date() : null;
    await candidate.save();

    return res.status(200).json({
      success: true,
      message: `Candidate attendance updated to: ${candidate.attended ? 'Attended' : 'Pending'}`,
      candidate,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Failed to update attendance status',
      error: error.message,
    });
  }
};
