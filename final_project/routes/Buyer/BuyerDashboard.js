const express = require('express');
const router = express.Router();
const User = require('../../models/User'); // Make sure you have a User model

router.get('/buyer_dashboard', async (req, res) => {
    if (!req.session.userId) {
      return res.redirect('/login');
    }
    
    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.redirect('/login');
      }
      
      // Get the page parameter or default to dashboard
      const page = req.query.page || 'dashboard';
      
      // Determine which template to render based on the page parameter
      let template;
      switch (page) {
        case 'dashboard':
          template = 'buyer_dashboard/proj.ejs'; // Updated path
          break;
        case 'about':
          template = 'buyer_dashboard/Aboutus.ejs'; // Updated path
          break;
        case 'auction':
          template = 'buyer_dashboard/auction.ejs'; // Updated path
          // Get car details if an id is provided
          if (req.query.id) {
            const cars = require('./cardetails');
            const selectedCar = cars.find(car => car.id === parseInt(req.query.id));
            if (!selectedCar) {
              return res.status(404).send("Car not found");
            }
            return res.render(template, { ...selectedCar, user });
          }
          break;
        case 'auctions':
          template = 'buyer_dashboard/auctions.ejs'; // Updated path
          break;
        case 'driver':
          template = 'buyer_dashboard/driver.ejs'; // Updated path
          // Get driver details if an id is provided
          if (req.query.id) {
            const drivers = require('./driverdetails');
            const selectedDriver = drivers.find(driver => driver.id === parseInt(req.query.id));
            if (!selectedDriver) {
              return res.status(404).send("Driver not found");
            }
            return res.render(template, { ...selectedDriver, user });
          }
          break;
        case 'drivers':
          template = 'buyer_dashboard/drivers.ejs'; // Updated path
          break;
        case 'rental':
          template = 'buyer_dashboard/rental.ejs'; // Updated path
          // Get rental details if an id is provided
          if (req.query.id) {
            const rentals = require('./rentaldetails');
            const selectedRental = rentals.find(rental => rental.id === parseInt(req.query.id));
            if (!selectedRental) {
              return res.status(404).send("Rental not found");
            }
            return res.render(template, { ...selectedRental, user });
          }
          break;
        case 'rentals':
          template = 'buyer_dashboard/rentals.ejs'; // Updated path
          break;
        case 'purchase':
          template = 'buyer_dashboard/purchase.ejs'; // Updated path
          break;
        case 'purchase_details':
          template = 'buyer_dashboard/purchase_details.ejs'; // Updated path
          break;
        case 'wishlist':
          template = 'buyer_dashboard/wishlist.ejs'; // Updated path
          break;
        default:
          template = 'buyer_dashboard/proj.ejs'; // Updated path
      }
      
      console.log(`Rendering template: ${template} for page: ${page}`);
      res.render(template, { user });
    } catch (err) {
      console.error('Error in buyer_dashboard route:', err);
      res.render('buyer_dashboard/proj.ejs', { user: {}, error: 'Failed to load data' });
    }
  });
  
  // Add backwards compatibility routes that redirect to the consolidated buyer dashboard route
  router.get('/proj', (req, res) => {
    res.redirect('/buyer_dashboard?page=dashboard');
  });
  
  router.get('/Aboutus', (req, res) => {
    res.redirect('/buyer_dashboard?page=about');
  });
  
  router.get('/auction', (req, res) => {
    const id = req.query.id;
    res.redirect(`/buyer_dashboard?page=auction&id=${id}`);
  });
  
  router.get('/auctions', (req, res) => {
    res.redirect('/buyer_dashboard?page=auctions');
  });
  
  router.get('/driver', (req, res) => {
    const id = req.query.id;
    res.redirect(`/buyer_dashboard?page=driver&id=${id}`);
  });
  
  router.get('/drivers', (req, res) => {
    res.redirect('/buyer_dashboard?page=drivers');
  });
  
  router.get('/rental', (req, res) => {
    const id = req.query.id;
    res.redirect(`/buyer_dashboard?page=rental&id=${id}`);
  });
  
  router.get('/rentals', (req, res) => {
    res.redirect('/buyer_dashboard?page=rentals');
  });
  
  router.get('/purchase', (req, res) => {
    res.redirect('/buyer_dashboard?page=purchase');
  });
  
  router.get('/purchase_details', (req, res) => {
    res.redirect('/buyer_dashboard?page=purchase_details');
  });
  
  router.get('/wishlist', (req, res) => {
    res.redirect('/buyer_dashboard?page=wishlist');
  });

  module.exports = router;