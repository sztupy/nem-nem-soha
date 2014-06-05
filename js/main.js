(function(window,document){
  var solution = {
    ter1: {x:298, y:171},
    ter2: {x:263, y:196},
    ter3: {x:260, y:213},
    ter4: {x:268, y:236},
    ter5: {x:313, y:232},
    ter6: {x:352, y:210},
    ter7: {x:345, y:168}
  };

  var board = document.getElementById('board');
  
  var worldWidth = board.offsetWidth;
  var worldHeight = board.offsetHeight;
  var turulOffsetY = document.getElementById('turul').offsetHeight/2;

  var actualLevel;
  var score;
  var keys;
  var speed;
  var locations;
  var grab;
  var ellens;
  var lives;
  var running;

  var setCentre = function(elem, x, y) {
    var width = elem.offsetWidth;
    var height = elem.offsetHeight;
    elem.style.top = Math.round(y - height/2)+"px";
    elem.style.left = Math.round(x - width/2)+"px";
  }

  var setPosition = function(id, x, y) {
    locations[id] = {x:x, y:y};
    setCentre(document.getElementById(id),x,y);
  };

  var generateBoard = function(level) {
    locations = {};
    ellens = [];
    keys = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    speed = {x:0, y:0};
    grab = null;

    for (var theId in solution) {
      if (solution.hasOwnProperty(theId)) {
        newX = solution[theId].x;
        newY = solution[theId].y;

        newX = newX + Math.floor(level * 50 * (0.5-Math.random()));
        newY = newY + Math.floor(level * 50 * (0.5-Math.random()));
        if (newX<50) newX = 50;
        if (newY<50) newY = 50;
        if (newX>worldWidth-50) newX = worldWidth-50;
        if (newY>worldHeight-50) newY = worldHeight-50;

        setPosition(theId, newX, newY);
      }
    }

    setPosition('turul',worldWidth/2, worldHeight/2);
    setPosition('centre',300, 200);
    document.getElementById('ellen').innerHTML = '';
  }

  var reset = function() {
    actualLevel = 1;
    lives = 3;
    score = 0;
    generateBoard(actualLevel);
  };

  var onKeyDown = function(event) {
    switch(event.keyCode) {
      case 37: keys.left = true; break;
      case 38: keys.up = true; break;
      case 39: keys.right = true; break;
      case 40: keys.down = true; break;
    };
  };

  var onKeyUp = function(event) {
    switch(event.keyCode) {
      case 37: keys.left = false; break;
      case 38: keys.up = false; break;
      case 39: keys.right = false; break;
      case 40: keys.down = false; break;
    };    
  };

  var theLoop = function() {
    if (running) {
      document.body.style.background = 'black';
      if (locations.turul) {
        var speedChange = 0.3;
        var maxSpeed = 4;

        if (keys.left) speed.x -= speedChange;
        if (keys.right) speed.x += speedChange;
        if (keys.up) speed.y -= speedChange;
        if (keys.down) speed.y += speedChange;
      
        if (speed.x>0) speed.x-=speedChange/2;
        if (speed.x<0) speed.x+=speedChange/2;
        if (speed.y>0) speed.y-=speedChange/2;
        if (speed.y<0) speed.y+=speedChange/2;

        if (speed.x>maxSpeed) speed.x = maxSpeed;
        if (speed.x<-maxSpeed) speed.x = -maxSpeed;
        if (speed.y>maxSpeed) speed.y = maxSpeed;
        if (speed.y<-maxSpeed) speed.y = -maxSpeed;

        locations.turul.x += speed.x;
        locations.turul.y += speed.y;

        if (locations.turul.x<0) locations.turul.x=0;
        if (locations.turul.y<0) locations.turul.y=0;
        if (locations.turul.x>worldWidth) locations.turul.x=worldWidth;
        if (locations.turul.y>worldHeight) locations.turul.y=worldHeight;

        setPosition('turul',locations.turul.x, locations.turul.y);

        var styles = ['msTransform','webkitTransform','MozTransform','OTransform','transform'];
        for (var i=0; i< styles.length;i++) {
          if (keys.left || speed.x<-0.5) {
            document.getElementById('turul').style[styles[i]] = 'scaleX(-1)';
          } else {
            document.getElementById('turul').style[styles[i]] = '';
          }
        }
      }

      if (grab) {
        setPosition(grab, locations.turul.x, locations.turul.y+turulOffsetY);
        if (Math.abs(locations.turul.x - solution[grab].x) < 5 && Math.abs(locations.turul.y+turulOffsetY - solution[grab].y) < 5) {
          score += actualLevel;
          setPosition(grab, solution[grab].x, solution[grab].y);
          delete locations[grab];
          grab = null;
        }
      }

      if (ellens.length<1+actualLevel && Math.random()<0.05) {
        var ellenSpeed = 2+actualLevel*Math.random();
        if (ellenSpeed>10) ellenSpeed = 10;
        var newEllen = {x:worldWidth * Math.random(), y:0, speed:ellenSpeed, el: document.createElement('div')};
        newEllen.el.className = 'ellen' + (1+Math.floor(Math.random()*2));
        document.getElementById('ellen').appendChild(newEllen.el);
        setCentre(newEllen.el, newEllen.x, newEllen.y);
        ellens.push(newEllen);
      }

      var toDelete = [];
      for (var i=0; i<ellens.length; i++) {
        ellens[i].y += ellens[i].speed;
        setCentre(ellens[i].el, ellens[i].x, ellens[i].y);

        if (Math.abs(locations.turul.x - ellens[i].x) < 25 && Math.abs(locations.turul.y - ellens[i].y) < 10) {
          document.body.style.background = 'red';
          document.getElementById('ellen').removeChild(ellens[i].el);
          lives-=1;
          toDelete.push(i);
        } else if (ellens[i].y>worldHeight) {
          document.getElementById('ellen').removeChild(ellens[i].el);
          toDelete.push(i);
        }
      }

      for (var i=toDelete.length-1; i>=0; i--) {
        ellens.splice(toDelete[i],1);
      }

      var solved = true;

      for (var l in locations) {
        if (locations.hasOwnProperty(l) && l.indexOf('ter') === 0) {
          solved = false;
          if (!grab) {
            if (Math.abs(locations.turul.x - locations[l].x) < 5 && Math.abs(locations.turul.y+turulOffsetY - locations[l].y) < 5) {
              grab = l;
            }
          }
        }
      }

      if (solved) {
        actualLevel += 1;
        lives += 1;
        generateBoard(actualLevel);
      }

      if (lives<=0) {
        lives = 0;
        running = false;
      }

      display();
    }
  };

  var init = function() {
    worldWidth = board.offsetWidth;
    worldHeight = board.offsetHeight;
    running = true;
    window.addEventListener('keydown',onKeyDown);
    window.addEventListener('keyup',onKeyUp);
    window.setInterval(theLoop, 33);
    reset();
  };

  var display = function() {
    document.getElementById('level-num').innerHTML = actualLevel;
    document.getElementById('lives-num').innerHTML = lives;
    document.getElementById('points-num').innerHTML = score;
  };


  init();
})(window,document);
