;(function ($, jsPlumb, undefined) {
	
	var version = '2.0.13';
	
	var defaults = {
		grid: {x: 10, y: 10},
		autosaveInterval: 30000,
		placeholders: {
			repositoryContainer: '<div class="no-results">No results found.</div>'
		}
	}
	
	ConversationEditor = function () {	
		$.extend(this, defaults, {});
		
		this.data = {};
		this.ui = {};
		this.intervalId = 0;
	};
	
	ConversationEditor.version = function () { return version; }
	
	ConversationEditor.prototype.initialize = function () {		
		this.initializeInterface();
		
		this.intervalId = setInterval($.proxy(this.save, this), this.autosaveInterval);
	};
	
	ConversationEditor.prototype.initializeInterface = function () {
		this.ui.repository = $('#repository');
		this.ui.stfChooser = $('.stfChooser', this.ui.repository).on('keyup', $.proxy(this.onStfChooserKeyUp, this));
		this.ui.stfSearch  = $('.searchStf', this.ui.repository).on('click', $.proxy(this.onStfSearchButtonClicked, this));
		this.ui.stfResults = $('#stfChooserResults')
			.offset({left: this.ui.stfChooser.offset().left, top: this.ui.stfChooser.offset().top + this.ui.stfChooser.outerHeight(true)})
			.on('click', 'a', $.proxy(this.onStfChooserResultClicked, this));
		this.ui.stfContainer = $('.container', this.ui.repository).html(this.placeholders.repositoryContainer);
		this.ui.canvas = $('#canvas');
		this.ui.progressSavedMessage = $('#saved-progress').disableSelection();
		
		this.ui.saveProgressButton = $('#save-progress-button').on('click', $.proxy(this.onSaveProgressButtonClicked, this));
		this.ui.moveAllToCanvasButton = $('#move-all-to-canvas-button').on('click', $.proxy(this.onMoveAllToCanvasButtonClicked, this));
		this.ui.resetCanvasButton = $('#reset-canvas-button').on('click', $.proxy(this.onResetCanvasButtonClicked, this));
		this.ui.clearAllConnectionsButton = $('#clear-all-connections-button').on('click', $.proxy(this.onClearAllConnectionsButtonClicked, this));
		this.ui.generateScriptButton = $('#generate-script-button').on('click', $.proxy(this.onGenerateScriptButtonClicked, this));
		this.ui.settingsButton = $('#settings-button').on('click', $.proxy(this.onSettingsButtonClicked, this));
		this.ui.aboutButton = $('#about-button').on('click', $.proxy(this.onAboutButtonClicked, this));
	};
	
	ConversationEditor.prototype.save = function () {
		this.ui.progressSavedMessage.stop(false, true).show().fadeOut(3000);
	};
	
	ConversationEditor.prototype.populateRepository = function (data) {
		var html = '';
		
		for (var key in data.entries) {
			var entry = data.entries[key];
			
			html += '<div class="stf-entry" data-stf="' + key + '">' + entry + '</div>';
		}
		
		this.ui.stfContainer.html(html);
	};
	
	/**
	 * Event handlers for the StfChooser
	 */
	ConversationEditor.prototype.onStfChooserKeyUp = function (e) {
		var str = this.ui.stfChooser.text();
		
		this.ui.stfResults.empty();
		
		if (str.length > 3) {
			for (var i = 0; i < stfFiles.length; i++) {
				var stf = stfFiles[i];
				
				if (stf.indexOf(str) === 0)
					this.ui.stfResults.append('<a href="javascript:void(0)">' + stf + '</a>');
			}
		}
		
		if (this.ui.stfResults.children().length > 0) {
			this.ui.stfResults.show();
		} else {
			this.ui.stfResults.hide();
		}
	};
	
	ConversationEditor.prototype.onStfChooserResultClicked = function (e) {
		this.ui.stfChooser.text($(e.target).text());
		this.ui.stfResults.hide().empty();
	};
	
	ConversationEditor.prototype.onStfSearchButtonClicked = function (e) {
		this.ui.stfContainer.empty().html('<span class="icon-spinner" style="display: inline-block"></span> Loading ...');

		var t = this;
		var deg = 0;
		var id = setInterval(function () { deg+=10; if (deg > 360) deg = 0; $('.icon-spinner', t.ui.stfContainer).css('transform', 'rotate(' + deg + 'deg)'); }, 10);

		
		$.getJSON('stf/' + this.ui.stfChooser.text() + '.json')
			.always(function () {
				clearInterval(id);
				t.ui.stfContainer.empty();
			})
			.done(function (data) {
				t.populateRepository(data);
			})
			.fail(function () {
				t.ui.stfContainer.html(t.placeholders.repositoryContainer);
			});
	};
	
	/**
	 * Click handlers for menu bar buttons.
	 */
	ConversationEditor.prototype.onSaveProgressButtonClicked = function (e) {
		this.save();
	};
	
	ConversationEditor.prototype.onMoveAllToCanvasButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onResetCanvasButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onClearAllConnectionsButtonClicked = function (e) {
	};

	ConversationEditor.prototype.onGenerateScriptButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onSettingsButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onAboutButtonClicked = function (e) {
	};
	
})(jQuery, jsPlumb.getInstance(), undefined);