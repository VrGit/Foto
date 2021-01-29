const fs = require('fs') ;
const file = __dirname+'/collections.json' ;

let rawdata = fs.readFileSync(file);
let data = JSON.parse(rawdata);

function save () {
    // Clear of temp items
    Object.keys(data).forEach(key => {
        let element = data[key] ;
        delete element.id ;
    });

    console.log('Saving ...');
    let str = JSON.stringify(data, null, 2);
    fs.writeFile(file, str, (err) => {
        if (err) throw err;
        console.log('Collecions written to file');
    });
}

module.exports.data = data 
module.exports.save = save 
