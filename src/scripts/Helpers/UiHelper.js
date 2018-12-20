const onCurrentLocationButtonClick = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateMapCenter,
            () => updateMapCenter({coords:{latitude: 56.28, longitude: 43.95}}));
    } else {
        updateMapCenter({coords:{latitude: 56.28, longitude: 43.95}});
    }
};

const currentLocationUpdate = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(updateCurrentLocation);
    }
};

const onIncreaseScaleButtonCLick = () => {
    increaseScale();
};

const onDecreaseScaleButtonClick = () => {
    decreaseScale();
};

const onOpenSidebarButtonCLick = () => {
    document.getElementById("open_bar_button").style.display = "none";
    document.getElementById("routes_menu").style.display = "block";
};

const onCloseSidebarButtonCLick = () => {
    document.getElementById("routes_menu").style.display = "none";
    document.getElementById("open_bar_button").style.display = "block";
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

const setElementChecked = (element, checked) => {
    if (element === null) return;
    let checkMark = element.getElementsByClassName('checkmark')[0];
    if (checked)
        checkMark.style.backgroundColor = '#2196F3';
    else
        checkMark.style.backgroundColor = '#eee';
};
