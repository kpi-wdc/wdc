// normalize values
// 

var STAT = require("../lib/stat"),
    transposeTable = require("../table/transpose").transpose,
    util = require("util");

var NormImplError = function(message) {
    this.message = message;
    this.name = "Command 'normalize' implementation error";
}
NormImplError.prototype = Object.create(Error.prototype);
NormImplError.prototype.constructor = NormImplError;

var impl = function(table, params) {
    // if(!params.normalization) return table;
    // if(!params.normalization.enable) return table;
    var normalization = (params.normalization) ? params.normalization : params;
    var normalizeMode = normalization.mode || "Range to [0,1]";
    var normalizeArea = normalization.direction || "Columns";
    var precision = normalization.precision || null;

    var metaSuffix = "";
    if (normalizeArea == "Columns") {
        table = transposeTable(table, { transpose: true });
    }
    table.body.forEach(function(currentRow) {
        switch (normalizeMode) {
            case "Range to [0,1]":
                currentRow.value = STAT.normalize(currentRow.value);
                break;
            case "Standartization":
                currentRow.value = STAT.standardize(currentRow.value);
                break;
            case "Logistic":
                currentRow.value = STAT.logNormalize(currentRow.value);
                break;
        };
        currentRow.value = currentRow.value.map(function(currentValue) {
            return (currentValue == null) ? null :
                (precision != null) ? new Number(Number(currentValue).toPrecision(precision)) : currentValue;
        })
    })
    table.body.forEach(function(col) {
        col.metadata[col.metadata.length - 1].id += metaSuffix;
        col.metadata[col.metadata.length - 1].label += metaSuffix;
    })

    if (normalizeArea == "Columns") {
        table = transposeTable(table, { transpose: true });
    }
    return table;
}


module.exports = {
    name: "normalize",

    synonims: {
        "normalize": "normalize",
        "norm": "normalize",
        "scale": "normalize"
    },


    "internal aliases":{
        "direction": "direction",
        "dir": "direction",
        "for": "direction",

        "Columns": "Columns",
        "col": "Columns",
        "Rows": "Rows",
        "row": "Rows",

        "mode": "mode",
        "method": "mode",
        "Standartization": "Standartization",
        "std": "Standartization",
        "Rangeto[0,1]": "Range to [0,1]",
        "0,1": "Range to [0,1]",
        "01": "Range to [0,1]",
        "Logistic": "Logistic",
        "log": "Logistic"

    },

    defaultProperty: {
        "normalize": "mode",
        "norm": "mode",
        "scale": "mode",
    },

    execute: function(command, state, config) {
        if (state.head.type != "table")
            throw new NormImplError("Incompatible context type: '" + state.head.type + "'.")
        var table = state.head.data;
        var params = command.settings;

        params = (params) ? {
            direction: params.direction || "Columns",
            mode: params.mode || "Range to [0,1]"
        } : {
            direction: "Columns",
            mode: "Range to [0,1]"
        }


        if (params.direction != "Rows" && params.direction != "Columns")
            throw new NormImplError("Incompatible direction value: " + JSON.stringify(params.direction) + ".")

        if (params.mode != "Range to [0,1]" && params.mode != "Standartization" && params.mode != "Logistic")
            throw new NormImplError("Incompatible mode value: " + JSON.stringify(params.mode) + ".")


        try {
            state.head = {
                type: "table",
                data: impl(table, params)
            }
        } catch (e) {
            throw new NormImplError(e.toString())
        }
        return state;
    },

    help: {
        synopsis: "Normalize values",

        name: {
            "default": "normalize",
            synonims: ["normalize", "norm", "scale"]
        },
        input:["table"],
        output:"table",
        "default param": "mode",
        params: [{
            name: "direction",
            synopsis: "Direction of iteration (optional)",
            type:["Rows", "row", "Columns", "col"],
            synonims: ["direction", "dir", "for"],
            "default value": "Columns"
        }, {
            name: "mode",
            synopsis: "Normalization mode (optional)",
            type:["Range to [0,1]", '0,1' , '01', "Standartization", "std", "Logistic", "log"],
            synonims: ["mode", "method"],
            "default value": "Range to [0,1]"
        }],
        example: {
            description: "Normalize values",
            code:   'src(ds:"47611d63-b230-11e6-8a1a-0f91ca29d77e_2016_02")\n'+
                    'json()dataset()\n'+
                    'proj([{dim:"time", as:"row"},{dim:"indicator",as:"col"}])\n'+
                    'norm(for:"row",method:"log")\n'+
                    'info()\n'+
                    'log()'
        }
    }
}
