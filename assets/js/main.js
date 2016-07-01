/*global
  $
*/

(function () {
  // ================== globals ==================
  var LEFT = 37;
  var RIGHT = 39;

  var GRID_SIZE = 12;
  var GRID_WIDTH = 50;
  var GRID_HEIGHT = 40;

  var START_TICK = 100;
  var START_FALL_SPEED = 1;
  var START_PAD_WIDTH = 4;
  var START_DROP_CREATE_TIME = 1000;

  var $game = null;
  var $pad = null;
  var $score = null;
  var $drops = [];

  var game = null;

  // ================== view helpers ==================
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

  var removeDrop = function ($drop) {
    $drops.splice($drops.indexOf($drop), 1);
    $drop.remove();
  };

  var moveDrops = function () {
    for (var i = 0; i < $drops.length; i++) {
      var $drop = $drops[i];
      var pos = getXY($drop);
      move($drop, pos.x, pos.y + game.fallSpeed);
    }
  };

  var colideDrops = function () {
    var padPos = getXY($pad);
    var $missed = [];

    for (var i = 0; i < $drops.length; i++) {
      var $drop = $drops[i];
      var pos = getXY($drop);
      if (pos.y > GRID_HEIGHT) {
        $missed.push($drop);
      } else if (pos.x >= padPos.x && pos.y === padPos.y) {
        onDropCatch($drop);
      }
    }

    for (var i = 0; i < $missed.length; i++) {
      var $drop = $missed[i];
      onDropMiss($drop);
    }
  };

  var movePad = function () {
    var pos = getXY($pad);
    move($pad, pos.x + game.padDX, pos.y);
  };

  // ================== actions ==================

  var onDropMiss = function ($drop) {
    removeDrop($drop);
  };

  var onDropCatch = function ($drop) {
    game.score = game.score + 1;
    $score.html(game.score);
    removeDrop($drop);
  };

  var onKeyDown = function (event) {
    if (event.keyCode === LEFT) {
      game.padDX = -1;
    } else if (event.keyCode === RIGHT) {
      game.padDX = 1;
    }
  };

  var onKeyUp = function (event) {
    game.padDX = 0;
  };

  // ================== game ==================
  var restart = function () {
    for (var i = 0; i < $drops.length; i++) {
      $drops[i].remove();
    }
    $drops = [];
    createDrop();
    game = {
      score: 0,
      fallSpeed: START_FALL_SPEED,
      tick: START_TICK,
      padWidth: START_PAD_WIDTH,
      dropCreateTime: START_DROP_CREATE_TIME
    };
    $score.html(game.score);
    size($pad, game.padWidth, 1);
    move($pad, Math.round(GRID_WIDTH / 2), GRID_HEIGHT - 2);
    game.dropHandle = setInterval(createDrop, game.dropCreateTime);
    game.tickHandle = setInterval(update, game.tick);
  };

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
  };

  var update = function () {
    movePad();
    moveDrops();
    colideDrops();
  };

  // ================== ready ==================

  // when the page is done loading
  var onReady = function () {
    setup();
    restart();
  };

  $(document).ready(onReady);
})();
