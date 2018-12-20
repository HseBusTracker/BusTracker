let selectedIds = [];
let showRoutes = true;
let favoriteBuses = [];
let allBuses = [];

init = () => {
    initMap();
    restorePreviousCondition();
    initBuses();
    initFavoriteBuses();
    selectedIds.forEach(busId => updateBusPosition(busId));
    onCurrentLocationButtonClick();
};

const restorePreviousCondition = () => {
    let previousCondition = get_previous_condition();
    selectedIds = previousCondition.arrayIDs;
    showRoutes = previousCondition.wayActivated;
};

const createBusItem = (bus, idPrefix) => {
    let span = document.createElement('span');
    span.classList.add('checkmark');
    if (selectedIds.indexOf(bus.id.toString()) !== -1)
        span.style.backgroundColor = '#2196F3';

    let label = document.createElement('label');
    label.value = bus.id;
    label.setAttribute('onClick', 'onBusItemClick(this)');
    label.innerHTML = 'Маршрут №' + bus.realName.trimEnd();
    label.appendChild(span);
    label.id = idPrefix + bus.id;

    label.classList.add('sidebar_item');
    return label;
};

const initBuses = () => {
    get_bus_list_async((buses) => {
        let container = document.getElementById('bus_container_all');
        allBuses = buses;
        buses.forEach(bus => container.appendChild(createBusItem(bus, "all_")));
        setSelectedAllButtons();
    });
};

const initFavoriteBuses = () => {
    get_top_favorites_buses_async(3, (buses) => {
        let container = document.getElementById('bus_container_favorite');
        if (buses.length === 0) {
            document.getElementById("favorite_label").style.display = "none";
            document.getElementById("bus_container_favorite").style.display = "none";
            return;
        }

        favoriteBuses = buses;
        buses.forEach(bus => container.appendChild(createBusItem(bus, "favorite_")));
        setSelectedAllButtons();
    });
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

        document.getElementById('select_all_favorite')
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

    setSelectedAllButtons();
    save_current_condition(selectedIds, showRoutes);
};

const updateAllBusesPositions = () => {
    removeAllMarkers();
    selectedIds.forEach((busId) => {
        updateBusPosition(busId);
    });
    currentLocationUpdate();
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
            'Скорость: <b>' + data[i].speed + 'км/ч</b><br>' +
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
    let allChecked = selectedIds.length === allBuses.length;

    allBuses.forEach(bus => {
        let favoriteItem = document.getElementById('favorite_' + bus.id);
        let simpleItem = document.getElementById('all_' + bus.id);
        setElementChecked(favoriteItem, !allChecked);
        setElementChecked(simpleItem, !allChecked);
        if (allChecked)
            selectedIds.splice(selectedIds.indexOf(bus.id.toString()), 1);
        else if (selectedIds.indexOf(bus.id.toString()) === -1)
            selectedIds.push(bus.id.toString());
    });

    setSelectedAllButtons();
    updateAllBusesPositions();
};

const onSelectAllFavoriteClick = () => {
    let allFavorite = true;

    favoriteBuses.forEach(bus => {
        if (selectedIds.indexOf(bus.id.toString()) === -1)
            allFavorite = false;
    });

    favoriteBuses.forEach(bus => {
        let favoriteItem = document.getElementById('favorite_' + bus.id);
        let simpleItem = document.getElementById('all_' + bus.id);
        setElementChecked(favoriteItem, !allFavorite);
        setElementChecked(simpleItem, !allFavorite);
        if (allFavorite)
            selectedIds.splice(selectedIds.indexOf(bus.id.toString()), 1);
        else if (selectedIds.indexOf(bus.id.toString()) === -1)
            selectedIds.push(bus.id.toString());
    });

    setSelectedAllButtons();
    updateAllBusesPositions();
};

const setSelectedAllButtons = () => {
    let selectFavoriteButton = document.getElementById('select_all_favorite');
    let selectButton = document.getElementById('select_all');

    if (selectedIds.length === allBuses.length) {
        setElementChecked(selectButton, true);
        setElementChecked(selectFavoriteButton, true);
    } else {
        setElementChecked(selectButton, false);
        let allFavorite = true;
        favoriteBuses.forEach(bus => {
            if (selectedIds.indexOf(bus.id.toString()) === -1)
                allFavorite = false;
        });
        setElementChecked(selectFavoriteButton, allFavorite);
    }
};

setInterval(updateAllBusesPositions, 30000);