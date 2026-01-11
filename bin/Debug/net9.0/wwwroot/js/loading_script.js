// JavaScript Document

(function($) {
	"use strict";
	var methods = {
		init : function( options ) {
			return this.each(function() {
			});
		},
		destroy : function( ) {
			return this.each(function() {
				var $this = $(this);
				if($this.find('.ls_outer').length == 1) $this.find('.ls_outer').remove();
				if($this.next('.ls_main').length == 1) $this.next('.ls_main').remove();
			});
		},
		method_1 : function( options ) {
			var defaults = {
				'color_option_1':'#f9f9f9',
				'color_option_2':'#000',
				'main_width':70,
				'main_height':12,
				'inner_width':10,
				'animation_speed':10,
				'additional_style': '',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_height = defaults['main_height'];
				var inner_width = defaults['inner_width'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; background-color:'+color_option_1+'; width:'+main_width+'px; height:'+main_height+'px; '+additional_style+'"><span class="ls_inner" style="display:inline-block; width:'+inner_width+'px; height:'+main_height+'px;"></span></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
					_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_2});
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; margin-left:auto; margin-right:auto; background-color:'+color_option_1+'; width:'+main_width+'px; height:'+main_height+'px; '+additional_style+'"><span class="ls_inner" style="display:inline-block; width:'+inner_width+'px; height:'+main_height+'px;"></span></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
					_this.find('.ls_inner').css({'background-color':color_option_2});
				}
				var i = 0;
				function ls_effect() {
					_this.find('.ls_inner').css({'margin-left':i});
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
					if(i == main_width) i = -inner_width;
				}
				var j = 0;
				function ls_effect_af() {
					_this.next('.ls_main').find('.ls_inner').css({'margin-left':j});
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
					if(j == main_width) j = 0;
				}
			});
		},
		method_2 : function( options ) {
			var defaults = {
				'color_option_1':'#aaa',
				'color_option_2':'#000',
				'main_width':15,
				'main_height':15,
				'animation_speed':200,
				'number_of_box':3,
				'margin_left_right':2,
				'additional_style': '',
				'circle_shape':true,
				'zoom_effect':false,
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_height = defaults['main_height'];
				var animation_speed = defaults['animation_speed'];
				var number_of_box = defaults['number_of_box'];
				var margin_left_right = defaults['margin_left_right'];
				var circle_shape = defaults['circle_shape'];
				var zoom_effect = defaults['zoom_effect'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				var box_radius = 0;
				if(circle_shape) box_radius = 80;
				if(after_element) {
					_this.after('<div class="ls_main" style="text-align:center; '+additional_style+'"></div>');
					for(var a=0; a<number_of_box; a++) {
					_this.next('.ls_main').append('<span class="ls_inner" style="display:inline-block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; margin:0 '+margin_left_right+'px; width:'+main_width+'px; height:'+main_height+'px;"></span>');
					}
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="text-align:center;"></div></div>');
					for(var a=0; a<number_of_box; a++) {
						_this.find('.ls_main').append('<span class="ls_inner" style="display:inline-block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; margin:0 '+margin_left_right+'px; width:'+main_width+'px; height:'+main_height+'px;"></span>');
					}
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					if(zoom_effect[0]) {
						_this.find('.ls_inner').css({'background-color':color_option_1,'height':main_height});
						_this.find('.ls_inner').eq(i).css({'background-color':color_option_2,'height':main_height+zoom_effect[1]});	
					} else {
						_this.find('.ls_inner').css({'background-color':color_option_1});
						_this.find('.ls_inner').eq(i).css({'background-color':color_option_2});
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
					if(i == number_of_box) i = 0;
				}
				var j = 0;
				function ls_effect_af() {
					if(zoom_effect[0]) {
						_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_1,'height':main_height});
						_this.next('.ls_main').find('.ls_inner').eq(j).css({'background-color':color_option_2,'height':main_height+zoom_effect[1]});	
					} else {
						_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_1});
						_this.next('.ls_main').find('.ls_inner').eq(j).css({'background-color':color_option_2});
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
					if(j == number_of_box) j = 0;
				}
			});
		},
		method_3 : function(options) {
			var defaults = {
				'color_option_1':'#aaa',
				'color_option_2':'#000',
				'animation_speed':100,
				'animation_text':'Loading',
				'space_between_text':10,
				'additional_style': 'font-family:arial; font-size:12px;',
				'zoom_effect':false,
				'after_element':false,
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var animation_speed = defaults['animation_speed'];
				var animation_text = defaults['animation_text'];
				var space_between_text = defaults['space_between_text'];
				var animation_text = animation_text.split("");
				var additional_style = defaults['additional_style'];
				var zoom_effect = defaults['zoom_effect'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; text-align:center; '+additional_style+'"></div>');
					for(var a=0; a<animation_text.length; a++) {
						_this.next('.ls_main').append('<span class="ls_inner" style="display:inline-block; text-align:center; width:'+space_between_text+'px;">'+animation_text[a]+'</span>');
					}
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; margin-left:auto; margin-right:auto; text-align:center; '+additional_style+'"></div></div>');
					for(var a=0; a<animation_text.length; a++) {
						_this.find('.ls_main').append('<span class="ls_inner" style="display:inline-block; text-align:center; width:'+space_between_text+'px;">'+animation_text[a]+'</span>');
					}
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					if(zoom_effect[0]) {
						_this.find('.ls_inner').css({'color':color_option_1, 'font-size':zoom_effect[1]});
						_this.find('.ls_inner').eq(i).css({'color':color_option_2, 'font-size':zoom_effect[2]});	
					} else {
						_this.find('.ls_inner').css({'color':color_option_1});
						_this.find('.ls_inner').eq(i).css({'color':color_option_2});
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
					if(i==animation_text.length) i = 0;
				}
				var j = 0;
				function ls_effect_af() {
					if(zoom_effect[0]) {
						_this.next('.ls_main').find('.ls_inner').css({'color':color_option_1, 'font-size':zoom_effect[1]});
						_this.next('.ls_main').find('.ls_inner').eq(j).css({'color':color_option_2, 'font-size':zoom_effect[2]});	
					} else {
						_this.next('.ls_main').find('.ls_inner').css({'color':color_option_1});
						_this.next('.ls_main').find('.ls_inner').eq(j).css({'color':color_option_2});
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
					if(j==animation_text.length) j = 0;
				}
			});
		},
		method_4 : function(options) {
			var defaults = {
				'color_option_1':'#fff',
				'color_option_2':'#000',
				'main_width':30,
				'main_height':30,
				'animation_speed':100,
				'additional_style': 'font-family:arial;',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_height = defaults['main_height'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; text-align:center; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; width:'+main_width+'px; height:'+main_height+'px; line-height:'+main_height+'px; background-color:'+color_option_1+'; color:'+color_option_2+'; '+additional_style+'">0</div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; text-align:center; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_height+'px; line-height:'+main_height+'px; background-color:'+color_option_1+'; color:'+color_option_2+'; '+additional_style+'">0</div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 1;
				function ls_effect() {
					_this.find('.ls_main').html(i);
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
				}
				var j = 1;
				function ls_effect_af() {
					_this.next('.ls_main').html(j);
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
				}
			});
		},
		method_5 : function(options) {
			var defaults = {
				'color_option_1':'#eee',
				'color_option_2':'#000',
				'main_width':25,
				'animation_speed':200,
				'additional_style': '',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_width_half = main_width / 2;
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);		
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					_this.find('.ls_inner').css({'background-color':color_option_1});
					_this.find('.ls_inner').eq(i).css({'background-color':color_option_2});
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
					if(i == 4) i = 0;
				}
				var j = 0;
				function ls_effect_af() {
					_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_1});
					_this.next('.ls_main').find('.ls_inner').eq(j).css({'background-color':color_option_2});
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
					if(j == 4) j = 0;
				}
			});
		},
		method_6 : function(options) {
			var defaults = {
				'color_option_1':'#f9f9f9',
				'color_option_2':'#333',
				'main_width':30,
				'animation_speed':100,
				'additional_style': '',
				'reverse_animation': false,
				'circle_shape':false,
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var reverse_animation = defaults['reverse_animation'];
				var circle_shape = defaults['circle_shape'];
				var after_element = defaults['after_element'];
				var box_radius = 0;
				if(circle_shape) box_radius = 80;
				var span_width = main_width/1.7;
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner 1" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:100%; height:100%; margin-left:0%; margin-top:0%; float:left;"><span class="ls_inner 2" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 3" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 4" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 5" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 6" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:60%; height:60%; margin-left:20%; margin-top:20%; float:left;"></span></span></span></span></span></span></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner 1" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:100%; height:100%; margin-left:0%; margin-top:0%; float:left;"><span class="ls_inner 2" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 3" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 4" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 5" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:80%; height:80%; margin-left:10%; margin-top:10%; float:left;"><span class="ls_inner 6" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:60%; height:60%; margin-left:20%; margin-top:20%; float:left;"></span></span></span></span></span></span></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 1;
				var k = 1;
				function ls_effect() {
					if(reverse_animation) {
						_this.find('.ls_inner').css({'background-color':color_option_1});
						_this.find('.ls_inner.'+i+'').css({'background-color':color_option_2});
					} else {
						_this.find('.ls_inner').css({'background-color':color_option_1});
						_this.find('.ls_inner.'+k+'').css({'background-color':color_option_2});
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
					k--;
					if(i==6) i = 1;
					if(k==0) k = 6;
				}
				var l = 1;
				var m = 1;
				function ls_effect_af() {
					if(reverse_animation) {
						_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_1});
						_this.next('.ls_main').find('.ls_inner.'+l+'').css({'background-color':color_option_2});
					} else {
						_this.next('.ls_main').find('.ls_inner').css({'background-color':color_option_1});
						_this.next('.ls_main').find('.ls_inner.'+m+'').css({'background-color':color_option_2});
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					l++;
					m--;
					if(l==6) l = 1;
					if(m==0) m = 6;
				}
			});
		},
		method_7 : function(options) {
			var defaults = {
				'color_option_1':'#fff',
				'color_option_2':'#333',
				'main_width' : '25',
				'animation_speed':1,
				'additional_style': '',
				'reverse_animation': false,
				'gradient_setting' : false,
				'circle_shape':false,
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var reverse_animation = defaults['reverse_animation'];
				var gradient_setting = defaults['gradient_setting'];
				var circle_shape = defaults['circle_shape'];
				var box_radius = 0;
				if(circle_shape) box_radius = 80;
				var span_width = main_width/1.7;
				var after_element = defaults['after_element'];
				if(after_element) {
					if(gradient_setting[0]) {
					_this.after('<div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+gradient_setting[1]+'), to('+gradient_setting[2]+')); background: -webkit-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -moz-linear-gradient(left, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -ms-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -o-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); width:100%; height:100%; margin-left:0; margin-top:0;"></span></div>');
					} else {
						_this.after('<div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_2+'; width:100%; height:100%; margin-left:0; margin-top:0;"></span></div>');
					}
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					if(gradient_setting[0]) {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+gradient_setting[1]+'), to('+gradient_setting[2]+')); background: -webkit-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -moz-linear-gradient(left, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -ms-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); background: -o-linear-gradient(top, '+gradient_setting[1]+', '+gradient_setting[2]+'); width:100%; height:100%; margin-left:0; margin-top:0;"></span></div></div>');
					} else {
						_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_1+'; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; background-color:'+color_option_2+'; width:100%; height:100%; margin-left:0; margin-top:0;"></span></div></div>');
					}
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 100;
				var j = 0;
				var k = 0;
				function ls_effect() {
					if(gradient_setting[0]) {
						_this.find('.ls_main').css({'transform':'rotate('+k+'deg)', '-moz-transform':'rotate('+k+'deg)', '-o-transform':'rotate('+k+'deg)', '-ms-transform':'rotate('+k+'deg)', '-webkit-transform':'rotate('+k+'deg)'});
						k = k + gradient_setting[3];
					}
					if(reverse_animation) {
						_this.find('.ls_inner').css({'height':''+j+'%', 'width':''+j+'%', 'margin-left':''+i/2+'%', 'margin-top':''+i/2+'%'});
					} else {
						_this.find('.ls_inner').css({'height':''+i+'%', 'width':''+i+'%', 'margin-left':''+j/2+'%', 'margin-top':''+j/2+'%'});
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i--;
					j++;
					if(i==0) i = 100;
					if(j==100) j = 0;
				}
				var l = 100;
				var m = 0;
				var n = 0;
				function ls_effect_af() {
					if(gradient_setting[0]) {
						_this.next('.ls_main').css({'transform':'rotate('+n+'deg)', '-moz-transform':'rotate('+n+'deg)', '-o-transform':'rotate('+n+'deg)', '-ms-transform':'rotate('+n+'deg)', '-webkit-transform':'rotate('+n+'deg)'});
						n = n + gradient_setting[3];
					}
					if(reverse_animation) {
						_this.next('.ls_main').find('.ls_inner').css({'height':''+m+'%', 'width':''+m+'%', 'margin-left':''+l/2+'%', 'margin-top':''+l/2+'%'});
					} else {
						_this.next('.ls_main').find('.ls_inner').css({'height':''+l+'%', 'width':''+l+'%', 'margin-left':''+m/2+'%', 'margin-top':''+m/2+'%'});
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					l--;
					m++;
					if(l==0) l = 100;
					if(m==100) m = 0;
				}
			});
		},
		method_8 : function(options) {
			var defaults = {
				'color_option_1':'#333',
				'color_option_2':'#fff',
				'main_width':30,
				'animation_speed':200,
				'additional_style': '',
				'circle_shape':false,
				'animation_effect':'',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_width_third = main_width / 3;
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var circle_shape = defaults['circle_shape'];
				var animation_effect = defaults['animation_effect'];
				var after_element = defaults['after_element'];
				var box_radius = 0;
				if(circle_shape) box_radius = 80;
				if(after_element) {
					if(animation_effect == 'rotate') {
					_this.after('<div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div>');
					} else {
						_this.after('<div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div>');
					}
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					if(animation_effect == 'rotate') {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div></div>');
					} else {
						_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:'+box_radius+'px; -moz-border-radius:'+box_radius+'px; -webkit-border-radius:'+box_radius+'px; margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div></div>');
					}
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					if(animation_effect == 'rotate') {
						_this.find('.ls_main').css({'transform':'rotate('+i+'deg)', '-moz-transform':'rotate('+i+'deg)', '-o-transform':'rotate('+i+'deg)', '-ms-transform':'rotate('+i+'deg)', '-webkit-transform':'rotate('+i+'deg)'});
					} else {
						if(i%2 == 0) {
							if(animation_effect == 'round') {
								_this.find('.ls_inner').eq(0).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(1).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(2).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(3).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(5).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(6).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(7).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(8).css({'background-color':color_option_1});
							} else if(animation_effect == 'cross') {
								_this.find('.ls_inner').eq(4).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(0).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(2).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(6).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(8).css({'background-color':color_option_1});
							} else  {
								_this.find('.ls_inner:even').css({'background-color':color_option_1});
								_this.find('.ls_inner:odd').css({'background-color':color_option_2});
							}
						} else {
							if(animation_effect == 'round') {
								_this.find('.ls_inner').eq(0).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(1).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(2).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(3).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(5).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(6).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(7).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(8).css({'background-color':color_option_2});
							} else if(animation_effect == 'cross') {
								_this.find('.ls_inner').eq(4).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(0).css({'background-color':color_option_2});
								_this.find('.ls_inner').eq(2).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(6).css({'background-color':color_option_1});
								_this.find('.ls_inner').eq(8).css({'background-color':color_option_2});
							} else {
								_this.find('.ls_inner:odd').css({'background-color':color_option_1});
								_this.find('.ls_inner:even').css({'background-color':color_option_2});
							}
						}
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i++;
				}
				var j = 0;
				function ls_effect_af() {
					if(animation_effect == 'rotate') {
						_this.next('.ls_main').css({'transform':'rotate('+j+'deg)', '-moz-transform':'rotate('+j+'deg)', '-o-transform':'rotate('+j+'deg)', '-ms-transform':'rotate('+j+'deg)', '-webkit-transform':'rotate('+j+'deg)'});
					} else {
						if(j%2 == 0) {
							if(animation_effect == 'round') {
								_this.next('.ls_main').find('.ls_inner').eq(0).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(1).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(2).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(3).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(5).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(6).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(7).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(8).css({'background-color':color_option_1});
							} else if(animation_effect == 'cross') {
								_this.next('.ls_main').find('.ls_inner').eq(4).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(0).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(2).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(6).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(8).css({'background-color':color_option_1});
							} else  {
								_this.next('.ls_main').find('.ls_inner:even').css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner:odd').css({'background-color':color_option_2});
							}
						} else {
							if(animation_effect == 'round') {
								_this.next('.ls_main').find('.ls_inner').eq(0).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(1).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(2).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(3).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(5).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(6).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(7).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(8).css({'background-color':color_option_2});
							} else if(animation_effect == 'cross') {
								_this.next('.ls_main').find('.ls_inner').eq(4).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(0).css({'background-color':color_option_2});
								_this.next('.ls_main').find('.ls_inner').eq(2).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(6).css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner').eq(8).css({'background-color':color_option_2});
							} else {
								_this.next('.ls_main').find('.ls_inner:odd').css({'background-color':color_option_1});
								_this.next('.ls_main').find('.ls_inner:even').css({'background-color':color_option_2});
							}
						}
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j++;
				}

			});
		},
		method_9 : function(options) {
			var defaults = {
				'color_option_1':'#333',
				'color_option_2':'#ddd',
				'main_width':25,
				'animation_speed':5,
				'additional_style': '',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var main_width = defaults['main_width'];
				var main_width_half = main_width / 2;
				var main_width_third = main_width / 3;
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);		
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_2+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option_1+'; width:'+main_width_third+'px; height:'+main_width_third+'px;"></span></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					_this.find('.ls_main').css({'transform':'rotate('+i+'deg)', '-moz-transform':'rotate('+i+'deg)', '-o-transform':'rotate('+i+'deg)', '-ms-transform':'rotate('+i+'deg)', '-webkit-transform':'rotate('+i+'deg)'});
					time_duration = setTimeout(ls_effect, animation_speed);
					i = i + 2;
				}
				var j = 0;
				function ls_effect_af() {
					_this.next('.ls_main').css({'transform':'rotate('+j+'deg)', '-moz-transform':'rotate('+j+'deg)', '-o-transform':'rotate('+j+'deg)', '-ms-transform':'rotate('+j+'deg)', '-webkit-transform':'rotate('+j+'deg)'});
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j = j + 2;
				}
			});
		},
		method_10 : function(options) {
			var defaults = {
				'color_option':['#eee', '#333', '#eee', '#333'],
				'main_width':25,
				'animation_speed':1,
				'additional_style': '',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option = defaults['color_option'];
				var main_width = defaults['main_width'];
				var main_width_half = main_width / 2;
				var main_width_third = main_width / 3;
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[0]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[1]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[2]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[3]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[0]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[1]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[2]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span><span class="ls_inner" style="display:block; float:left; background-color:'+color_option[3]+'; width:'+main_width_half+'px; height:'+main_width_half+'px;"></span></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					_this.find('.ls_main').css({'transform':'rotate('+i+'deg)', '-moz-transform':'rotate('+i+'deg)', '-o-transform':'rotate('+i+'deg)', '-ms-transform':'rotate('+i+'deg)', '-webkit-transform':'rotate('+i+'deg)'});
					time_duration = setTimeout(ls_effect, animation_speed);
					i = i + 2;
				}
				var j = 0;
				function ls_effect_af() {
					_this.next('.ls_main').css({'transform':'rotate('+j+'deg)', '-moz-transform':'rotate('+j+'deg)', '-o-transform':'rotate('+j+'deg)', '-ms-transform':'rotate('+j+'deg)', '-webkit-transform':'rotate('+j+'deg)'});
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j = j - 2;
				}
			});
		},
		method_11 : function(options) {
			var defaults = {
				'color_option_1':'#aaa',
				'color_option_2':'#333',
				'color_option_3':'#fff',
				'main_width':30,
				'animation_speed':1,
				'additional_style': '',
				'animation_effect':'option_1',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var color_option_1 = defaults['color_option_1'];
				var color_option_2 = defaults['color_option_2'];
				var color_option_3 = defaults['color_option_3'];
				var main_width = defaults['main_width'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var animation_effect = defaults['animation_effect'];
				var after_element = defaults['after_element'];
				var span_width = main_width/1.7;
				if(after_element) {
					if(animation_effect == 'option_1') {
						_this.after('<div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_load_span" style="display:block; margin:auto; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background-color:'+color_option_3+'; width:'+span_width+'px; height:'+span_width+'px;"></span></div>');
					} else if(animation_effect == 'option_2') {
						_this.after('<div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_load_span" style="display:block; margin:15% 0 0 15%; border-radius:80px; background-color:'+color_option_3+'; width:70%; height:70%;"></span></div>');
					} else if(animation_effect == 'option_3') {
						_this.after('<div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background-color:'+color_option_3+'; width:100%; height:100%; margin-left:0; margin-top:0;"></span></div>');
					}
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					if(animation_effect == 'option_1') {
						_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_load_span" style="display:block; margin:auto; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background-color:'+color_option_3+'; width:'+span_width+'px; height:'+span_width+'px;"></span></div></div>');
					} else if(animation_effect == 'option_2') {
						_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; vertical-align:center; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_load_span" style="display:block; margin:15% 0 0 15%; border-radius:80px; background-color:'+color_option_3+'; width:70%; height:70%;"></span></div></div>');
					} else if(animation_effect == 'option_3') {
						_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background: -webkit-gradient(linear, 0% 0%, 0% 100%, from('+color_option_1+'), to('+color_option_2+')); background: -webkit-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -moz-linear-gradient(left, '+color_option_1+', '+color_option_2+'); background: -ms-linear-gradient(top, '+color_option_1+', '+color_option_2+'); background: -o-linear-gradient(top, '+color_option_1+', '+color_option_2+'); margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; '+additional_style+'"><span class="ls_inner" style="display:block; border-radius:80px; -moz-border-radius:80px; -webkit-border-radius:80px; background-color:'+color_option_3+'; width:100%; height:100%; margin-left:0; margin-top:0;"></span></div></div>');
					}
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				var k = 100;
				function ls_effect() {
					if(animation_effect == 'option_3') {
						_this.find('.ls_main').css({'transform':'rotate('+k+'deg)', '-moz-transform':'rotate('+k+'deg)', '-o-transform':'rotate('+k+'deg)', '-ms-transform':'rotate('+k+'deg)', '-webkit-transform':'rotate('+k+'deg)'});
						_this.find('.ls_inner').css({'height':''+k+'%', 'width':''+k+'%'});
					} else {
						_this.find('.ls_main').css({'transform':'rotate('+i+'deg)', '-moz-transform':'rotate('+i+'deg)', '-o-transform':'rotate('+i+'deg)', '-ms-transform':'rotate('+i+'deg)', '-webkit-transform':'rotate('+i+'deg)'});
					}
					time_duration = setTimeout(ls_effect, animation_speed);
					i = i + 5;
					k = k - 5;
					if(k==0) k = 100;
				}
				var l = 0;
				var m = 100;
				function ls_effect_af() {
					if(animation_effect == 'option_3') {
						_this.next('.ls_main').css({'transform':'rotate('+m+'deg)', '-moz-transform':'rotate('+m+'deg)', '-o-transform':'rotate('+m+'deg)', '-ms-transform':'rotate('+m+'deg)', '-webkit-transform':'rotate('+m+'deg)'});
						_this.next('.ls_main').find('.ls_inner').css({'height':''+m+'%', 'width':''+m+'%'});
					} else {
						_this.next('.ls_main').css({'transform':'rotate('+l+'deg)', '-moz-transform':'rotate('+l+'deg)', '-o-transform':'rotate('+l+'deg)', '-ms-transform':'rotate('+l+'deg)', '-webkit-transform':'rotate('+l+'deg)'});
					}
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					l = l + 5;
					m = m - 5;
					if(m==0) m = 100;
				}
			});
		},
		method_12 : function(options) {
			var defaults = {
				'background_image':'img/loading.png',
				'main_width':32,
				'animation_speed':1,
				'additional_style': '',
				'after_element':false
			};
			return this.each(function() {
				if(options) $.extend(defaults, options);
				var _this = $(this);
				var background_color = defaults['background_color'];
				var background_image = defaults['background_image'];
				var main_width = defaults['main_width'];
				var animation_speed = defaults['animation_speed'];
				var additional_style = defaults['additional_style'];
				var after_element = defaults['after_element'];
				var span_width = main_width/1.7;
				if(after_element) {
					_this.after('<div class="ls_main" style="overflow:hidden; width:'+main_width+'px; height:'+main_width+'px; background-image:url('+background_image+'); background-repeat:no-repeat; background-position:center center; '+additional_style+'"></div>');
					var time_duration_af = setTimeout(ls_effect_af, animation_speed);
				} else {
					_this.prepend('<div class="ls_outer" style="position:absolute; z-index:99999; width:'+_this.width()+'px; height:'+_this.height()+'px;"><div class="ls_main" style="overflow:hidden; margin-left:auto; margin-right:auto; width:'+main_width+'px; height:'+main_width+'px; background-image:url('+background_image+'); background-repeat:no-repeat; background-position:center center; '+additional_style+'"></div></div>');
					_this.find('.ls_main').css({'margin-top':(_this.find('.ls_outer').height() - _this.find('.ls_main').outerHeight()) / 2});
					var time_duration = setTimeout(ls_effect, animation_speed);
				}
				var i = 0;
				function ls_effect() {
					_this.find('.ls_main').css({'transform':'rotate('+i+'deg)', '-moz-transform':'rotate('+i+'deg)', '-o-transform':'rotate('+i+'deg)', '-ms-transform':'rotate('+i+'deg)', '-webkit-transform':'rotate('+i+'deg)'});
					time_duration = setTimeout(ls_effect, animation_speed);
					i = i + 5;
				}
				var j = 0;
				function ls_effect_af() {
					_this.next('.ls_main').css({'transform':'rotate('+j+'deg)', '-moz-transform':'rotate('+j+'deg)', '-o-transform':'rotate('+j+'deg)', '-ms-transform':'rotate('+j+'deg)', '-webkit-transform':'rotate('+j+'deg)'});
					time_duration_af = setTimeout(ls_effect_af, animation_speed);
					j = j + 5;
				}
			});
		},
	};
	$.fn.LoadingScript = function(method) {
		if ( methods[method] ) {
			return methods[method].apply( this, Array.prototype.slice.call( arguments, 1 ));
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Method ' +  method + ' does not exist on jQuery.LoadingScript' );
		}    
	};
})(jQuery);