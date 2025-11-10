// controllers/auctionManager/assignMechanic.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';
import User from '../../models/User.js';
import InspectionChat from '../../models/InspectionChat.js';

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

    // Auto-create an inspection chat for this assignment (one per task) using InspectionChat model
    let chatDoc = null;
    try {
      let existingChat = await InspectionChat.findOne({ inspectionTask: updated._id });

      if (!existingChat) {
        const created = await InspectionChat.create({
          mechanic: mechanicId,
          auctionManager: req.user._id,
          inspectionTask: updated._id,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          title: `Inspection: ${updated.vehicleName}`
        });
        console.log('InspectionChat created for:', updated.vehicleName, 'id=', created._id);
        chatDoc = created;
      } else {
        chatDoc = existingChat;
      }

      if (chatDoc) {
        chatDoc = await InspectionChat.findById(chatDoc._id)
          .populate('mechanic', 'firstName lastName _id')
          .populate('auctionManager', 'firstName lastName _id')
          .populate({ path: 'inspectionTask', select: 'vehicleName vehicleImage _id' });
      }
    } catch (cErr) {
      console.error('Failed to create or fetch InspectionChat:', cErr);
    }

    res.json(send(true, 'Mechanic assigned successfully', { chat: chatDoc }));
  } catch (err) {
    console.error('Assign mechanic save error:', err);
    res.json(send(false, 'Failed to assign mechanic'));
  }
};