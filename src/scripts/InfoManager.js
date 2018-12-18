const TICKS_IN_HOUR = 1000 * 60 * 60;
const DeltaTime = function(left, right){
    return Math.abs(left.getTime() - right.getTime());
};

const BusName = function (id, name) {
    this.id = id;
    this.realName = name;
};

const BusData = function(json){
    this.busName = new BusName(json.route.routeId, json.route.routeNumber);
    this.graficNumber = json.route.graficNumber;
    this.latitude = json.upe.lastPoint.lat;
    this.longitude = json.upe.lastPoint.lng;
    this.angle = json.upe.lastPoint.angle;
    this.valid = json.upe.lastPoint.valid;
    this.dateTime = new Date(json.upe.lastPoint.lastDatetime);
    this.dateTimeString = json.upe.lastPoint.datetimeString;
    this.regNumber = json.upe.regNumber;
};

const http_get_async = function(theUrl, callback){
    let xmlHttp = new window.XMLHttpRequest();
    xmlHttp.open( "GET", theUrl, true );
    xmlHttp.onload = function(e) {
        callback(xmlHttp.response);
    };
    xmlHttp.send( null );
};


/**
 * Работает с данными по всем автобусам с этим id. Отсекает устаревшие(обновление час назад)
 *
 * @param busID
 * @param callback Принимает один параметр - список всех автобусов с этим id. В списке содержатся объекты BusData
 */
const get_bus_data_async = function(busID, callback){
    http_get_async('http://notnpat.ru/b'+busID+'.json', function (htmlText) {
        let json = JSON.parse(htmlText);
        let resultList = [];
        let nowTime = new Date(Date.now());
        for(let i = 0; i < json.length; ++i){
            let tmpData = new BusData(json[i]);
            if(DeltaTime(tmpData.dateTime, nowTime) < TICKS_IN_HOUR)
                resultList.push(tmpData);
        }
        callback(resultList);
    });
};


/**
 * Работает с путём автобуса
 * @param bus_id
 * @param callback Принимает два параметра - (bus_id, pointsArray). pointsArray - массив точек. Каждая точка имеет lat и lng
 */
const get_bus_way_async = function(bus_id, callback){
    http_get_async('http://notnpat.ru/p'+bus_id+'.json', function (htmlText) {
        callback(bus_id, JSON.parse(htmlText).points);
    });
};


/**
 * Работает со списком всех автобусов
 * @param callback принимает один параметр - список всех автобусов. Каждые элемент - BusName
 */
const get_bus_list_async = function(callback){
    http_get_async("http://notnpat.ru/routes.json", function (htmlText) {
        let json = JSON.parse(htmlText);
        let resultList = [];
        for(let i = 0; i < json.length; ++i){
            resultList.push(new BusName(json[i].id, json[i].routeNumber));
        }

        callback(resultList);
    });
};


/**
 * Сам извлекает из кук все популярные автобусы и работает со список автобусов (BusName) которые входит в популярные
 * @param minBusUses нижний предел вхождения в list популярных автобусов
 * @param callback приинмает один параметр - массив автобусов (BusName)
 */
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


/**
 * Сохраняет выбранные автобусы
 * @param buses_selected - Array с id выбранных автобусов
 * @param wayActivated - Активирован ли маршрут автобуса
 */
const save_current_condition = function(buses_selected, wayActivated){
    save_condition(buses_selected, wayActivated);
};


/**
 * возращает сохранённое состояние в куках в виде Array с id выбранных в пред. раз автобусов. Если состояние нет, то вернёт null
 *
 * @returns {{arrayIDs: (*|string[]), wayActivated: boolean}}
 */
const get_previous_condition = function() {
    return get_condition();
};

/*module.exports.get_bus_data_async = get_bus_data_async;
module.exports.get_bus_way_async = get_bus_way_async;
module.exports.get_bus_list_async = get_bus_list_async;
module.exports.get_favorites_buses_async = get_favorites_buses_async;
module.exports.save_current_condition = save_current_condition;
module.exports.get_previous_condition = get_previous_condition;*/