;(function () {

	var curColourIndex = 1, maxColourIndex = 24, nextColour = function () {
		var R,G,B;
		R = parseInt(128+Math.sin((curColourIndex*3+0)*1.3)*128);
		G = parseInt(128+Math.sin((curColourIndex*3+1)*1.3)*128);
		B = parseInt(128+Math.sin((curColourIndex*3+2)*1.3)*128);
		curColourIndex = curColourIndex + 1;
		if (curColourIndex > maxColourIndex) curColourIndex = 1;
		return "rgb(" + R + "," + G + "," + B + ")";
	};
	
	var repository = $("#repository");
	var scriptWindow = $("#script").hide();
	var scriptContainer = $("PRE", scriptWindow);
	var overlay = $("#overlay").hide();
	var script = {};
	var map = {};
	var autoSaveInterval = 60000; //Auto save interval in ms.
	
	window.conversationEditor = {
	    grid: {x: 10, y: 10},
	    
	    init: function () {
	        $("#toolbar A:contains('Generate Lua')").on("click", conversationEditor.onGenerateLuaClicked);
	        $("#toolbar A:contains('About')").on("click", conversationEditor.onAboutClicked);
	        $("#toolbar A:contains('Move All To Canvas')").on("click", conversationEditor.onMoveAllToCanvasClicked);
	        $("#toolbar A:contains('Reset Canvas')").on("click", conversationEditor.onResetCanvasClicked);
	        $("#toolbar A:contains('Clear All Connections')").on("click", conversationEditor.onClearAllConnectionsClicked);
	        $("#toolbar A:contains('Demo')").on("click", conversationEditor.onDemoClicked);
	        $("#toolbar A:contains('Save Progress')").on("click", conversationEditor.onSaveProgressClicked);
	        
	        //Add close buttons to all the dialog boxes.
	        var closeButton = $('<div class="closeButton">x</div>');
	        
	        $(".dialog").append(closeButton.clone().click(function (e) {
	            overlay.hide();
	            $(this).parent().hide();
	        }));
	        
	        jsPlumb.importDefaults({
                Endpoint : ["Dot", {radius:2}],
                HoverPaintStyle : {strokeStyle:"#fff", lineWidth:2 }
            });

	        //Standard connection click event.
            jsPlumb.bind("click", function (connection) {
                connection.target.removeClass("convo-option");
                jsPlumb.detach(connection);
            });

            //Standard connection created event.
            jsPlumb.bind("jsPlumbConnection", function (conn) {
                //Can't create a connection to itself...
                if (conn.source.attr("id") == conn.target.attr("id")) {
                    jsPlumb.detach(conn);
                    return false;
                }
                
                if (conn.source.hasClass("convo-option") && conn.target.hasClass("convo-option")) {
                    jsPlumb.detach(conn); //Delete the connection.
                    //alert("You cannot connect an option to another option.");
                    return false;
                }
                
                if (conn.source.hasClass("convo-dialog"))
                    conn.target.removeClass("convo-dialog").addClass("convo-option");

                conn.connection.setPaintStyle({strokeStyle:nextColour()});
            });
            
            //Start automatic saves.
            setInterval(conversationEditor.saveProgress, autoSaveInterval);
	    },
	    
	    fillRepository: function (data) {
	        var container = $(".container", repository).empty();

	        for (key in data.entries) {
	            var entry = data.entries[key];
	            
	            var o = $('<div class="stfEntry">' + entry + '</div>')
	                .attr("data-stf", "@" + data.stfFile + ":" + key)
	                .draggable({
                        revert: "invalid",
                        appendTo: "#canvas",
                        scroll: false,
                        helper: "clone"
                    }).disableSelection();

	            container.append(o);
	        }
	    },
	    
	    saveProgress: function () {
	        
	        var save = {
	            selectedStf: $(".stfChooser").text(),
	            conversation: []
	        };
	        
	        $("#canvas .stfEntry").each(function(k, v) {
	            var $v = $(v);
	            
	            var obj = {
	                id: $v.attr('id'),
	                stf: $v.attr('data-stf'),
	                x: $v.position().left,
	                y: $v.position().top,
	                connections: []
	            }
	            
	            var connections = jsPlumb.getConnections({source: obj.id});
	            
	            for (var i = 0; i < connections.length; i++) {
	                obj.connections.push(connections[i].targetId);
	            }
	            
	            console.log(obj);
	            
	            save.conversation.push(obj);
	        });
	        
	        conversationEditor.onResetCanvasClicked();
	        
	        //load them.
	        
	        
	        
	        $("#savedProgress").show().fadeOut(2000);
	    },
	    
	    onSaveProgressClicked: function (e) {
	        conversationEditor.saveProgress();
	    },
	    
	    onDemoClicked: function (e) {
	        //Run a clickable demo of the conversation.
	        alert("Coming in futurde version!");
	    },
	    
	    onResetCanvasClicked: function (e) {
	        //Delete all the stf entries from the canvas.
	        jsPlumb.deleteEveryEndpoint();
	        $("#canvas .stfEntry").remove();
	    },
	    
	    onMoveAllToCanvasClicked: function (e) {
	        //We want to clone one of each stfentry in the #repository to the #canvas.
	        $("#repository .stfEntry").each(function(k, v) {
	            var obj = $(v).clone();
                obj.removeAttr("id"); //Force a new id to be generated.
                
                conversationEditor.addCanvasObject(obj, {left: 0, top: 0});
	        });
	    },
	    
	    onAboutClicked: function (e) {
	        overlay.show();
	        $("#about").show().css("left", $(document).width() / 2 - $("#about").width() / 2);
	    },
	    
	    onClearAllConnectionsClicked: function (e) {
	        jsPlumb.detachEveryConnection();
	    },
	    
	    onGenerateLuaClicked: function (e) {
	        if ($("#scriptName DIV").text() == "") {
	            alert("You must provide a name for your script.\n\nPlease make sure this name is unique, as it will be the referenced name of the conversation template.\n\n\"ConversationTemplate\" will automatically be appended to the name when the script is generated.");
	            $("#scriptName DIV").focus();
	            return;
	        }
	        
	        var script = conversationEditor.writeScript();
	        var lines = script.split(/\r\n/g);
	        
	        var html = "<ol><li><span class=\"def\">" + lines.join("</span></li><li><span class=\"def\">") + "</span></li></ol>";
	        
	        scriptContainer.html(html);
	        overlay.show();
	        scriptWindow.show().css("left", $(document).width() / 2 - scriptWindow.width() / 2);
	    },
	    
	    addCanvasObject: function (obj, pos) {
	        obj.addClass("convo-dialog")
	            .append('<div class="closeButton">X</div>')
	            .append('<div class="endPoint"></div>');
	        
            jsPlumb.makeTarget(obj, {
                dropOptions: {hoverClass: "dragHover"},
                anchor: "LeftMiddle"
            });
	        
	        $(".closeButton", obj).click(conversationEditor.onStfEntryCloseClicked);
	        
	        obj.appendTo("#canvas");
	        
            pos.left = Math.floor(pos.left / conversationEditor.grid.x) * conversationEditor.grid.x;
            pos.top = Math.floor(pos.top / conversationEditor.grid.y) * conversationEditor.grid.y;

            obj.css("left", pos.left);
            obj.css("top", pos.top);
            
            obj.removeClass("ui-draggable");
            jsPlumb.draggable(obj);
            obj.draggable({snap: "#canvas", grid: [conversationEditor.grid.x, conversationEditor.grid.y], scroll: true});
            
            var ep = $(".endPoint", obj);
            jsPlumb.makeSource(ep, {
                parent: obj,
                anchor: "RightMiddle",
                connector: ["Straight"],
                connectorStyle: { strokeStyle:"#fff", lineWidth:2 },
                maxConnections: 8,
                onMaxConnections: function(info, e) {
                    alert("Maximum connections (" + info.maxConnections + ") reached");
                }
            });
	    },
	    
	    onStfEntryCloseClicked: function (e) {
	        e.preventDefault();
            var parent = $(this).parent();
            var connections = jsPlumb.getConnections({target: parent.attr("id")});

            for (var i = 0; i < connections.length; ++i) {
                jsPlumb.detach(connections[i]);
            }
            
            connections = jsPlumb.getConnections({source: parent.attr("id")});
            
            for (var i = 0; i < connections.length; ++i) {
                var connection = connections[i];
                var target = connection.target;
                
                target.removeClass("convo-option").addClass("convo-dialog");
                
                var targetConnections = jsPlumb.getConnections({source: target.attr("id")});
                
                for (var k = 0; k < targetConnections.length; ++k) {
                    jsPlumb.detach(targetConnections[k]);
                }
                
                jsPlumb.detach(connections[i]);
            }
            
            parent.remove();
	    },
	    
	    writeScript: function () {
	        var scriptName = $("#scriptName DIV").text() + "ConversationTemplate";

	        var script  = "<span class=\"com\">--Generated by SWGEmu Conversation Editor</span>\r\n";
	        	script += "<span class=\"var\">" + scriptName + "</span> = <span class=\"cls\">ConvoTemplate</span>:<span class=\"mem\">new</span> {\r\n";
	            script += "\t<span class=\"var\">initialScreen</span> = <span class=\"str\">\"\"</span>,\r\n";
	            script += "\t<span class=\"var\">templateType</span> = <span class=\"str\">\"Normal\"</span>,\r\n";
	            script += "\t<span class=\"var\">luaClassHandler</span> = <span class=\"str\">\"\"</span>,\r\n";
	            script += "\t<span class=\"var\">screens</span> = {}\r\n";
	            script += "}\r\n\r\n";
	        
	        //Loop through each element on the canvas.
	        $("#canvas .stfEntry.convo-dialog").each(function(k, v) {
                var obj = $(v);
                
                var key = v.id;
                var stfFile = obj.attr("data-stf");
                
                var options = jsPlumb.getConnections({source: v.id});
                
                script += "<span class=\"var\">cs_" + key + "</span> = <span class=\"cls\">ConvoScreen</span>:<span class=\"mem\">new</span> {\r\n";
                script += "\t<span class=\"var\">id</span> = <span class=\"str\">\"cs_" + key + "\"</span>,\r\n";
                script += "\t<span class=\"var\">leftDialog</span> = <span class=\"str\">\"" + stfFile + "\"</span>,\r\n";
                script += "\t<span class=\"var\">stopConversation</span> = <span class=\"str\">\"" + (options.length > 0 ? "false" : "true") + "\"</span>,\r\n";
                script += "\t<span class=\"var\">options</span> = {\r\n";
                
                for (var i = 0; i < options.length; ++i) {
                    var option = options[i].target;
                    var optionKey = option.attr("id");
                    var optionStfFile = option.attr("data-stf");
                    
                    var connections = jsPlumb.getConnections({source: option.attr("id")});
                    var connectionKey = "";
                    
                    if (connections.length > 0)
                        connectionKey = "cs_" + $(connections[0].target).attr("id");
                    
                    script += "\t\t{<span class=\"str\">\"" + optionStfFile + "\"</span>,<span class=\"str\">\"" + connectionKey + "\"</span>}" + (options.length - 1 == i ? "" : ",") + "\r\n";
                }
                
                script += "\t}\r\n";
                script += "}\r\n\r\n";
                script += "<span class=\"var\">" + scriptName + "</span>:<span class=\"var\">addScreen</span>(<span class=\"var\">cs_" + key + "</span>);\r\n\r\n";
            });
	        
	        script += "<span class=\"var\">addConversationTemplate</span>(<span class=\"str\">\"" + scriptName + "\"</span>, <span class=\"var\">" + scriptName + "</span>);\r\n";

	        return script;
	    }
	};
})();

jsPlumb.bind("ready", function () {
    jsPlumb.init();
});