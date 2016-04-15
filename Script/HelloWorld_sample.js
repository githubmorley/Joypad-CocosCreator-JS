　cc.Class({
    extends: cc.Component,

    properties: {
        label: {
            default: null,
            type: cc.Label
        },
        text: 'Hello, World!',
        joypadStick: {  // ジョイスティック
            default: null, // デフォルト値
            type: cc.Node, // cc.Node型
        },
        joypadButton: { // ボタン
            default: null, // デフォルト値
            type: cc.Node, // cc.Node型
        },
    },

    // use this for initialization
    onLoad: function () {
        this.label.string = this.text;
    },

    // called every frame
    update: function (dt) {
        if(this.joypadButton.getComponent("JoypadButton").getValue() === 1) { // ボタンが押された場合
            this.label.node.setPosition(0, -180); // ラベルの位置を最初の位置に戻す
        }
        var pos = this.label.node.getPosition(); // 現在の位置を取得
        var velocity = this.joypadStick.getComponent("JoypadStick").getVelocity(); // ジョイスティックの値を取得
        
        this.label.node.setPosition(pos.x + velocity.x * 10, pos.y + velocity.y * 10); // ラベルを移動
    },
});