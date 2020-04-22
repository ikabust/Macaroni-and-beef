//グローバルに展開
phina.globalize();

var ASSETS = {
    //画像
    image: {
        'back': 'img/back.png',//1430*990
        'back2': 'img/back2.png',//1430*990
        'beef': 'img/food_beef.png',// 152*85
        'block': 'img/block1.png', // 99*64
        'macaroni': 'img/macaroni.png',// 332*320
        'ru': 'img/curry_ru.png',
        'potato': 'img/jagaimo_poteto.png',
        'cheese': 'img/kunsei_cheese.png',
        'carrot': 'img/ninjin_carrot.png',
    },

    spritesheet: {
        "main_character": 
        {
            //フレーム情報
            "frame": {
                //1フレームの画像サイズ
                "width": 113,//横
                "height": 165,//縦
                //フレーム数
                "cols": 3, //横
                "rows": 2,//縦
            },
            //アニメーション情報
            "animations" : {
                "walk": {//アニメーション名
                    "frames": [0, 1, 2],
                    "next": "walk", //次のアニメーション
                    "frequency": 4, //アニメーション間隔　速 < 遅
                }, 
                "jump": {
                    "frames": [3, 4, 5],
                    "next": "walk", //次のアニメーション
                    "frequency": 5, //アニメーション間隔　速 < 遅

                }
            }
        }
    }
};

//定数
var SCREEN_WIDTH = 640;
var SCREEN_HEIGHT = 960;
var SPEED = 9;//移動速度
var GRAND = 800;//地面の位置
var vx = 5;//自動移動速度
var JUMP_POWOE = 21;//ジャンプ力
var GRAVITY = 0.9; //重力

var JUMP_FL = false;
var MOVE_FL = true;

var BLOCK_HIGHT_HALF = 32//ブロックの半分の高さ
var BLOCK_WIDTH_HALF = 50//ブロックの半分の幅
var MACARONI_HIGHT_HALF = 57;//マカロニの半分の高さ
var MACARONI_WIDTH_HALF = 83;//マカロニの半分の幅

//スコア表示
var score = 0;
var scoreLabel;


//---メインシーン---
phina.define("MainScene", {
    //継承
    superClass: 'DisplayScene',
    //-初期化-
    init: function() {
        //親クラスの初期化
        this.superInit();

        //背景色
        this.backgroundColor = 'LemonChiffon';

        //---スプライト画像作成---

        //背景
        var back1 = Sprite("back").addChildTo(this);
        var back2 = Sprite("back").addChildTo(this);
        var back3 = Sprite("back2").addChildTo(this);
        put_back(back1, 0, 0, 0, 0)
        put_back(back2, back1.right, 0, 0, 0)
        put_back(back3, back2.right, 0, 0, 0)

        //ブロック
        var bl1 = Sprite("block").addChildTo(this);
        var bl2 = Sprite("block").addChildTo(this);
        var bl3 = Sprite("block").addChildTo(this);
        put_back(bl1, 500, 600, 0.5, 0);
        put_back(bl2, 300, 300, 0.5, 0);
        put_back(bl3, 700, 500, 0.5, 0);
        
        //材料
        var beef = Sprite('beef').addChildTo(this);
        var ru = Sprite('ru').addChildTo(this);
        var potato = Sprite('potato').addChildTo(this);
        var cheese = Sprite('cheese').addChildTo(this);
        var carrot = Sprite('carrot').addChildTo(this);
        put_material(beef, 200, 100, GRAND-150);
        put_material(ru, beef.x+120, 100, GRAND-150);
        put_material(potato, ru.x+120, 100, GRAND-150);
        put_material(cheese, potato.x+120, 100, GRAND-150);
        put_material(carrot, cheese.x+120, 100, GRAND-150);

        //主人公マカロニ
        var main_macaroni = Sprite("macaroni").addChildTo(this);
        put_back(main_macaroni, 100, GRAND, 0.5, 1);

        // スコアラベルの追加
        scoreLabel = Label({
            text : "うまうま度",
            message: "おわり",
            x: 320, 
            y: 60,
            fontSize: 40,
            fill: "orange",
        }).addChildTo(this);
        
        //スプライトにフレームアニメーションをアタッチ
        var anim = FrameAnimation("main_character").attachTo(main_macaroni);
        //アニメーション指定
        anim.gotoAndPlay("walk");

        JUMP_FL = false;
        main_macaroni.physical.velocity.y = 0;
        main_macaroni.physical.gravity.y = 0; 
        MOVE_FL = true;
        score = 0;
        
        //移動＋表示＋終了
        this.update = function(app) {//app経由でキー情報を取得
            const key = app.keyboard;
            const m = app.mouse;
            const t = app.pointer;

            //左右上下移動
            if (key.getKey("left")) { main_macaroni.x -= SPEED; }
            if (key.getKey("right")) { main_macaroni.x += SPEED; }
            
            //ジャンプ
            if ((key.getKey("up") || m.getButtonUp("left") || t.getPointingStart()) && JUMP_FL == false) { 
                //ジャンプ処理
                JUMP_FL = true;
                main_macaroni.physical.velocity.y = -JUMP_POWOE;
                main_macaroni.physical.gravity.y = GRAVITY;                
                //アニメーション
                anim.gotoAndPlay("jump");
                //サウンド付けたかった、、、
            }
        };
        
        //終了判定＋背景移動更新
        this.on("enterframe", function() {
            //スコア計算
            score = (beef.umauma+ru.umauma+carrot.umauma+potato.umauma+cheese.umauma)*20;
            //途中スコア表示
            scoreLabel.text = "うまうま度：" + score;

            //ゲームの終了判定
            if (back3.right < SCREEN_WIDTH+10) {
                main_macaroni.x += vx;
                if (main_macaroni.x > SCREEN_WIDTH/2) { 
                    //鍋に突っ込む
                    main_macaroni.x += 10; 
                    main_macaroni.y += 15; 
                    //着地処理を行わず、ジャンプができないようにする
                    MOVE_FL = false;
                    JUMP_FL = true;
                    if (main_macaroni.y > SCREEN_HEIGHT) {
                        //とりあえず下に行けば終了シーンに移動するよう
                        main_macaroni.x = SCREEN_WIDTH;
                        
                        //終了シーンのメッセージ
                        make_message(score, scoreLabel);

                        //終了シーンへ
                        this.exit({
                            score:score,
                            message: scoreLabel.message,
                        });
                    } 
                }
            } else {
                //ブロックをランダム出現
                show_block(bl1, 150, 300);
                show_block(bl2, 350, 500);
                show_block(bl3, 600, GRAND-150);
                //材料をランダム出現
                show_material(beef);
                show_material(ru);   
                show_material(potato);            
                show_material(cheese);            
                show_material(carrot);            
                
                // 背景移動
                back1.x -= vx;
                back2.x -= vx;
                back3.x -= vx;
                // 材料移動
                beef.x -= vx;
                ru.x -= vx;
                potato.x -= vx;
                cheese.x -= vx;
                carrot.x -= vx;
                // ブロック移動
                bl1.x -= vx;
                bl2.x -= vx;
                bl3.x -= vx;
                
                //マカロニの範囲外処理
                if (main_macaroni.x < 0) {
                    main_macaroni.x = 0;
                }
                if (main_macaroni.x > SCREEN_WIDTH) {
                    main_macaroni.x = SCREEN_WIDTH;
                }
            }
            
            //着地処理
            if (main_macaroni.y > GRAND+5  && MOVE_FL) {
                main_macaroni.physical.velocity.y = 0;
                main_macaroni.physical.gravity.y = 0; 
                JUMP_FL = false;
                main_macaroni.y = GRAND;
            }
        });
            
            //当たり判定
            this.on("enterframe", function() {
            // 判定用の円
            var c1 = Circle (main_macaroni.x, main_macaroni.y-MACARONI_HIGHT_HALF, main_macaroni.radius-5);
            var c2 = Circle (bl1.x, bl1.y+BLOCK_HIGHT_HALF, bl1.radius-5);
            var c3 = Circle (bl2.x, bl2.y+BLOCK_HIGHT_HALF, bl2.radius-5);
            var c4 = Circle (bl3.x, bl3.y+BLOCK_HIGHT_HALF, bl3.radius-5);
            var c5 = Circle (beef.x, beef.y, beef.radius-5);
            var c6 = Circle (potato.x, potato.y, potato.radius-5);
            var c7 = Circle (carrot.x, carrot.y, carrot.radius-5);
            var c8 = Circle (cheese.x, cheese.y, cheese.radius-5);
            var c9 = Circle (ru.x, ru.y, ru.radius-5);
            
            // 肉の当たり判定
            if (Collision.testCircleCircle(c1, c5)) {
                hide_material(beef);
            }
            //じゃがいも
            if (Collision.testCircleCircle(c1, c6)) {
                hide_material(potato);
            }   
            //にんじん         
            if (Collision.testCircleCircle(c1, c7)) {
                hide_material(carrot);
            }
            //チーズ
            if (Collision.testCircleCircle(c1, c8)) {
                hide_material(cheese);
            }
            //ルー
            if (Collision.testCircleCircle(c1, c9)) {
                hide_material(ru);
            }            

            //ブロック１の当たり判定　
            if (Collision.testCircleCircle(c1, c2)) {
                hit_block(main_macaroni, bl1);
            } 
            // ブロック２の当たり判定　
            else if (Collision.testCircleCircle(c1, c3)) {
                hit_block(main_macaroni, bl2);
            }
            //ブロック３の当たり判定
            else if (Collision.testCircleCircle(c1, c4)) {
                hit_block(main_macaroni, bl3);
            } 
            else {
                //浮遊中は重力をかける
                if (main_macaroni.y < GRAND){
                    main_macaroni.physical.gravity.y = GRAVITY; 
                    JUMP_FL = true;
                }
            }
 
        });
    },
});

//値の代入　背景とまかろに
phina.define("put_back", {
    init: function(name, px, py, ox, oy) {
        name.x =px;
        name.y =py;
        name.origin.set(ox, oy);       
    }
});

//値の代入　材料
phina.define("put_material", {
    init: function(name, px, rmin, rmax) {
        name.x = px;
        name.y = Random.randint(rmin, rmax);
        name.flag = 0;
        name.umauma = 0;
    }
});

//材料の非表示
phina.define("hide_material", {
    init: function(name) {
        name.hide();
        if (!name.flag) {
            name.umauma++;
            name.flag = 1;
        }
    },
});

//ブロックのあたり判定
phina.define("hit_block", {
    init: function(main, bl) {
        if(Math.abs(main.y- bl.y) < 10) {
            main.physical.velocity.y = 0;
            main.physical.gravity.y = 0; 
            main.y = bl.y + 5;
            JUMP_FL = false;
        }   
    },
});

//材料の出現
phina.define("show_material", {
    init: function(name) {
        if (name.right < 0) {    
            name.x = SCREEN_WIDTH+10;
            name.y = Random.randint(100, GRAND-100);
            name.show();
            name.flag = 0;
        }
    }
});

//ブロックの出現
phina.define("show_block", {
    init: function(name, max, min) {
        if (name.right < 0) {    
            name.x = SCREEN_WIDTH+10;
            name.y = Random.randint(max, min);
        }
    }
});

phina.define("make_message", {
    init: function(score,lavel) {
        if (score <= 200) {
            lavel.message = "最高にまずいビーフシチューの完成だな！！"
        } else if (score <= 500) {
            lavel.message = "まあ、まずまずといったところかな"
            
        } else if (score <= 560) {
            lavel.message = "おいおい、もうシェフになった方が\nいいんじゃないか？最高だよ！"
        }
    }
});


//---メイン処理---
phina.main(function() {
    //アプリケーションを生成
    var app = GameApp({
        title: "マカロニと牛肉",
        // startLabel: 'main',
        //アセット読み込み
        assets: ASSETS,
        backgroundColor:"BlanchedAlmond",
        fontColor: "Chocolate",
    });

    //実行
    app.run();
});