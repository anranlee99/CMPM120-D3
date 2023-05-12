class Example extends Phaser.Scene {
    constructor() {
        super();
        this.delete = []
    }
    
    drawTrajectory() {

        this.graphics.clear();


        const p0 = new Phaser.Math.Vector2(this.ball.position.x, this.ball.position.y);
        const length = 50;
        const A = Phaser.Math.Distance.Between(this.ball.position.x,this.ball.position.y, this.dot.position.x, this.dot.position.y) - length 
        const k = 0.03
        const v = Math.sqrt(k * A * A)
        let theta = Phaser.Math.Angle.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y)
        const x1 = v * v * 2* Math.sin(theta) * Math.cos(theta) 

        let y1 = x1 * Math.tan(theta) - ((x1 * x1) / (2 * v * v * Math.cos(theta) * Math.cos(theta)))
        const p1 = new Phaser.Math.Vector2(this.ball.position.x - x1, y1)
        const x2 = 2 * A * Math.cos(theta) * Math.cos(theta) * Math.tan(theta)
        console.log(x2)
        const p2 = new Phaser.Math.Vector2(this.ball.position.x - x2, this.ball.position.y)

        const curve = new Phaser.Curves.QuadraticBezier(p0, p1, p2);
        
        this.graphics.lineStyle(1, 0xffffff, 1);
        
        curve.draw(this.graphics, 64);
        this.graphics.fillStyle(0xff0000, 1);
        this.graphics.fillCircle(p0.x, p0.y, 8);
        this.graphics.fillStyle(0x00ff00, 1);
        this.graphics.fillCircle(p1.x, p1.y, 8);
        this.graphics.fillStyle(0x0000ff, 1);
        this.graphics.fillCircle(p2.x, p2.y, 8);


        /*
        GIVEN:
        p0 is this.ball.position
        mass = 1; dont care
        g = 1; dont care
        v = sqrt((k*A^2) / mass)
        k = 0.03
        A = Phaser.Math.Distance.between(this.ball.position.x,this.ball.position.y, this.dot.position.x, this.dot.position.y) - length
        v = sqrt((0.03 * A^2))
        y = x tan(theta) - (g x^2) / (2 v^2 cos^2(theta))

        
        y = xtan(theta) - (g x^2) / (2 (0.03 * A^2)^2 cos^2(theta))
        y = xtan(theta) - (g x^2) / (2 (0.0009 * A^4) cos^2(theta))
        theta = Phaser.Math.Angle.between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y)

        solving for p1 aka the apex:
        dy/dx = tan(theta) - (g x) / (v^2 cos^2(theta)) = 0
        dy/dx = tan(theta) - (x) / (0.0009 * A^4 cos^2(theta)) = 0
        x1 = (v^2 sin(2theta)) 
        x1 = (0.03 * A^2 * sin(2theta))
        y1 = xtan(theta) - (g x^2) / (2 (0.0009 * A^4) cos^2(theta))
        which is p1
        
        A = Phaser.Math.Distance.between(this.ball.position.x,this.ball.position.y, this.dot.position.x, this.dot.position.y) - length 
        p2 is where 0 = x tan(theta) - (g x^2) / (2 v^2 cos^2(theta))
        0 = 2v^2cos^2(theta) x tan(theta) - gx^2
        0 = 2A*cos^2(theta)*x*tan(theta) - x^2
        x ^2 = 2A*cos^2(theta)*x*tan(theta)
        x2 = 2A*cos^2(theta)*tan(theta)

        qed?
        p0 = (this.ball.position.x, this.ball.position.y)
        p1 = (x1, y1)
        p2 = (x2, this.ball.position.y)





        */

        const points = curve.getSpacedPoints(20);

        this.graphics.fillStyle(0xff0000, 1);
        //  Draw the points
        this.graphics.fillStyle(0xff0000, 1);

        for (let i = 0; i < points.length; i++) {
            this.graphics.fillCircle(points[i].x, points[i].y, 4);
        }
    }
    

    
    create() {
        this.graphics = this.add.graphics();
        this.matter.world.setBounds();
        this.w = this.game.config.width
        this.h = this.game.config.height

        const platform = this.matter.add.rectangle(this.w * 0.25, this.h * 0.75, this.w / 2, this.h / 2, { isStatic: true })

        //move body x to the bottom left corner
        this.dot = this.matter.add.circle(this.w * 0.25, this.h * 0.25, 1, { isStatic: true })
        this.dot.collisionFilter = {
            category: 0x0000,
            mask: 0x0000
        };
        this.ball = this.matter.add.circle(this.w * 0.25, this.h * 0.25 + 50, 32)
        this.spring = this.matter.add.spring(this.ball, this.dot, 50, 0.03);
        console.log(this.spring)
        /*
        v = sqrt(2 * k * d / m)

        v is the velocity of the this.ball in m/s
        k is the spring constant in N/m
        d is the maximum displacement of the spring in m
        m is the mass of the this.ball in kg
        */

        // Calculate the velocity of the this.ball when released from the spring



        this.spring.render.visible = false;
        const blocks = []
        for (let i = 0; i < 10; i++) {
            //at the 75%, i%height of the scrren,
            //draw a 100 by 
            let b = this.matter.add.rectangle(this.w * 0.75, this.h * i / 10, 100, this.h * 0.09)
            blocks.push(b)
        }
        this.matter.add.mouseSpring();




        this.maxV = 0;
        this.fakeV = 0;
        this.predict = true
        console.log(this.matter.world)
    }
    update() {
        const damping = 0.03; // Damping coefficient
        const d = Phaser.Math.Distance.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y); // Maximum displacement of the spring in m

        const v = Math.sqrt(2 * d * (1 - damping));
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
