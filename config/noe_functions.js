//var path = require('path');
const fs = require('fs');

let noe_functions={};
//функция удаления файла
noe_functions.file_doc_delete = function(file){
    fs.unlink(file, function(err){
        if(err) console.log(err);
        else console.log('file deleted successfully');
        return true;
    });
};

//функция которая оставляет в массиве только уникальные значения
noe_functions.unique_item_in_arr = function(arr){
    let obj = [];
    for (let i = 0; i < arr.length; i++) {
        let str = arr[i];
        obj[str] = true; // запомнить строку в виде свойства объекта
    }
    return Object.keys(obj); // или собрать ключи перебором для IE8-
}
module.exports = noe_functions;