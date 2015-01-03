/**
 * =======================================================
 * imageChanger core
 * =======================================================
 */
;(function($, window, undefined){
	"use strict";

	var version = "2.0.0",

	// Default Options
	defaults = {
		suffix: "_on", // img.png => img_on.png
		hover: true,
		transition: {
			type: "fade"
		},
		backgroundImage: false,
		imageTypes: "jpg|jpeg|gif|png",

		// Callbacks
		beforeInit: false,
		afterInit: false,
		beforeChange: false,
		afterChange: false,
		beforeOnImage: false,
		afterOnImage: false,
		beforeOffImage: false,
		afterOffImage: false
	},

	// Namespace
	ns = "ic",

	// Events
	MouseEvent = {
		ROLL_OVER: "mouseenter." + ns,
		ROLL_OUT: "mouseleave." + ns,
		CLICK: "click." + ns
	},

	TouchEvent = {
		TOUCH_START: "touchstart." + ns,
		TOUCH_END: "touchend." + ns,
		TOUCH_MOVE: "touchmove." + ns
	},

	// Classes
	ClassName = {
		image: ns + "-image",
		inner: ns + "-inner",
		on: ns + "-on",
		off: ns + "-off"
	},

	// touch device?
	isTouch = ("ontouchstart" in window),

	// lt IE7?
	ltIe7 = window.addEventListener === undefined && document.querySelectorAll === undefined;



	// ===============================================================
	// Global API
	// ===============================================================
	$.imageChanger = {};

	// Builtin Transitions
	var Transition = $.imageChanger.transition = {
		builtin: {}
	};

	// transition base
	Transition.base = {
		defaults: {
			duration: 150,
			easing: "linear",
			opacity: 0
		},
		initialize: function(params){
			params = params;
		},
		on: function(params, done){
			params = params;
			this.$off.css("opacity", 0);
			done.call();
		},
		off: function(params, done){
			params = params;
			this.$off.css("opacity", 1);
			done.call();
		},
		destroy: function(){
		}
	};

	/**
	 * register built-in transition.
	 * @param string
	 * @param object
	 * @return void
	 */
	$.imageChanger.registerTransition = function(name, transition){
		Transition.builtin[name] = $.extend({}, Transition.base, transition);
	};

	/**
	 * unregister built-in transition
	 * @param string
	 * @return void
	 */
	$.imageChanger.unregisterTransition = function(name){
		delete Transition.builtin[name];
	};





	// ===============================================================
	// Instance
	// ===============================================================
	function ImageChanger(){
		this._initialize.apply(this, arguments);
	}

	ImageChanger.prototype = {
		version: version,
		options: null,
		transition: null,
		imageTypes: "",

		$elem: null,
		$img: null,
		$parant: null,
		$on: null,
		$off: null,

		status: {
			active: false,
			animate: false,
			enable: false,
			loaded: false,
			error: false
		},

		touchTimer: false,

		on: "",
		off: ""
	};

	/**
	 * 初期化
	 * @param jqObj 
	 * @param object
	 */
	ImageChanger.prototype._initialize = function($elem, options){
		this.$elem = $elem;
		this.options = options;
		
		// beforeInit
		if( this._callbackApply("beforeInit", options.beforeInit) === false ){
			return false;
		}

		// Initialize
		this.$img = $elem.find("img");
		this.$parent = this.$img.parent();
		this.transition = this._getTransition();

		this.imageTypes = $.type(options.imageTypes) === "string" ? options.imageTypes.split("|") : options.imageTypes;
		this.imageTypes = "\\."+this.imageTypes.join("\|\\.");

		// srcを取得
		var src = "";
		if( options.backgroundImage ){
			src = this.$elem.css("background-image");
			src = src !== "" ? src.match(/url\((\S+)\)/)[1] : "";
			src = src.replace(/"/g, "");
		}else{
			src = this.$img.attr("src");
		}

		// srcが未指定の場合は未処理
		if( isEmpty(src) ) return false;

		// 既にOn画像の場合は、内部パラメータもOnに設定
		var on = this._hasSuffix(src);

		if( on ){
			this.on = src;
			this.off = this._removeSuffix(src);
			this.status.active = true;
		}else{
			this.on = this._addSuffix(src);
			this.off = src;
		}

		// build HTML
		this._buildHtml();

		// load image
		$("<img>")
			.on("load", $.proxy(this._loadSuccess, this))
			.on("error", $.proxy(this._loadError, this))
			.attr("src", on ? this.off : this.on );

	};

	/**
	 * HTMLを構築
	 * @return void
	 */
	ImageChanger.prototype._buildHtml = function(){
		var $elem = this.$elem,
				$inner,
				$image,
				$off,
				$on,
				contents = $elem.html(),
				size = {
					width: $elem.width(),
					height: $elem.height()
				},
				position,
				style = {
					position: "absolute",
					zIndex: 1,
					top: 0,
					left: 0,
					display: "inline-block",
					width: size.width,
					height: size.height
				};

		// background image
		if( this.options.backgroundImage === true ){
			position = $elem.css("position");
			position = position != "static" ? position : "relative";

			// 元のHTMLを保持
			style.zIndex = 3;
			$inner = $("<span>").addClass(ClassName.inner).css(style).html(contents);

			// off image
			style.zIndex = 2;
			style.backgroundImage = "url("+this.off+")";
			$off = $("<span>").addClass(ClassName.off).css(style);

			// on image
			style.zIndex = 1;
			style.backgroundImage = "url("+this.on+")";
			$on = $("<span>").addClass(ClassName.on).css(style);

			// append
			$elem
				.css({
					"background-image": "transparent",
					"position": position
				})
				.append($inner)
				.append($off)
				.append($on);

		}else{
			// off image
			$off = this.$img;

			position = $off.css("position");

			// on image
			$on = $($("<div>").append($off.clone()).html()); // ie7 jQuery.clone() bug fix
			$on
				.addClass(ClassName.on)
				.attr("src", this.on)
				.css({
					"position": "absolute",
					"z-index": 1
				});

			// wrap
			$off.wrap('<span class="'+ClassName.image+'" style="position:relative; display:inline-block; /display:inline; /zoom:1;"></span>');
			$image = this.$elem.find(ClassName.image);

			if( position === "static" ){
				$off.css("position", "relative");
				$on.css({
					"top": 0,
					"left": 0
				});
			}else{
				$on.css({
					"top": $off.css("top"),
					"right": $off.css("right"),
					"bottom": $off.css("bottom"),
					"left": $off.css("left")
				});
			}

			// append
			$off.css("z-index", 2).addClass(ClassName.off);
			$("."+ClassName.image).append($on);
		}

		this.$on = $on;
		this.$off = $off;
		this.$inner = $inner;
		this.$image = $image;

		// 初期がOn画像の場合
		if( this.status.active ){
			this.$off.attr("src", this.off).css("opacity", 0);
		}
	};

	/**
	 * 構築したHTMLを削除
	 * @return void
	 */
	ImageChanger.prototype._unbuildHtml = function(){
		if( this.options.backgroundImage === true ){
			this.$elem.css({
				"background-image": "",
				"position": ""
			});
			this.$inner.remove();
			this.$on.remove();
			this.$off.remove();

		}else{
			this.$img.unwrap();
			this.$on.remove();
			this.$off
				.css({
					"position": "",
					"z-index": ""
				})
				.removeClass(ClassName.off);
		}
	};

	/**
	 * On画像のプリロードが完了
	 * @param eventObj
	 * @return void
	 */
	ImageChanger.prototype._loadSuccess = function(){
		this.status.enable = this.status.loaded = true;

		// bind events
		this._bindEvents();

		// transition intialize
		this.transition.initialize.call(this, $.extend({}, this.transition.defaults, this.options.transition));

		// afterInit
		this._callbackApply("afterInit", this.options.afterInit, "success");
	};

	/**
	 * On画像のロードエラー
	 * @param eventObj
	 * @return void
	 */
	ImageChanger.prototype._loadError = function(){
		this.status.error = true;

		// afterInit
		this._callbackApply("afterInit", this.options.afterInit, "error");
	};

	/**
	 * イベントを設定
	 * @return void
	 */
	ImageChanger.prototype._bindEvents = function(){
		var _this = this;

		if( _this.options.hover === true ){
			if( isTouch ){
				_this.$elem
					.on(TouchEvent.TOUCH_START, $.proxy(_this._onTouchStartHandler, _this))
					.on(TouchEvent.TOUCH_END, $.proxy(_this._onTouchEndHandler, _this))
					.on(TouchEvent.TOUCH_MOVE, $.proxy(_this._onTouchMoveHandler, _this));
			}else{
				_this.$elem
					.on(MouseEvent.ROLL_OVER, $.proxy(_this._onRollOverHandler, _this))
					.on(MouseEvent.ROLL_OUT, $.proxy(_this._onRollOutHandler, _this));
			}
		}

		// IE7以下で<a>タグのクリックが効かないバグ対策
		if( ltIe7 && _this.$parent.is("a") ){
			_this.$parent
				.css("cursor", "pointer")
				.on(MouseEvent.CLICK, function(e){
					e.preventDefault();
					var href = $(this).attr("href"),
							target = $(this).attr("target");
					if( target === "_blank" ){
						window.open(href, target);
					}else{
						location.href = href;
					}
				});

		}
	};

	/**
	 * イベントを解除
	 * @return void
	 */
	ImageChanger.prototype._unbindEvents = function(){
		if( this.options.hover === true ){
			if( isTouch ){
				this.$elem
					.off(TouchEvent.TOUCH_START)
					.off(TouchEvent.TOUCH_END)
					.off(TouchEvent.TOUCH_MOVE);
			}else{
				this.$elem
					.off(MouseEvent.ROLL_OVER)
					.off(MouseEvent.ROLL_OUT);
			}
		}

		if( ltIe7 && this.$parent.is("a") ){
			this.$parent
				.css("cursor", "")
				.off(MouseEvent.CLICK);
		}
	};

	/**
	 * RollOver
	 * @return void
	 */
	ImageChanger.prototype._onRollOverHandler = function(){
		this.onImage();
	};

	/**
	 * RollOut
	 * @return void
	 */
	ImageChanger.prototype._onRollOutHandler = function(){
		this.offImage();
	};

	/**
	 * TouchStart
	 * @return void
	 */
	ImageChanger.prototype._onTouchStartHandler = function(){
		this.onImage();
	};

	/**
	 * TouchEnd
	 * @return void
	 */
	ImageChanger.prototype._onTouchEndHandler = function(){
		this.offImage();
	};

	/**
	 * TouchMove
	 * @return void
	 */
	ImageChanger.prototype._onTouchMoveHandler = function(){
		if( this.touchTimer ) clearTimeout(this.touchTimer);
		this.touchTimer = setTimeout($.proxy(this.offImage, this), 200);
	};

	/**
	 * 画像切替が有効か判定
	 * @return boolean
	 */
	ImageChanger.prototype._isChangeEnable = function(){
		return !this.status.error && this.status.enable;
	};

	/**
	 * thisを束縛してコールバックを実行
	 * @param string
	 * @param function
	 * @param [param1, param2, ...]
	 * @return boolean
	 */
	ImageChanger.prototype._callbackApply = function(){
		var type = arguments[0],
				callback = arguments[1],
				params = sliceArray(arguments, 2),
				f = $.isFunction(callback) ? callback : function(){},
				v = f.apply(this, params);

		// Fire Custom Event
		var e = new $.Event(ns+"."+type);
		this.$elem.trigger(e, this);

		return v;
	};

	/**
	 * srcの値にsuffixが付いているか判定
	 * @param string
	 * @return boolean
	 */
	ImageChanger.prototype._hasSuffix = function(src){
		return src.match(new RegExp("^(.+)"+this.options.suffix+"("+this.imageTypes+")$", "gi")) ? true : false;
	};

	/**
	 * srcの値にsuffixを付与
	 * @param string
	 * @return boolean
	 */
	ImageChanger.prototype._addSuffix = function(src){
		return src.replace(new RegExp("^(.+)("+this.imageTypes+")$", "gi"), "$1"+this.options.suffix+"$2");
	};

	/**
	 * srcの値からsuffixを削除
	 * @param string
	 * @return boolean
	 */
	ImageChanger.prototype._removeSuffix = function(src){
		return src.replace(new RegExp("^(.+)("+this.options.suffix+")("+this.imageTypes+")$", "gi"), "$1$3");
	};

	/**
	 * アニメーションを実行
	 * @param string
	 * @return boolean
	 */
	ImageChanger.prototype._transition = function(type, callback){
		var _this = this,
				params = $.extend({}, _this.transition.defaults, _this.options.transition || {});

		_this.transition[type].call(_this, params, function(){
			callback.call(_this);
		});
	};

	/**
	 * アニメーションを取得
	 * 指定が無ければ新規でtransition用オブジェクトを生成
	 * @return boolean
	 */
	ImageChanger.prototype._getTransition = function(){
		// not animations
		if( this.options.transition === false || this.options.transition === "none" ){
			return $.extend({}, Transition.base);

		// search buildint transitions
		}else if( Transition.builtin.hasOwnProperty(this.options.transition.type) ){
			return Transition.builtin[this.options.transition.type];

		// custom transition
		}else if( this.options.transition.type === "custom" ){
			return $.extend({}, Transition.base, this.options.transition);
		}

		throw new Error("[ImageChanger] :: Is invalid specification of transition.");
	};

	/**
	 * On, Off画像を切り替える
	 * @param function
	 * @return void
	 */
	ImageChanger.prototype.toggle = function(callback){
		if( this.status.active ){
			this.offImage(callback);
		}else{
			this.onImage(callback);
		}
	};

	/**
	 * On画像に切り替え
	 * @param function
	 * @return void
	 */
	ImageChanger.prototype.onImage = function(callback){
		if( !this._isChangeEnable() || this.status.active ) return false;

		// beforeChange & beforeOnImage
		if( this._callbackApply("beforeChange", this.options.beforeChange, "on") === false ) return false;
		if( this._callbackApply("beforeOnImage", this.options.beforeOnImage) === false ) return false;

		this.status.active = true;
		this.status.animate = true;

		// change animation
		this._transition("on", function(){
			this.status.animate = false;

			// afterChange & afterOnImage
			this._callbackApply("afterChange", this.options.afterChange, "on");
			this._callbackApply("afterOnImage", this.options.afterOnImage);

			if( $.isFunction(callback) ) callback.call(this);
		});
	};

	/**
	 * Off画像に切り替え
	 * @param function
	 * @return void
	 */
	ImageChanger.prototype.offImage = function(callback){
		if( !this._isChangeEnable() || !this.status.active ) return false;

		// beforeChange & beforeOffImage
		if( this._callbackApply("beforeChange", this.options.beforeChange, "off") === false ) return false;
		if( this._callbackApply("beforeOffImage", this.options.beforeOffImage) === false ) return false;

		this.status.active = false;
		this.status.animate = true;

		// change animation
		this._transition("off", function(){
			this.status.animate = false;

			// afterChange & afterOffImage
			this._callbackApply("afterChange", this.options.afterChange, "off");
			this._callbackApply("afterOffImage", this.options.afterOffImage);

			if( $.isFunction(callback) ) callback.call(this);
		});
	};

	/**
	 * 一時的に動作を無効化する
	 * @return void
	 */
	ImageChanger.prototype.disable = function(){
		this.status.enable = false;
	};

	/**
	 * disableを解除
	 * @return void
	 */
	ImageChanger.prototype.enable = function(){
		if( !this.status.error ) this.status.enable = true;
	};

	/**
	 * プラグインを全て解除
	 * @return void
	 */
	ImageChanger.prototype.destroy = function(){
		if( !this.$elem.data("imageChanger") ) return false;

		// transition
		this.transition.destroy.call(this);

		// destroy all events. and DOM(styles)
		this._unbindEvents();
		this._unbuildHtml();

		this.status.enable = false;

		// remove data
		this.$elem.removeData("imageChanger");
	};



	/**
	 * =========================================================
	 * Utilities
	 * =========================================================
	 */
	function sliceArray(array, start, end){
		return Array.prototype.slice.call(array, start, end !== undefined ? end : array.length);
	}

	function isEmpty(val){
		return !val || val === "" || val === 0;
	}


	// Run imageChanger
	$.fn.imageChanger = function(options){
		return this.each(function(){
			if( !$(this).data("imageChanger") ){
				$(this).data("imageChanger", new ImageChanger($(this), $.extend({}, defaults, options)));
			}
		});
	};


}(jQuery, window));
