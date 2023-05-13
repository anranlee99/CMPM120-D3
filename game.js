class Example extends Phaser.Scene {
    constructor() {
        super();
    }

    drawTrajectory() {

        this.graphics.clear();
        //credit: Adam Smith
        let hFactory = new Phaser.Physics.Matter.Factory(hWorld);
        let hDot = hFactory.circle(this.w * 0.25, this.h * 0.25, 0, { isStatic: true })
        let hBall = hFactory.circle(this.ball.position.x, this.ball.position.y , 32);
        let hSpring = hFactory.spring(hBall, hDot, this.spring.length, this.spring.stiffness);
        const step = 1000/60;
        hWorld.update(0,step);
        hWorld.removeConstraint(hSpring);

        for(let t = 0; t < 1000; t += step) {
            let {x,y} = hBall.position;
            this.graphics.fillCircle(x, y, 3);
            hWorld.update(t,step);
        }

    }



    create() {
        this.graphics = this.add.graphics();
        this.matter.world.setBounds();
        this.w = this.game.config.width
        this.h = this.game.config.height

        //the anchor for the spring
        this.dot = this.matter.add.circle(this.w * 0.25, this.h * 0.25, 0, { isStatic: true })
        //turn off collision for the anchor
        this.dot.collisionFilter = {
            category: 0x0000,
            mask: 0x0000
        };
        //the ball and spring
        this.ball = this.matter.add.circle(this.w * 0.25, this.h * 0.25 , 32)
        this.spring = this.matter.add.spring(this.ball, this.dot, 0, 0.03);
        this.spring.render.visible = false;
        // console.log(this.spring.length, this.ball.mass, this.matter.world.localWorld)
        console.log(this.ball)

        const blocks = []
        for (let i = 0; i < 10; i++) {
            let b = this.matter.add.rectangle(this.w * 0.75, this.h * i / 10, 100, this.h * 0.09)
            blocks.push(b)
        }
        this.matter.add.mouseSpring();
        this.predict = true
    }
    update() {
        if (this.predict) {
            this.drawTrajectory()
        }
        //release the spring if the ball is far enough away
        let disp = Phaser.Math.Distance.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y);
        if (disp > this.ball.circleRadius && !this.input.activePointer.isDown) {
            this.matter.world.removeConstraint(this.spring)
            this.predict = false
            this.graphics.clear()

        }
    }
}

const config = {
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920 ,
        height: 1080
    }, 
    backgroundColor: '#000000',
    resolution: 4,
    parent: 'phaser-example',
    physics: {
        default: 'matter',
        matter: {
            enableSleeping: true,
            debug: {

                showAxes: true,
                showAngleIndicator: true,
                angleColor: 0xe81153,

                showBroadphase: false,
                broadphaseColor: 0xffb400,

                showBounds: true,
                boundsColor: 0xffffff,

                showVelocity: true,
                velocityColor: 0x00aeef,

                showCollisions: true,
                collisionColor: 0xf5950c,

                showSeparations: false,
                separationColor: 0xffa500,

                showBody: true,
                showStaticBody: true,
                showInternalEdges: true,

                renderFill: true,
                renderLine: true,

                fillColor: 0x106909,
                fillOpacity: 1,
                lineColor: 0x28de19,
                lineOpacity: 1,
                lineThickness: 1,

                staticFillColor: 0x0d177b,
                staticLineColor: 0x1327e4,

                showSleeping: true,
                staticBodySleepOpacity: 1,
                sleepFillColor: 0x464646,
                sleepLineColor: 0x999a99,

                showSensors: true,
                sensorFillColor: 0x0d177b,
                sensorLineColor: 0x1327e4,

                showPositions: true,
                positionSize: 4,
                positionColor: 0xe042da,

                showJoint: true,
                jointColor: 0xe0e042,
                jointLineOpacity: 1,
                jointLineThickness: 2,

                pinSize: 4,
                pinColor: 0x42e0e0,

                springColor: 0xe042e0,

                anchorColor: 0xefefef,
                anchorSize: 4,

                showConvexHulls: true,
                hullColor: 0xd703d0
            }
        }
    },
    scene: Example
};

let game = new Phaser.Game(config);
// Set the origin to the bottom-left corner of the screen
