/* http://keith-wood.name/maxlength.html
   Textarea Max Length for jQuery v1.0.0.
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
		showFeedback: true, // True to show user feedback
		feedbackText: '{r} characters remaining ({m} maximum)'
			// Display text for feedback message, use {r} for remaining characters,
			// {c} for characters entered, {m} for maximum
	};
}

$.extend(MaxLength.prototype, {
	/* Class name added to elements to indicate already configured with max length. */
	markerClassName: 'hasMaxLength',

	/* Class name for the feedback section. */
	_feedbackClass: 'maxlength-feedback',

	/* Override the default settings for all max length instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (MaxLength) this object */
	setDefaults: function(settings) {
		$.extend(this._defaults, settings || {});
		return this;
	},

	/* Attach the max length functionality to a textarea.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the custom options for this instance */
	_attachMaxLength: function(target, settings) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName).
			bind('keypress.maxlength', function(event) {
				var ch = String.fromCharCode(
					event.charCode == undefined ? event.keyCode : event.charCode);
				return (ch == '\u0000' || $(this).val().length < inst.settings.max);
			}).
			bind('keyup.maxlength', function() { $.maxlength._checkLength($(this)); });
		var inst = {settings: $.extend({}, this._defaults)};
		$.data(target[0], PROP_NAME, inst);
		this._changeMaxLength(target, settings);
	},

	/* Reconfigure the settings for a max length control.
	   @param  target    (element) the control to affect
	   @param  settings  (object) the new options for this instance or
	                     (string) an individual property name
	   @param  value     (any) the individual property value (omit if settings is an object) */
	_changeMaxLength: function(target, settings, value) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		settings = settings || {};
		if (typeof settings == 'string') {
			var name = settings;
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(target[0], PROP_NAME);
		$.extend(inst.settings, settings);
		var rem = target.nextAll('.' + this._feedbackClass);
		if (inst.settings.showFeedback && rem.length == 0) {
			target.after('<span class="' + this._feedbackClass + '"></span>');
		}
		if (!inst.settings.showFeedback && rem.length > 0) {
			rem.remove();
		}
		this._checkLength(target);
	},

	/* Check the length of the text and notify accordingly.
	   @param  textarea  (jQuery) the control to check */
	_checkLength: function(textarea) {
		var inst = $.data(textarea[0], PROP_NAME);
		var value = textarea.val();
		if (value.length > inst.settings.max) {
			value = value.substring(0, inst.settings.max);
			textarea.val(value);
		}
		if (inst.settings.showFeedback) {
			textarea.nextAll('.' + this._feedbackClass).
				text(inst.settings.feedbackText.replace(/\{c\}/, value.length).
					replace(/\{m\}/, inst.settings.max).
					replace(/\{r\}/, inst.settings.max - value.length));
		}
	},

	/* Remove the max length functionality from a control.
	   @param  target  (element) the control to affect */
	_destroyMaxLength: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).
			unbind('.maxlength').
			nextAll('.' + this._feedbackClass).remove();
		$.removeData(target[0], PROP_NAME);
	}
});

/* Attach the max length functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.maxlength = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	return this.each(function() {
		if (typeof options == 'string') {
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
