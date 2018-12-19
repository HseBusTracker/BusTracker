let selectedIds = [];
let busCount = 0;
let showRoutes = true;

init = () => {
    initMap();
    selectedIds = get_previous_condition().arrayIDs;
    initBuses();
    initFavoriteBuses();
    selectedIds.forEach(busId => updateBusPosition(busId));
    onCurrentLocationButtonClick();
};

initBuses = () => {
    get_bus_list_async((buses) => {
        let container = document.getElementById('bus_container_all');
        busCount = buses.length;
        for (let i = 0; i < buses.length; i++) {
            let input = document.createElement('input');
            input.value = buses[i].id;
            input.type = 'checkbox';
            input.setAttribute('onClick', 'onBusItemClick(this)');
            if (selectedIds.indexOf(buses[i].id.toString()) !== -1)
                input.setAttribute('checked', 'checked');


            let span = document.createElement('span');
            span.classList.add('checkmark');

            let label = document.createElement('label');
            label.innerHTML = 'Автобус №' + buses[i].realName.trimEnd();
            label.appendChild(input);
            label.appendChild(span);
            label.value = buses[i].id;

            label.classList.add('sidebar_item');
            container.appendChild(label);
        }
    });
};

initFavoriteBuses = () => {
    get_favorites_buses_async(5, (buses) => {
        let container = document.getElementById('bus_container_favorite');
        if (buses.length === 0) {
            document.getElementById("favorite").style.display = "none";
            return;
        }
        busCount = buses.length;
        for (let i = 0; i < buses.length; i++) {
            let input = document.createElement('input');
            input.value = buses[i].id;
            input.type = 'checkbox';
            input.setAttribute('onClick', 'onBusItemClick(this)');
            if (selectedIds.indexOf(buses[i].id.toString()) !== -1)
                input.setAttribute('checked', 'checked');


            let span = document.createElement('span');
            span.classList.add('checkmark');

            let label = document.createElement('label');
            label.innerHTML = 'Автобус №' + buses[i].realName.trimEnd();
            label.appendChild(input);
            label.appendChild(span);
            label.value = buses[i].id;

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
        removeRoute(busId);
        removeMarker(busId);
    } else {
        selectedIds.push(busId);
        updateBusPosition(busId);
        update_bus_statistic(busId);
    }

    save_current_condition(selectedIds, true);
};

const updateAllBusesPositions = () => {
    removeAllMarkers();
    selectedIds.forEach((busId) => {
        updateBusPosition(busId);
    });
};

const updateBusPosition = (busId) => {
    get_bus_data_async(busId, setPositions);
    if (showRoutes && !trySetRoute(busId))
        get_bus_way_async(busId, setWay);
};

const setPositions = (data) => {
    for (let i = 0; i < data.length; i++) {
        let busId = data[i].busName.id;
        let label = data[i].dateTimeString;
        let position = {
            lat: data[i].latitude,
            lng: data[i].longitude
        };
        let angle = data[i].angle;
        addBusMarker(busId, label, position, angle);
    }
};

const setWay = (busId, points) => {
    addRoute(busId, points);
};

const onShowRoutesCheckedChanged = () => {
    showRoutes = !showRoutes;
    if (showRoutes) {
        selectedIds.forEach(busId => {
            if (!trySetRoute(busId))
                get_bus_way_async(busId, setWay);
        });
    } else {
        removeAllRoutes();
    }
};

const onSelectAllButtonClick = () => {
    let container = document.getElementById('bus_container');

    if (selectedIds.length === busCount) {
        removeAllRoutes();
        removeAllMarkers();
        for (let i = 0; i < container.children.length; i++) {
            let busItem = container.children[i];
            let input = busItem.getElementsByTagName('input')[0];
            input.removeAttribute('checked');
        }
        selectedIds = [];
    } else {
        for (let i = 0; i < container.children.length; i++) {
            let busItem = container.children[i];
            let input = busItem.getElementsByTagName('input')[0];

            let busId = input.value;
            if (selectedIds.indexOf(busId) === -1) {
                input.setAttribute('checked', 'checked');
                selectedIds.push(busId);
                updateBusPosition(busId);
            }
        }
    }
};

const onListCollapse = (list) => {
    let childList = list.getElementsByTagName("div")[0];
    if (childList.style.display !== "none")
        childList.style.display = "none";
    else
        childList.style.display = "block";
};

setInterval(updateAllBusesPositions, 30000);