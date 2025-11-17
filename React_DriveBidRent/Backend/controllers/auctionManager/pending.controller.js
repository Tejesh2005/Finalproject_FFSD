// controllers/auctionManager/pending.controller.js
import AuctionRequest from '../../models/AuctionRequest.js';

const send = (success, message, data = null) => ({
  success,
  message,
  data
});

export const getPending = async (req, res) => {
  try {
    const cars = await AuctionRequest.find({ status: 'assignedMechanic' })
      .populate('sellerId', 'firstName lastName city')
      .sort({ createdAt: -1 });

    res.json(send(true, 'Pending cars fetched', cars));
  } catch (err) {
    console.error('Pending cars error:', err);
    res.json(send(false, 'Failed to load pending cars'));
  }
};

export const getReview = async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');

    if (!car) return res.json(send(false, 'Car not found'));

    const review = car.mechanicReview || {};
    const mechanicName = car.assignedMechanic
      ? `${car.assignedMechanic.firstName} ${car.assignedMechanic.lastName}`
      : 'Unknown';

    res.json(send(true, 'Review fetched', {
      ...review,
      reviewStatus: car.reviewStatus || 'pending',
      mechanicName
    }));
  } catch (err) {
    console.error('Review error:', err);
    res.json(send(false, 'Error fetching review'));
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const car = await AuctionRequest.findById(req.params.id);

    if (!car) return res.json(send(false, 'Car not found'));

    if (['approved', 'rejected'].includes(status) && car.reviewStatus === 'pending') {
      return res.json(send(false, 'Cannot change status until mechanic review is complete'));
    }

    if (status === 'approved' && (!car.mechanicReview?.mechanicalCondition || !car.mechanicReview?.bodyCondition)) {
      return res.json(send(false, 'Complete mechanic review required for approval'));
    }

    const updated = await AuctionRequest.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    res.json(send(true, 'Status updated', { status: updated.status }));
  } catch (err) {
    console.error('Status update error:', err);
    res.json(send(false, 'Failed to update status'));
  }
};

export const getPendingCarDetails = async (req, res) => {
  try {
    const car = await AuctionRequest.findById(req.params.id)
      .populate('assignedMechanic', 'firstName lastName');

    if (!car) return res.json(send(false, 'Car not found'));

    res.json(send(true, 'Car details fetched', car));
  } catch (err) {
    console.error('Car details error:', err);
    res.json(send(false, 'Failed to load car details'));
  }
};