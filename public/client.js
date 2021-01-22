const { lstat } = require("fs");

var slideIndex = 1;
const maxSlideIndex = 32 ;
var zoomOn = false ;
const zoomID = "myZoomID" ;

// Next/previous controls
function plusSlide(n) {
    slideIndex += n ;
    if (slideIndex > maxSlideIndex) {slideIndex = 1} 
    if (slideIndex < 1) {slideIndex = maxSlideIndex}
    showSlide();
}

function openZoom () {
    zoomOn = !zoomOn ;
    if (zoomOn) {
        magnify("image", 3, zoomID);
    }
    else {
        $("#"+zoomID).remove();
    }
}

function openProperties () {
    $("#modalBox").css("display","block");
    
    var a = $("#description").html() ;
    $("#iDescription").val(a) ;
}

function closeProperties () {
    $("#modalBox").css("display","none");
}

function saveProperties () {
    $("#modalBox").css("display","none");
    
    var b  = $("#iDescription").val() ;
    $.ajax( {
        type: 'GET',
        url:'/edit',
        data: {
            "number" : slideIndex,
            "description" : b 
        },
        dataType : 'json'
    }) ;
    $("#description").html(b) ;
    
}


/*
$("#description").keypress( e => {
    let keycode = (e.keyCode ? e.keyCode : e.which);
    if(keycode == '13'){
        let desc = $("#description").val();
        alert (desc);
    }
})
*/

function fillPeopleWithAllData(data) {
    $.ajax( {
        type: 'GET',
        url:'/getAssigned',
        data: {
            "number" : slideIndex
        },
        dataType : 'json'
    })
    .done(function (assigned) {
        var list = $("#peopleList") ;
        list.html("") ;
        Object.keys(data).forEach(key => {
            let element = data[key] ;
            
            if (assigned.indexOf(key)>=0) {
                list.append('<li data-value="'+key+'" class="checked">' + element["name"] + '</li>' );
            }
            else {
                list.append('<li data-value="'+key+'">' + element["name"] + '</li>' );
            }
        });
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    }
    );
    
    
    
    
}
function fillPeopleList () {
    $.ajax( {
        type: 'GET',
        url:'/peopleList',
        dataType : 'json'
    })
    .done(function (data) {
        fillPeopleWithAllData(data) ;    
        var list = document.querySelector('ul');
        list.addEventListener('click', function(ev) {
            if (ev.target.tagName === 'LI') {
                ev.target.classList.toggle('checked');
            }
        }, false);   
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    }
    );
    
}

function showSlide() {
    
    var n = slideIndex ;
    if (slideIndex < 10) {
        n = '00' + slideIndex ;
    }
    else if (slideIndex < 100) {
        n = '0' + slideIndex ;
    }
    
    var image = document.getElementById("image");
    image.src = "https://virtualitereelle.com/paillet/Paillet"+n+ ".jpg" ;
    
    let w = window.innerWidth ; 
    let h = window.innerHeight;

    var target = $("#image"); 
    let w2 = image.naturalWidth;
    let h2 = image.naturalHeight;

    if (w2/w > h2/h)     {
        target.css({ "width": w + "px", "height": "auto" }); 
    }
    else {   
        target.css({ "height": h + "px", "width": "auto" })
    }
        
        var number = document.getElementById("number");
        number.innerText = slideIndex + '/' + maxSlideIndex ;
        
        $.ajax( {
            type: 'GET',
            url:'/description',
            data: {
                "number" : slideIndex
            },
            dataType : 'json'
        })
        .done(function (data) {
            $("#description").html(data["description"]) ;git init
        })
        .fail(function(jq, status,err) {
            console.log("Ajax error",status) ;
        }
        );
        
    }
    
    /* People Box */
    function openPeople () {
        fillPeopleList();
        $("#peopleBox").css("display","block");
    }
    
    function savePeople () {
        let res = [] ;
        $("ul li").each(function() { 
            if (this.classList.contains("checked")) {
                res.push(this.getAttribute('data-value'));
            }
        });
        $.ajax( {
            type: 'GET',
            url:'/assignPeople',
            data: {
                "number" : slideIndex,
                "assignedPeople" : res
            },
            dataType : 'json'
        })
        .done(function (data) {
            $("#peopleBox").css("display","none");
        })
        .fail(function(jq, status,err) {
            console.log("Ajax error",status) ;
        });
        // TODO : why here ?
        $("#peopleBox").css("display","none");
        
    }
    
    
    
    showSlide() ;
    
    
    