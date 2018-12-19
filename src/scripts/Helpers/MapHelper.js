let map;
let markers = [];
let routes = [];

const initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.28, lng: 43.95},
        zoom: 12,
        disableDefaultUI: true
    });
    initMapControls();
};

const initMapControls = () => {
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('decrease_scale'));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('increase_scale'));
    map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('current_location'));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('right_top_group'));
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('open_bar_button'));
};

const increaseScale = () => {
    map.setZoom(map.getZoom() + 1);
};

const decreaseScale = () => {
    map.setZoom(map.getZoom() - 1);
};

const updateMapCenter = (position) => {
    map.setCenter({
        lat: position.coords.latitude,
        lng: position.coords.longitude
    });
};

const addBusMarker = (busId, label, position, angle) => {
    let marker = new google.maps.Marker({
        position: position,
        label: label,
        icon: {
            path: google.maps.SymbolPath.FORWARD_CLOSED_ARROW,
            scale: 3,
            rotation: angle,
            labelOrigin: new google.maps.Point(10, 10)
        },
        map: map
    });
    if (!markers[busId])
        markers[busId] = [];
    markers[busId].push(marker);
};

const removeMarker = (busId) => {
    if (!markers[busId]) return;

    for (let i = 0; i < markers[busId].length; i++) {
        markers[busId][i].setMap(null);
    }
    markers[busId] = [];
};

const removeRoute = (busId) => {
    if (!routes[busId]) return;

    routes[busId].setMap(null);
};

const removeAllMarkers = () => {
    markers.forEach((element, id) => {
        removeMarker(id);
    });
};

const removeAllRoutes = () => {
    routes.forEach((element) => {
        element.setMap(null);
    });
};

const trySetRoute = (busId) => {
    if (routes[busId]) {
        routes[busId].setMap(map);
        return true;
    } else {
        return false;
    }
};

const addRoute = (busId, points) => {
    let route = new google.maps.Polyline({
        path: points,
        geodesic: true,
        strokeColor: '#FF0000',
        strokeOpacity: 1.0,
        strokeWeight: 3,
        map: map
    });
    routes[busId] = route;
};