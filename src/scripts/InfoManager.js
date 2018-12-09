import {update_bus_statistic} from './StatisticFunctions.js';

//Возращает json данных по реальному имени автобуса и его значении.
function get_bus_data(real_bus, bus_value){
    let data;
    let jsonAnswer;
    let isSuccess = false;
    $.ajax({
        url: 'http://notnpat.ru/b'+bus_value+'.json',
        async: false,
        data: data,
        dataType: 'json',
        success: function (json) {
            jsonAnswer = json;
            isSuccess = true;
        }
    });

    update_bus_statistic(real_bus);
    return jsonAnswer;
}