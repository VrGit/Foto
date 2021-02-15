const fs = require('fs') ;
const file = __dirname+'/people.json' ;

let rawdata = fs.readFileSync(file);
let data = JSON.parse(rawdata);

function get(number) {
    let r = data[number] ;
    if (r === undefined) {
        r = {
            "name": '?'
        } ;
        data[number] = r ;
    }
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

function setName(r, name) {
    r["name"] = name ;
}
function setBirth(r, birth) {
    r["birth"] = birth ;
}
function setPrefix(r, prefix) {
    r["prefix"] = prefix ;
}
function setSuffix(r, suffix) {
    r["suffix"] = suffix ;
}
function setDescription(r, description) {
    r["description"] = description ;
}

function size() {
    return Object.keys(data).length
}

function save () {
    let str = JSON.stringify(data, null, 2);
    fs.writeFile(file, str, (err) => {
        if (err) throw err;
    });
}

module.exports.data = data
module.exports.get = get
module.exports.setDescription = setName
module.exports.setBirth = setBirth
module.exports.setPrefix = setPrefix
module.exports.setSuffix = setSuffix
module.exports.setDescription = setDescription
module.exports.size = size
module.exports.save = save
module.exports.add = add 
