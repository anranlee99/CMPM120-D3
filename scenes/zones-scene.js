export class Zones extends Phaser.Scene {
    constructor() {
        super('zones');
    }

    drawTrajectory() {

        this.graphics.clear();
        //credit: adam smith 
        let hWorld = new Phaser.Physics.Matter.World(this, this.matter.config);
        let hFactory = new Phaser.Physics.Matter.Factory(hWorld);
        let hDot = hFactory.circle(this.dot.position.x, this.dot.position.y, 0, { isStatic: true })
        let hBall = hFactory.circle(this.ball.position.x, this.ball.position.y, 24);
        let hSpring = hFactory.spring(hBall, hDot, this.spring.length, this.spring.stiffness);
        const step = 1000 / 60;
        hWorld.update(0, step);
        hWorld.removeConstraint(hSpring);

        if (Math.abs(hBall.position.y - this.ball.position.y) > 1) {
            for (let t = 0; t < 1000; t += step) {
                let { x, y } = hBall.position;
                this.graphics.fillCircle(x, y, 3);
                hWorld.update(t, step);
            }
        }

    }

    checkGameOver() {
        if(this.score >= 5){
            this.cameras.main.fade(1000,0,0,0)
            this.time.delayedCall(2000, () => {
                this.scene.start('pegs')
            })
        }
        
    }
    checkFired(){
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
    setUpLevel() {
        this.matter.world.setBounds();
        this.w = this.game.config.width
        this.h = this.game.config.height

        this.predict = true
        this.gameOver = false
        this.add.text(this.w, 0, "restart", {
            fontSize: '32px',
        }).setOrigin(1,0).setPadding(10).setInteractive({useHandCursor: true}).on('pointerdown', () => {
            this.scene.start('zones')
        })
        this.score = 0;
        this.scoreBoard = this.add.text(this.w, this.h * 0.2, `${this.score}/5`, {
            fontSize: '32px',
        }).setOrigin(1,0).setPadding(10).setInteractive({useHandCursor: true})
        this.add.text(this.w, 30, "pegs", {
            fontSize: '32px',
        }).setOrigin(1, 0).setPadding(10).setInteractive({useHandCursor: true}).on('pointerdown', () => {
            this.scene.start('pegs')
        })
        this.hoverMsg(this.scoreBoard, "Score 10 to pass")
         
        this.graphics = this.add.graphics();
        this.gameStart = false; 
    }
    hoverMsg(target, msg){
        target.on('pointerover', () => {
            let m = this.add.text(this.input.activePointer.x, this.input.activePointer.y, msg, {
                fontSize: '32px',
            }).setPadding(10).setOrigin(0.5, 0.5)
            this.tweens.add({
                targets: m,
                alpha: {from: 1, to: 0},
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
    setShot(){
        //anchor for the spring
        this.dot = this.matter.add.circle(this.input.activePointer.x, this.input.activePointer.y, 0, { isStatic: true })
        //turn off collision for the anchor
        this.dot.collisionFilter = {
            category: 0x0000,
            mask: 0x0000
        };
        //the ball and spring
        const canDrag = this.matter.world.nextGroup();
        this.ball = this.matter.add.circle(this.input.activePointer.x, this.input.activePointer.y, 24, { 
            collisionFilter: { group: canDrag },
            render: {
                fillColor: 0xffffff,
                fillOpacity: 1,
            }
        });
        // this.ball.setInteractive({useHandCursor: true}).on('pointerdown', () => {
        //     this.hoverMsg(this.ball, "Click and drag to aim")
        // })
        this.spring = this.matter.add.spring(this.ball, this.dot, 0, 0.03);
        this.spring.render.visible = false;
        this.matter.add.mouseSpring
        this.matter.add.mouseSpring({ collisionFilter: { group: canDrag } });
    }
    create() {
        this.setUpLevel()
        this.teebox = this.add.rectangle(0, 0, this.w*0.25, this.h, 0x00ff00).setOrigin(0, 0)
        this.teebox.setInteractive({ useHandCursor: true }).setAlpha(0.25)
        this.teebox.once('pointerdown', () => {
            this.setShot()
            this.gameStart = true;
        })
        this.hoverMsg(this.teebox, "Click to place your ball")
        let c1 = 0x64BF6A;
        let c2 = 0xd4af37;
        this.blocks = []
        this.goal = this.matter.add.rectangle(this.w * 0.9, this.h * 0.9, this.w * 0.25, this.h * 0.2, { 
            isStatic: true,
            render: {
                fillColor: c1,
                // fillOpacity: 0.5,
            }
        })
        this.bonus = this.matter.add.rectangle(this.w * 0.4, this.h * 0.9, this.w * 0.25, this.h * 0.2, { 
            isStatic: true,
            render: {
                fillColor: c2,
                // fillOpacity: 0.5,
            },
        })
        this.add.text(this.goal.position.x, this.goal.position.y, "+1", {
            fontSize: '100px',
            alpha: 0.7
        }).setOrigin(0.5).setDepth(this.goal.depth + 1)
        this.add.text(this.bonus.position.x, this.bonus.position.y, "+2", {
            fontSize: '100px',
            alpha: 0.7
        }).setOrigin(0.5).setDepth(this.bonus.depth + 1)
        for (let i = 0; i < 10; i++) {
            
            let type = Math.random() < 0.4 ?  c2: c1;
            let b = this.matter.add.rectangle(this.w * 0.6, this.h * i / 10, 100, this.h * 0.099, {
                render: {
                    fillColor: type,
                    fillOpacity: 1,
                },
            })
            b.color = type; 
            if(b.color === c1){
                b.setOnCollideWith(this.goal, () => {
                    this.matter.world.remove(b)
                    this.score++
                    this.scoreBoard.setText(`${this.score}/5`)
                })
            } else {
                b.setOnCollideWith(this.bonus, () => {
                    this.matter.world.remove(b)
                    this.score+=2
                    this.scoreBoard.setText(`${this.score}/5`)
                })
            }
            this.blocks.push(b)
        }


    }
    update() {
        if (this.predict && this.gameStart) {
            this.checkFired()
        } else {
            //does multiple fades but im too lazy to fix it
            this.checkGameOver()
        }
        
    }
}