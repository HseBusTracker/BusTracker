const BUS_NAME = "bus_name";
const BUS_VALUE = "bus_value";

function get_cookie ( cookie_name ) {
    let results = document.cookie.match ( '(^|;) ?' + cookie_name + '=([^;]*)(;|$)' );

    if ( results )
        return ( unescape ( results[2] ) );
    else
        return null;
}

function set_cookie ( name, value, exp_y, exp_m, exp_d, path, domain, secure ) {
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
}

function delete_cookie ( cookie_name ) {
    let cookie_date = new Date ( );  // Текущая дата и время
    cookie_date.setTime ( cookie_date.getTime() - 1 );
    document.cookie = cookie_name += "=; expires=" + cookie_date.toGMTString();
}

function clear_bus_statistic() {
    delete_cookie("bus_name");
    delete_cookie("bus_value");
}

function get_bus_statistic() {
    let bus_statistic = new Map();
    let strBusName = get_cookie(BUS_NAME);

    if (!strBusName)
        return bus_statistic;

    let strBusValue = get_cookie(BUS_VALUE);

    let arrayName = strBusName.split(";");
    let arrayValue = strBusValue.split(";");

    if(arrayName.length !== arrayValue.length)
        clear_bus_statistic();

    for(let i = 0; i < arrayName.length; ++i){
        bus_statistic.set(arrayName[i], arrayValue[i]);
    }

    return bus_statistic;
}

function set_bus_statistic(bus_statistic) {
    let strName = "";
    let strValue = "";

    for(let [key, value] of bus_statistic){
        strName += key + ";";
        strValue += value + ";";
    }

    set_cookie(BUS_NAME, strName.slice(0, -1), 2042, 12, 12);
    set_cookie(BUS_VALUE, strValue.slice(0, -1), 2042, 12, 12);
}

function update_bus_statistic( bus_name ) {
    let bus_statistic = get_bus_statistic();

    if(bus_statistic.has(bus_name))
        bus_statistic[bus_name]++;
    else
        bus_statistic.set(bus_name, 1);

    set_bus_statistic(bus_statistic);
}

//Возращает список популярных автобусов (избранное)
//bus_uses - кол-во использований имени автобуса (при апдейте местоположения)/ Нижнее ограничение для вхождение в список
function get_popular_buses(bus_uses){
    let bus_array = [];

    let bus_statistic = get_bus_statistic();

    for(let [key,value] of bus_statistic){
        if(value >= bus_uses)
            bus_array.push(key);
    }

    return bus_array;
}

