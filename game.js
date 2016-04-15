var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example',
{ preload: preload, create: create, update: update });



// ON PRELOAD
function preload() {

    //  37x45 is the size of each frame

    //  There are 18 frames in the PNG - you can leave this value blank if the frames fill up the entire PNG, but in this case there are some
    //  blank frames at the end, so we tell the loader how many to load

    game.load.spritesheet('goo', 'drop/spritesheet.png', 128, 80, 7);

    // 250 * 501 total in 3 pics = each: 250 x 167
    game.load.spritesheet('fh', 'fh-spritesheet-small.png', 250, 167, 3);

    game.load.physics("fh-physics", "fh-spritesheet-small.json");

    game.load.image('egg', 'egg/egg-small.png');
    game.load.image('arrow', 'arrow.png');

    game.load.audio('punch', 'punch.mp3');

    game.load.audio('clip1', 'clip1.mp3');

    game.load.audio('splash', 'splash.mp3');

}


var eggs;
var arrow;
var francois;
var fireRate = 100;
var nextFire = 0;

var score = 0;
var scoreText;

var speakTimer;

var eggCollisionGroup;
var francoisCollisionGroup;

// ON CREATE
function create() {

  game.physics.startSystem(Phaser.Physics.P2JS);
  game.physics.p2.gravity.y = 200;
  //game.physics.p2.restitution = 2;

  //  Turn on impact events for the world, without this we get no collision callbacks
  game.physics.p2.setImpactEvents(true);

  francois = game.add.sprite(100, 100, 'fh');

  game.physics.p2.enable(francois, false);

  francois.body.velocity.x = 50;
  francois.body.velocity.y = 50;

  francois.animations.add('fh-anim');

  francois.body.clearShapes();
  francois.body.loadPolygon("fh-physics", "fh-spritesheet-small");

  francois.animations.play('fh-anim', 5, true);

  francoisCollisionGroup = game.physics.p2.createCollisionGroup();
  francois.body.setCollisionGroup(francoisCollisionGroup);

  arrow = game.add.sprite(400, 500, 'arrow');
  arrow.scale.setTo(0.5, 0.5);
  arrow.anchor.set(0.5, 0.5);
  game.physics.enable(arrow, Phaser.Physics.P2JS);
  arrow.body.angle = 270;
  arrow.body.static = true;

  game.punchSound = game.add.audio('punch');

  game.clip1Sound = game.add.audio('clip1');

  game.splashSound = game.add.audio('splash');

  speakTimer = game.time.create(false);
  randomTime = game.rnd.integerInRange(10000, 50000);
  speakTimer.loop(randomTime, speak, this);
  speakTimer.start();

  eggCollisionGroup = game.physics.p2.createCollisionGroup();

  eggs = game.add.group();
  eggs.enableBody = true;
  eggs.physicsBodyType = Phaser.Physics.P2JS;

  eggs.createMultiple(30, 'egg');
  eggs.setAll('checkWorldBounds', true);
  eggs.setAll('outOfBoundsKill', true);

  game.input.onDown.add(fire, this);

  scoreText = game.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#fff' });

  francois.body.collides(eggCollisionGroup, collisionHandler, this);

}

function speak() {

  game.clip1Sound.play();

}

// MAIN LOOP
function update(){

  arrow.body.rotation = game.physics.arcade.angleToPointer(arrow);

  francois.body.moveRight(100);
  francois.body.moveUp(5);

  if (francois.x > 800)
    francois.body.x = 0;
  if (francois.y > 600)
    francois.body.y = 0;
  if (francois.y < 100)
    francois.body.y += 100;

}


function collisionHandler (f, egg) {

  var goo = game.add.sprite(egg.x - 40, egg.y - 60, 'goo');
  egg.sprite.kill();
  game.splashSound.play();
  goo.animations.add('splurb');
  goo.animations.play('splurb', 10, false);

  //  Add and update the score
  score += 10;
  scoreText.text = 'Score: ' + score;

}

function rotateArrow(pointer) {
  arrow.body.rotation = game.physics.arcade.angleToPointer(arrow);
}

function fire(pointer) {

  arrow.body.rotation = game.physics.arcade.angleToPointer(arrow);

  if (game.time.now > nextFire && eggs.countDead() > 0) {

    nextFire = game.time.now + fireRate;

    var egg = eggs.getFirstDead();

    egg.body.setCircle(10);

    egg.reset(arrow.x, arrow.y - 40);

    egg.body.collideWorldBounds = false;

    egg.body.setCollisionGroup(eggCollisionGroup);
    egg.body.collides([eggCollisionGroup, francoisCollisionGroup]);

    game.physics.arcade.moveToPointer(egg, 500);

    game.punchSound.play();

  }
}
