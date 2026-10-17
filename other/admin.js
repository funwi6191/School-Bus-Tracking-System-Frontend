let routes = [];

const fallbackRoutes = [
    { id: 1, routeName: "North Loop" },
    { id: 2, routeName: "South Loop" },
    { id: 3, routeName: "City Connector" }
];

const fallbackBuses = [
    {
        id: 1,
        busNumber: "Bus 101",
        registrationNumber: "ABC 123 GP",
        active: true,
        latitude: -26.2041,
        longitude: 28.0473,
        updatedAt: "2026-10-17T08:15:00Z",
        route: { id: 1, routeName: "North Loop" }
    },
    {
        id: 2,
        busNumber: "Bus 202",
        registrationNumber: "DEF 456 GP",
        active: false,
        latitude: null,
        longitude: null,
        updatedAt: "2026-10-17T07:45:00Z",
        route: { id: 2, routeName: "South Loop" }
    },
    {
        id: 3,
        busNumber: "Bus 303",
        registrationNumber: "GHI 789 GP",
        active: true,
        latitude: -26.1911,
        longitude: 28.0344,
        updatedAt: "2026-10-17T08:02:00Z",
        route: { id: 3, routeName: "City Connector" }
    }
];

const fallbackStops = [
    {
        id: 1,
        stopName: "Main Gate",
        stopOrder: 1,
        latitude: -26.2048,
        longitude: 28.0452,
        active: true,
        route: { id: 1, routeName: "North Loop" }
    },
    {
        id: 2,
        stopName: "Library Plaza",
        stopOrder: 2,
        latitude: -26.2065,
        longitude: 28.0496,
        active: true,
        route: { id: 1, routeName: "North Loop" }
    },
    {
        id: 3,
        stopName: "Rosebank Station",
        stopOrder: 1,
        latitude: -26.1444,
        longitude: 28.0408,
        active: false,
        route: { id: 2, routeName: "South Loop" }
    }
];

function getBusRouteId(bus) {
    if (!bus || !bus.route) {
        return "";
    }

    if (typeof bus.route === "object") {
        return String(bus.route.id ?? "");
    }

    return String(bus.route);
}

function isLocalFallbackAvailable() {
    return window.location.protocol === "file:";
}

// ==============================
// LOAD ROUTES
// ==============================

async function loadRoutes() {

    const routeSelector =
        document.getElementById("stopRoute");

    if (isLocalFallbackAvailable()) {
        routes = fallbackRoutes;
    } else {
        try {

            const response =
                await fetch("/api/routes");

            if (!response.ok) {

                throw new Error(
                    "Could not load routes"
                );

            }

            routes =
                await response.json();

        } catch (error) {

            console.warn(
                "Using demo route data because the API is unavailable.",
                error
            );

            routes = fallbackRoutes;

        }
    }

    if (routeSelector) {

        routeSelector.innerHTML =
            '<option value="">Select Route</option>';

        routes.forEach(function(route) {

            const option =
                document.createElement("option");

            option.value =
                route.id;

            option.textContent =
                route.routeName;

            routeSelector.appendChild(
                option
            );

        });

    }

}


// ==============================
// LOAD BUSES
// ==============================

async function loadBuses() {

    const loading =
        document.getElementById("loading");

    const tableBody =
        document.getElementById(
            "busTableBody"
        );

    let buses = [];

    if (loading) {
        loading.textContent =
            "Loading buses...";
    }

    if (isLocalFallbackAvailable()) {
        buses = fallbackBuses;
    } else {
        try {

            const response =
                await fetch("/api/buses");

            if (!response.ok) {

                throw new Error(
                    "Could not load buses"
                );

            }

            buses =
                await response.json();

        } catch (error) {

            console.warn(
                "Using demo bus data because the API is unavailable.",
                error
            );

            buses = fallbackBuses;

        }
    }

    if (!tableBody) {
        return;
    }

    tableBody.innerHTML = "";

    buses.forEach(function(bus) {

        const row =
            document.createElement("tr");


        const status =
            bus.active
                ? "🟢 Active"
                : "🔴 Inactive";


        const latitude =
            bus.latitude !== null &&
            bus.latitude !== undefined
                ? bus.latitude
                : "---";


        const longitude =
            bus.longitude !== null &&
            bus.longitude !== undefined
                ? bus.longitude
                : "---";


        const updatedAt =
            bus.updatedAt
                ? new Date(
                    bus.updatedAt
                  ).toLocaleString()
                : "---";


        let routeOptions =
            '<option value="">Select Route</option>';

        const selectedRouteId =
            getBusRouteId(bus);

        routes.forEach(function(route) {

            const selected =
                selectedRouteId &&
                String(route.id) === selectedRouteId
                    ? "selected"
                    : "";

            routeOptions += `

                <option
                    value="${route.id}"
                    ${selected}>

                    ${route.routeName}

                </option>

            `;

        });


        row.innerHTML = `

            <td>
                ${bus.busNumber}
            </td>

            <td>
                ${bus.registrationNumber}
            </td>

            <td>

                <select
                    id="route-${bus.id}">

                    ${routeOptions}

                </select>

            </td>

            <td>
                ${status}
            </td>

            <td>
                ${latitude}
            </td>

            <td>
                ${longitude}
            </td>

            <td>
                ${updatedAt}
            </td>

            <td>

                <button
                    onclick="assignRoute(${bus.id})">

                    Assign Route

                </button>

                <button
                    onclick="startBus(${bus.id})"
                    ${bus.active ? "disabled" : ""}>

                    🟢 Start

                </button>

                <button
                    onclick="stopBus(${bus.id})"
                    ${!bus.active ? "disabled" : ""}>

                    🔴 Stop

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

    if (loading) {
        loading.textContent =
            buses.length +
            " bus(es) found.";
    }

}


// ==============================
// ASSIGN ROUTE TO BUS
// ==============================

async function assignRoute(busId) {

    const routeSelector =
        document.getElementById(
            "route-" + busId
        );

    const routeId =
        routeSelector && routeSelector.value;


    if (!routeId) {

        alert(
            "Please select a route."
        );

        return;

    }

    if (isLocalFallbackAvailable()) {
        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            ) || fallbackBuses[0];

        const route =
            routes.find(
                (item) => String(item.id) === String(routeId)
            ) || fallbackRoutes[0];

        if (bus) {
            bus.route = route;
        }

        alert(
            "Route assigned to " +
            (bus ? bus.busNumber : "bus") +
            " in demo mode."
        );

        loadBuses();
        return;
    }


    try {

        const response =
            await fetch(
                `/api/buses/${busId}/route/${routeId}`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not assign route"
            );

        }


        const bus =
            await response.json();


        alert(
            "Route assigned to " +
            bus.busNumber
        );


        loadBuses();


    } catch (error) {

        console.warn(
            "Using local demo state for route assignment.",
            error
        );

        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            ) || fallbackBuses[0];

        const route =
            routes.find(
                (item) => String(item.id) === String(routeId)
            ) || fallbackRoutes[0];

        if (bus) {
            bus.route = route;
        }

        alert(
            "Route assigned to " +
            (bus ? bus.busNumber : "bus") +
            " in demo mode."
        );

        loadBuses();

    }

}


// ==============================
// START BUS
// ==============================

async function startBus(busId) {

    if (isLocalFallbackAvailable()) {
        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            );

        if (bus) {
            bus.active = true;
        }

        alert(
            (bus ? bus.busNumber : "Bus") +
            " has been started in demo mode."
        );

        loadBuses();
        return;
    }

    try {

        const response =
            await fetch(
                `/api/buses/${busId}/start`,
                {
                    method: "PUT"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not start bus"
            );

        }


        const bus =
            await response.json();


        alert(
            bus.busNumber +
            " has been started."
        );


        loadBuses();


    } catch (error) {

        console.warn(
            "Using local demo state for bus start.",
            error
        );

        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            );

        if (bus) {
            bus.active = true;
        }

        alert(
            (bus ? bus.busNumber : "Bus") +
            " has been started in demo mode."
        );

        loadBuses();

    }

}


// ==============================
// STOP BUS
// ==============================

async function stopBus(busId) {

    if (isLocalFallbackAvailable()) {
        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            );

        if (bus) {
            bus.active = false;
        }

        alert(
            (bus ? bus.busNumber : "Bus") +
            " has been stopped in demo mode."
        );

        loadBuses();
        return;
    }

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
                "Could not stop bus"
            );

        }


        const bus =
            await response.json();


        alert(
            bus.busNumber +
            " has been stopped."
        );


        loadBuses();


    } catch (error) {

        console.warn(
            "Using local demo state for bus stop.",
            error
        );

        const bus =
            fallbackBuses.find(
                (item) => item.id === Number(busId)
            );

        if (bus) {
            bus.active = false;
        }

        alert(
            (bus ? bus.busNumber : "Bus") +
            " has been stopped in demo mode."
        );

        loadBuses();

    }

}


// ==============================
// LOAD PICKUP STOPS
// ==============================

async function loadPickupStops() {

    const tableBody =
        document.getElementById(
            "stopTableBody"
        );


    if (!tableBody) {
        return;
    }

    let stops = [];

    if (isLocalFallbackAvailable()) {
        stops = fallbackStops;
    } else {
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


            stops =
                await response.json();


        } catch (error) {

            console.warn(
                "Using demo pickup stop data because the API is unavailable.",
                error
            );

            stops = fallbackStops;

        }
    }

    tableBody.innerHTML = "";

    stops.sort(function(a, b) {

        return (a.stopOrder || 0) -
               (b.stopOrder || 0);

    });

    stops.forEach(function(stop) {

        const row =
            document.createElement("tr");


        const status =
            stop.active
                ? "🟢 Active"
                : "🔴 Inactive";


        const routeName =
            stop.route
                ? stop.route.routeName || stop.route.name
                : "No route";


        row.innerHTML = `

            <td>
                ${stop.stopName}
            </td>

            <td>
                ${stop.stopOrder}
            </td>

            <td>
                ${routeName}
            </td>

            <td>
                ${stop.latitude}
            </td>

            <td>
                ${stop.longitude}
            </td>

            <td>
                ${status}
            </td>

            <td>

                <button
                    onclick="deletePickupStop(${stop.id})">

                    🗑️ Delete

                </button>

            </td>

        `;


        tableBody.appendChild(row);

    });

}


// ==============================
// ADD PICKUP STOP
// ==============================

async function addPickupStop() {

    const stopNameInput =
        document.getElementById("stopName");

    const latitudeInput =
        document.getElementById("stopLatitude");

    const longitudeInput =
        document.getElementById("stopLongitude");

    const stopOrderInput =
        document.getElementById("stopOrder");

    const routeSelect =
        document.getElementById("stopRoute");

    const activeCheckbox =
        document.getElementById("stopActive");

    if (isLocalFallbackAvailable()) {
        const stopName =
            stopNameInput.value.trim();

        const latitude =
            latitudeInput.value;

        const longitude =
            longitudeInput.value;

        const stopOrder =
            stopOrderInput.value;

        const routeId =
            routeSelect.value;

        const active =
            activeCheckbox.checked;

        if (
            !stopName ||
            !latitude ||
            !longitude ||
            !stopOrder ||
            !routeId
        ) {
            alert("Please complete all pickup stop fields.");
            return;
        }

        const route =
            routes.find(
                (item) => String(item.id) === String(routeId)
            ) || fallbackRoutes[0];

        const nextId =
            Math.max(0, ...fallbackStops.map((item) => item.id)) + 1;

        const newStop = {
            id: nextId,
            stopName,
            stopOrder: parseInt(stopOrder, 10),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            active,
            route: { id: Number(routeId), routeName: route.routeName }
        };

        fallbackStops.unshift(newStop);

        stopNameInput.value = "";
        latitudeInput.value = "";
        longitudeInput.value = "";
        stopOrderInput.value = "";
        routeSelect.value = "";
        activeCheckbox.checked = true;

        alert("Pickup stop added successfully in demo mode.");
        loadPickupStops();
        return;
    }

    const stopName =
        stopNameInput.value.trim();

    const latitude =
        latitudeInput.value;

    const longitude =
        longitudeInput.value;

    const stopOrder =
        stopOrderInput.value;

    const routeId =
        routeSelect.value;

    const active =
        activeCheckbox.checked;


    if (
        !stopName ||
        !latitude ||
        !longitude ||
        !stopOrder ||
        !routeId
    ) {

        alert(
            "Please complete all pickup stop fields."
        );

        return;

    }


    try {

        const response =
            await fetch(
                "/api/pickup-stops",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        stopName:
                            stopName,

                        latitude:
                            parseFloat(latitude),

                        longitude:
                            parseFloat(longitude),

                        stopOrder:
                            parseInt(stopOrder),

                        active:
                            active,

                        route: {
                            id:
                                parseInt(routeId)
                        }

                    })

                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not add pickup stop"
            );

        }


        const stop =
            await response.json();


        console.log(
            "Pickup stop created:",
            stop
        );


        alert(
            "Pickup stop added successfully."
        );


    } catch (error) {

        console.warn(
            "Using local demo state for pickup stop creation.",
            error
        );

        const route =
            routes.find(
                (item) => String(item.id) === String(routeId)
            ) || fallbackRoutes[0];

        const nextId =
            Math.max(0, ...fallbackStops.map((item) => item.id)) + 1;

        const newStop = {
            id: nextId,
            stopName,
            stopOrder: parseInt(stopOrder, 10),
            latitude: parseFloat(latitude),
            longitude: parseFloat(longitude),
            active,
            route: { id: Number(routeId), routeName: route.routeName }
        };

        fallbackStops.unshift(newStop);

        alert(
            "Pickup stop added successfully in demo mode."
        );

    }

    stopNameInput.value = "";
    latitudeInput.value = "";
    longitudeInput.value = "";
    stopOrderInput.value = "";
    routeSelect.value = "";
    activeCheckbox.checked = true;

    loadPickupStops();

}


// ==============================
// DELETE PICKUP STOP
// ==============================

async function deletePickupStop(stopId) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this pickup stop?"
        );


    if (!confirmed) {
        return;
    }

    if (isLocalFallbackAvailable()) {
        const stopIndex =
            fallbackStops.findIndex(
                (stop) => stop.id === Number(stopId)
            );

        if (stopIndex >= 0) {
            fallbackStops.splice(stopIndex, 1);
        }

        alert("Pickup stop deleted in demo mode.");
        loadPickupStops();
        return;
    }

    try {

        const response =
            await fetch(
                `/api/pickup-stops/${stopId}`,
                {
                    method: "DELETE"
                }
            );


        if (!response.ok) {

            throw new Error(
                "Could not delete pickup stop"
            );

        }


        alert(
            "Pickup stop deleted."
        );


        loadPickupStops();


    } catch (error) {

        console.warn(
            "Using local demo state for pickup stop deletion.",
            error
        );

        const stopIndex =
            fallbackStops.findIndex(
                (stop) => stop.id === Number(stopId)
            );

        if (stopIndex >= 0) {
            fallbackStops.splice(stopIndex, 1);
        }

        alert(
            "Pickup stop deleted in demo mode."
        );

        loadPickupStops();

    }

}


// ==============================
// REFRESH BUTTONS
// ==============================

document
    .getElementById("refreshButton")
    .addEventListener(
        "click",
        async function() {

            await loadRoutes();

            await loadBuses();

            await loadPickupStops();

        }
    );


document
    .getElementById("refreshStopsButton")
    .addEventListener(
        "click",
        loadPickupStops
    );


document
    .getElementById("addStopButton")
    .addEventListener(
        "click",
        addPickupStop
    );


// ==============================
// PAGE START
// ==============================

window.onload = async function() {

    await loadRoutes();

    await loadBuses();

    await loadPickupStops();

};