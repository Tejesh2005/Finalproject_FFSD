// controllers/auctionManager/assignMechanic.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import User from '../../models/User.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getAssignMechanic = async (req, res) => {
  try {
    const request = await AuctionRequest.findById(req.params.id).populate('sellerId');
    if (!request) return res.json(send(false, 'Request not found'));

    const mechanics = await User.find({
      userType: 'mechanic',
      city: request.sellerId.city,
      approved_status: 'Yes'
    }).select('firstName lastName shopName experienceYears _id');

    res.json(send(true, 'Mechanics loaded', { request, mechanics }));
  } catch (err) {
    console.error('Assign mechanic error:', err);
    res.json(send(false, 'Failed to load mechanics'));
  }
};

export const assignMechanic = async (req, res) => {
  try {
    const { mechanicId, mechanicName } = req.body;

    const updated = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      {
        status: 'assignedMechanic',
        assignedMechanic: mechanicId,
        mechanicName
      },
      { new: true }
    );

    if (!updated) return res.json(send(false, 'Request not found'));

    try {
      await User.findByIdAndUpdate(
        mechanicId,
        { $addToSet: { assignedRequests: updated._id } },
        { new: true }
      );
    } catch (uErr) {
      console.error('Failed to update mechanic assignedRequests:', uErr);
      return res.json(send(true, 'Mechanic assigned successfully, but failed to update mechanic record'));
    }

    res.json(send(true, 'Mechanic assigned successfully'));
  } catch (err) {
    console.error('Assign mechanic save error:', err);
    res.json(send(false, 'Failed to assign mechanic'));
  }
};