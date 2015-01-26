jQuery.imageChanger
====

![jQuery.imageChanger.js](http://webdesign-dackel.com/dev/imagechanger/images/plugin.png)


## Version
2.0.1


## Description
フェード等のアニメーションを付けて、On、Off画像の切り替えを行う為のjQueryプラグインです。


## Demo
[http://webdesign-dackel.com/dev/imagechanger/examples/index.html](http://webdesign-dackel.com/dev/imagechanger/examples/index.html)


## Features
`jQuery.imageChanger.js`は下記の様な特徴を持ちます。

* hoverアクションに応じてOn,Off画像を切替える。オプションでhoverを無効に設定可能
* 切り替え画像の接尾辞をオプションで変更可能
* クロスフェードやスライド等、切替時のアニメーションを設定可能
* オプションで切り替えのアニメーションを拡張可能
* 背景画像の切り替えに対応
* On画像読み込めない場合(404等)は、切り替えを行わない
* 各アクションが実行された場合のコールバック、イベントをサポート
* 一時無効、有効に対応
* プラグインの削除(destroy)に対応


## How To Use

### jQueryとjQuery.imageChanger.jsを読み込みます
~~~~html
<script type="text/javascript" src="//code.jquery.com/jquery-1.11.2.min.js"></script>
<script type="text/javascript" src="js/jquery.imagechanger.min.js"></script>
~~~~

### Set up HTML
~~~~html
<a class="rollover" href="http://example.com" ><img src="path/to/image.jpg" alt="image"></a>
~~~~

### Call the plugin
~~~~javascript
$(document).ready(function(){
	$(".rollover").imageChanger();
});
~~~~


## Options

### suffix
On画像のファイル名につける接尾辞を指定します。  
**Default: `_on`**  
**Type: `string`**

### hover
マウスオーバ、マウスアウトに応じて画像を切り替えます。
タッチデバイスの場合、マウスイベントの代わりにタッチイベントが使用されます。  
**Default: `true`**  
**Type: `boolean`**

### transition
切替時の動作を指定します。  
**Default: fade**  
**Type: `object`**
~~~~javascript
{
	type: "fade",
	duration: 150,
	easing: "linear",
	opacity: 0
}
~~~~


**not animations:**
~~~~javascript
{
	type: false
}
~~~~

**wink:**
~~~~javascript
{
	type: "wink",
	duration: 150,
	easing: "swing",
	opacity: 0.4
}
~~~~

**slide:**
~~~~javascript
{
	type: "slide",
	duration: 150,
	easing: "swing",
	direction: "top", // "top" | "bottom" | "left" | "right"
	display: "inline-block"
}
~~~~

### backgroundImage
背景画像の切り替えを行います。  
**Default: `false`**  
**Type: `boolean`**

### imageTypes
対応する画像の拡張子を`|`区切りの文字列か、配列で指定します。  
**Default: `jpg|jpeg|gif|png`**  
**Type: `string | array`**


## Callbacks
`before**`系のコールバックでは、`return false;`することで、その後の動作をキャンセルすることが出来ます。

### beforeInit
初期化の前にコールされます。プラグイン実行前と変わらない状態です。  
**Default: `false`**  
**Type: `function`**

### afterInit
初期化が完了した際にコールされます。
DOMの構築、画像のプリロード、イベントのバインドなどが完了しています。  
**Default: `false`**  
**Type: `function`**

### beforeChange
画像が切り替わる直前にコールされます。  
**Default: `false`**  
**Param: `(string)type: "on"|"off"`**  
**Type: `function`**

### afterChange
画像が切り替わった直後にコールされます。  
**Default: `false`**  
**Param: `(string)type: "on"|"off"`**  
**Type: `function`**

### beforeOnImage
On画像に切り替わる直前にコールされます。  
**Default: `false`**  
**Type: `function`**

### afterOnImage
On画像に切り替わった直後にコールされます。  
**Default: `false`**  
**Type: `function`**

### beforeOffImage
Off画像に切り替わる直前にコールされます。  
**Default: `false`**  
**Type: `function`**

### afterOffImage
Off画像に切り替わった直後にコールされます。  
**Default: `false`**  
**Type: `function`**


## Custom data attributes
カスタムデータ属性を使ったオプションの指定に対応します。  
`data-ic-`に続けてオプション名、オプション値を指定します。
データ属性を使って指定したオプションは、`$.fn.imageChanger()`で
指定したオプションよりも優先されます。

下記の例では実行時、data属性のオプションが優先されることで次の様にオプションが有効になります。

* **suffix: "_active"**
* **transition: {type:wink}**

**Example:**

**HTML**
~~~~html
<a class="rollover" href="http://example.com" data-ic-suffix="_active" data-ic-transition='{"type":"wink"}'><img src="path/to/image.jpg" alt="image"></a>
~~~~

**JavaScript**
~~~~javascript
$(function(){
	$(".rollover").imageChanger({
		suffix: "_on",
		transition: {
			type: "fade"
		}
	});
});
~~~~


## Custom Events
`jQuery#on()`を使って、イベントをバインドします。

~~~~javascript
$(selector).on("ic.**", function(e, ic){
	// do something...
});
~~~~

### ic.beforeInit
初期化を行う前に発火します。

### ic.afterInit
初期化が完了した段階で発火します。

### ic.beforeChange
画像が切り替わる直前に発火します。

### ic.afterChange
画像が切り替わった直後に発火します。

### ic.beforeOnImage
On画像に切り替わる直前に発火します。

### ic.afterOnImage
On画像に切り替わった直後に発火します。  

### ic.beforeOffImage
Off画像に切り替わる直前に発火します。

### ic.afterOffImage
Off画像に切り替わった直後に発火します。



## Data Methods
`jQuery#data()`のキーに`"imageChanger"`を指定することで、
imageChangerオブジェクトを取得出来ます。  
取得したオブジェクトに対して各メソッドを実行します。

~~~~javascript
var ic = $(selector).imageChanger().data("imageChanger");
ic.method();
~~~~


### toggle
画像の表示をトグルします。  

### onImage
On画像に切替えます。  

### offImage
Off画像に切替えます。  

### disable
プラグインの各設定を一時的に無効化します。  

### enable
プラグインを有効化します。無効化されていない場合は変化ありません。

### destroy
構築したDOM、バインドされた各イベントを解除し、プラグイン実行前の状態に戻します。


## Custom Transitions
`transition`オプションに下記のメソッドを持ったオブジェクトを
指定することで、独自の動作へ調整することが出来ます。

* **`initialize()`** スタイルやDOMの構成など、初期化処理を実装します。
* **`on()`** On画像への切替処理を実装します。
* **`off()`** Off画像への切替処理を実装します。
* **`destroy()`** `ImageChanger#destroy()`実行時の処理を実装します。

`on()`, `off()`の第一引数には、コールバックの関数が入ってくるので、
処理が終わったら、関数を実行します。
詳細のコードは、`examples/transition-custom.html`を参照して下さい。

~~~~javascript
{
	type: "custom",
	defaults: {
		// default parametors...
	},

	initialize: function(params){
	},

	on: function(params, done){
		done.call();
	},

	off: function(params, done){
		done.call();
	},

	destroy: function(params){
	}
}
~~~~

また、`jQuery.imageChanger.registerTransition()`を使うことで
ビルトインのtransitionとして登録することが出来ます。  
登録したtransitionは、`type`オプションに第一引数で指定した`name`を
指定することで使うことが出来ます。

**Example:**
~~~~javascript
// Register Custom Transition.
$.imageChanger.registerTransition("example", {
	defaults: {
		// default parametors...
	},

	initialize: function(params){
	},

	on: function(params, done){
		done.call();
	},

	off: function(params, done){
		done.call();
	},

	destroy: function(params){
	}
});

// Use Custom Transition.
$(selector).imageChanger({
	transition: {
		type: "example"
	}
});
~~~~


## Transition Examples (Use Buitlin)
~~~~javascript
$(selector).imageChanger({
	transition: {
		type: "slide",
		direction: "bottom",
		duration: 150,
		easing: "swing"
	}
});
~~~~


## Requirements
jQuery 1.7.2 +


## Browser Support
* IE7 +
* Firefox
* Chrome
* Safari
* iOS5 +
* Android2.3 +


## Change Log
* **[2015.01.27]** Support the option specified in the custom data attributes.
* **[2015.01.04]** First release.


## Licence
Released under the [MIT Licence](https://github.com/tcnksm/tool/blob/master/LICENCE)


## Author
[tsuyoshi wada](https://github.com/tsuyoshiwada/)
