jQuery(function($) {
	"use strict";

	/**
	 * Object that sends ajax request for server status and show/hide warning messages.
	 *
	 * @type {Object}
	 */
	var checker = {
		timeout: 10000,
		warning: false,

		/**
		 * Sends ajax request to get Zabbix server availability and message to show if server is not available.
		 *
		 * @param nocache add 'nocache' parameter to get result not from cache
		 */
		check: function(nocache) {
			var params = nocache ? {nocache: true} : {};

			new RPC.Call({
				'method': 'zabbix.status',
				'params': params,
				'onSuccess': $.proxy(this.onSuccess, this)
			});
		},

		onSuccess: function(result) {
			if (result.result) {
				this.hideWarning()
			}
			else {
				this.showWarning(result.message);
			}
		},

		showWarning: function(message) {
			if (!this.warning) {
				$('#message-global').text(message);
				$('#message-global-wrap').show();
				this.warning = true;
			}
		},

		hideWarning: function() {
			if (this.warning) {
				$('#message-global-wrap').hide();
				this.warning = false;
			}
		}
	};

	// looping function that check for server status every 10 seconds
	function checkStatus(nocache) {
		checker.check(nocache);

		window.setTimeout(checkStatus, checker.timeout);
	}

	// start server status checks with 5 sec dealy after page is loaded
	window.setTimeout(function() {
		checkStatus(true);
	}, 5000);


	// event that hide warning message when mouse hover it
	$('#message-global-wrap').on('mouseenter', function() {
		var obj = $(this),
			offset = obj.offset(),
			x1 = offset.left,
			x2 = x1 + obj.outerWidth(),
			y1 = offset.top,
			y2 = y1 + obj.outerHeight();

		obj.hide();

		$(document).on('mousemove.messagehide', function(e) {
			if (e.pageX < x1 || e.pageX > x2 || e.pageY < y1 || e.pageY > y2) {
				obj.show();
				$(document).off('mousemove.messagehide');
				$(document).off('mouseleave.messagehide');
			}
		});
		$(document).on('mouseleave.messagehide', function() {
			obj.show();
			$(document).off('mouseleave.messagehide');
			$(document).off('mousemove.messagehide');
		});
	});
});

