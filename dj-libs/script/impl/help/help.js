require('string-natural-compare');

module.exports = {
    name: "help",
    synonims: {
        "help": "help",
        "h": "help"
    },
    "internal aliases":{
        "cmd": "command",
        "c": "command"
    },
    defaultProperty: {
        "help": "command",
        "h": "command"
    },

    execute: function(command, state, config) {
        command.settings.command = command.settings.command || "help";

        var c = config.filter(function(cmd) {
            return cmd.name == command.settings.command || cmd.synonims[command.settings.command]
        })[0]

        if (!c) {
            state.head = {
                type: "help",
                data: {error: "Command '" + command.settings.command + "' not implemented"}
            }
        } else {
            if (!c.help) {
                state.head = {
                    type: "help",
                    data: {warning: "Command '" + command.settings.command + "' found but help not exists"}
                }
            } else {

                state.head = {
                    type: "help",
                    data: c.help
                }
                }
        }

        state.head.data["implemented commands"] = config
                    .map(function(item){return item.name})
                    .sort(function(a,b){return String.naturalCompare((a).toLowerCase(),(b).toLowerCase())})
            
        return state;
    },

    help: {
        synopsis: "Helps for command usage",
        name: {
            "default": "help",
            synonims: ["h"]
        },
        "default param": "command",
        params: [{
            name: "command",
            synopsis: "Command name for help",
            type:["string"],
            synonims: ["command","cmd","c"],
            "default value": "help"
        }],
        example: {
            description: "get help for 'context'",
            code: "help(command:'context')"
        }
    }
}
