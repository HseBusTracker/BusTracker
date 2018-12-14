let map;

initMap = () => {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 56.28, lng: 43.95},
        zoom: 12,
        disableDefaultUI: true
    });
    initMapButtons();
};

initMapButtons = () => {
    //map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(document.getElementById('right_bottom_group'));
    map.controls[google.maps.ControlPosition.RIGHT_TOP].push(document.getElementById('right_top_group'));
    map.controls[google.maps.ControlPosition.LEFT_TOP].push(document.getElementById('open_bar_button'));
    //document.getElementById('open_bar_button').style.display = "inline";
};

increaseScale = () => {
    map.setZoom(map.getZoom() + 1);
};

decreaseScale = () => {
    map.setZoom(map.getZoom() - 1);
};

updateMapCenter = (position) => {
    map.setCenter({
        lat: position.latitude,
        lng: position.longitude
    });
};

addMarker = (label, image, position, additionalInfo) => {

};

//module.exports = {updateMapCenter, addMarker};

