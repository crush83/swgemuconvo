function LuaState() {
    this.objects = {};
};

LuaState.prototype.push = function(key, object) {
    this.objects[key] = object;
};


function ConvoTemplate() {
    this.initialScreen = "";
    this.templateType = "Normal";
    this.luaClassHandler = "";
    this.screens = {};
};

function ConvoScreen() {
    this.id = "";
    this.leftDialog = "";
    this.stopConversation = true;
    this.options = {};
};