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
	    
	    jsPlumb.importDefaults({
	        Container: this.ui.canvas,
	        Endpoint: ['Dot', {radius: 2}],
	        HoverPaintStyle: {strokeStyle: '#fff', lineWidth: 2},
	        PaintStyle: {strokeStyle: '#8bd', lineWidth: 2}
	    });
	    
		jsPlumb.bind('click', this.onConnectionClicked);
		jsPlumb.bind('connection', this.onConnectionCreated);
		
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
		this.ui.progressSavedMessage = $('#saved-progress').disableSelection();
		
		this.ui.saveProgressButton = $('#save-progress-button').on('click', $.proxy(this.onSaveProgressButtonClicked, this));
		this.ui.moveAllToCanvasButton = $('#move-all-to-canvas-button').on('click', $.proxy(this.onMoveAllToCanvasButtonClicked, this));
		this.ui.resetCanvasButton = $('#reset-canvas-button').on('click', $.proxy(this.onResetCanvasButtonClicked, this));
		this.ui.clearAllConnectionsButton = $('#clear-all-connections-button').on('click', $.proxy(this.onClearAllConnectionsButtonClicked, this));
		this.ui.generateScriptButton = $('#generate-script-button').on('click', $.proxy(this.onGenerateScriptButtonClicked, this));
		this.ui.settingsButton = $('#settings-button').on('click', $.proxy(this.onSettingsButtonClicked, this));
		this.ui.aboutButton = $('#about-button').on('click', $.proxy(this.onAboutButtonClicked, this));
		
		this.ui.canvas = $('#canvas')
		    .droppable({
		        drop: $.proxy(this.onDropObjectOnCanvas, this)
		    });
	};
	
	ConversationEditor.prototype.save = function () {
		this.ui.progressSavedMessage.stop(false, true).show().fadeOut(3000);
	};
	
	ConversationEditor.prototype.populateRepository = function (data) {
		for (var key in data.entries) {
			var entry = data.entries[key];
			
			var o = $('<div class="stf-entry">' + entry + '</div>')
			    .attr('data-stf', '@' + key)
			    .draggable({
			        revert: 'invalid',
			        appendTo: '#canvas',
			        scroll: false,
			        helper: 'clone'
			    })
			    .disableSelection();
			    
			this.ui.stfContainer.append(o);
		}
	};
	
	ConversationEditor.prototype.addObjectToCanvas = function (obj, position) {	    
	    position.left = Math.floor(position.left / this.grid.x) * this.grid.x;
        position.top = Math.floor(position.top / this.grid.y) * this.grid.y;
        
        var endPoint = $('<div class="end-point"></div>');
	    var closeButton = $('<div class="close-button">X</div>').on('click', this.onCloseButtonClicked);
        
	    obj
	        .appendTo(this.ui.canvas)
            .addClass('convo-dialog')
            .append(closeButton)
            .append(endPoint)
            .css('position', 'absolute')
            .css('left', position.left)
            .css('top', position.top);
	    
	    jsPlumb.draggable(obj);
	    
	    obj.draggable({
	        snap: '#canvas',
	        grid: [this.grid.x, this.grid.y],
	        scroll: true
	    });
	    
        jsPlumb.makeSource(endPoint, {
            isSource: true,
            parent: obj,
            anchor: 'RightMiddle',
            connector: ['Straight'],
            connectorStyle: {strokeStyle: '#fff', lineWidth: 2},
            maxConnections: 8,
            onMaxConnections: $.proxy(this.onMaxConnectionsReached, this)
        });
	    
        jsPlumb.makeTarget(obj, {
            dropOptions: {hoverClass: 'drag-hover'},
            anchor: 'LeftMiddle'
        });
	};
	
	ConversationEditor.prototype.createCanvasObject = function (key, value) {
	    return $('<div class="stf-entry">' + value + '</div>')
	        .attr('data-stf', '@' + key)
	        .disableSelection();
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
	 * Event handlers for canvas.
	 */
	ConversationEditor.prototype.onDropObjectOnCanvas = function (e, ui) {
	    if (ui.draggable.parents('#repository').length > 0) {
	        this.addObjectToCanvas(
	            this.createCanvasObject(ui.draggable.attr('data-stf'), ui.draggable.text()),
	            ui.position);
	    }
	    
	};
	
	ConversationEditor.prototype.onConnectionCreated = function (connection) {
	    if (connection.source.attr("id") == connection.target.attr("id")) {
            jsPlumb.detach(conn);
            return false;
        }
        
        if (connection.source.hasClass("convo-option") && connection.target.hasClass("convo-option")) {
            jsPlumb.detach(conn); //Delete the connection.
            return false;
        }
        
        if (connection.source.hasClass("convo-dialog"))
            connection.target.removeClass("convo-dialog").addClass("convo-option");
        
	    connection.connection.setPaintStyle({strokeStyle: '#8bd'});
	};
	
	ConversationEditor.prototype.onConnectionClicked = function (connection) {
	    connection.target.removeClass("convo-option");
	    jsPlumb.detach(connection);
	};
	
	ConversationEditor.prototype.onCloseButtonClicked = function (e) {
	    e.preventDefault();
	    
	    var parent = $(this).parent();
	    var connections = jsPlumb.getConnections({target: parent.attr('id')});
	    
	    for (var i = 0; i < connections.length; i++) {
	        jsPlumb.detach(connections[i]);
	    }
	    
	    connections = jsPlumb.getConnections({source: parent.attr('id')});
	    
	    for (var i = 0; i < connections.length; i++) {
	        var connection = connections[i];
	        var target = connection.target;
	        
	        target.removeClass('convo-option').addClass('convo-dialog');
	        
	        var targetConnections = jsPlumb.getConnections({source: target.attr('id')});
	        
	        for (var k = 0; k < targetConnections.length; k++) {
	            jsPlumb.detach(targetConnections[k]);
	        }
	        
	        jsPlumb.detach(connection);
	    }
	    
	    parent.remove();
	};
	
	ConversationEditor.prototype.onMaxConnectionsReached = function (info, e) {
	    console.log("Max connections reached.");
	};
	
	/**
	 * Click handlers for menu bar buttons.
	 */
	ConversationEditor.prototype.onSaveProgressButtonClicked = function (e) {
		this.save();
	};
	
	ConversationEditor.prototype.onMoveAllToCanvasButtonClicked = function (e) {
	    this.ui.stfContainer.children().each(function (k, v) {
	        
	    });
	};
	
	ConversationEditor.prototype.onResetCanvasButtonClicked = function (e) {
	    jsPlumb.deleteEveryEndpoint();
	    this.ui.canvas.empty();
	};
	
	ConversationEditor.prototype.onClearAllConnectionsButtonClicked = function (e) {
	    if (confirm("Are you sure you want to detach all the connections in this conversation?\n\nThis action is irreversible.")) {
	        jsPlumb.detachEveryConnection();
	    }
	};

	ConversationEditor.prototype.onGenerateScriptButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onSettingsButtonClicked = function (e) {
	};
	
	ConversationEditor.prototype.onAboutButtonClicked = function (e) {
	};
	
})(jQuery, jsPlumb.getInstance(), undefined);