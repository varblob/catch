/*global
  $
  Audio
*/

(function () {
  // ================== globals ==================
  // keycodes for left and right
  var LEFT = 37;
  var RIGHT = 39;

  // size of each grid square
  var GRID_SIZE = 12;
  // grid height and width
  var GRID_WIDTH = 50;
  var GRID_HEIGHT = 40;

  // initial game settings
  // how fast the game update loop runs
  var START_TICK = 10;
  // how many update calls per drop move / collision
  var START_DROPS_SPEED = 10;
  // how many update calls per pad movement
  var START_MOVE_SPEED = 5;
  // how widet he pad is to start
  var START_PAD_WIDTH = 4;
  // how many update calls per createDrop
  var START_DROP_CREATE_TIME = 99;

  // the jquery game element
  var $game = null;
  // the pad that catches the drops
  var $pad = null;
  // the jquery score element
  var $score = null;
  // all the jquery drop elements
  var $drops = [];

  // all the game state
  var game = null;

  // the sound of catching
  var catchSound = null;

  // ================== utils ==================

  // play an Audio object restarting if sound currently playing
  // todo overlapping sounds we must create new Audio instances
  var playSound = function (sound) {
    // if a sound is currently playing restart from beginning
    if (!sound.paused) {
      sound.currentTime = 0;
    } else {
      sound.play();
    }
  };

  // ================== view helpers ==================
  // these are all helpers to get and set model info from a jquery element
  // the conversion to grid is also handled here

  var pxToNum = function (px) {
    return parseInt(px.replace('px', ''), 10);
  };

  var getXY = function ($elem) {
    return {
      x: pxToNum($elem.css('left')) / GRID_SIZE,
      y: pxToNum($elem.css('top')) / GRID_SIZE
    };
  };

  var move = function ($elem, x, y) {
    $elem.css({top: y * GRID_SIZE, left: x * GRID_SIZE});
  };

  var size = function ($elem, width, height) {
    $elem.css({width: width * GRID_SIZE, height: height * GRID_SIZE});
  };

  // ================== drops ==================
  // all functions related to drops

  // create a drop at the top of the screen with random x
  var createDrop = function () {
    var $drop = $('<div class="drop"></div>');
    var x = Math.floor(Math.random() * GRID_WIDTH);
    var y = 0;
    move($drop, x, y);
    size($drop, 1, 1);
    $game.append($drop);
    $drops.push($drop);
    return $drop;
  };

  // remove the given drop
  var removeDrop = function ($drop) {
    $drops.splice($drops.indexOf($drop), 1);
    $drop.remove();
  };

  // move all the drops
  var moveDrops = function () {
    for (var i = 0; i < $drops.length; i++) {
      var $drop = $drops[i];
      var pos = getXY($drop);
      // move only by one to make collision detection easier
      move($drop, pos.x, pos.y + 1);
    }
  };

  // check if the drops are colliding with pad or bottom of screen
  var colideDrops = function () {
    var padPos = getXY($pad);
    var $missed = [];

    for (var i = 0; i < $drops.length; i++) {
      var $drop = $drops[i];
      var pos = getXY($drop);
      // the drop hit the bottom :(
      if (pos.y >= GRID_HEIGHT) {
        $missed.push($drop);
      } else if (
        // colliding with the pad
        pos.x >= padPos.x && pos.x <= padPos.x + game.padWidth &&
        // out of bounds
        pos.y === padPos.y) {
        onDropCatch($drop);
      }
    }

    // drop removeal is separated to avoid removing from an array midway
    // through iterating
    for (var i = 0; i < $missed.length; i++) {
      var $drop = $missed[i];
      onDropMiss($drop);
    }
  };

  // ================== pad ==================
  // pad related functions

  var movePad = function () {
    var pos = getXY($pad);
    var newPos = pos.x + game.padDX;
    // don't move the pad if it's out of bounds
    if (newPos + game.padWidth <= GRID_WIDTH && newPos >= 0) {
      move($pad, newPos, pos.y);
    }
  };

  // ================== actions ==================
  // game actions

  var onDropMiss = function ($drop) {
    removeDrop($drop);
  };

  var onDropCatch = function ($drop) {
    playSound(catchSound);
    game.score = game.score + 1;
    $score.html(game.score);
    removeDrop($drop);
  };

  // NOTE: we must use key down and up as keypress doesn't work for arrow keys
  // set the pads movement direction based on key down
  var onKeyDown = function (event) {
    if (event.keyCode === LEFT) {
      game.padDX = -1;
    } else if (event.keyCode === RIGHT) {
      game.padDX = 1;
    }
  };

  // when the user lets go of the key set the pads movement to 0
  var onKeyUp = function (event) {
    game.padDX = 0;
  };

  // ================== game ==================
  // high level game functions

  // restart the game this end and restarts the game - not currently used
  var restart = function () {
    // cleanup if there was a last game
    if (game && game.tickHandle) {
      clearInterval(game.tickHandle);
    }
    for (var i = 0; i < $drops.length; i++) {
      $drops[i].remove();
    }
    // start a new game
    $drops = [];
    game = {
      score: 0,
      tick: START_TICK,
      padWidth: START_PAD_WIDTH,
      dropCreateTime: START_DROP_CREATE_TIME,
      dropsSpeed: START_DROPS_SPEED,
      moveSpeed: START_MOVE_SPEED,
      time: 0
    };
    $score.html(game.score);
    size($pad, game.padWidth, 1);
    // start the game pad in the middle of the board at the bottom
    move($pad, Math.round(GRID_WIDTH / 2), GRID_HEIGHT - 2);
    game.tickHandle = setInterval(update, game.tick);
  };

  // setup the game this is called only once per page load
  var setup = function () {
    $game = $('.game');
    $game.css({
      width: GRID_WIDTH * GRID_SIZE,
      height: GRID_HEIGHT * GRID_SIZE
    });
    $pad = $('.pad');
    $score = $('.score');
    $(document).keydown(onKeyDown);
    $(document).keyup(onKeyUp);
    catchSound = new Audio('assets/sound/catch.mp3');
  };

  var update = function () {
    game.time = game.time + 1;
    // use the time and modulus to control various speeds on the same game
    // loop
    if (game.time % game.dropCreateTime === 0) {
      createDrop();
    }
    if (game.time % game.moveSpeed === 0) {
      movePad();
    }
    if (game.time % game.dropsSpeed === 0) {
      moveDrops();
      colideDrops();
    }
  };

  // ================== ready ==================

  // when the page is done loading
  var onReady = function () {
    setup();
    restart();
  };

  $(document).ready(onReady);
})();
