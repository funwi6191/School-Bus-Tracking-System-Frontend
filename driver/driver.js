let watchId = null;


// ===============================
// PAGE ELEMENTS
// ===============================

const startTripButton =
    document.getElementById("startTripButton");

const stopTripButton =
    document.getElementById("stopTripButton");

const statusText =
    document.getElementById("status");

const latitudeText =
    document.getElementById("latitude");

const longitudeText =
    document.getElementById("longitude");

const busSelector =
    document.getElementById("busId");

const currentBusText =
    document.getElementById("currentBus");

const fromLocationSelector =
    document.getElementById("fromLocation");

const destinationSelector =
    document.getElementById("destination");

const tripFromText =
    document.getElementById("tripFrom");

const tripToText =
    document.getElementById("tripTo");


// ===============================
// BUTTON EVENTS
// ===============================

startTripButton.addEventListener(
    "click",
    startTrip
);

stopTripButton.addEventListener(
    "click",
    stopTrip
);


// ===============================
// BUS SELECTION
// ===============================

busSelector.addEventListener(
    "change",
    updateCurrentBus
);


function updateCurrentBus() {

    if (
        busSelector.selectedIndex >= 0 &&
        busSelector.value !== ""
    ) {

        const selectedOption =
            busSelector.options[
                busSelector.selectedIndex
            ];

        currentBusText.textContent =
            selectedOption.textContent;

    } else {

        currentBusText.textContent =
            "No bus selected";

    }

}


// ===============================
// LOAD BUSES
// ===============================

async function loadBuses() {

    try {

        const response =
            await fetch("/api/buses");

        if (!response.ok) {

            throw new Error(
                "Could not load buses"
            );

        }

        const buses =
            await response.json();

        console.log(
            "Available buses:",
            buses
        );


        busSelector.innerHTML = "";


        // Default option
        const defaultOption =
            document.createElement("option");

        defaultOption.value = "";

        defaultOption.textContent =
            "Select a bus";

        busSelector.appendChild(
            defaultOption
        );


        // Add buses
        buses.forEach(function(bus) {

            const option =
                document.createElement("option");

            option.value =
                bus.id;

            option.textContent =
                bus.busNumber;

            busSelector.appendChild(
                option
            );

        });


        updateCurrentBus();


    } catch (error) {

        console.error(
            "Could not load buses:",
            error
        );

        busSelector.innerHTML =
            '<option value="">Could not load buses</option>';

    }

}


// ===============================
// FROM / TO INFORMATION
// ===============================

function updateTripInformation() {

    const from =
        fromLocationSelector.value;

    const to =
        destinationSelector.value;


    tripFromText.textContent =
        from || "---";

    tripToText.textContent =
        to || "---";

}


// Update From/To immediately when changed

fromLocationSelector.addEventListener(
    "change",
    updateTripInformation
);

destinationSelector.addEventListener(
    "change",
    updateTripInformation
);


// ===============================
// START TRIP
// ===============================

async function startTrip() {

    const busId =
        busSelector.value;

    const from =
        fromLocationSelector.value;

    const destination =
        destinationSelector.value;


    // Check bus
    if (!busId) {

        alert(
            "Please select a bus."
        );

        return;
    }


    // Check starting location
    if (!from) {

        alert(
            "Please select where you are starting from."
        );

        return;
    }


    // Check destination
    if (!destination) {

        alert(
            "Please select where you are going."
        );

        return;
    }


    // Prevent same location
    if (from === destination) {

        alert(
            "Starting location and destination cannot be the same."
        );

        return;
    }


    console.log(
        "Starting trip..."
    );

    console.log(
        "Bus:",
        busId
    );

    console.log(
        "From:",
        from
    );

    console.log(
        "To:",
        destination
    );


    try {

        const response =
            await fetch(
                `/api/buses/${busId}/start`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        from: from,

                        destination:
                            destination

                    })
                }
            );


        if (!response.ok) {

            const errorText =
                await response.text();

            console.error(
                "Server error:",
                errorText
            );

            throw new Error(
                "Could not start trip"
            );

        }


        const bus =
            await response.json();


        console.log(
            "Trip started:",
            bus
        );


        // Update trip information
        tripFromText.textContent =
            from;

        tripToText.textContent =
            destination;


        // Update status
        statusText.textContent =
            "Starting GPS...";


        // Update buttons
        startTripButton.disabled =
            true;

        stopTripButton.disabled =
            false;


        // Start GPS
        startTracking();


    } catch (error) {

        console.error(
            "Could not start trip:",
            error
        );

        alert(
            "Could not start trip."
        );

    }

}


// ===============================
// GPS TRACKING
// ===============================

function startTracking() {

    if (watchId !== null) {

        console.log(
            "GPS tracking is already running."
        );

        return;
    }


    if (!navigator.geolocation) {

        statusText.textContent =
            "GPS is not supported";

        return;
    }


    statusText.textContent =
        "Starting GPS...";


    watchId =
        navigator.geolocation.watchPosition(

            function(position) {

                // Ignore callbacks after stopping
                if (watchId === null) {

                    console.log(
                        "GPS callback ignored - tracking stopped."
                    );

                    return;
                }


                const latitude =
                    position.coords.latitude;

                const longitude =
                    position.coords.longitude;


                latitudeText.textContent =
                    latitude.toFixed(6);

                longitudeText.textContent =
                    longitude.toFixed(6);


                statusText.textContent =
                    "Trip Active - Tracking";


                console.log(
                    "Latitude:",
                    latitude
                );

                console.log(
                    "Longitude:",
                    longitude
                );


                sendLocationToServer(
                    latitude,
                    longitude
                );

            },


            function(error) {

                console.error(
                    "GPS Error:",
                    error
                );

                statusText.textContent =
                    "GPS error";

            },


            {
                enableHighAccuracy: true,

                maximumAge: 0,

                timeout: 10000
            }

        );

}


// ===============================
// SEND GPS LOCATION
// ===============================

async function sendLocationToServer(
    latitude,
    longitude
) {

    const busId =
        busSelector.value;


    if (!busId) {

        console.error(
            "No bus selected."
        );

        return;
    }


    try {

        const response =
            await fetch(
                `/api/buses/${busId}/location`,
                {
                    method: "PUT",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        latitude:
                            latitude,

                        longitude:
                            longitude

                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Server returned " +
                response.status
            );

        }


        const bus =
            await response.json();


        console.log(
            "Location sent successfully:",
            bus
        );


    } catch (error) {

        console.error(
            "Could not send location:",
            error
        );

    }

}


// ===============================
// STOP GPS TRACKING
// ===============================

function stopTracking() {

    if (watchId !== null) {

        navigator.geolocation.clearWatch(
            watchId
        );

        watchId = null;

        console.log(
            "GPS tracking stopped."
        );

    }


    statusText.textContent =
        "Not Tracking";


    latitudeText.textContent =
        "---";

    longitudeText.textContent =
        "---";

}


// ===============================
// STOP TRIP
// ===============================

async function stopTrip() {

    const busId =
        busSelector.value;


    if (!busId) {

        alert(
            "Please select a bus."
        );

        return;
    }


    // Stop browser GPS immediately
    stopTracking();


    statusText.textContent =
        "Stopping Trip...";


    startTripButton.disabled =
        false;

    stopTripButton.disabled =
        true;


    try {

        const response =
            await fetch(
                `/api/buses/${busId}/stop`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not stop trip"
            );

        }


        const bus =
            await response.json();


        console.log(
            "Trip stopped:",
            bus
        );


        statusText.textContent =
            "Trip Stopped";


    } catch (error) {

        console.error(
            "Could not stop trip:",
            error
        );


        statusText.textContent =
            "Could not stop trip";


        alert(
            "Could not stop trip."
        );

    }

}


// ===============================
// PAGE LOAD
// ===============================

window.onload = function() {

    console.log(
        "Driver page loaded."
    );


    loadBuses();


    // Show initial From / To
    updateTripInformation();


    // Stop button disabled initially
    stopTripButton.disabled =
        true;

};