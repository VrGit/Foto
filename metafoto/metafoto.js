const fs = require('fs') ;
const file = __dirname+'/metafoto.json' ;

let rawdata = fs.readFileSync(file);
let data = JSON.parse(rawdata);

function get(number) {
    let r = data[number] ;
    if (r === undefined) {
        r = {
            "number":number,
            "description":"Photo numéro "+number,
            "assignedPeople": []
        } ;
        data[number] = r ;
    }
    else {
        let a = r["description"] ;
        if ( (a === undefined) || (a === "")) {
            r["description"] = "Photo numéro "+number ;
        }
        let b = r["assignedPeople"] ;
        if ( (b === undefined) || (b === "")) {
            r["assignedPeople"] = [] ;
        }
    }
    return r ;
}

function setDescription(number, description) {
    let r = get(number) ;
    r["number"] = number ;
    r["description"] = description ;
    return r ;
}

function assignPeople(number, assignedPeople) {
    let r = get(number) ;
    r["number"] = number ;
    r["assignedPeople"] = assignedPeople ;
    return r ;
}

function size() {
    return Object.keys(data).length
}

function save () {
    let str = JSON.stringify(data, null, 2);
    fs.writeFile(file, str, (err) => {
        if (err) throw err;
        console.log('Data written to file');
    });
}

module.exports.data = data
module.exports.get = get
module.exports.setDescription = setDescription
module.exports.assignPeople = assignPeople
module.exports.size = size
module.exports.save = save
