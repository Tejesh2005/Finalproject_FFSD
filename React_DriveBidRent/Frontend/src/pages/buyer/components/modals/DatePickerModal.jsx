import { useState, useEffect } from 'react';

export default function DatePickerModal({ isOpen, onClose, onProceed, onDateSelect, rental }) {
    const [pickupDate, setPickupDate] = useState('');
    const [dropDate, setDropDate] = useState('');
    const [includeDriver, setIncludeDriver] = useState(false);
    const [totalCost, setTotalCost] = useState(0);
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (isOpen) {
            setPickupDate('');
            setDropDate('');
            setIncludeDriver(false);
            setTotalCost(0);
            setErrors({});
        }
    }, [isOpen]);

    useEffect(() => {
        if (pickupDate && dropDate && rental) {
            calculateCost();
        }
    }, [pickupDate, dropDate, includeDriver, rental]);

    const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const calculateCost = () => {
        if (!pickupDate || !dropDate || !rental) {
            setTotalCost(0);
            return 0;
        }

        const pickupDateObj = new Date(pickupDate);
        const dropDateObj = new Date(dropDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (pickupDateObj < today) {
            setErrors({ pickupDate: 'Pickup date cannot be in the past' });
            setTotalCost(0);
            return 0;
        }

        if (dropDateObj <= pickupDateObj) {
            setErrors({ dropDate: 'Drop date must be after pickup date' });
            setTotalCost(0);
            return 0;
        }

        setErrors({});

        const timeDiff = dropDateObj - pickupDateObj;
        const days = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        const vehicleCost = days * rental.costPerDay;
        const driverCost = includeDriver && rental.driverAvailable ? days * rental.driverRate : 0;
        const cost = vehicleCost + driverCost;

        setTotalCost(cost);
        onDateSelect(pickupDate, dropDate, includeDriver);

        return cost;
    };

    const handlePickupDateChange = (e) => {
        const selectedDate = e.target.value;
        setPickupDate(selectedDate);
        setErrors({});

        if (dropDate && new Date(dropDate) <= new Date(selectedDate)) {
            setDropDate('');
        }
    };

    const handleDropDateChange = (e) => {
        setDropDate(e.target.value);
        setErrors({});
    };

    const handleDriverToggle = (e) => {
        setIncludeDriver(e.target.checked);
    };

    const handleProceed = () => {
        if (!pickupDate || !dropDate) {
            setErrors({ general: 'Please select both pickup and drop dates' });
            return;
        }

        if (totalCost <= 0) {
            setErrors({ general: 'Please select valid dates to calculate the cost' });
            return;
        }

        onProceed();
    };

    if (!isOpen) return null;

    const days = pickupDate && dropDate
        ? Math.ceil((new Date(dropDate) - new Date(pickupDate)) / (1000 * 60 * 60 * 24))
        : 0;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 text-white">
                    <h2 className="text-xl font-bold">Select Rental Dates</h2>
                    <p className="text-orange-100 text-sm mt-1">Choose your pickup and drop-off dates</p>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    {/* Error Message */}
                    {errors.general && (
                        <div className="bg-red-50 border border-red-300 text-red-700 px-4 py-2 rounded-lg text-sm font-medium">
                            ⚠️ {errors.general}
                        </div>
                    )}

                    {/* Pickup Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Pickup Date</label>
                        <input
                            type="date"
                            value={pickupDate}
                            onChange={handlePickupDateChange}
                            min={formatDate(new Date())}
                            max={formatDate(new Date(new Date().getTime() + 30 * 24 * 60 * 60 * 1000))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                        />
                        {errors.pickupDate && (
                            <p className="text-red-600 text-xs mt-1">❌ {errors.pickupDate}</p>
                        )}
                    </div>

                    {/* Drop Date */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Drop-off Date</label>
                        <input
                            type="date"
                            value={dropDate}
                            onChange={handleDropDateChange}
                            min={pickupDate ? formatDate(new Date(new Date(pickupDate).getTime() + 86400000)) : formatDate(new Date())}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none text-sm"
                        />
                        {errors.dropDate && (
                            <p className="text-red-600 text-xs mt-1">❌ {errors.dropDate}</p>
                        )}
                    </div>

                    {/* Driver Option */}
                    {rental.driverAvailable && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={includeDriver}
                                    onChange={handleDriverToggle}
                                    className="w-4 h-4 accent-orange-500 cursor-pointer"
                                />
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-gray-900">Include Professional Driver</p>
                                    <p className="text-xs text-gray-600 mt-1">₹{rental.driverRate}/day</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full font-medium text-xs ${includeDriver
                                        ? 'bg-orange-500 text-white'
                                        : 'bg-gray-200 text-gray-700'
                                    }`}>
                                    {includeDriver ? '✓ INCLUDED' : 'OPTIONAL'}
                                </span>
                            </label>
                        </div>
                    )}

                    {/* Cost Summary */}
                    {pickupDate && dropDate && totalCost > 0 && (
                        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                            <h3 className="text-sm font-semibold text-orange-600 mb-3">Cost Breakdown</h3>
                            <div className="space-y-2">
                                <div className="flex justify-between items-center pb-2 border-b border-orange-200">
                                    <span className="text-xs text-gray-700">
                                        Vehicle ({days} {days === 1 ? 'day' : 'days'} × ₹{rental.costPerDay}/day)
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900">₹{(days * rental.costPerDay).toLocaleString()}</span>
                                </div>
                                {rental.driverAvailable && includeDriver && (
                                    <div className="flex justify-between items-center pb-2 border-b border-orange-200">
                                        <span className="text-xs text-gray-700">
                                            Driver ({days} {days === 1 ? 'day' : 'days'} × ₹{rental.driverRate}/day)
                                        </span>
                                        <span className="text-sm font-semibold text-gray-900">₹{(days * rental.driverRate).toLocaleString()}</span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center pt-2">
                                    <span className="text-sm font-semibold text-orange-600">Total Amount</span>
                                    <span className="text-lg font-bold text-orange-600">₹{totalCost.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex gap-3 border-t border-gray-200">
                    <button
                        onClick={onClose}
                        className="flex-1 bg-gray-500 text-white py-2 rounded-lg font-semibold hover:bg-gray-600 transition text-sm"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleProceed}
                        disabled={!pickupDate || !dropDate || totalCost <= 0}
                        className={`flex-1 py-2 rounded-lg font-semibold transition text-sm ${pickupDate && dropDate && totalCost > 0
                                ? 'bg-orange-500 text-white hover:bg-orange-600'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Proceed → ₹{totalCost.toLocaleString()}
                    </button>
                </div>
            </div>
        </div>
    );
}