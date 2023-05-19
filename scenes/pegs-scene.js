export class Pegs extends Phaser.Scene {
    constructor() {
        super('pegs');
    }

    drawTrajectory() {

        this.graphics.clear();
        //credit: adam smith 
        let hWorld = new Phaser.Physics.Matter.World(this, this.matter.config);
        hWorld.disableGravity();
        let hFactory = new Phaser.Physics.Matter.Factory(hWorld);
        let hDot = hFactory.circle(this.dot.position.x, this.dot.position.y, 0, { isStatic: true })
        let hBall = hFactory.circle(this.ball.position.x, this.ball.position.y, 24);
        let hSpring = hFactory.spring(hBall, hDot, this.spring.length, this.spring.stiffness);
        const step = 1000 / 60;
        hWorld.update(0, step);
        hWorld.removeConstraint(hSpring);
        hWorld.setBounds()

        if (Math.abs(hBall.position.y - this.ball.position.y) > 1) {
            for (let t = 0; t < 1000; t += step) {
                let { x, y } = hBall.position;
                this.graphics.fillCircle(x, y, 3);
                hWorld.update(t, step);
            }
        }

    }

    checkGameOver() {
        if(!this.targets.l){
            console.log('game over')
            this.cameras.main.fade(1000,0,0,0)
            this.time.delayedCall(2000, () => {
                this.scene.start('outro')
            })
            //so it doesnt get called more than once lol
            this.targets.l++;
        }
    }
    checkFired() {
        //release the spring if the ball is far enough away
        let disp = Phaser.Math.Distance.Between(this.ball.position.x, this.ball.position.y, this.dot.position.x, this.dot.position.y);
        if (disp > this.ball.circleRadius && !this.input.activePointer.isDown) {
            this.matter.world.removeConstraint(this.spring)
            this.predict = false
            this.graphics.clear()
            //remove the mouse spring
            const d = this.matter.world.localWorld.constraints.filter((c) => {
                return c.label === "Pointer Constraint"
            })
            d.forEach((constraint) => {
                this.matter.world.removeConstraint(constraint)
            })
        }
        if (this.predict) {
            this.drawTrajectory()
        }
    }
    addBall() {
        if (this.balls.length <= 20) {
            let b = this.matter.add.circle(this.ball.position.x, this.ball.position.y, this.ball.circleRadius, {
                render: {
                    fillColor: 0xffffff,
                    fillOpacity: 1,
                },
                restitution: 1,
                velocity: {
                    x: this.ball.velocity.x,
                    y: this.ball.velocity.y
                },
                restitution: 1,
                friction: 0,
                frictionAir: 0,
                speed: this.ball.speed,
                motion: this.ball.motion,
            })
            this.balls.push(b)
        }
        this.balls.forEach((ball) => {
            ball.circleRadius = this.circleRad
        })
    }
    setUpLevel() {
        this.matter.world.setBounds();
        this.circleRad = 32
        this.w = this.game.config.width
        this.h = this.game.config.height
        this.predict = true
        this.gameOver = false
        this.add.text(this.w, 0, "restart", {
            fontSize: '32px',
        }).setOrigin(1, 0).setPadding(10).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            this.scene.start('pegs')
        })

        this.graphics = this.add.graphics();
        this.gameStart = false;
        this.balls = [];
        this.targets = [];

        this.makeTarget(this.w * 0.1, this.h * 0.1)
        this.makeTarget(this.w * 0.9, this.h * 0.1)
        this.makeTarget(this.w * 0.2, this.h * 0.6)
        this.makeTarget(this.w * 0.8, this.h * 0.6)
        this.makeTarget(this.w * 0.4, this.h * 0.95)
        this.makeTarget(this.w * 0.6, this.h * 0.95)
        this.targets.l = this.targets.length;
        this.targets.forEach((target) => {
            target.onCollideCallback = ()=>{
                target.visuals.forEach((visual)=>{
                    visual.destroy()
                })
                this.matter.world.remove(target)
                this.targets.l--;
            }
        })
    }
    makeTarget(x, y) {
        let r = 50
        let c1 = this.matter.add.circle(x, y, r, {
            isStatic: true,
            render: {
                fillColor: 0xff0000,
                fillOpacity: 1,
            },
        })
        c1.visuals = []
        let c2 = this.add.circle(x, y, r * .65, 0xffffff).setDepth(c1.depth + 1)
        let c3 = this.add.circle(x, y, r * .3, 0xff0000).setDepth(c1.depth + 2)
        c1.visuals.push(c2, c3)
        this.targets.push(c1)
    }
    hoverMsg(target, msg) {
        target.on('pointerover', () => {
            let m = this.add.text(this.input.activePointer.x, this.input.activePointer.y, msg, {
                fontSize: '32px',
                fontColor: '#ffffff',
            }).setPadding(10).setOrigin(0.5, 0.5)
            this.tweens.add({
                targets: m,
                alpha: { from: 1, to: 0 },
                duration: 3000,
                ease: 'Cubic.easeOut',
                onComplete: () => {
                    m.destroy();
                }
            })
            target.on('pointerout', () => {
                m.destroy();
            })
            //make the message follow the pointer
            this.input.on('pointermove', (pointer) => {
                m.setPosition(pointer.x, pointer.y)
            })
        })

    }
    setShot() {
        //anchor for the spring
        this.dot = this.matter.add.circle(this.input.activePointer.x, this.input.activePointer.y, 0, { isStatic: true })
        //turn off collision for the anchor
        this.dot.collisionFilter = {
            category: 0x0000,
            mask: 0x0000
        };
        //the ball and spring
        const canDrag = this.matter.world.nextGroup();
        this.ball = this.matter.add.circle(this.input.activePointer.x, this.input.activePointer.y, this.circleRad, {
            collisionFilter: { group: canDrag },
            render: {
                fillColor: 0xffffff,
                fillOpacity: 1,
            },
            restitution: 1,
            friction: 0,
            frictionAir: 0,

        });
        this.balls.push(this.ball)
        console.log(this.ball)
        this.spring = this.matter.add.spring(this.ball, this.dot, 0, 0.03);
        this.spring.render.visible = false;
        this.matter.add.mouseSpring
        this.matter.add.mouseSpring({ collisionFilter: { group: canDrag } });
    }
    makePegs() {
        this.pegs = []
        const radius = 10;
        //we want this triangle to occupy the center of the screen
        //and take up 2/3 of the screen

        //initial coords
        let x = this.w / 2;
        let y = this.h / 6;
        //half height of the triangle
        let triangleHeight = this.h * 2 / 3;
        const side = (triangleHeight) / Math.sqrt(3);
        for (let row = 0; row < 5; row++) {

            const circleCount = row + 1;
            const rowOffset = this.h / 6 / side * side;

            for (let col = 0; col < circleCount; col++) {
                const offsetX = (col - (circleCount - 1) / 2) * rowOffset;

                // Draw circles at (x, y) with radius 10
                // Your code to draw circles goes here
                let peg = this.matter.add.circle(x + offsetX, y, radius, {
                    isStatic: true,
                    render: {
                        fillColor: 0xffa500,
                        fillOpacity: 1,
                    },
                    collisionFilter: {
                        group: this.split,
                    },
                    onCollideCallback: () => {
                        this.circleRad *= 0.99;
                        this.addBall();
                    }
                });
                this.pegs.push(peg);
            }

            y += this.h / 6;
        }
    }
    create() {
        this.setUpLevel()
        this.input.once('pointerdown', () => {
            this.setShot()
            this.gameStart = true;
        })
        this.matter.world.localWorld.gravity.y = 0;

        this.makePegs()

    }
    update() {
        if (this.predict && this.gameStart) {
            this.checkFired()
        } else {
            this.checkGameOver()
        }

    }
}