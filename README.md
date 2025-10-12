# DriveBidRent

*DriveBidRent* is a comprehensive, user-friendly web platform designed to connect *vehicle sellers*, *buyers*, *mechanics*, *drivers*, and *auction managers* for all your car auction and rental needs. Our platform streamlines the process of selling, buying, and renting vehicles, ensuring a seamless and transparent experience for every user.

---

## ✨ Features

### 🚗 Seller Features
- **Auction Listing:** List your vehicles for auction with detailed information and images.
- **Rental Listing:** Offer vehicles for rental with flexible pricing and availability.
- **Auction & Rental Management:** Manage all your auctions and rentals from a dedicated dashboard.
- **Bid Monitoring:** Track bids on your auctions and view bid histories.
- **Mechanic Assignment:** Get notified when a mechanic is assigned for vehicle inspection.

### 🛒 Buyer Features
- **Browse & Bid:** Explore live auctions and place bids on vehicles.
- **Wishlist:** Save favorite vehicles for quick access.
- **Rental Booking:** Browse and book available rentals.
- **Notifications:** Receive updates on bids, auction results, and rental confirmations.
- **Purchase History:** View all past purchases and rentals.

### 🧑‍🔧 Mechanic Features
- **Task Management:** View and manage assigned vehicle inspections.
- **Inspection Updates:** Submit inspection reports and update task statuses.
- **Profile Management:** Update personal and professional details.

### 🚚 Driver Features
- **Job Requests:** View and accept driving requests for vehicle deliveries.
- **Job History:** Track completed and ongoing jobs.
- **Profile Management:** Manage driver profile and availability.

### 🏢 Auction Manager Features
- **Auction Approval:** Review and approve/reject auction listings.
- **Mechanic Assignment:** Assign mechanics for vehicle inspections.
- **Auction Monitoring:** Oversee all ongoing auctions and manage auction statuses.

### ⚙️ Admin Features
- **User Management:** Full visibility and control over all users (Sellers, Buyers, Mechanics, Drivers, Auction Managers).
- **Analytics:** Access platform analytics and earnings reports.
- **Profile Editing:** Remove any user at any time, if there is any report about them.

### 🌐 General Features
- **Role-Based Dashboards:** Dedicated interfaces for each user type.
- **Secure Authentication:** JWT-based login and session management.
- **Responsive Design:** Optimized for desktop.

---

## 🛠 Technology Stack

| Category           | Technology           | Description                                      |
| :----------------- | :-------------------| :----------------------------------------------- |
| **Database**       | MongoDB              | Flexible, document-based data storage            |
| **Backend**        | Node.js / Express    | RESTful API and server-side logic                |
| **Frontend**       | EJS, HTML, CSS, JS   | Server-rendered pages with dynamic content       |
| **Authentication** | JWT token            | Used JWT token for authentication and cookies    |

---

## 🚀 Getting Started

Follow these steps to set up the project locally for development and testing.

### Prerequisites

- **Node.js** (with npm)
- **MongoDB** (local or remote instance)

### Installation and Running

1. **Clone the repository:**
    ```bash
    git clone https://github.com/<your-username>/DriveBidRent
    ```

2. **Navigate into the project directory:**
    ```bash
    cd DriveBidRent
    ```

3. **Change directory to the application root (where `app.js` is located):**
    ```bash
    cd Finalproject_FFSD/DrivrBidRent
    ```

4. **Install dependencies:**
    ```bash
    npm install
    ```

5. **Configure Environment Variables (If Applicable):**
    - Create a `.env` file if needed.
    - Set your MongoDB connection URI and any other secrets.

6. **Run the application:**
    ```bash
    nodemon app.js
    ```
    - **Access:** Open your browser and go to:  
      **http://localhost:8000**

---

## 📁 Key Files and Functions

- **app.js**: Main server file, sets up routes, middleware, and database connection.
- **models/**: Contains all Mongoose models (User, AuctionRequest, RentalRequest, etc.).
- **routes/**: All Express route handlers for each user role and feature.
- **controllers/**: Business logic for authentication and user actions.
- **middlewares/**: Authentication and role-based access control.
- **utils/**: Utility functions (file upload, JWT token generation).
- **views/**: EJS templates for all user dashboards and pages.

---

## 📝 Demo & Evidence

- **Demo Link:** [Add your demo video link here]
- **Timestamps:** [Add exact timestamps for feature demonstrations]
- **Evidence Locations:**  
  - `network_evidence/` (screenshots, logs, etc.)  
  - `git-logs.txt` (commit history and contributions)

---

## 📧 Contact

If you have any questions, feel free to contact the project maintainers.

- **Project Link:** [Coming Soon]  
- **Maintainers:**  
  - MV Tejesh (S20230010137) - [venkatatejesh.m23@iiits.in]  
  - Jeevan Vanakadara (S20230010250) - [jeevanguptha.v23@iiits.in]  
  - Shaik Toufeeq (S20230010222) - [toufeeq.sk23@iiits.in]  
  - Kishan Achanta (S20230010004) - [hariharasaikishan.a23@iiits.in]  
  - Nithwik Mantrala (S20230010143) - [nitwikreddy.m23@iiits.in]  
  - Karthik (S20230010234) - [karthik.s23@iiits.in]

---
