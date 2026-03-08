import express from 'express';
import LeaveRequest from '../models/LeaveRequest.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

const validateDates = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return false;
  return start <= end;
};

router.post('/', authenticate, requireRole('employee'), async (req, res) => {
  try {
    const { leaveType, startDate, endDate, reason } = req.body;
    if (!leaveType || !startDate || !endDate || !reason) {
      return res.status(400).json({ message: 'Leave type, start date, end date and reason are required.' });
    }
    if (!validateDates(startDate, endDate)) {
      return res.status(400).json({ message: 'End date must be on or after start date.' });
    }
    const doc = await LeaveRequest.create({
      employee: req.user._id,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
    });
    const populated = await LeaveRequest.findById(doc._id).populate('employee', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to create leave request.' });
  }
});

router.get('/', authenticate, async (req, res, next) => {
  try {
    if (req.user.role === 'employee') {
      const leaves = await LeaveRequest.find({ employee: req.user._id })
        .sort({ createdAt: -1 })
        .populate('employee', 'name email');
      return res.json(leaves);
    }
    if (req.user.role === 'employer') {
      const leaves = await LeaveRequest.find()
        .sort({ createdAt: -1 })
        .populate('employee', 'name email')
        .populate('reviewedBy', 'name');
      return res.json(leaves);
    }
    res.status(403).json({ message: 'Access denied.' });
  } catch (err) {
    next(err);
  }
});

router.patch('/:id/approve', authenticate, requireRole('employer'), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed.' });
    }
    leave.status = 'approved';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();
    await leave.populate(['employee', 'reviewedBy']);
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to approve.' });
  }
});

router.patch('/:id/reject', authenticate, requireRole('employer'), async (req, res) => {
  try {
    const leave = await LeaveRequest.findById(req.params.id);
    if (!leave) return res.status(404).json({ message: 'Leave request not found.' });
    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed.' });
    }
    leave.status = 'rejected';
    leave.reviewedBy = req.user._id;
    leave.reviewedAt = new Date();
    await leave.save();
    await leave.populate(['employee', 'reviewedBy']);
    res.json(leave);
  } catch (err) {
    res.status(500).json({ message: err.message || 'Failed to reject.' });
  }
});

export default router;
