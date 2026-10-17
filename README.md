# 🚌 School Bus Tracking System — Frontend

A web-based school bus tracking interface designed to help students identify nearby buses, view pickup stops, and monitor bus locations. The project aims to make school transportation more predictable by improving access to bus location and route information.

This repository contains the **frontend only**, developed using HTML, CSS, and JavaScript.

## 📸 Screenshots

Add screenshots of your application to the `images/` folder in this repository. Replace the example images below with your actual screenshots.

### Student Dashboard

![Student Dashboard](images/student.png)

### Driver Dashboard

![Driver Dashboard](images/driver.png)

## ✨ Features

- **Interactive Map:** Displays bus locations and pickup stops using Leaflet and OpenStreetMap.
- **Student Location:** Uses browser geolocation to help students identify nearby buses.
- **Nearest Bus:** Calculates the distance to the nearest available bus.
- **Pickup Stops:** Displays pickup stops in their designated order.
- **Bus Tracking:** Shows bus location information received from the backend.
- **Route Information:** Supports viewing bus routes and related journey information.
- **Driver GPS Tracking:** Allows the driver interface to share GPS location updates with the backend.
- **Bus Status:** Displays location freshness and tracking status based on received updates.
- **Estimated Arrival:** Provides an estimated travel time based on distance and the application's assumptions.

## 🛠️ Technologies Used

- HTML5
- CSS3
- JavaScript
- Leaflet.js
- OpenStreetMap
- Browser Geolocation API
- REST API integration

## 🏗️ Project Structure

```text
SchoolBusTrackingSystem-Frontend/
├── index.html
├── student.css
├── student.js
├── driver/
│   ├── driver.html
│   ├── driver.css
│   └── driver.js
├── other/
│   ├── admin.html
│   ├── admin.css
│   └── admin.js
├── images/
│   ├── student.png
│   └── driver.png
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- A modern web browser.
- A code editor such as Visual Studio Code or NetBeans.
- The School Bus Tracking System backend running and accessible for live tracking features.

### Installation

1. Clone this repository:

   ```bash
   git clone https://github.com/funwi6191/SchoolBusTrackingSystem-Frontend.git
   ```

2. Open the project folder.

3. Open `index.html` in your browser, or use a local development server.

4. Start the Spring Boot backend separately and ensure that the API URLs configured in the JavaScript point to the correct backend address.

5. Allow location access in your browser when prompted.

**Note:** Some browser geolocation features require HTTPS or a secure local origin such as `localhost`. Opening the HTML file directly may not support every feature.

## 🔗 Backend Integration

The frontend communicates with the School Bus Tracking System backend through REST API endpoints to retrieve bus information, pickup stops, and location updates.

The backend is maintained separately and is not included in this repository.

Live tracking requires a running, accessible backend and the correct API configuration. Publishing the frontend on GitHub does not automatically deploy the backend or make live bus locations available.

## 🔒 Privacy and Security

- Browser location access requires user permission.
- Do not commit passwords, database credentials, private API keys, or sensitive personal information.
- Configure the API base URL appropriately for the environment in which the application runs.

## 🎯 Project Goal

The goal of this project is to help reduce uncertainty around school bus arrival times by giving students better access to bus locations, pickup stops, and route information.

## 👨‍💻 Author

**Funwi Checy**

- GitHub: [@funwi6191](https://github.com/funwi6191)
- LinkedIn: [Connect with me](https://www.linkedin.com/in/)

## 📄 License

A license has not yet been specified.
