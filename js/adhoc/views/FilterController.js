(function(window) {

    var FilterController = function() {};

    FilterController.filterRowToReportParameter = function(model) {

    };

    FilterController.formulaConstraintToFilterModel = function(constraint, query) {

        var js = saiku.mql.Phomp.formulaToJs(constraint.condition.replace("<![CDATA[", "").replace("]]>", ""));

        var filterModel = {};

        if(js.name != "AND" && js.name != "OR") {
            var category = js.args[0].arg.left.text;
            var column = js.args[0].arg.right.text;
            filterModel.conditionType = js.name;
            filterModel.value = FilterController.stringToValue(js.args[1].text);
            filterModel.columnMeta = query.selectedModel.getColumnById(category,column);
        } else {
            alert("this seems to be a complex filter");
        }

        return filterModel;

    };

    FilterController.filterRowToFormula = function(model) {

        var formula;

        var aggExpression = "";

        if(typeof(model.aggType) != "undefined" && model.aggType != AggregationFunction.NONE) {
            aggExpression = "." + model.aggType;
        }

        var column = '[' + model.columnMeta.category + '.' + model.columnMeta.id + aggExpression + ']';

        var value = FilterController.valueToString(model); //auch den model.parameter mit einbauen, wenn er existiert
        //und wenn er existiert, dann auch direkt in den report einbauen?
        if(model.conditionType == "LIKE") {
            var val =  value.replace(/"/g, "") ;
            formula = 'LIKE(' + column + ';"%' + value.replace(/"/g, "") + '%")';
        } else if(model.conditionType == ConditionType.EQUAL) {
            if(true) { //check here if we have one value or an array
                formula = 'EQUALS(' + column + ';' + value + ')';
            } else {
                formula = 'IN(' + column + ';' + value + ')';
            }
        } else if(model.conditionType == "LESS_THAN") {
            formula = column + '<' + value;
        } else if(model.conditionType == "LESS_THAN_OR_EQUAL") {
            formula = column + '<=' + value;
        } else if(model.conditionType == "MORE_THAN") {
            formula = column + '>' + value;
        } else if(model.conditionType == "MORE_THAN_OR_EQUAL") {
            formula = column + '>=' + value;
        }

        //return "<![CDATA[" + formula + "]]>";
        return formula;
    };

    FilterController.stringToValue = function(value){
        return value.replace(/"/g, "").replace(/%/g, "");
    }

    FilterController.valueToString = function(model) {

        if(model.value == null) return "";

        if($.isArray(model.value)) {
            return model.value.join(";");
        } else if(model.columnMeta.type == DataType.DATE) {
            return 'DATEVALUE("' + model.value + '")';
        }

        //the standard string value needs to be in ""
        return '"' + model.value + '"';

        //if the model has a param, we know that it needs to be prompted 
        if(typeof(model.parameter) != "undefined" && model.parameter != null) {
            if(model.columnMeta.typeof == DataType.DATE) {
                return "DATEVALUE([param:" + model.parameter + "])";
            } else {
                return "[param:" + model.parameter + "]";
            }
        }
    };

    if(typeof(define) === "function" && define.amd) {
        define(function() {
            return PentahoMqlUtils;
        });
    } else window.FilterController = FilterController;

    return FilterController;

})(typeof exports === "undefined" ? window : exports);