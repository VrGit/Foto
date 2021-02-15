
var slideIndex = 0;
var maxSlideIndex = 0 ;

var currentCheckedPeople ;
var currentDescription = "?";
var currentYear = -1 ;
var currentLocation = -1 ;
var currentToBeChecked = false ;
var currentCollection = [] ;
var currentCollectionId = 0 ;
var currentCollectionName = "" ;
var allLocations = {};

var zoomOn = false ;
const zoomID = "myZoomID" ;

var mobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ;


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

    let opts = '<option value=-1>Non définie</option>' ;
    for (let i=1900 ; i < 2050 ; i++) {
        opts += '<option value='+i+'>'+i+'</option>' ;
    }
    $("#iDate").html(opts);
    $("#iDate").val(currentYear);

    $("#iLocation").val(currentLocation);
}

function closeProperties () {
    $("#modalBox").css("display","none");
}

function saveProperties () {
    $("#modalBox").css("display","none");
    
    var b  = $("#iDescription").val() ;
    var c = $("#toBeChecked").is(":checked") ;
    var d = $("#iSkip").is(":checked") ;
    var e = $("#iDate").val() ;
    var l = $("#iLocation").val() ;
    $.ajax( {
        type: 'GET',
        url:'/edit',
        data: {
            "number" : currentCollection[slideIndex],
            "description" : b,
            "toBeChecked": c,
            "skip": d,
            "year": e,
            "location": l
        },
        dataType : 'json'
    }) ;
    fillDescriptor(b,c,e,l) ;     
}
/////////////////////////////////////////
function openNewPeople () {
    $("#newPeopleBox").css("display","block");    
}

function closeNewPeople () {
    $("#newPeopleBox").css("display","none");
}
function saveNewPeople () {
    $("#newPeopleBox").css("display","none");
    let name = $("#npName").val() ;
    let birth = $("#npBirth").val() ;
    let prefix = $("#npPrefix").val() ;
    let suffix = $("#npSuffix").val() ;
    let description = $("#npDescription").val() ;
    $.ajax( {
        type: 'GET',
        url:'/newPeople',
        data: {
            "name": name,
            "birth": birth,
            "prefix": prefix,
            "suffix": suffix,
            "description": description
        },
        dataType : 'json'
    })
    .done(function (assigned) {
        fillPeopleList ();
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
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

function getImageSrc (images,iLocal) {
    let i = parseInt(images[iLocal]) ;
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
    image.src =  getImageSrc(currentCollection,slideIndex);
    
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
    if (slideIndex+1>maxSlideIndex) {
        slideIndex = maxSlideIndex-1 ;
    }
    number.innerText = currentCollectionName + ' [' + (slideIndex+1) + '/' + maxSlideIndex + ']';
    
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
        
        fillDescriptor(data["description"],data["toBeChecked"],data["year"],data["location"]) ;
        
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

function  fillDescriptor(text, warning, year, location) {
    currentDescription = text ;
    currentYear = year ;
    currentLocation = location ;
    if (warning === undefined) warning = false ;
    currentToBeChecked = (warning == 'true');
    let cd = text ;
    if (year>0) cd += ' ('+year+')' ;
    if (location>0) {
        let loc = allLocations[location] ;
        if (loc !== undefined) {
            cd += ' ['+loc.name+']' ;
        }      
    }
    $("#description").html(cd) ;
    if (currentToBeChecked) {
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
        $("#bCopyJSON").css("display","inline");
    }
    else {
        $("#bNewPeople").css("display","none");
        $("#bCopyJSON").css("display","none");
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

function changeAlbum () {
    currentCollectionId = $('#album-name').val() ;
    $.ajax( {
        type: 'GET',
        url:'/collectionFromId',
        data: {
            "currentCollectionId" : currentCollectionId
        },
        dataType : 'json'
    })
    .done(function (data) {
        currentCollection = data.contents ;
        currentCollectionName = data.title ;
        openAlbum ();
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });
}

function toggleAlbumSorter () {
    var cSort = $("#album-sorter") ;
    if (cSort.is(":checked")) {
        // the sorter is checked
        $("#album-row").css("display","none");
        $("#album-set").css("display","block");
    
        let s = "" ;
        for (let i=0 ; i < currentCollection.length ; i++) {
            let j = currentCollection[i] ;
            let src = getImageSrc(currentCollection,i) ;
            s+= "<div class='album-sorter-div'><img src='"+src+"' class='album-sorter-img' data-value='"+(j)+"'/></div>" ;
        }
        $("#album-set").html(s) ;

        $( function() {
            $( "#album-set" ).sortable();
            $( "#album-set" ).disableSelection();
          } );
    }
    else {
        $("#album-row").css("display","block");
        $("#album-set").css("display","none");
 
    }
}

function openAlbum () {
    $("#image-container").css("display","none");
    $("#album-container").css("display","block");
    
    $('#album-name').val(String(currentCollectionId)) ;
    $.ajax( {
        type: 'GET',
        url:'/wholeCollection',
        dataType: 'json'
    })
    .done(function (res) {
        // res is a map imageID => array of peopleId
        let peopleFilter = $("#album-filter").val();
        let allImages = Object.keys(res) ;
        let maxAll = allImages.length ;
        
        // First iteration to count the number of items
        let actualMax = maxAll ;
        if (peopleFilter>0) {
            actualMax = 0 ;
            for (let i=0 ; i < maxAll ; i++) {
                let sIndex = String((i+1)) ;
                let imagePeopleIds = res[sIndex] ;
                if (imagePeopleIds.indexOf(String(peopleFilter))==-1) {
                    continue ;
                }
                actualMax++ ;
            }
        }
        
        let nbInCol = actualMax/4 ;
        let j=0 ;
        let html = "" ;
        for (let i=0 ; i < maxAll ; i++) {
            let src = getImageSrc(allImages,i) ;
            let sIndex = String((i+1)) ;
            
            if (j==0) {
                html+='<div class="album-column">';           
            }
            
            let visible = "" ;
            if (peopleFilter>0) {
                let imagePeopleIds = res[sIndex] ;
                if (imagePeopleIds.indexOf(String(peopleFilter))==-1) {
                    visible = 'style = "display:none;"';
                }
            }
            let s = "<div class='album-img-block' "+visible+">" ;
            let par = "" ;
            let sty = "" ;
            if (currentCollection.indexOf(sIndex)>=0) {
                par = 'checked="checked"' ;
                sty = " style='padding: 20px;' "
            }
            s+= "<img id='ial"+(i+1)+"' src='"+src+"' class='album-img' "+sty+"/>" ;

            s+='<input type="checkbox" '+par+' class="album-checkbox" data-value="'+(i+1)+'" onclick="onImgAlbumSelect(event)"/>' ;
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

function closeAlbum () {
    $("#image-container").css("display","block");
    $("#album-container").css("display","none");
}

function openAlbumTitle () {
    $("#album-title-box").css("display","block");   
}

function newAlbum () {
    $('#album-name').val(-1) ; // to clear the select
    currentCollectionName = $("#naName").val() ;
    saveAlbum (true);
    $("#album-title-box").css("display","none");
}   

function openRemoveFromAlbum () {
    if( confirm("Voulez vous vraiment supprimer cette photo de l'almbum?") ) {
        currentCollection.splice(slideIndex,1);
        maxSlideIndex = currentCollection.length ;
        plusSlide(0) ;
        $.ajax( {
            type: 'GET',
            url:'/saveCollection',
            data: {
                "collection" : currentCollection,
                "collectionId" : currentCollectionId,
                "collectionName" : currentCollectionName
            },
        })
        .done(function (data) {
        })
        .fail(function(jq, status,err) {
            console.log("Ajax error",status) ;
        });    
    }
}   

function clearAlbum () {
    let selector = $("#album-container input.album-checkbox") ;
    selector.each(function() { 
        this.checked=false ;
    });
}

function openCopyJSON () {
    $.ajax( {
        type: 'POST',
        url:'/getAllData',
        dataType: 'json'
    })
    .done(function (data) {
        download('metafoto.json',data.metafoto) ;
        download('people.json',data.people) ;
        download('collections.json',data.collections) ;
        download('params.json',data.params) ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
 }

function download(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
    document.body.removeChild(element);
}

function onImgAlbumSelect(ev) {
    var c = $(ev.target) ;
    let ial = $("#ial" + c.attr('data-value'));
    if (c.is(":checked")) {
        ial.css("padding","20px");
    }
    else {
        ial.css("padding","0px");       
    }
}

function saveAlbum (fromNewAlbum) {
    closeAlbum();
    var cSort = $("#album-sorter") ;
 
    if (cSort.is(":checked")) {
        let selector = $("#album-set img") ;
        var res = [] ; // The new album
        selector.each(function() { 
             res.push(this.getAttribute('data-value'));
        });
        cSort.prop( "checked", false ); // to reset when reopen the album
        currentCollection = res ;
    }
    else {
        let selector = $("#album-container input.album-checkbox") ;
        selector.each(function() { 
            var c = $(this).is(":checked") ;
            let n = this.getAttribute('data-value') ;
            let p = currentCollection.indexOf(n) ;
            if (c) {
                // push at the end
                if (p==-1) {
                    currentCollection.push(n);
                }               
            }
            else {
                // Remove if found
                if (p>-1) {
                    currentCollection.splice(p,1) ;
                }    
            }
        });

    }
    maxSlideIndex = currentCollection.length ;
    currentCollectionId = $('#album-name').val() ;
    showSlide() ;
    $.ajax( {
        type: 'GET',
        url:'/saveCollection',
        data: {
            "collection" : currentCollection,
            "collectionId" : currentCollectionId,
            "collectionName" : currentCollectionName
        },
    })
    .done(function (data) {
        if (fromNewAlbum) {
            initCollections()  ;
        }
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}

function initCurrentCollection() {
    $.ajax( {
        type: 'GET',
        url:'/currentCollection',
        dataType: 'json'
    })
    .done(function (data) {
        currentCollection = data.contents ;
        currentCollectionId = data.id ;
        currentCollectionName = data.title ;
        maxSlideIndex = currentCollection.length ;
        showSlide() ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}
function initCollections() {
    $.ajax( {
        type: 'GET',
        url:'/collections',
        dataType : 'json'
    })
    .done(function (collections) {
        let select = $("#album-name") ;
        let s = "" ;
        Object.keys(collections).forEach(key => {
            let collection = collections[key] ;
            s+= '<option value="'+key+'">'+collection.title+'</option>' ;
        });
        select.html(s) ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}
function initLocations() {
    $.ajax( {
        type: 'GET',
        url:'/getLocations',
        dataType : 'json'
    })
    .done(function (locations) {
        allLocations = locations ;
        let select = $("#iLocation") ;
        let s = "" ;
        Object.keys(locations).forEach(key => {
            let location = locations[key] ;
            s+= '<option value="'+key+'">'+location.name+'</option>' ;
        });
        select.html(s) ;
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    });    
}
function fillCollectionSeelectorWithPeople() {
    $.ajax( {
        type: 'GET',
        url:'/peopleList',
        dataType : 'json'
    })
    .done(function (peopleMap) {
        let select = $("#album-filter") ;
        let s = "" ;
        s+= '<option value="'+0+'">Pas de filtre</option>' ;
        Object.keys(peopleMap).forEach(peopleKey => {
            let people = peopleMap[peopleKey] ;
            s+= '<option value="'+peopleKey+'">'+people.name+'</option>' ;
        });
        select.html(s) ;  
    })
    .fail(function(jq, status,err) {
        console.log("Ajax error",status) ;
    }
    );
    
}
createListEvent();
initCollections ();
initLocations ();
initCurrentCollection ();
fillCollectionSeelectorWithPeople ();

if (mobile) {
    // Cacher les boutons
    $(".edit").css("display","none");
    $(".people").css("display","none");
    $(".zoom").css("display","none");
    $(".save").css("display","none");
    $(".remove").css("display","none");
    
    window.fullScreen = true ;
}
else {
    $(".zoom").css("display","none");
    $(".save").css("display","none");   
}

