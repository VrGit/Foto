
var slideIndex = 1;
var currentCheckedPeople ;
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
    var c = $("#toBeChecked").is(":checked")
    $.ajax( {
        type: 'GET',
        url:'/edit',
        data: {
            "number" : slideIndex,
            "description" : b,
            "toBeChecked": c
        },
        dataType : 'json'
    }) ;
    fillDescriptor(b,c) ;
     
}

var peoplePattern = "" ;
function onPeopleFilterKeyUp () {
    peoplePattern = $("#peopleFilter").val().toUpperCase();
    fillPeopleList ();
}

function fillPeopleWithAllData(peopleMap) {
    var list = $("#peopleList") ;
    list.html("") ;
    $.ajax( {
        type: 'GET',
        url:'/getAssigned',
        data: {
            "number" : slideIndex
        },
        dataType : 'json'
    })
    .done(function (assigned) {
        Object.keys(peopleMap).forEach(peopleKey => {
            let people = peopleMap[peopleKey] ;
            let peopleName = people["name"];
            if (peoplePattern !== "" ) {
                if (peopleName.toUpperCase().indexOf(peoplePattern) == -1) return ;
            }
            
            if (peopleKey in assigned) {
                list.append('<li data-value="'+peopleKey+'" class="checked">' + peopleName + '</li>' );
            }
            else {
                list.append('<li data-value="'+peopleKey+'">' + peopleName + '</li>' );
            }
        });
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}
function fillPeopleList () {
    $.ajax( {
        type: 'GET',
        url:'/peopleList',
        dataType : 'json'
    })
    .done(function (data) {
        fillPeopleWithAllData(data) ;    
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
    
    let w2 = image.naturalWidth;
    let h2 = image.naturalHeight;
    
    var target = $("#image"); 
    if (w2/w > h2/h)     {
        target.css({ "width": w + "px", "height": "auto"}); 
    }
    else {   
        target.css({ "height": h + "px", "width": "auto" })
    }
    
    var number = document.getElementById("number");
    number.innerText = slideIndex + '/' + maxSlideIndex ;

    $("#description").html("") ;
    $("span").each(function() { 
        if (this.classList.contains("tooltip-text")) {
            this.remove();
        }
    });            

    $.ajax( {
        type: 'GET',
        url:'/description',
        data: {
            "number" : slideIndex
        },
        dataType : 'json'
    })
    .done(function (data) {
        fillDescriptor(data["description"],data["toBeChecked"]) ;
 
        let tt = data["aPeople"] ;
        for (let i=0 ; i < tt.length ; i++) {
            let v = tt[i] ;
            let a = v [0].trim() ;
            let s = v [1] ;
            let x = v [2] ;
            let y = v [3] ;
            if (x<0 && y <0) {
                // Default positionment of items
                x=100/(tt.length+1)*(i+1) ;
                y=85 ;
            }
            let color = v [4] ;
            
            let imageContainer = $("#image-container");
            let sp = '<span id="pTag'+a+'" class="tooltip-text" style="left: '+x+
                '%; top: '+y+'%; background-color: '+color+'; data-value="'+a+'";>'+s+'</span>' ;
            imageContainer.append(sp) ;
        }
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    }
    );
    
}

function  fillDescriptor(text, warning) {
    $("#description").html(text) ;
    if (warning) {
        $("#warning").css("display","block");
    }
    else {
        $("#warning").css("display","none");       
    }
}

/* People Box */
function openPeople () {
    fillPeopleList();
    $("#peopleBox").css("display","block");
}

function savePeople () {
    var res = [] ;
    var peopleBox = $("#peopleBox") ;
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
            "assignedIds" : res
        },
        dataType : 'json'
    })
    .done(function (data) {
        peopleBox.css("display","none");
        console.log("Box closed") ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });
    console.log("ending") ;
}

function onSave () {
     $.ajax( {
        type: 'GET',
        url:'/save',
        dataType : 'json'
    })
    .done(function (data) {
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });
}

$("#image-container").mousedown(function(ev) {
    if (currentCheckedPeople !== undefined) {
        let x = ev.clientX;
        let y = ev.clientY ;
        var target = $("#image-container"); 
        let xp = Math.round(100 * x / target.width());
        let yp = Math.round(100 * y / target.height());
        let trace = x+","+y+","+target.width()+","+target.height() ;
        var peopleBox = $("#peopleBox") ;

        $.ajax( {
            type: 'GET',
            url:'/positionPeople',
            data: {
                "number" : slideIndex,
                "id" : currentCheckedPeople,
                "x" : xp,
                "y" : yp,
                "trace" : trace 
            },
            dataType : 'json'
        })
        .done(function (data) {
            // Restauration
            peopleBox.css("display","block");
            showSlide ();
            currentCheckedPeople = undefined ;
        })
        .fail(function(jq, status,err) {
            console.log("Ajax error",status) ;
        });
    }
    
});

function createListEvent () {
    //var list2 = document.querySelector('ul');
    var list2 = $("#peopleList") ;
    list2.click(function(ev) {
        if (ev.target.tagName === 'LI') {
            let stateBefore = ev.target.classList.contains('checked') ;
            ev.target.classList.toggle('checked');
            if (!stateBefore) {
                currentCheckedPeople = ev.target.getAttribute('data-value') ;
                let name = ev.target.innerText ;
                $("#peopleBox").css("display","none");
                let selector = "#pTag"+currentCheckedPeople.trim() ;
                let elt = $(selector) ;
                elt.css("background-color","red");
                elt.addClass("tooltip-blink");
 //               alert ("Cliquez sur "+name) ;

            }
        }
    });   
}

createListEvent();
showSlide() ;


