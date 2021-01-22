const express = require('express') ;
const app = express ();
const metafoto = require('./metafoto/metafoto') ;
const people = require('./people/people') ;
var sizeOf = require('image-size');

//app.use(express.static(__dirname+'/public')) ;
app.use(express.static('public')) ;

app.get ('/description', function (req,res) {
    let r  = metafoto.get(req.query.number) ;
    let sPeople = "" ;
    for (let i=0 ; i < r["assignedPeople"].length ; i++) {
        let v = r["assignedPeople"][i] ;
        let s = people.get(v)["name"] ;
        sPeople += s + " " ;
    }
    r["sPeople"] = sPeople ;
    res.send(r) ; 
});

app.get ('/edit', function (req,res) {
    metafoto.setDescription(req.query.number ,req.query.description) ;
    metafoto.save();
});


app.get ('/assignPeople', function (req,res) {
    metafoto.assignPeople(req.query.number ,req.query.assignedPeople) ;
    metafoto.save();
});
app.get ('/getAssigned', function (req,res) {
    let r  = metafoto.get(req.query.number) ;
    res.send(r["assignedPeople"]) ; 
});

app.get ('/peopleList', function (req,res) {
    let r  = people.data ;
    res.send(r) ; 
});


app.listen(5000, () => { console.log("Server is running ...")}) ;

