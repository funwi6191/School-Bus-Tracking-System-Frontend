let map;

let studentMarker = null;

let busMarkers = [];

let pickupStopMarkers = [];

let pickupStopLine = null;

let nearestStopMarker = null;

let studentLatitude = null;

let studentLongitude = null;

let nearestPickupStop = null;

let currentNextStop = null;


// ==========================================
// START APPLICATION
// ==========================================

window.onload = function () {

    initializeMap();

    getStudentLocation();

};


// ==========================================
// INITIALIZE MAP
// ==========================================

function initializeMap() {

    map = L.map("map").setView(
        [-26.177789, 27.978607],
        13
    );

    L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
            attribution: "&copy; OpenStreetMap contributors"
        }
    ).addTo(map);

}


// ==========================================
// GET STUDENT LOCATION
// ==========================================

function getStudentLocation() {

    if (!navigator.geolocation) {

        alert("Your browser does not support GPS.");

        return;
    }

    navigator.geolocation.getCurrentPosition(

        async function (position) {

            studentLatitude =
                position.coords.latitude;

            studentLongitude =
                position.coords.longitude;

            console.log(
                "Student latitude:",
                studentLatitude
            );

            console.log(
                "Student longitude:",
                studentLongitude
            );


            // Show student marker

            studentMarker = L.marker([
                studentLatitude,
                studentLongitude
            ])
            .addTo(map)
            .bindPopup("You are here");

            studentMarker.openPopup();


            // Move map to student

            map.setView(
                [
                    studentLatitude,
                    studentLongitude
                ],
                14
            );


            // Load pickup stops

            await loadPickupStops();


            // Find nearest bus

            findNearestBus();

        },


        function (error) {

            console.error(
                "GPS error:",
                error
            );

            alert(
                "Please allow location access."
            );

        },


        {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
        }

    );

}


// ==========================================
// LOAD ALL PICKUP STOPS
// ==========================================

async function loadPickupStops() {

    try {

        const response =
            await fetch("/api/pickup-stops");

        if (!response.ok) {

            throw new Error(
                "Could not get pickup stops"
            );

        }

        const pickupStops =
            await response.json();

        console.log(
            "Pickup stops:",
            pickupStops
        );


        // Remove old markers

        pickupStopMarkers.forEach(
            function (marker) {

                map.removeLayer(marker);

            }
        );

        pickupStopMarkers = [];


        // Remove old line

        if (pickupStopLine !== null) {

            map.removeLayer(
                pickupStopLine
            );

            pickupStopLine = null;

        }


        // ======================================
        // FIND STUDENT'S NEAREST PICKUP STOP
        // ======================================

        if (
            studentLatitude !== null &&
            studentLongitude !== null &&
            pickupStops.length > 0
        ) {

            let closestStop = null;

            let shortestDistance =
                Infinity;


            pickupStops.forEach(
                function (stop) {

                    const distance =
                        calculateDistance(
                            studentLatitude,
                            studentLongitude,
                            stop.latitude,
                            stop.longitude
                        );


                    if (
                        distance <
                        shortestDistance
                    ) {

                        shortestDistance =
                            distance;

                        closestStop =
                            stop;

                    }

                }
            );


            if (closestStop !== null) {

                nearestPickupStop =
                    closestStop;


                displayNearestPickupStop(
                    closestStop,
                    shortestDistance
                );

            }

        }


        // Sort pickup stops

        pickupStops.sort(
            function (a, b) {

                return (
                    a.stopOrder -
                    b.stopOrder
                );

            }
        );


        const stopCoordinates = [];


        // Create pickup stop markers

        pickupStops.forEach(
            function (stop) {

                const coordinates = [
                    stop.latitude,
                    stop.longitude
                ];


                stopCoordinates.push(
                    coordinates
                );


                const stopIcon =
                    L.divIcon({

                        className:
                            "pickup-stop-marker",

                        html:
                            "<div>" +
                            stop.stopOrder +
                            "</div>",

                        iconSize:
                            [30, 30],

                        iconAnchor:
                            [15, 15]

                    });


                const marker =
                    L.marker(
                        coordinates,
                        {
                            icon:
                                stopIcon
                        }
                    )
                    .addTo(map);


                marker.bindPopup(
                    "<b>" +
                    stop.stopName +
                    "</b><br>" +
                    "Stop " +
                    stop.stopOrder
                );


                pickupStopMarkers.push(
                    marker
                );

            }
        );


        // Draw line through stops

        if (
            stopCoordinates.length > 1
        ) {

            pickupStopLine =
                L.polyline(
                    stopCoordinates,
                    {
                        weight: 4
                    }
                ).addTo(map);

        }


        // Return stops for other functions

        return pickupStops;


    } catch (error) {

        console.error(
            "Error loading pickup stops:",
            error
        );

        return [];

    }

}


// ==========================================
// DISPLAY STUDENT'S NEAREST PICKUP STOP
// ==========================================

function displayNearestPickupStop(
    stop,
    distance
) {

    if (!stop) {
        return;
    }


    console.log(
        "Student nearest pickup stop:",
        stop.stopName,
        distance,
        "km"
    );


    // Pickup Stop

    const nearestStopElement =
        document.getElementById(
            "nearestStop"
        );

    if (nearestStopElement) {

        nearestStopElement.textContent =
            stop.stopName;

    }


    // Stop number

    const stopOrderElement =
        document.getElementById(
            "stopOrder"
        );

    if (stopOrderElement) {

        stopOrderElement.textContent =
            stop.stopOrder;

    }


    // Remove previous marker

    if (
        nearestStopMarker !== null
    ) {

        map.removeLayer(
            nearestStopMarker
        );

    }


    // Add new nearest-stop marker

    nearestStopMarker =
        L.marker([
            stop.latitude,
            stop.longitude
        ])
        .addTo(map)
        .bindPopup(
            "<b>Your Nearest Pickup Stop</b><br>" +
            stop.stopName +
            "<br>" +
            "Distance: " +
            distance.toFixed(2) +
            " km"
        );


    window.nearestPickupStop =
        stop;

}


// ==========================================
// FIND NEAREST BUS
// ==========================================

async function findNearestBus() {

    try {

        const response =
            await fetch("/api/buses");


        if (!response.ok) {

            throw new Error(
                "Could not get buses"
            );

        }


        const buses =
            await response.json();


        console.log(
            "All buses:",
            buses
        );


        // Only active buses with GPS

        const busesWithLocation =
            buses
                .filter(
                    function (bus) {

                        return (
                            bus.active === true &&
                            bus.latitude !== null &&
                            bus.longitude !== null
                        );

                    }
                )
                .map(
                    function (bus) {

                        return {

                            bus: bus,

                            latitude:
                                bus.latitude,

                            longitude:
                                bus.longitude,

                            updatedAt:
                                bus.updatedAt

                        };

                    }
                );


        console.log(
            "Active buses:",
            busesWithLocation
        );


        // No buses

        if (
            busesWithLocation.length === 0
        ) {

            showNoBuses();

            return;

        }


        // Find closest bus

        let nearestBus = null;

        let shortestDistance =
            Infinity;


        busesWithLocation.forEach(
            function (busData) {

                const distance =
                    calculateDistance(
                        studentLatitude,
                        studentLongitude,
                        busData.latitude,
                        busData.longitude
                    );


                if (
                    distance <
                    shortestDistance
                ) {

                    shortestDistance =
                        distance;

                    nearestBus =
                        busData;

                }

            }
        );


        // Display nearest bus

        if (nearestBus !== null) {

            await displayNearestBus(
                nearestBus,
                shortestDistance
            );

        }


        // Update all bus markers

        updateBusMarkers(
            busesWithLocation
        );


    } catch (error) {

        console.error(
            "Error finding bus:",
            error
        );

    }

}


// ==========================================
// DISPLAY NEAREST BUS
// ==========================================

async function displayNearestBus(
    busData,
    distance
) {

    const bus =
        busData.bus;


    console.log(
        "Nearest bus:",
        bus
    );


    // ======================================
    // BUS NUMBER
    // ======================================

    const nearestBusElement =
        document.getElementById(
            "nearestBus"
        );

    if (nearestBusElement) {

        nearestBusElement.textContent =
            bus.busNumber;

    }


    // ======================================
    // DISTANCE FROM STUDENT
    // ======================================

    const distanceElement =
        document.getElementById(
            "distance"
        );

    if (distanceElement) {

        distanceElement.textContent =
            distance.toFixed(2) +
            " km";

    }


    // ======================================
    // DRIVER'S FROM LOCATION
    // ======================================

    const fromElement =
        document.getElementById(
            "from"
        );

    if (fromElement) {

        fromElement.textContent =
            bus.currentFrom ||
            "---";

    }


    // ======================================
    // DRIVER'S DESTINATION
    // ======================================

    const destinationElement =
        document.getElementById(
            "destination"
        );

    if (destinationElement) {

        destinationElement.textContent =
            bus.currentDestination ||
            "---";

    }


    // ======================================
    // FIND NEXT STOP
    // ======================================

    let nextStop = null;


    /*
     * IMPORTANT:
     *
     * The driver now chooses From and To
     * manually.
     *
     * We do NOT use bus.route to determine
     * the driver's destination.
     *
     * Pickup stops are only used to determine
     * the next pickup point for students.
     */


    try {

        const allStops =
            await loadPickupStopsForNextStop();


        if (
            allStops &&
            allStops.length > 0
        ) {

            nextStop =
                findNextStop(
                    busData,
                    allStops
                );

        }

    } catch (error) {

        console.error(
            "Could not determine next stop:",
            error
        );

    }


    currentNextStop =
        nextStop;


    // ======================================
    // DISPLAY NEXT STOP
    // ======================================

    const nextStopElement =
        document.getElementById(
            "nextStop"
        );


    if (nextStopElement) {

        if (nextStop) {

            nextStopElement.textContent =
                nextStop.stopName;

        } else if (
            nearestPickupStop
        ) {

            nextStopElement.textContent =
                nearestPickupStop.stopName;

        } else {

            nextStopElement.textContent =
                "---";

        }

    }


    // ======================================
    // ETA
    // ======================================

    let eta = 0;


    if (nextStop) {

        const busToStopDistance =
            calculateDistance(
                busData.latitude,
                busData.longitude,
                nextStop.latitude,
                nextStop.longitude
            );


        eta =
            calculateETA(
                busToStopDistance,
                busData.updatedAt
            );

    }

    else if (nearestPickupStop) {

        const busToStopDistance =
            calculateDistance(
                busData.latitude,
                busData.longitude,
                nearestPickupStop.latitude,
                nearestPickupStop.longitude
            );


        eta =
            calculateETA(
                busToStopDistance,
                busData.updatedAt
            );

    }

    else {

        eta =
            calculateETA(
                distance,
                busData.updatedAt
            );

    }


    const etaElement =
        document.getElementById(
            "estimatedArrival"
        );


    if (etaElement) {

        etaElement.textContent =
            eta + " minutes";

    }


    // ======================================
    // LAST UPDATED
    // ======================================

    displayLastUpdated(
        busData.updatedAt
    );


    // ======================================
    // STATUS
    // ======================================

    updateBusStatus(
        busData.updatedAt
    );

}


// ==========================================
// LOAD STOPS FOR NEXT STOP CALCULATION
// ==========================================

async function loadPickupStopsForNextStop() {

    try {

        const response =
            await fetch(
                "/api/pickup-stops"
            );


        if (!response.ok) {

            throw new Error(
                "Could not load pickup stops"
            );

        }


        const stops =
            await response.json();


        return stops;


    } catch (error) {

        console.error(
            "Could not load stops:",
            error
        );

        return [];

    }

}


// ==========================================
// FIND NEXT STOP
// ==========================================

function findNextStop(
    busData,
    stops
) {

    if (
        !busData ||
        !stops ||
        stops.length === 0
    ) {

        return null;

    }


    // Sort by stop order

    const sortedStops =
        [...stops].sort(
            function (a, b) {

                return (
                    a.stopOrder -
                    b.stopOrder
                );

            }
        );


    // Find closest stop to bus

    let closestStop = null;

    let shortestDistance =
        Infinity;


    sortedStops.forEach(
        function (stop) {

            const distance =
                calculateDistance(
                    busData.latitude,
                    busData.longitude,
                    stop.latitude,
                    stop.longitude
                );


            if (
                distance <
                shortestDistance
            ) {

                shortestDistance =
                    distance;

                closestStop =
                    stop;

            }

        }
    );


    if (!closestStop) {

        return null;

    }


    const currentIndex =
        sortedStops.findIndex(
            function (stop) {

                return (
                    stop.id ===
                    closestStop.id
                );

            }
        );


    /*
     * If the bus is close to a stop,
     * that stop is considered the next
     * pickup point.
     *
     * Otherwise use the following stop.
     */

    if (
        currentIndex >= 0 &&
        currentIndex <
        sortedStops.length - 1
    ) {

        return sortedStops[
            currentIndex + 1
        ];

    }


    return closestStop;

}


// ==========================================
// UPDATE BUS MARKERS
// ==========================================

function updateBusMarkers(
    busesWithLocation
) {

    busesWithLocation.forEach(
        function (busData) {

            const bus =
                busData.bus;


            const busDistance =
                calculateDistance(
                    studentLatitude,
                    studentLongitude,
                    busData.latitude,
                    busData.longitude
                );


            let existingMarker =
                busMarkers.find(
                    function (item) {

                        return (
                            item.busId ===
                            bus.id
                        );

                    }
                );


            // Update existing marker

            if (existingMarker) {

                existingMarker.marker.setLatLng([
                    busData.latitude,
                    busData.longitude
                ]);


                existingMarker.marker.setPopupContent(

                    "<b>" +
                    bus.busNumber +
                    "</b><br>" +

                    "From: " +
                    (
                        bus.currentFrom ||
                        "---"
                    ) +
                    "<br>" +

                    "To: " +
                    (
                        bus.currentDestination ||
                        "---"
                    ) +
                    "<br>" +

                    "Distance: " +
                    busDistance.toFixed(2) +
                    " km"

                );

            }


            // Create new marker

            else {

                const marker =
                    L.marker([
                        busData.latitude,
                        busData.longitude
                    ])
                    .addTo(map)
                    .bindPopup(

                        "<b>" +
                        bus.busNumber +
                        "</b><br>" +

                        "From: " +
                        (
                            bus.currentFrom ||
                            "---"
                        ) +
                        "<br>" +

                        "To: " +
                        (
                            bus.currentDestination ||
                            "---"
                        ) +
                        "<br>" +

                        "Distance: " +
                        busDistance.toFixed(2) +
                        " km"

                    );


                busMarkers.push({

                    busId:
                        bus.id,

                    marker:
                        marker

                });

            }

        }
    );


    // Remove inactive buses

    busMarkers =
        busMarkers.filter(
            function (item) {

                const stillActive =
                    busesWithLocation.some(
                        function (busData) {

                            return (
                                busData.bus.id ===
                                item.busId
                            );

                        }
                    );


                if (!stillActive) {

                    map.removeLayer(
                        item.marker
                    );

                }


                return stillActive;

            }
        );

}


// ==========================================
// SHOW NO BUSES
// ==========================================

function showNoBuses() {

    const fields = [

        "nearestBus",
        "distance",
        "from",
        "destination",
        "nextStop",
        "estimatedArrival",
        "lastUpdated"

    ];


    fields.forEach(
        function (id) {

            const element =
                document.getElementById(id);


            if (element) {

                element.textContent =
                    "---";

            }

        }
    );


    const nearestBusElement =
        document.getElementById(
            "nearestBus"
        );


    if (nearestBusElement) {

        nearestBusElement.textContent =
            "No buses available";

    }


    const statusElement =
        document.getElementById(
            "busStatus"
        );


    if (statusElement) {

        statusElement.textContent =
            "No active buses";

    }

}


// ==========================================
// BUS STATUS
// ==========================================

function updateBusStatus(
    updatedAt
) {

    const statusElement =
        document.getElementById(
            "busStatus"
        );


    if (!statusElement) {

        return;

    }


    if (!updatedAt) {

        statusElement.textContent =
            "GPS unavailable";

        return;

    }


    const lastUpdate =
        new Date(
            updatedAt
        ).getTime();


    const ageSeconds =
        (
            Date.now() -
            lastUpdate
        ) / 1000;


    if (
        ageSeconds <= 15
    ) {

        statusElement.textContent =
            "🟢 Live";

    }

    else if (
        ageSeconds <= 60
    ) {

        statusElement.textContent =
            "🟡 GPS delayed";

    }

    else {

        statusElement.textContent =
            "🔴 GPS offline";

    }

}


// ==========================================
// LAST UPDATED
// ==========================================

function displayLastUpdated(
    updatedAt
) {

    const element =
        document.getElementById(
            "lastUpdated"
        );


    if (!element) {

        return;

    }


    if (!updatedAt) {

        element.textContent =
            "---";

        return;

    }


    const updatedTime =
        new Date(
            updatedAt
        );


    const ageSeconds =
        Math.max(
            0,
            Math.floor(
                (
                    Date.now() -
                    updatedTime.getTime()
                ) / 1000
            )
        );


    let updatedText;


    if (
        ageSeconds < 60
    ) {

        updatedText =
            ageSeconds +
            " seconds ago";

    }

    else if (
        ageSeconds < 3600
    ) {

        const minutes =
            Math.floor(
                ageSeconds / 60
            );


        updatedText =
            minutes +
            (
                minutes === 1
                    ? " minute ago"
                    : " minutes ago"
            );

    }

    else {

        updatedText =
            updatedTime.toLocaleTimeString();

    }


    element.textContent =
        updatedText;

}


// ==========================================
// CALCULATE ETA
// ==========================================

function calculateETA(
    distanceKm,
    updatedAt
) {

    let averageSpeedKmh =
        30;


    if (updatedAt) {

        const lastUpdate =
            new Date(
                updatedAt
            ).getTime();


        const ageSeconds =
            (
                Date.now() -
                lastUpdate
            ) / 1000;


        if (
            ageSeconds > 60
        ) {

            averageSpeedKmh =
                20;

        }

        else if (
            ageSeconds > 30
        ) {

            averageSpeedKmh =
                25;

        }

    }


    const timeHours =
        distanceKm /
        averageSpeedKmh;


    const timeMinutes =
        timeHours *
        60;


    return Math.max(
        1,
        Math.round(
            timeMinutes
        )
    );

}


// ==========================================
// CALCULATE DISTANCE
// ==========================================

function calculateDistance(
    lat1,
    lon1,
    lat2,
    lon2
) {

    const earthRadius =
        6371;


    const dLat =
        toRadians(
            lat2 - lat1
        );


    const dLon =
        toRadians(
            lon2 - lon1
        );


    const a =
        Math.sin(dLat / 2) *
        Math.sin(dLat / 2) +

        Math.cos(
            toRadians(lat1)
        ) *

        Math.cos(
            toRadians(lat2)
        ) *

        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);


    const c =
        2 *
        Math.atan2(
            Math.sqrt(a),
            Math.sqrt(1 - a)
        );


    return (
        earthRadius *
        c
    );

}


// ==========================================
// DEGREES TO RADIANS
// ==========================================

function toRadians(
    degrees
) {

    return (
        degrees *
        Math.PI /
        180
    );

}


// ==========================================
// REFRESH EVERY 5 SECONDS
// ==========================================

setInterval(
    function () {

        if (
            studentLatitude !== null &&
            studentLongitude !== null
        ) {

            findNearestBus();

        }

    },
    5000
);