let selectedIds = [];
let busCount = 0;
let showRoutes = true;
let favoriteIds = [];

init = () => {
    initMap();
    let previousCondition = get_previous_condition();
    selectedIds = previousCondition.arrayIDs;
    showRoutes = previousCondition.wayActivated;
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
            let span = document.createElement('span');
            span.classList.add('checkmark');
            if (selectedIds.indexOf(buses[i].id.toString()) !== -1)
                span.style.backgroundColor = '#2196F3';

            let label = document.createElement('label');
            label.value = buses[i].id;
            label.setAttribute('onClick', 'onBusItemClick(this)');
            label.innerHTML = 'Маршрут №' + buses[i].realName.trimEnd();
            label.appendChild(span);
            label.id = 'all_' + buses[i].id;

            label.classList.add('sidebar_item');
            container.appendChild(label);
        }
    });
};

initFavoriteBuses = () => {
    get_top_favorites_buses_async(3, (buses) => {
        let container = document.getElementById('bus_container_favorite');
        if (buses.length === 0) {
            document.getElementById("favorite_label").style.display = "none";
            document.getElementById("bus_container_favorite").style.display = "none";
            return;
        }

        favoriteIds = buses;
        busCount = buses.length;
        for (let i = 0; i < buses.length; i++) {
            let span = document.createElement('span');
            span.classList.add('checkmark');
            if (selectedIds.indexOf(buses[i].id.toString()) !== -1)
                span.style.backgroundColor = '#2196F3';

            let label = document.createElement('label');
            label.value = buses[i].id;
            label.setAttribute('onClick', 'onBusItemClick(this)');
            label.innerHTML = 'Маршрут №' + buses[i].realName.trimEnd();
            label.appendChild(span);
            label.id = 'favorite_' + buses[i].id;

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
    let busId = element.value.toString();
    if (selectedIds.indexOf(busId) !== -1) {
        selectedIds.splice(selectedIds.indexOf(busId), 1);
        removeRoute(busId);
        removeMarker(busId);

        let simpleElement = document.getElementById('all_' + busId);
        let favoriteElement = document.getElementById('favorite_' + busId);
        simpleElement.getElementsByClassName('checkmark')[0].style.backgroundColor = '#eee';

        if (favoriteElement != null)
            favoriteElement.getElementsByClassName('checkmark')[0].style.backgroundColor = '#eee';
    } else {
        selectedIds.push(busId);
        updateBusPosition(busId);
        update_bus_statistic(busId);

        let simpleElement = document.getElementById('all_' + busId);
        let favoriteElement = document.getElementById('favorite_' + busId);
        simpleElement.getElementsByClassName('checkmark')[0].style.backgroundColor = '#2196F3';
        if (favoriteElement != null)
            favoriteElement.getElementsByClassName('checkmark')[0].style.backgroundColor = '#2196F3';
    }

    save_current_condition(selectedIds, showRoutes);
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
        let label = data[i].busName.realName.trimEnd() + ' (' + data[i].dateTimeString + ')';
        let position = {
            lat: data[i].latitude,
            lng: data[i].longitude
        };
        let angle = data[i].angle;
        let busInfo = '<div>' +
            '<label><b>Маршрут №' + data[i].busName.realName.trim() + '</b><br>' +
            'Номер: <b>' + data[i].graficNumber + '</b><br>' +
            'Скорость: <b>' + 0 + 'км/ч</b><br>' +
            'Номер автобуса: <b>' + data[i].regNumber + '</b><br>' +
            'Последнее обновление: <b>' + data[i].dateTimeString + '</b></label>' +
            '</div>';

        addBusMarker(busId, label, position, angle, busInfo);
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
    let container = document.getElementById('bus_container_all');

    if (selectedIds.length === busCount) {
        removeAllRoutes();
        removeAllMarkers();
        for (let i = 0; i < container.children.length; i++) {
            let busItem = container.children[i];
            let checkmark = busItem.getElementsByClassName('checkmark')[0];
            checkmark.style.backgroundColor = '#eee';

            let busId = busItem.value;
            if (favoriteIds.indexOf(busId) !== -1) {
                let favoriteBusItem = document.getElementById('favorite_' + busId);
                let favoriteCheckmark = favoriteBusItem.getElementsByClassName('checkmark')[0];
                favoriteCheckmark.style.backgroundColor = '#eee';
            }
        }
        selectedIds = [];
    } else {
        for (let i = 0; i < container.children.length; i++) {
            let busItem = container.children[i];
            let checkmark = busItem.getElementsByClassName('checkmark')[0];
            let busId = busItem.value;

            checkmark.style.backgroundColor = '#2196F3';
            if (busId && selectedIds.indexOf(busId) === -1)
                selectedIds.push(busId);

            if (favoriteIds.indexOf(busId) !== -1) {
                let favoriteBusItem = document.getElementById('favorite_' + busId);
                let favoriteCheckmark = favoriteBusItem.getElementsByClassName('checkmark')[0];
                favoriteCheckmark.style.backgroundColor = '#2196F3';
            }
        }
    }
    updateAllBusesPositions();
};

const onSelectAllFavoriteClick = () => {
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

const onListAllCollapse = () => {
    let list = document.getElementById('bus_container_all');
    if (list.style.display !== "none")
        list.style.display = "none";
    else
        list.style.display = "block";
};

const onListFavoriteCollapse = () => {
    let list = document.getElementById('bus_container_favorite');
    if (list.style.display !== "none")
        list.style.display = "none";
    else
        list.style.display = "block";
};

setInterval(updateAllBusesPositions, 30000);