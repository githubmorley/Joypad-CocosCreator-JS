cc.Class({
    extends: cc.Component,

    properties: {
        defaultSF: { // デフォルト状態の画像
            default: null, // デフォルト値
            type: cc.SpriteFrame, // 型
            visible: false, // 『Proeperties』パネルに表示しない
        },
        disabledSF: { // 無効状態の画像
            default: null, // デフォルト値
            type: cc.SpriteFrame, // 型
        },
        pressedSF: { // 押下状態の画像
            default: null, // デフォルト値
            type: cc.SpriteFrame, // 型
        },
        _spriteButton: { // ボタンのスプライト
            default: null, // デフォルト値
            type: cc.Sprite, // 型
        },
        isHoldable: false, // ホールド機能 true:ボタンを離すまでON、false:"_rateLimit"時間だけON（すぐOFF）
        isToggleable: false,  // トグル機能
        _value: 0, // ボタンのON/OFF状態
        _status: 1, // ボタンの有効無効状態、1:有効、0:無効
	    _active: false, // ボタンの処理状態、true:処理中、false:処理受付中
        Radius: { // ボタンの半径
            default: 0, // デフォルト値
            type: cc.Integer, // 型
            tooltip: "if 0 then Radius = Image.Width / 2",
        },
        _radiusSq: 0, // ボタンの半径の２乗
        FPS: 120, // ボタンONの時間（1 / FPS） 
        _rateLimit: 1 / this.FPS, // ボタンONの時間
        _running: false, // ループ実行中フラグ、true:実行中、false：停止中
    },
    onLoad: function () { // 初期化処理
        this._rateLimit = 1 / this.FPS; // ボタンONの時間を計算
        this._spriteButton = this.node.addComponent(cc.Sprite); // ノードに追加したコンポーネントを取得
        this.defaultSF = this._spriteButton.spriteFrame; // デフォルトのスプライトフレームの取得
        this._centerPosition = cc.p( // ボタンの中心を計算
            this.node.getContentSize().width / 2,
            this.node.getContentSize().height / 2);
        if (this.Radius === 0) this.Radius = this._centerPosition.x; // ボタンの半径を計算
        this._radiusSq = Math.pow(this.Radius, 2); // ボタンの半径の２乗を計算
        cc.eventManager.addListener({ // タッチイベントを登録
            event: cc.EventListener.TOUCH_ONE_BY_ONE, // シングルタッチのみ対応
            swallowTouches:false, // false:以降のノードにタッチイベントを渡す
            onTouchBegan: this.onTouchBegan.bind(this), // タッチ開始
            onTouchMoved: this.onTouchMoved.bind(this), // タッチ中
            onTouchEnded: this.onTouchEnded.bind(this), // タッチ終了
            onTouchCanceled:  this.onTouchCanceled.bind(this), // タッチキャンセル
        }, this.node);
        this._running = true; // ループ開始
    },
    onTouchBegan:function(touch, event){ // タッチ開始時処理
        if (this._active) return; // 処理中でないなら場合、処理を抜ける
        var location = this.node.convertToNodeSpace(touch.getLocation()); // タッチ座標を取得（画面の座標）し、自ノードの座標に変換
        location = cc.v2(location.x - this._centerPosition.x, location.y - this._centerPosition.y); // 中心が原点の座標に変換
        var dSq = Math.pow(location.x, 2) + Math.pow(location.y, 2); // 中心からタッチ位置までの距離の２乗を計算
		if (this._radiusSq > dSq) { // ボタン内をタッチした場合
			this._active = true; // 処理中に変更
			if (!this.isToggleable) { // トグル機能が無効の場合
			    this._value = 1; // ボタンをONに変更
			} else { // トグル機能が有効の場合
			    this._value ^= 1; // ボタンのON/OFFを交互に入れ替
			}
			if (!this.isHoldable && !this.isToggleable) { // ホールド機能が無効の場合
			    this.scheduleOnce( // 一回だけ実行
                    function () {
                        this._value = 0; // ボタンをOFFに変更
		                this._active = false; // 処理受付中に変更
			        }, this._rateLimit); // 遅延時間
			}
		} else {
			return false; // タッチイベントを中断
		}
		return true; // onTouchBegan()はbooleanを返す必要あり true:タッチイベントを継続
    },
	onTouchMoved:function(touch, event){ // タッチ中の処理
	    if (!this._active) return; // 処理中でないなら場合、処理を抜ける
	    if (this.isToggleable) return; // トグル機能が有効の場合、処理を抜ける
        var location = this.node.convertToNodeSpace(touch.getLocation()); // タッチ座標を取得（画面の座標）し、自ノードの座標に変換
        location = cc.v2(location.x - this._centerPosition.x, location.y - this._centerPosition.y); // 中心が原点の座標に変換
        var dSq = Math.pow(location.x, 2) + Math.pow(location.y, 2); // 中心からタッチ位置までの距離の２乗を計算
		if (this._radiusSq > dSq) { // ボタン内をタッチした場合
			if (this.isHoldable) this._value = 1; // ホールド機能有効の場合、ボタンをONに変更
		} else { // ボタン外にタッチが移動した場合
			if (this.isHoldable) { // ホールド機能有効の場合
				this._value = 0; // ホールド機能有効の場合、ボタンをOFFに変更
				this._active = false; // 処理受付中に変更
			}
		}
	},
	onTouchEnded:function(touch, event){ // タッチ終了時処理
		if (!this._active) return; // 処理中でないなら場合、処理を抜ける
		if (this.isHoldable && !this.isToggleable) this._value = 0; // ホールド機能有効かつトグル機能無効の場合、ボタンをOFFに変更
		if (this.isHoldable || this.isToggleable) this._active = false; // ホールド機能かトグル機能が有効の場合、処理受付中に変更
	},
	onTouchCanceled:function(touch, event){ //タッチキャンセル時処理
		this.onTouchEnded(touch, event); // タッチ終了時処理を実行
	},
	update: function (dt) { // 周期処理
        if (!this._running) return; // trueになるまでループを実行しない
        if (!this._status) { // ボタンが無効の場合
            this._spriteButton.spriteFrame = this.disabledSF; // 無効状態の画像を表示
        } else { // ボタンが有効の場合
            if (this._value === 0) { // ボタンがOFFの場合
                this._spriteButton.spriteFrame = this.defaultSF; // デフォルト状態の画像を表示
			} else { // ボタンがONの場合
				this._spriteButton.spriteFrame = this.pressedSF; // 押下状態のスプライトを表示
			}
        }
    },
    getValue: function () { // ボタンのON/OFF状態を返す
        return this._value;
    },
    getStatus: function () { // ボタンの有効無効状態を返す
        return this._status;
    },
    setStatus: function (value) { // ボタンの有効無効を設定
        this._status = value;
    },
});