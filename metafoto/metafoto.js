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
            "assignedPeople": {}
        } ;
        data[number] = r ;
    }
    else {
        let a = r["description"] ;
        if ( (a === undefined) || (a === "")) {
            r["description"] = "Photo numéro "+number ;
        }
        let b = r["assignedPeople"] ;
        if (b === undefined) {
            r["assignedPeople"] = {} ;
        }
    }
    return r ;
}

function setDescription(number, description, toBeChecked) {
    let r = get(number) ;
    r["number"] = number ;
    r["description"] = description ;
    r["toBeChecked"] = toBeChecked ;
    return r ;
}

function addRelatedPeople (number, assignedId) {
    let r = get(number)["assignedPeople"]  ;
    let keys = Object.keys(r) ;
    for (let i=0 ; i < keys.length ; i++) {
         let key = keys[i] ;
         let element = r[key] ;
         if (key === assignedId) {
             // Found
              return;
         }
    }    
    r[assignedId] = {
        "x" : -1,
        "y" : -1
    }
}

function clearRelatedPeople (number) {
    get(number)["assignedPeople"] = {} ;
}
function setRelatedPeoplePosition (number, assignedId,x,y) {
   let r = get(number)["assignedPeople"]  ;
   let keys = Object.keys(r) ;
   for (let i=0 ; i < keys.length ; i++) {
        let key = keys[i] ;
        let element = r[key] ;
        if (key === assignedId) {
            element.x=x;
            element.y=y;
            return;
        }
   }    
   // Case of not found yet
   r[assignedId] = {
    "x" : x,
    "y" : y
}
}

function size() {
    return Object.keys(data).length
}

function save () {
    // Clear of temp items
    Object.keys(data).forEach(key => {
        let element = data[key] ;
        delete element.aPeople ;
    });

    console.log('Saving ...');
    let str = JSON.stringify(data, null, 2);
    fs.writeFile(file, str, (err) => {
        if (err) throw err;
        console.log('Photos metadata written to file');
    });
}

module.exports.data = data
module.exports.get = get
module.exports.setDescription = setDescription
module.exports.addRelatedPeople = addRelatedPeople
module.exports.setRelatedPeoplePosition = setRelatedPeoplePosition
module.exports.size = size
module.exports.save = save
module.exports.clearRelatedPeople = clearRelatedPeople 
