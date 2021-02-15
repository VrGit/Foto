
const fs = require('fs') ;
const file = __dirname+'/locations.json' ;

let rawdata = fs.readFileSync(file);
let data = JSON.parse(rawdata);

function get(number) {
    let r = data[number] ;
    return r ;
}
function add (r) {
    let max = -1 ;
    Object.keys(data).forEach (
        key => {
            let i = parseInt(key) ;
            if (i>max) max=i ;
        }
    ) ;
    max++ ;
    data[max]=r ;
}

function save () {
    let str = JSON.stringify(data, null, 2);
    fs.writeFile(file, str, (err) => {
        if (err) throw err;
        console.log('People written to file');
    });
}

module.exports.data = data
module.exports.get = get
module.exports.save = save
module.exports.add = add 
