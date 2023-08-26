window.requestAnimFrame = (function () {
  return (
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    function (callback) {
      window.setTimeout(callback, 1000 / 60);
    }
  );
})();

window.cancelRequestAnimFrame = (function () {
  return (
    window.cancelAnimationFrame ||
    window.webkitCancelRequestAnimationFrame ||
    window.mozCancelRequestAnimationFrame ||
    window.oCancelRequestAnimationFrame ||
    window.msCancelRequestAnimationFrame ||
    clearTimeout
  );
})();

var Intense = (function () {
  "use strict";

  var KEYCODE_ESC = 27;

  // Track both the current and destination mouse coordinates
  // Destination coordinates are non-eased actual mouse coordinates
  var mouse = { xCurr: 0, yCurr: 0, xDest: 0, yDest: 0 };

  var horizontalOrientation = true;

  // Holds the animation frame id.
  var looper;

  // Current position of scrolly element
  var lastPosition,
    currentPosition = 0;

  var sourceDimensions, target;
  var targetDimensions = { w: 0, h: 0 };

  var container;
  var containerDimensions = { w: 0, h: 0 };
  var overflowArea = { x: 0, y: 0 };

  // Overflow variable before screen is locked.
  var overflowValue;

  /* -------------------------
    /*          UTILS
    /* -------------------------*/

  // Soft object augmentation
  function extend(target, source) {
    for (var key in source) if (!(key in target)) target[key] = source[key];

    return target;
  }

  // Applys a dict of css properties to an element
  function applyProperties(target, properties) {
    for (var key in properties) {
      target.style[key] = properties[key];
    }
  }

  // Returns whether target a vertical or horizontal fit in the page.
  // As well as the right fitting width/height of the image.
  function getFit(source) {
    var heightRatio = window.innerHeight / source.h;

    if (source.w * heightRatio > window.innerWidth) {
      return { w: source.w * heightRatio, h: source.h * heightRatio, fit: true };
    } else {
      var widthRatio = window.innerWidth / source.w;
      return { w: source.w * widthRatio, h: source.h * widthRatio, fit: false };
    }
  }

  /* -------------------------
    /*          APP
    /* -------------------------*/

  function startTracking(passedElements) {
    var i;

    // If passed an array of elements, assign tracking to all.
    if (passedElements.length) {
      // Loop and assign
      for (i = 0; i < passedElements.length; i++) {
        track(passedElements[i]);
      }
    } else {
      track(passedElements);
    }
  }

  function track(element) {
    // Element needs a src at minumun.
    if (element.getAttribute("data-image") || element.src) {
      element.addEventListener(
        "click",
        function () {
          init(this);
        },
        false
      );
    }
  }

  function start() {
    loop();
  }

  function stop() {
    cancelRequestAnimFrame(looper);
  }

  function loop() {
    looper = requestAnimFrame(loop);
    positionTarget();
  }

  // Lock scroll on the document body.
  function lockBody() {
    overflowValue = document.body.style.overflow;
    document.body.style.overflow = "hidden";
  }

  // Unlock scroll on the document body.
  function unlockBody() {
    document.body.style.overflow = overflowValue;
  }

  function createViewer(title, caption) {
    /*
     *  Container
     */
    var containerProperties = {
      backgroundColor: "rgba(0,0,0,0.8)",
      width: "100%",
      height: "100%",
      position: "fixed",
      top: "0px",
      left: "0px",
      overflow: "hidden",
      zIndex: "999999",
      margin: "0px",
      webkitTransition: "opacity 150ms cubic-bezier( 0, 0, .26, 1 )",
      MozTransition: "opacity 150ms cubic-bezier( 0, 0, .26, 1 )",
      transition: "opacity 150ms cubic-bezier( 0, 0, .26, 1 )",
      opacity: "0",
    };
    container = document.createElement("figure");
    container.appendChild(target);
    applyProperties(container, containerProperties);

    var imageProperties = {
      cursor: `url( "data:image/svg+xml,%3C%3Fxml version='1.0' encoding='utf-8'%3F%3E%3C!-- Generator: Adobe Illustrator 27.8.1, SVG Export Plug-In . SVG Version: 6.00 Build 0) --%3E%3Csvg version='1.1' id='Calque_1' xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' x='0px' y='0px' width='25' height='25' viewBox='0 0 28 28' style='enable-background:new 0 0 28 28;' xml:space='preserve'%3E%3Cstyle type='text/css'%3E .st0%7Bfill:%230E1111;%7D .st1%7Bfill-rule:evenodd;clip-rule:evenodd;fill:%230E1111;%7D .st2%7Bfill-rule:evenodd;clip-rule:evenodd;fill:%23FFFFFF;%7D%0A%3C/style%3E%3Crect x='9' y='13.2' class='st0' width='10' height='1.5'/%3E%3Cpath class='st1' d='M14,3.2C8.1,3.2,3.2,8.1,3.2,14S8.1,24.8,14,24.8S24.8,19.9,24.8,14S19.9,3.2,14,3.2z M14,23.2 c-5.1,0-9.2-4.1-9.2-9.2S8.9,4.8,14,4.8s9.2,4.1,9.2,9.2S19.1,23.2,14,23.2z'/%3E%3Cpath class='st2' d='M14,4.8c-5.1,0-9.2,4.1-9.2,9.2s4.1,9.2,9.2,9.2s9.2-4.1,9.2-9.2S19.1,4.8,14,4.8z M19,14.8H9v-1.5h10V14.8z'/%3E%3C/svg%3E%0A" ) 25 25, auto`,
    };
    applyProperties(target, imageProperties);

    /*
     *  Caption Container
     */
    var captionContainerProperties = {
      fontFamily: 'Georgia, Times, "Times New Roman", serif',
      position: "fixed",
      bottom: "0px",
      left: "0px",
      padding: "20px",
      color: "#fff",
      wordSpacing: "0.2px",
      webkitFontSmoothing: "antialiased",
      textShadow: "-1px 0px 1px rgba(0,0,0,0.4)",
    };
    var captionContainer = document.createElement("figcaption");
    applyProperties(captionContainer, captionContainerProperties);

    /*
     *  Caption Title
     */
    if (title) {
      var captionTitleProperties = {
        margin: "0px",
        padding: "0px",
        fontWeight: "normal",
        fontSize: "40px",
        letterSpacing: "0.5px",
        lineHeight: "35px",
        textAlign: "left",
      };
      var captionTitle = document.createElement("h1");
      applyProperties(captionTitle, captionTitleProperties);
      captionTitle.innerHTML = title;
      captionContainer.appendChild(captionTitle);
    }

    if (caption) {
      var captionTextProperties = {
        margin: "0px",
        padding: "0px",
        fontWeight: "normal",
        fontSize: "20px",
        letterSpacing: "0.1px",
        maxWidth: "500px",
        textAlign: "left",
        background: "none",
        marginTop: "5px",
      };
      var captionText = document.createElement("h2");
      applyProperties(captionText, captionTextProperties);
      captionText.innerHTML = caption;
      captionContainer.appendChild(captionText);
    }

    container.appendChild(captionContainer);

    setDimensions();

    mouse.xCurr = mouse.xDest = window.innerWidth / 2;
    mouse.yCurr = mouse.yDest = window.innerHeight / 2;

    document.body.appendChild(container);
    setTimeout(function () {
      container.style["opacity"] = "1";
    }, 10);
  }

  function removeViewer() {
    unlockBody();
    unbindEvents();
    document.body.removeChild(container);
  }

  function setDimensions() {
    // Manually set height to stop bug where
    var imageDimensions = getFit(sourceDimensions);
    target.width = imageDimensions.w;
    target.height = imageDimensions.h;
    horizontalOrientation = imageDimensions.fit;

    targetDimensions = { w: target.width, h: target.height };
    containerDimensions = { w: window.innerWidth, h: window.innerHeight };
    overflowArea = { x: containerDimensions.w - targetDimensions.w, y: containerDimensions.h - targetDimensions.h };
  }

  function init(element) {
    var imageSource = element.getAttribute("data-image") || element.src;
    var title = element.getAttribute("data-title");
    var caption = element.getAttribute("data-caption");

    var img = new Image();
    img.onload = function () {
      sourceDimensions = { w: img.width, h: img.height }; // Save original dimensions for later.
      target = this;
      createViewer(title, caption);
      lockBody();
      bindEvents();
      loop();
    };

    img.src = imageSource;
  }

  function bindEvents() {
    container.addEventListener("mousemove", onMouseMove, false);
    container.addEventListener("touchmove", onTouchMove, false);
    window.addEventListener("resize", setDimensions, false);
    window.addEventListener("keyup", onKeyUp, false);
    target.addEventListener("click", removeViewer, false);
  }

  function unbindEvents() {
    container.removeEventListener("mousemove", onMouseMove, false);
    container.removeEventListener("touchmove", onTouchMove, false);
    window.removeEventListener("resize", setDimensions, false);
    window.removeEventListener("keyup", onKeyUp, false);
    target.removeEventListener("click", removeViewer, false);
  }

  function onMouseMove(event) {
    mouse.xDest = event.clientX;
    mouse.yDest = event.clientY;
  }

  function onTouchMove(event) {
    event.preventDefault(); // Needed to keep this event firing.
    mouse.xDest = event.touches[0].clientX;
    mouse.yDest = event.touches[0].clientY;
  }

  // Exit on excape key pressed;
  function onKeyUp(event) {
    event.preventDefault();
    if (event.keyCode === KEYCODE_ESC) {
      removeViewer();
    }
  }

  function positionTarget() {
    mouse.xCurr += (mouse.xDest - mouse.xCurr) * 0.05;
    mouse.yCurr += (mouse.yDest - mouse.yCurr) * 0.05;

    if (horizontalOrientation === true) {
      // HORIZONTAL SCANNING
      currentPosition += mouse.xCurr - currentPosition;
      if (mouse.xCurr !== lastPosition) {
        var position = parseFloat(currentPosition / containerDimensions.w);
        position = overflowArea.x * position;
        target.style["webkitTransform"] = "translate3d(" + position + "px, 0px, 0px)";
        target.style["MozTransform"] = "translate3d(" + position + "px, 0px, 0px)";
        target.style["msTransform"] = "translate3d(" + position + "px, 0px, 0px)";
        lastPosition = mouse.xCurr;
      }
    } else if (horizontalOrientation === false) {
      // VERTICAL SCANNING
      currentPosition += mouse.yCurr - currentPosition;
      if (mouse.yCurr !== lastPosition) {
        var position = parseFloat(currentPosition / containerDimensions.h);
        position = overflowArea.y * position;
        target.style["webkitTransform"] = "translate3d( 0px, " + position + "px, 0px)";
        target.style["MozTransform"] = "translate3d( 0px, " + position + "px, 0px)";
        target.style["msTransform"] = "translate3d( 0px, " + position + "px, 0px)";
        lastPosition = mouse.yCurr;
      }
    }
  }

  function main(element) {
    // Parse arguments

    if (!element) {
      throw "You need to pass an element!";
    }

    startTracking(element);
  }

  return extend(main, {
    resize: setDimensions,
    start: start,
    stop: stop,
  });
})();
