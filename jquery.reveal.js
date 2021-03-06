/*
 * Copyright (c) 2008-2009 Olle Törnström studiomediatech.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

/**
 * Simple hCard viewer. Listens for click events on the bound element and
 * reveals either all hCards found as children of the bound element or all
 * hCards on the page, if no cards are found on the element.
 *
 * Assume for example there's an element <ul class="vCards"> with hCards.
 *
 * $('.vCards').Reveal();
 * 
 * Means that a click on any element in the list would reveal all the cards in 
 * the list with next/previous links in the card viewer.
 *
 * Or simply:
 *
 * $('button').Reveal();
 *
 * Reveals all cards on the page with next/previous links.
 *
 * Or if perhaps <div id="me"> is a single hCard.
 *
 * $('#me').Reveal();
 *
 * Will then reveal only the single card without any navigation showing.
 * 
 * @author Olle Törnström olle[at]studiomediatech[dot]com
 * @since 2008-11-25
 * @version 1.0.0-ALPHA
 */
;(function($) {

	var options = {
		overlay : {},
		hcard : {}
	};
	
	$.fn.Reveal = function(settings) {

		var finals = {
			overlay : {
			},
			hcard : {
			}
		};
		
		$.fn.Reveal.setup(finals, $.fn.Reveal.defaults, settings);
		$.fn.Reveal.init();
		
		return this.each(function() {
			$(this).click(function(event) {
				event.preventDefault();
				$(this).Reveal.execute(this);
			});
		});
	};

	/**
	 * Public default and overridable options.
	 */
	$.fn.Reveal.defaults = {
		overlay : {
			id : 'overlay',
			top : 0,
			left : 0,
			margin : 0,
			padding : 0,
			width : '100%',
			'background-color' : '#210',
			opacity : '.9',
			'z-index' : 99
		},
		hcard : {
			id : 'reveal',
			position : 'absolute',
			width : 400,
			height : 250,
			'background-color' : '#333',
			'border-style' : 'solid',
			'border-color' : '#777',
			'border-width' : '12px',
			'z-index' : 100,
			addStyle : true,
			nextCardTitle : 'Next',
			previousCardTitle : 'Previous'
		}
	};

	$.fn.Reveal.setup = function(finals, defaults, settings) {
		for (n in options) {
			if (typeof options[n] === 'object') {
				options[n] = $.extend({}, finals[n] || {}, defaults[n] || {}, (settings || {})[n] || {});
			}
		}
	};		
	
	$.fn.Reveal.init = function() {
		$('#' + options.overlay.id).remove();
		$('#' + options.hcard.id).remove();		
		$('body').append('<div id="' + options.overlay.id + '"></div>' +
				'<div id="' + options.hcard.id + '"><div class="content"></div>' +
				'<div class="navigation">' +
				'<a href="#" class="previous" title="' + options.hcard.previousCardTitle + '">' + options.hcard.previousCardTitle + '</a>' +
				'<a href="#" class="next" title="' + options.hcard.nextCardTitle + '">' + options.hcard.nextCardTitle + '</a>' +
				'</div></div>');
		$('#' + options.overlay.id).click(function() { 
			$.fn.Reveal.cancel();
		}).hide();
		$('#' + options.hcard.id).hide();
		$('#' + options.hcard.id + ' .navigation .next').click(function(event) {
			event.preventDefault();
			$.fn.Reveal.transition(options.hcard.currentCard + 1);
			return false;
		}).hide();
		$('#' + options.hcard.id + ' .navigation .previous').click(function(event) {
			event.preventDefault();
			$.fn.Reveal.transition(options.hcard.currentCard - 1);
			return false;
		}).hide();
		$(window).resize(function() {
			$.fn.Reveal.resize();
		});
		$(window).scroll(function() {
			$.fn.Reveal.adjust();
		});
		if (options.hcard.addStyle) {
			$('head').append('' +
'<style type="text/css" media="all">\n' +
'#' + options.hcard.id + ' .content { margin: 0; padding: 0; }\n' +
'#' + options.hcard.id + ' .navigation { margin: 0; padding: 0; }\n' +
'#' + options.hcard.id + ' .vcard { margin: 10px; padding: 0; font-size: 11px; background: #333; color: #ccc; }\n' +
'#' + options.hcard.id + ' .vcard { padding: 0px; }\n' +
'#' + options.hcard.id + ' .vcard a { text-decoration: none; color: #ccc; }\n' +
'#' + options.hcard.id + ' a.fn,\n' +
'#' + options.hcard.id + ' a.n { font: italic 40px/100% baskerville, times, serif; color: #eee; letter-spacing: .02em; margin: 0 0 10px; }\n' +
'#' + options.hcard.id + ' .org { font-size: 22px; color: #aaa; margin: 10px 0 0 0; }\n' +
'#' + options.hcard.id + ' a.email { font-size: 15px; color: #ddd; display: block; margin: 10px 0 10px; }\n' +
'#' + options.hcard.id + ' .adr { float: right; font: normal normal 11px/120% arial, sans-serif; color: #aaa; margin: 0 0 0; width: 35%; }\n' +
'#' + options.hcard.id + ' .adr span.country-name { display: block; text-transform: upper; margin: 0 0 5px; }\n' +
'#' + options.hcard.id + ' .tel { font: normal normal 14px/100% baskerville, times, serif; color: #ddd; margin: 0 0 10px; }\n' +
'#' + options.hcard.id + ' .navigation { font: normal normal 11px/100% arial, veradna, sans-serif; display: block; position: absolute; bottom: 0; height: 20px; width: 100%; background: #7e7e7e; padding: 5px 0 0; text-align: center; }\n' +
'#' + options.hcard.id + ' .navigation a { color: #ccc; text-decoration: none; position: relative; top: 3px; margin: 0 5px; }\n' +
'</style>');
		}
	};
	
	$.fn.Reveal.execute = function(rootElement) {
		var cards = [];
		var cardNumber = 0;
		if ($(rootElement).hasClass('vcard')) {
			cards.push(rootElement);
		} else if ($('.vcard', rootElement).length > 0) {
			$('.vcard', rootElement).each(function(i, element) {
				cards.push(element);
			});	
		} else if ($('.vcard').length > 0) {
			$('.vcard').each(function(i, element) {
				cards.push(element);
			});
		}
		options.hcard.cards = cards;
		$('select, embed, object').hide();
		$('#' + options.hcard.id + ' .navigation').hide();

		options.overlay.top = $(window).scrollTop();
		options.overlay.left = $(window).scrollLeft();
		options.hcard.top = options.overlay.top + (($(window).height() / 2) - (options.hcard.height / 2));
		options.hcard.left = options.overlay.left + (($(window).width() / 2) - (options.hcard.width / 2));
		
		$('#' + options.overlay.id).css({
			position : 'absolute',
			top : options.overlay.top,
			left : options.overlay.left,
			'z-index' : options.overlay['z-index'],
			width : options.overlay.width,
			height : $(window).height() + 'px',
			margin : options.overlay.margin,
			padding : options.overlay.padding,
			'background-color' : options.overlay['background-color'],
			'-moz-opacity' : options.overlay.opacity,
			opacity : options.overlay.opacity,
			filter : 'alpha(opacity=' + Math.round(options.overlay.opacity * 100) + ')'
		}).fadeIn(function() {
			$('#' + options.hcard.id).css({
				position : options.hcard.position,
				left : options.hcard.left + 'px',
				top : options.hcard.top + 'px',
				'z-index' : options.hcard['z-index'],
				width : options.hcard.width + 'px',
				height : options.hcard.height + 'px',			
				'background-color' : options.hcard['background-color'],
				'border-style' : options.hcard['border-style'],
				'border-color' : options.hcard['border-color'],
				'border-width' : options.hcard['border-width']		
			}).fadeIn(function() {
				$.fn.Reveal.transition(cardNumber);							
			});		
		});
	};
	
	$.fn.Reveal.transition = function(cardNumber) {
		$('#' + options.hcard.id + ' .navigation').hide();
		$('#' + options.hcard.id + ' .navigation .previous').hide();
		$('#' + options.hcard.id + ' .navigation .next').hide();		
		options.hcard.currentCard = cardNumber;		
		var card = $(options.hcard.cards[cardNumber]).clone().removeAttr('id').hide();
		$('#' + options.hcard.id + ' .content').empty().append(card);
		card.fadeIn();
		if (options.hcard.cards.length > 1) {
			if (cardNumber - 1 >= 0)
				$('#' + options.hcard.id + ' .navigation .previous').show();
			if (cardNumber + 1 <= options.hcard.cards.length - 1)
				$('#' + options.hcard.id + ' .navigation .next').show();				
			$('#' + options.hcard.id + ' .navigation').show();
		}
	};
	
	$.fn.Reveal.cancel = function() {
		$('#' + options.hcard.id).hide();
		$('#' + options.hcard.id + ' .content').empty();
		$('#' + options.overlay.id).fadeOut();
	};
	
	$.fn.Reveal.resize = function() {
		$('#' + options.overlay.id).width($(window).width()).height($(window).height());			
		var newLeft = (($(window).width() / 2) - (options.hcard.width / 2)) + 'px';
		var newTop = (($(window).height() / 2) - (options.hcard.height / 2)) + 'px';
		$('#' + options.hcard.id).animate({left : newLeft, top : newTop}, {queue : false, duration : 300});
	};
	
	$.fn.Reveal.adjust = function() {
		options.overlay.top = $(window).scrollTop();
		options.overlay.left = $(window).scrollLeft();
		var newTop = (options.overlay.top + (($(window).height() / 2) - (options.hcard.height / 2))) + 'px';
		var newLeft = (options.overlay.left + (($(window).width() / 2) - (options.hcard.width / 2))) + 'px';
		$('#' + options.overlay.id).animate({top : options.overlay.top + 'px',left : options.overlay.left + 'px'}, {queue : false, duration : 100});
		$('#' + options.hcard.id).animate({left : newLeft, top : newTop}, {queue : false, duration : 400});
	};

})(jQuery);
