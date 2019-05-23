let noe_functions={};
//функция удаления файла
noe_functions.file_doc_delete = function(file){
    fs.unlink(file, function(err){
        if(err) console.log(err);
        else console.log('file deleted successfully');
        return true;
    });
}
module.exports = noe_functions;