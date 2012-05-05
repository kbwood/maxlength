/* http://keith-wood.name/maxlength.html
   Textarea Max Length for jQuery v1.0.2.
   Written by Keith Wood (kwood{at}iinet.com.au) May 2009.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var PROP_NAME = 'maxlength';

/* Max length manager. */
function MaxLength() {
	this._defaults = {
		max: 200, // Maximum length
		truncate: true, // True to disallow further input, false to highlight only
		showFeedback: true, // True to always show user feedback, 'active' for hover/focus only
		feedbackTarget: null, // jQuery selector or function for element to fill with feedback
		feedbackText: '{r} characters remaining ({m} maximum)',
			// Display text for feedback message, use {r} for remaining characters,
			// {c} for characters entered, {m} for maximum
		overflowText: '{o} characters too many ({m} maximum)'
			// Display text when past maximum, use substitutions above
			// and {o} for characters past maximum
	};
}

$.extend(MaxLength.prototype, {
	/* Class name added to elements to indicate already configured with max length. */
	markerClassName: 'hasMaxLength',

	/* Class name for the feedback section. */
	_feedbackClass: 'maxlength-feedback',
	/* Class name for indicating the textarea is full. */
	_fullClass: 'maxlength-full',
	/* Class name for indicating the textarea is overflowing. */
	_overflowClass: 'maxlength-overflow',

	/* Override the default settings for all max length instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (MaxLength) this object */
	setDefaults: function(settings) {
		$.extend(this._defaults, settings || {});
		return this;
	},

	/* Attach the max length functionality to a textarea.
	   @param  textarea    (element) the control to affect
	   @param  settings  (object) the custom options for this instance */
	_attachMaxLength: function(textarea, settings) {
		textarea = $(textarea);
		if (textarea.hasClass(this.markerClassName)) {
			return;
		}
		textarea.addClass(this.markerClassName).
			bind('keypress.maxlength', function(event) {
				if (!inst.settings.truncate) {
					return true;
				}
				var ch = String.fromCharCode(
					event.charCode == undefined ? event.keyCode : event.charCode);
				return (event.ctrlKey || event.metaKey || ch == '\u0000' ||
					$(this).val().length < inst.settings.max);
			}).
			bind('keyup.maxlength', function() { $.maxlength._checkLength($(this)); });
		var inst = {settings: $.extend({}, this._defaults), feedbackTarget: $([])};
		$.data(textarea[0], PROP_NAME, inst);
		this._changeMaxLength(textarea, settings);
	},

	/* Reconfigure the settings for a max length control.
	   @param  textarea  (element) the control to affect
	   @param  settings  (object) the new options for this instance or
	                     (string) an individual property name
	   @param  value     (any) the individual property value (omit if settings is an object) */
	_changeMaxLength: function(textarea, settings, value) {
		textarea = $(textarea);
		if (!textarea.hasClass(this.markerClassName)) {
			return;
		}
		settings = settings || {};
		if (typeof settings == 'string') {
			var name = settings;
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(textarea[0], PROP_NAME);
		$.extend(inst.settings, settings);
		if (inst.feedbackTarget.length > 0) {
			if (inst.hadFeedbackTarget) {
				inst.feedbackTarget.empty().val('').
					removeClass(this._feedbackClass + ' ' + this._fullClass + ' ' + this._overflowClass);
			}
			else {
				inst.feedbackTarget.remove();
			}
			inst.feedbackTarget = $([]);
		}
		if (inst.settings.showFeedback) {
			inst.hadFeedbackTarget = !!inst.feedbackTarget;
			if ($.isFunction(inst.settings.feedbackTarget)) {
				inst.feedbackTarget = inst.settings.feedbackTarget.apply(textarea[0], []);
			}
			else if (inst.settings.feedbackTarget) {
				inst.feedbackTarget = $(inst.settings.feedbackTarget);
			}
			else {
				inst.feedbackTarget = $('<span></span>').insertAfter(textarea);
			}
			inst.feedbackTarget.addClass(this._feedbackClass);
		}
		textarea.unbind('mouseover.maxlength focus.maxlength mouseout.maxlength blur.maxlength');
		if (inst.settings.showFeedback == 'active') {
			textarea.bind('mouseover.maxlength', function() {
					inst.feedbackTarget.css('visibility', 'visible');
				}).bind('mouseout.maxlength', function() {
					if (!inst.focussed) {
						inst.feedbackTarget.css('visibility', 'hidden');
					}
				}).bind('focus.maxlength', function() {
					inst.focussed = true;
					inst.feedbackTarget.css('visibility', 'visible');
				}).bind('blur.maxlength', function() {
					inst.focussed = false;
					inst.feedbackTarget.css('visibility', 'hidden');
				});
			inst.feedbackTarget.css('visibility', 'hidden');
		}
		this._checkLength(textarea);
	},

	/* Check the length of the text and notify accordingly.
	   @param  textarea  (jQuery) the control to check */
	_checkLength: function(textarea) {
		var inst = $.data(textarea[0], PROP_NAME);
		var value = textarea.val();
		textarea.toggleClass(this._fullClass, value.length >= inst.settings.max).
			toggleClass(this._overflowClass, value.length > inst.settings.max);
		if (value.length > inst.settings.max && inst.settings.truncate) {
			value = value.substring(0, inst.settings.max);
			textarea.val(value);
		}
		var feedback = (value.length > inst.settings.max ?
			inst.settings.overflowText : inst.settings.feedbackText).
				replace(/\{c\}/, value.length).replace(/\{m\}/, inst.settings.max).
				replace(/\{r\}/, inst.settings.max - value.length).
				replace(/\{o\}/, value.length - inst.settings.max);
		inst.feedbackTarget.toggleClass(this._fullClass, value.length >= inst.settings.max).
			toggleClass(this._overflowClass, value.length > inst.settings.max).
			text(feedback).val(feedback);
	},

	/* Remove the max length functionality from a control.
	   @param  textarea  (element) the control to affect */
	_destroyMaxLength: function(textarea) {
		textarea = $(textarea);
		if (!textarea.hasClass(this.markerClassName)) {
			return;
		}
		var inst = $.data(textarea[0], PROP_NAME);
		if (inst.feedbackTarget.length > 0) {
			if (inst.hadFeedbackTarget) {
				inst.feedbackTarget.empty().val('').css('visibility', 'visible').
					removeClass(this._feedbackClass + ' ' + this._fullClass + ' ' + this._overflowClass);
			}
			else {
				inst.feedbackTarget.remove();
			}
		}
		textarea.removeClass(this.markerClassName).unbind('.maxlength');
		$.removeData(textarea[0], PROP_NAME);
	},

	/* Retrieve the current instance settings.
	   @param  textarea  (element) the control to check
	   @return  (object) the current instance settings */
	_settingsMaxLength: function(textarea) {
		var inst = $.data(textarea, PROP_NAME);
		return (inst || {}).settings;
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['settings'];

/* Attach the max length functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.maxlength = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if ($.inArray(options, getters) > -1) {
		return $.maxlength['_' + options + 'MaxLength'].
			apply($.maxlength, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!$.maxlength['_' + options + 'MaxLength']) {
				throw 'Unknown command: ' + options;
			}
			$.maxlength['_' + options + 'MaxLength'].
				apply($.maxlength, [this].concat(otherArgs));
		}
		else {
			$.maxlength._attachMaxLength(this, options || {});
		}
	});
};

/* Initialise the max length functionality. */
$.maxlength = new MaxLength(); // singleton instance

})(jQuery);
