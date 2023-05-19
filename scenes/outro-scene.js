export class Outro extends Phaser.Scene {
    constructor() {
        super('outro');
    }
    create() {
        this.w = this.game.config.width
        this.h = this.game.config.height
        this.add.text(this.w / 2, this.h / 2, "You Win!", {
            fontSize: '200px',
            }).setOrigin(0.5, 0.5).setPadding(10).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
                this.scene.start('intro')

        })
    }
}