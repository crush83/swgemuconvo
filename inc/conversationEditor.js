;(function ($, jsPlumb, undefined) {
	
	var version = '2.0.13';
	
	var defaults = {
		grid: {x: 10, y: 10},
		autosaveInterval: 60000
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
		
		this.intervalId = setInterval(this.save, this.autosaveInterval);
	};
	
	ConversationEditor.prototype.initializeInterface = function () {
		this.ui.repository = $('#repository');
		this.ui.stfChooser = $('.stfChooser', this.ui.repository).on('keyup', $.proxy(this.onStfChooserKeyUp, this));
		this.ui.stfSearch  = $('.searchStf', this.ui.repository).on('click', $.proxy(this.onStfSearchButtonClicked, this));
		this.ui.canvas = $('#canvas');
		
		this.ui.saveProgressButton = $('#save-progress-button').on('click', $.proxy(this.onSaveProgressButtonClicked, this));
		this.ui.moveAllToCanvasButton = $('#move-all-to-canvas-button').on('click', $.proxy(this.onMoveAllToCanvasButtonClicked, this));
		this.ui.resetCanvasButton = $('#reset-canvas-button').on('click', $.proxy(this.onResetCanvasButtonClicked, this));
		this.ui.clearAllConnectionsButton = $('#clear-all-connections-button').on('click', $.proxy(this.onClearAllConnectionsButtonClicked, this));
		this.ui.generateScriptButton = $('#generate-script-button').on('click', $.proxy(this.onGenerateScriptButtonClicked, this));
		this.ui.settingsButton = $('#settings-button').on('click', $.proxy(this.onSettingsButtonClicked, this));
		this.ui.aboutButton = $('#about-button').on('click', $.proxy(this.onAboutButtonClicked, this));
	};
	
	ConversationEditor.prototype.save = function () {
		console.log("Saving.");
	};
	
	/**
	 * Event handlers for the StfChooser
	 */
	ConversationEditor.prototype.onStfChooserKeyUp = function (e) {
		var str = this.ui.stfChooser.text();
		
		if (str.length < 3) return;
		
		for (var i = 0; i < stfFiles.length; i++) {
			var stf = stfFiles[i];
			
			if (stf.indexOf(str) === 0) {
				//Update the stf results window.
			}
		}
	};
	
	ConversationEditor.prototype.onStfSearchButtonClicked = function (e) {
		console.log("Clicked stf search.");
	};
	
	/**
	 * Click handlers for menu bar buttons.
	 */
	ConversationEditor.prototype.onSaveProgressButtonClicked = function (e) {
		console.log("Save progress.")
		this.save();
	};
	
	ConversationEditor.prototype.onMoveAllToCanvasButtonClicked = function (e) {
		console.log("Move all to canvas.");
	};
	
	ConversationEditor.prototype.onResetCanvasButtonClicked = function (e) {
		console.log("Reset canvas.");
	};
	
	ConversationEditor.prototype.onClearAllConnectionsButtonClicked = function (e) {
		console.log("Clear all connections.");
	};

	ConversationEditor.prototype.onGenerateScriptButtonClicked = function (e) {
		console.log("Generate script.");
	};
	
	ConversationEditor.prototype.onSettingsButtonClicked = function (e) {
		console.log("Settings.");
	};
	
	ConversationEditor.prototype.onAboutButtonClicked = function (e) {
		console.log("About.");
	};
	
})(jQuery, jsPlumb.getInstance(), undefined);