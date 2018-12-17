let selectedIds = [];

init = () => {
    initMap();
    initBuses();
};

initBuses = () => {
    get_bus_list_async((buses) => {
        let container = document.getElementById('bus_container');
        for (let i = 0; i < buses.length; i++) {
            let input =  document.createElement('input');
            input.value = buses[i].id;
            input.type = 'checkbox';
            input.setAttribute('onClick', 'onBusItemClick(this)');

            let span =  document.createElement('span');
            span.classList.add('checkmark');

            let label = document.createElement('label');
            label.innerHTML = '<b>Автобус №' + buses[i].routeNumber.trimEnd() + '</b>';
            label.appendChild(input);
            label.appendChild(span);

            label.classList.add('sidebar_item');
            container.appendChild(label);
        }
    });
};

const onOpenSidebarButtonCLick = () => {
    document.getElementById("open_bar_button").style.display = "none";
    document.getElementById("routes_menu").style.display = "block";
};

const onCloseSidebarButtonCLick = () => {
    document.getElementById("routes_menu").style.display = "none";
    document.getElementById("open_bar_button").style.display = "block";
};

const onCurrentLocationButtonClick = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateMapCenter,
            () => updateMapCenter({latitude: 56.28, longitude: 43.95}));
    } else {
        mapHelper.updateMapCenter({latitude: 56.28, longitude: 43.95});
    }
};

const onIncreaseScaleButtonCLick = () => {
    increaseScale();
};

const onDecreaseScaleButtonClick = () => {
    decreaseScale();
};

const onBusItemClick = (element) => {
    let busId = element.value;
    if (selectedIds.indexOf(busId) !== -1) {
        selectedIds.splice(selectedIds.indexOf(busId), 1);
        element.backgroundColor = 'white';
        removeRoute(busId);
        removeMarker(busId);
        return;
    }

    selectedIds.push(busId);
    element.backgroundColor = 'lightgray';
    updateBusPosition(busId);
};

const updateAllBusesPositions = () => {
    removeAllMarkers();
    selectedIds.forEach((busId) => {
        updateBusPosition(busId);
    });
};

const updateBusPosition = (busId) =>{
    get_bus_data_async(busId, setPositions);
    if (!trySetRoute(busId))
        get_bus_way_async(busId, setWay);
};

const setPositions = (data) => {
    for (let i = 0; i < data.length; i++) {
        let busId = data[i].route.routeId;
        let label = data[i].upe.lastPoint.datetimeString;
        let position = {
            lat: data[i].upe.lastPoint.lat,
            lng: data[i].upe.lastPoint.lng
        };
        let angle = data[i].upe.lastPoint.angle;
        addBusMarker(busId, label, position, angle);
    }
};

const setWay = (busId, points) => {
    addRoute(busId, points);
};

setInterval(updateAllBusesPositions, 30000);