//var XMLHttpRequest = require('xhr2');
//var statisticFunctions = require('./StatisticFunctions.js');

const http_get_async = function(theUrl, callback){
    let xmlHttp = new window.XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true );
    xmlHttp.onload = function(e) {
        callback(xmlHttp.response);
    };
    xmlHttp.send( null );
};

//busID - id автобуса
//Callback принимает один параметр - список всех автобусов с этим id
//Каждый элемент имеет следующие параметры(важные данные): upe.lastPoint(lat, lang, angle, datetimeString), upe.id
const get_bus_data_async = function(busID, callback){
    http_get_async('http://notnpat.ru/b'+busID+'.json', function (htmlText) {
        callback(JSON.parse(htmlText));
        update_bus_statistic(busID);
    });
};

//Callback принимает один параметр - список точек.
//Каждый элемент имеет следующие параметры: lat, lang
const get_bus_way_async = function(bus_id, callback){
    http_get_async('http://notnpat.ru/p'+bus_id+'.json', function (htmlText) {
        callback(bus_id, JSON.parse(htmlText).points);
    });
};

//Callback принимает один параметр - список автобусов([]).
//Каждый элемент имеет следующие параметры: id, routeNumber, type, fromAtoB, hidden, routeInt
const get_bus_list_async = function(callback){
    http_get_async("http://notnpat.ru/routes.json", function (htmlText) {
        callback(JSON.parse(htmlText));
    });
};

//minBusUses - нижний предел вхождения в итоговый list.
//Callback принимает один параметр - список автобусов([]).
//Каждый элемент имеет следующие параметры: id, routeNumber, type, fromAtoB, hidden, routeInt
const get_favorites_buses_async = function( minBusUses, callback ){
    let bus_array = get_popular_buses(minBusUses);
    get_bus_list_async(function (allBuses) {
        let result_buses = [];

        for(let bus of all_buses){
            if(bus_array.contains(bus.id))
                result_buses.push(bus);
        }

        callback(result_buses);
    });
};

//сохраняет выбранные автобусы.
//buses_selected - формат "id1;id2;id3"
const save_current_condition = function(buses_selected){
    save_condition(buses_selected);
};

//возращает сохранённое состояние в куки
//return value - []
const get_previous_condition = function() {
    return get_condition();
};

/*module.exports.get_bus_data_async = get_bus_data_async;
module.exports.get_bus_way_async = get_bus_way_async;
module.exports.get_bus_list_async = get_bus_list_async;
module.exports.get_favorites_buses_async = get_favorites_buses_async;
module.exports.save_current_condition = save_current_condition;
module.exports.get_previous_condition = get_previous_condition;*/