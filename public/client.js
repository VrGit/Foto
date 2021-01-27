
var slideIndex = 0;
var maxSlideIndex = 0 ;

var currentCheckedPeople ;
var currentDescription = "?";
var currentToBeChecked = false ;
var currentCollection = [] ;

var zoomOn = false ;
const zoomID = "myZoomID" ;

var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ;
alert (mobile) ;

// Next/previous controls
function plusSlide(n) {
    slideIndex += n ;
    if (slideIndex >= maxSlideIndex) {slideIndex = 0 ; } 
    if (slideIndex < 0) {slideIndex = maxSlideIndex-1 ; }
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

/////////////////////////////////////////
function openProperties () {
    $("#modalBox").css("display","block");
    
    $("#iDescription").val(currentDescription) ;
    $("#toBeChecked").prop('checked', currentToBeChecked);

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
            "number" : currentCollection[slideIndex],
            "description" : b,
            "toBeChecked": c
        },
        dataType : 'json'
    }) ;
    fillDescriptor(b,c) ;     
}
/////////////////////////////////////////
function openNewPeople () {
    $("#newPeopleBox").css("display","block");    
}

function closeNewPeople () {
    $("#newPeopleBox").css("display","none");
}
function saveNewPeople () {
    // TODO
    $("#newPeopleBox").css("display","none");
}
/////////////////////////////////////////


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
            "number" : currentCollection[slideIndex]
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

function getImageSrc (iLocal) {
    let i = parseInt(currentCollection[iLocal]) ;
    var n = i ;
    if (i < 10) {
        n = '00' + i ;
    }
    else if (i < 100) {
        n = '0' + i ;
    }
    return "https://virtualitereelle.com/paillet/Paillet"+n+ ".jpg" ;
}
function showSlide() {
    
    var image = document.getElementById("image");
    image.src =  getImageSrc(slideIndex);
    
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
    number.innerText = (slideIndex+1) + '/' + maxSlideIndex ;

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
            "number" : currentCollection[slideIndex]
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
    currentDescription = text ;
    if (warning === undefined) warning = false ;
    currentToBeChecked = warning ;
    $("#description").html(text) ;
    if (warning) {
        $("#warning").css("display","block");
    }
    else {
        $("#warning").css("display","none");       
    }
}

/* People Box */
$("#bPeople").click(function(ev) {
    fillPeopleList();
    $("#peopleBox").css("display","block");
    if (ev.altKey) {
        $("#bNewPeople").css("display","inline");
    }
    else {
        $("#bNewPeople").css("display","none");
    }
});  

$("#bEdit").click(function(ev) {
     if (ev.altKey) {
        openAlbum () ;
     }
    else {
        openProperties() ;
     }
}); 

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
            "number" : currentCollection[slideIndex],
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
                "number" : currentCollection[slideIndex],
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
            let dv = ev.target.getAttribute('data-value') ;
            let selector = "#pTag"+dv.trim() ;
            let elt = $(selector) ;
           if (!stateBefore) {
                currentCheckedPeople = dv ;
                $("#peopleBox").css("display","none");
                elt.css("display","block");
                elt.css("background-color","red");
                elt.addClass("tooltip-blink");
                /*
                let name = ev.target.innerText ;
                alert ("Cliquez sur "+name) ;
                */
            }
            else {
                // Disparition du tag
                elt.css("display","none");
            }
        }
    });   
}

function openAlbum () {
    $("#image-container").css("display","none");
    $("#album-container").css("display","block");

    $.ajax( {
        type: 'GET',
        url:'/wholeCollection'
    })
    .done(function (data) {
        currentCollection = data ;
        maxSlideIndex = currentCollection.length ;
        let nbInCol = maxSlideIndex/4 ;
        let j=0 ;
        let html = "" ;
        for (let i=0 ; i < maxSlideIndex ; i++) {
            let src = getImageSrc(i) ;
    
            if (j==0) {
                html+='<div class="album-column">';           
            }
    
            let s = "<div class='album-img-block'>" ;
            s+= "<img src='"+src+"' class='album-img'/>" ;
            s+='<input type="checkbox"  class="album-checkbox" data-value="'+(i+1)+'" />' ;
            s+= "</div>"
            html+=s;
    
            j++ ;
            if (j>nbInCol) {
                j=0 ;
                html+='</div>' ;                  
            }
        }
        if (j!=0) {
            html+='</div>' ;                  
        }
        $("#album-row").html(html) ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });     
}

function saveAlbum () {
    $("#image-container").css("display","block");
    $("#album-container").css("display","none");

    let selector = $("#album-container input.album-checkbox") ;
    var res = [] ;
    selector.each(function() { 
        var c = $(this).is(":checked") ;
        if (c) {
            res.push(this.getAttribute('data-value'));
        }
    });
    console.log (res) ; // new album
    currentCollection = res ;
    maxSlideIndex = currentCollection.length ;
    showSlide() ;
    $.ajax( {
        type: 'GET',
        url:'/saveCollection',
        data: {
            "collection" : currentCollection
        },
    })
    .done(function (data) {
     })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}

$("#album-title").click(function(ev) {
    if (ev.altKey) {
        saveAlbum () ;
    }
}); 

function initCurrentCollecion() {
    $.ajax( {
        type: 'GET',
        url:'/currentCollection'
    })
    .done(function (data) {
        currentCollection = data ;
        maxSlideIndex = currentCollection.length ;
        showSlide() ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    

}
createListEvent();
initCurrentCollecion ();



