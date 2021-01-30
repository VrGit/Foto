const express = require('express') ;
const app = express ();
const metafoto = require('./metafoto/metafoto') ;
const people = require('./people/people') ;
const colors = require('./colors/color') ;
const collections = require('./collections/collections') ;
const MAX_PHOTO = 112 ;

const fs = require('fs') ;
const paramsFile = __dirname+'/params.json' ;
let rawParams = fs.readFileSync(paramsFile);
let params = JSON.parse(rawParams);

const NO_RES = {} ;

//app.use(express.static(__dirname+'/public')) ;
app.use(express.static('public')) ;

app.get ('/description', function (req,res) {
    let r  = metafoto.get(req.query.number) ;
    let aPeople = [] ;

    let mapPeople = r["assignedPeople"] ;
    Object.keys(mapPeople).forEach(key => {
        let v = mapPeople[key] ;
        let s = people.get(key)["name"] ;
        let i = parseInt(key) ;
        aPeople.push([key.trim(),s,v.x,v.y,colors.getColor(i)]) ;
    });
    r["aPeople"] = aPeople ;
    res.send(r) ; 
});

app.get ('/currentCollection', function (req,res) {
    let r = collections.data[params.currentCollection] ;
    r["id"]=params.currentCollection;
    console.log("Current collection="+r) ;
    res.send(r) ;
 });
 app.get ('/collectionFromId', function (req,res) {
    params.currentCollection = req.query.currentCollectionId ;
    let r = collections.data[params.currentCollection] ;
    r["id"]=params.currentCollection;
    console.log("Current collection="+r) ;
    res.send(r) ;
 });

 app.get ('/saveCollection', function (req,res) {
    params.currentCollection = req.query.collectionId ;
    if (params.currentCollection === '') {
        var id=-1 ;
        // case of creation
        Object.keys(collections.data).forEach( key => {
            let id0 = parseInt(key) ;
            if (id0>id) id=id0;
        }) ;
        params.currentCollection = id+1 ;
        let a = {
            "title" : req.query.collectionName ,
            "contents": []
        }
        collections.data[params.currentCollection] = a ;
    }

    collections.data[params.currentCollection]["contents"] = req.query.collection ;
    console.log("Current collection="+params.currentCollection) ;
    res.send(NO_RES) ;
 });

 app.get ('/wholeCollection', function (req,res) {
     let wr = {} ;
     for (let i=1 ; i <= MAX_PHOTO ; i++) {
        let r  = metafoto.get(i) ;
        let mapPeople = r["assignedPeople"] ;
        wr[i] = Object.keys(mapPeople) ;
     }
     res.send(wr) ;
 });


app.get ('/edit', function (req,res) {
    metafoto.setDescription(req.query.number ,req.query.description, req.query.toBeChecked) ;
    res.send(NO_RES) ;
 });
app.get ('/save', function (req,res) {
    metafoto.save();
    collections.save();
    people.save ();

    // Save of the parameters
    let str = JSON.stringify(params, null, 2);
    fs.writeFile(paramsFile, str, (err) => {
        if (err) throw err;
        console.log('Params written to file');
    });

    res.send(NO_RES) ;
});

app.get ('/assignPeople', function (req,res) {
    metafoto.updateAssigned (req.query.number, req.query.assignedIds );
    res.send(NO_RES) ;
 });
app.get ('/positionPeople', function (req,res) {
    let id = req.query.id ;
    let x = req.query.x ;
    let y = req.query.y ;
    console.log('Save pos for '+id+' at '+x+','+y+"=>"+req.query.trace) ;
    metafoto.setRelatedPeoplePosition(req.query.number , id, x, y) ;
    res.send(NO_RES) ;
 });
app.get ('/getAssigned', function (req,res) {
    let r  = metafoto.get(req.query.number) ;
    let ap = r["assignedPeople"] ;
    console.log("getAssignedPeople") ;
    console.log(ap) ;
    res.send(ap) ; 
});
app.get ('/newPeople', function (req,res) {
    let r = req.query ;
    people.add (r) ;
    console.log(r.name + ' has been added');
    res.send(NO_RES) ;
});

app.get ('/peopleList', function (req,res) {
    let r  = people.data ;
    res.send(r) ; 
});

app.get ('/collections', function (req,res) {
    let r  = collections.data ;
    res.send(r) ; 
});

app.listen(process.env.PORT || 5000, () => { console.log("Server is running ...")}) ;

