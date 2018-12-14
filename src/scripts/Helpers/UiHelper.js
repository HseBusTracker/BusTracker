//mapHelper = require('./MapHelper.js');

onOpenSidebarButtonCLick = () => {
    document.getElementById("routes_menu").style.display = "block";
};

onCloseSidebarButtonCLick = () => {
    document.getElementById("routes_menu").style.display = "none";
};

onCurrentLocationButtonClick = () => {
    if (navigator.geolocation) {
        //navigator.geolocation.getCurrentPosition(mapHelper.updateMapCenter,
            //() => mapHelper.updateMapCenter({latitude: 56.28, longitude: 43.95}));
    } else {
        //mapHelper.updateMapCenter({latitude: 56.28, longitude: 43.95});
    }
};



