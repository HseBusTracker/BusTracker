const BUS_ID = "bus_name";
const BUS_VALUE = "bus_value";
const BUS_CONDITION = "bus_condition";

const get_cookie = function( cookie_name ) {
    let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

    if ( results )
        return ( unescape ( results[2] ) );
    else
        return null;
};

const set_cookie = function( name, value, exp_y, exp_m, exp_d, path, domain, secure ) {
    let cookie_string = name + "=" + escape ( value );

    if ( exp_y )
    {
        let expires = new Date ( exp_y, exp_m, exp_d );
        cookie_string += "; expires=" + expires.toGMTString();
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
    delete_cookie(BUS_CONDITION);
};

const get_bus_statistic = function(){
    let bus_statistic = new Map();
    let strBusID = get_cookie(BUS_ID);

    if (!strBusID)
        return bus_statistic;

    let strBusValue = get_cookie(BUS_VALUE);

    let arrayID = strBusID.split(";");
    let arrayValue = strBusValue.split(";");

    if(arrayID.length !== arrayValue.length)
        clear_bus_statistic();

    for(let i = 0; i < arrayID.length; ++i){
        bus_statistic.set(arrayID[i], arrayValue[i]);
    }

    return bus_statistic;
};

const set_bus_statistic = function(bus_statistic) {
    let strName = "";
    let strValue = "";

    for(let [key, value] of bus_statistic){
        strName += key + ";";
        strValue += value + ";";
    }

    set_cookie(BUS_ID, strName.slice(0, -1), 2042, 12, 12);
    set_cookie(BUS_VALUE, strValue.slice(0, -1), 2042, 12, 12);
};



/**
 * Обновляет счётчик для текущего автобуса.
 *
 * @param bus_id
 */
const update_bus_statistic = function( bus_id ) {
    let bus_statistic = get_bus_statistic();

    if(bus_statistic.has(bus_id))
        bus_statistic[bus_id]++;
    else
        bus_statistic.set(bus_id, 1);

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
        if(value >= bus_uses)
            bus_array.push(key);
    }

    return bus_array;
};


/**
 * сохраняет состояние
 *
 * @param buses_selected - выбранные автобусы
 */
const save_condition = function(buses_selected){
    let bus_string = "";
    for(let name of buses_selected){
        bus_string += name + ";";
    }

    set_cookie(BUS_CONDITION, bus_string.slice(0, -1), 2042, 12, 12);
};

/**
 * возращает список выбранных автобусов в прошлый раз. Если его нет, то вернёт null
 *
 * @returns {Array}
 */
const get_condition = function(){
    let buses_string = get_cookie(BUS_CONDITION);
    if (buses_string == null) return [];
    let arrayName = buses_string.split(";");
    if(arrayName == null || arrayName.length <= 0)
        return [];

    return arrayName;
};

//module.exports.update_bus_statistic = update_bus_statistic;
//module.exports.get_popular_buses = get_popular_buses;
//module.exports.save_condition = save_condition;
//module.exports.get_condition = get_condition;

