
var tColors = [
    "AliceBlue",
    "AntiqueWhite",
    "AquaMarine",
    "Coral",
    "Cyan",
    "Gold",
    "GreenYellow",
    "LightPink",
    "Salmon",
    "Silver"
] ;

function getColor (n) {
    let p = n % (tColors.length) ;
    return tColors[p] ;
}

function getOneColor () {
    return getColor (Math.random()*1000) ;
}

module.exports.getColor = getColor ;
module.exports.getOneColor = getOneColor ;
