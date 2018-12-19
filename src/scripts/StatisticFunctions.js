const BUS_ID = "bus_name";
const BUS_VALUE = "bus_value";
const BUS_DATE_TIME = "bus_date_time";
const BUS_CONDITION = "bus_condition";
const WAY_ACTIVATED = "way_activated";

const CONDITION_SAVE_TIME_TICKS = 1000 * 60 * 60 * 2;//2 часа
const  FAVORITS_SAVE_TIME_TICKS = 1000 * 60 * 60 * 24 * 15;//15 Дней

const BusStatisticData = function (value, dateTime) {
    this.value = value;
    this.dateTime = dateTime;
};

const get_cookie = function( cookie_name ) {
    let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

    if ( results )
        return ( unescape ( results[2] ) );
    else
        return null;
};

const set_cookie = function( name, value, date, path = null, domain = null, secure = null ) {
    let cookie_string = name + "=" + escape ( value );

    if ( date )
    {
        cookie_string += "; expires=" + date.toGMTString();
    }

    if ( path )
        cookie_string += "; path=" + escape ( path );

    if ( domain )
        cookie_string += "; domain=" + escape ( domain );

    if ( secure )
        cookie_string += "; secure";

    document.cookie = cookie_string;
};

const delete_cookie = function( cookie_name ) {
    let cookie_date = new Date ( );  // Текущая дата и время
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
};

const clear_bus_statistic = function(){
    delete_cookie(BUS_ID);
    delete_cookie(BUS_VALUE);
    delete_cookie(BUS_DATE_TIME);
    delete_cookie(BUS_CONDITION);
    delete_cookie(WAY_ACTIVATED);
};

/**
 *
 * Возращает актуальные данные. Убирает неподходящие по времени. Удаляет все куки, если произошёл сбой.
 *
 * @returns {Map<int, BusStatisticData>}
 */
const get_bus_statistic = function(){
    let busStatistic = new Map();
    let strBusID = get_cookie(BUS_ID);

    if (!strBusID)
        return busStatistic;

    let strBusValue = get_cookie(BUS_VALUE);
    let strBusTime = get_cookie(BUS_DATE_TIME);

    let arrayID = strBusID.split("-");
    let arrayValue = strBusValue.split("-");
    let arrayTime = strBusTime.split("-");
    if(arrayID.length !== arrayValue.length && arrayTime.length !== arrayID.length)
        clear_bus_statistic();

    let timeLimit = new Date();
    for(let i = 0; i < arrayID.length; ++i){
        let tmpDateTime = new Date(parseInt(arrayTime[i]));
        if(tmpDateTime.getTime() >= timeLimit.getTime())
            busStatistic.set(arrayID[i], new BusStatisticData(parseInt(arrayValue[i])  , tmpDateTime));
    }

    return busStatistic;
};

const set_bus_statistic = function(bus_statistic) {
    let strName = "";
    let strValue = "";
    let strDate = "";

    for(let [key, value] of bus_statistic){
        strName += key + "-";
        strValue += value.value + "-";
        strDate += value.dateTime.getTime() + "-";
    }

    let dateToDelete = new Date(Date.now() + FAVORITS_SAVE_TIME_TICKS);

    set_cookie(BUS_ID, strName.slice(0, -1), dateToDelete);
    set_cookie(BUS_VALUE, strValue.slice(0, -1), dateToDelete);
    set_cookie(BUS_DATE_TIME, strDate.slice(0, -1), dateToDelete);
};



/**
 * Обновляет счётчик для текущего автобуса. Так же обновляет и дату последнего обновдения.
 *
 * @param bus_id
 */
const update_bus_statistic = function( bus_id ) {
    let bus_statistic = get_bus_statistic();
    let dateToDelete = new Date(Date.now() + FAVORITS_SAVE_TIME_TICKS);

    if(bus_statistic.has(bus_id)) {
        bus_statistic.get(bus_id).value++;
        bus_statistic.get(bus_id).dateTime = dateToDelete;
    }
    else {
        bus_statistic.set(bus_id, new BusStatisticData(1, dateToDelete));
    }

    set_bus_statistic(bus_statistic);
};


/**
 * Возращает список популярных автобусов (избранное)/ Содержит ID автобусов.
 * @param bus_uses - кол-во использований имени автобуса (при апдейте местоположения)/ Нижнее ограничение для вхождение в список
 * @returns {Array}
 */
const get_popular_buses = function(bus_uses){
    let bus_array = [];

    let bus_statistic = get_bus_statistic();

    for(let [key,value] of bus_statistic){
        if(value.value >= bus_uses)
            bus_array.push(key);
    }

    return bus_array;
};


/**
 * Возращает популярные автобусы
 * @param border_index индекс элемента с которым сравнивать
 * @returns {Array}
 */
const get_top_favorites_buses = function(border_index){
    let bus_statistic = get_bus_statistic();
    let values = [];
    let tmpDatas = Array.from(bus_statistic.values());
    if(border_index > tmpDatas.length)
        return [];

    for(let i = 0; i < tmpDatas.length; ++i){
        values.push(tmpDatas[i].value);
    }
    values = values.sort(function(a,b){return b-a;});

    let tmp_buses = get_popular_buses(values[border_index]);
    if(tmp_buses.length > border_index * 2) {
        return get_popular_buses(values[border_index] + 1);
    }

    return tmp_buses;
};

/**
 * Сохраняет состояние
 * @param buses_selected - выбранные автобусы
 * @param wayActivated - активирован ли маршрут
 */
const save_condition = function(buses_selected, wayActivated){
    let bus_string = "";

    for(let i = 0; i < buses_selected.length; ++i){
        bus_string += buses_selected[i] + "-";
    }

    let dateToDelete = new Date(Date.now() + CONDITION_SAVE_TIME_TICKS);

    set_cookie(BUS_CONDITION, bus_string.slice(0, -1), dateToDelete);
    set_cookie(WAY_ACTIVATED, wayActivated, dateToDelete);
};

/**
 * Возращает список автобусов и флаг на активацию маршрута
 * @returns {{arrayIDs: (*|string[]), wayActivated: boolean}}
 */
const get_condition = function(){
    let buses_string = get_cookie(BUS_CONDITION);

    if(buses_string === null)
        return {
            arrayIDs : [],
            wayActivated: false
        };

    let arrayName = buses_string.split("-");
    if(arrayName == null || arrayName.length <= 0)
        arrayName = [];

    let wayActivated = (get_cookie(WAY_ACTIVATED) === 'true');
    return {
        arrayIDs : arrayName,
        wayActivated: wayActivated
    }
};

//module.exports.update_bus_statistic = update_bus_statistic;
//module.exports.get_popular_buses = get_popular_buses;
//module.exports.save_condition = save_condition;
//module.exports.get_condition = get_condition;

