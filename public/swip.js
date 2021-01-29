let imageContainer = document.querySelector("div#image-container");

imageContainer.addEventListener("touchstart", startTouch, false);
imageContainer.addEventListener("touchmove", moveTouch, false);

  // Swipe Up / Down / Left / Right
  var initialX = null;
  var initialY = null;

  function startTouch(e) {
    initialX = e.touches[0].clientX;
    initialY = e.touches[0].clientY;
  };

  function moveTouch(e) {
    if (initialX === null) {
      return;
    }

    if (initialY === null) {
      return;
    }

    var currentX = e.touches[0].clientX;
    var currentY = e.touches[0].clientY;

    var diffX = initialX - currentX;
    var diffY = initialY - currentY;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      // sliding horizontally
      if (diffX > 0) {
        // swiped left
        plusSlide(-1) ;
      } else {
        // swiped right
        plusSlide(1) ;
      }  
    } else {
      // sliding vertically
      if (diffY > 0) {
        // swiped up
        
      } else {
        // swiped down
        
      }  
    }

    initialX = null;
    initialY = null;

    e.preventDefault();
  };
