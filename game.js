class Example extends Phaser.Scene {
    constructor() {
        super();
        this.delete = []
    }

    drawTrajectory() {

        this.graphics.clear();


        let g = 1;
        let x0 = this.ball.position.x;
        let y0 = this.ball.position.y;
        let k = 0.03;
        let disp = Phaser.Math.Distance.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y) - 50;
        let v = Math.sqrt(2 * k * Math.pow(disp, 2));
        let theta = (Math.PI * 2) - Phaser.Math.Angle.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y);

        this.graphics.fillStyle(0xff0000, 1);
        const y = (x) =>{
            //x0,y0 are wrong
            let res =  (x - x0) * Math.tan(theta) - (g * (x - x0) ** 2) / (2 * (v * Math.cos(theta)) ** 2) + y0
            return res
          }
        for (let i = 0; i < this.w; i += this.w / 10) {
            let x = x0 + i;
            
            this.graphics.fillCircle(x, this.h-y(x), 5);
        }


        // const curve = new Phaser.Curves.QuadraticBezier(p0, p1, p2);

        // curve.draw(this.graphics, 64);

        // const points = curve.getSpacedPoints(20);

        // this.graphics.fillStyle(0xff0000, 1);
        // //  Draw the points
        // this.graphics.fillStyle(0xff0000, 1);

        // for (let i = 0; i < points.length; i++) {
        //     this.graphics.fillCircle(points[i].x, points[i].y, 4);
        // }
    }



    create() {
        this.graphics = this.add.graphics();
        this.matter.world.setBounds();
        this.w = this.game.config.width
        this.h = this.game.config.height


        // const platform = this.matter.add.rectangle(this.w * 0.25, this.h * 0.75, this.w / 2, this.h / 2, { isStatic: true })

        //move body x to the bottom left corner
        this.dot = this.matter.add.circle(this.w * 0.25, this.h * 0.25, 1, { isStatic: true })
        this.dot.collisionFilter = {
            category: 0x0000,
            mask: 0x0000
        };
        this.ball = this.matter.add.circle(this.w * 0.25, this.h * 0.25 + 50, 32)
        this.spring = this.matter.add.spring(this.ball, this.dot, 50, 0.03);
        this.spring.render.visible = false;

        const blocks = []
        for (let i = 0; i < 10; i++) {
            //at the 75%, i/10 height of the screen,
            //draw a 100 by 9 % of the screen rectangle
            let b = this.matter.add.rectangle(this.w * 0.75, this.h * i / 10, 100, this.h * 0.09)
            blocks.push(b)
        }
        this.matter.add.mouseSpring();




        this.predict = true
        // console.log(this.matter.world)
    }
    update() {
        if (this.predict) {
            this.drawTrajectory()
        }
        // console.log("v, maxV - ", this.fakeV, this.maxV)
        let m = Math.max(Math.abs(this.ball.velocity.x), Math.abs(this.ball.velocity.y))
        if (m > 25 && !this.input.activePointer.isDown) {
            this.matter.world.removeConstraint(this.spring)
            this.predict = false
            this.graphics.clear()

        }
    }
}

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
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
console.log(game.scale)
