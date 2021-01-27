const express = require('express') ;
const app = express ();
const metafoto = require('./metafoto/metafoto') ;
const people = require('./people/people') ;
const colors = require('./colors/color') ;

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
    console.log("Current collection="+params.currentCollection) ;
     res.send(params.currentCollection) ;
 });

 app.get ('/saveCollection', function (req,res) {
    params.currentCollection = req.query.collection ;
    console.log("Current collection="+params.currentCollection) ;
    res.send(NO_RES) ;
 });

 app.get ('/wholeCollection', function (req,res) {
     let r = [] ;
     for (let i=1 ; i <=32 ; i++) r.push(String(i)) ;
     res.send(r) ;
 });


app.get ('/edit', function (req,res) {
    metafoto.setDescription(req.query.number ,req.query.description, req.query.toBeChecked) ;
    res.send(NO_RES) ;
 });
app.get ('/save', function (req,res) {
    metafoto.save();

    // Save of the parameters
    let str = JSON.stringify(params, null, 2);
    fs.writeFile(paramsFile, str, (err) => {
        if (err) throw err;
        console.log('Params written to file');
    });

    res.send(NO_RES) ;
});

app.get ('/assignPeople', function (req,res) {
    let ids = req.query.assignedIds ;
    metafoto.clearRelatedPeople ();
    if (ids !== undefined) {
        for (let i=0 ; i < ids.length ; i++) {
            let id = ids[i] ;
            metafoto.addRelatedPeople(req.query.number ,id) ;
        }
    }
   console.log("assignPeople: "+ids) ;
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

app.get ('/peopleList', function (req,res) {
    let r  = people.data ;
    res.send(r) ; 
});


app.listen(process.env.PORT || 5000, () => { console.log("Server is running ...")}) ;

