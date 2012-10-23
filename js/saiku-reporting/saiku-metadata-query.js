/**
 * @author mgiepz
 */

/*
 * saiku namespace
 */

var saiku = saiku || {};
saiku.mql = saiku.mql || {};

/*
 * Enums
 */

var AggregationFunction = {
	NONE : "NONE",
	SUM : "SUM",
	AVERAGE : "AVERAGE",
	COUNT : "COUNT",
	COUNT_DISTINCT : "COUNT_DISTINCT",
	MINIMUM : "MINIMUM",
	MAXIMUM : "MAXIMUM"
};
 
var OperatorType = {
	OR : 'OR',
	OR_NOT : 'OR NOT',
	AND : 'AND',
	AND_NOT : 'AND NOT'
};

var ConditionType = {
	LIKE : 'LIKE',
	BEGINSWITH : 'BEGINS WITH',
	ENDSWITH : 'ENDS WITH',
	CONTAINS : 'CONTAINS',
	NOT_CONTAINS : 'DOES NOT CONTAIN',
	EQUAL : 'EQUAL',
	LESS_THAN : '<',
	LESS_THAN_OR_EQUAL : '<=',
	MORE_THAN : '>',
	MORE_THAN_OR_EQUAL : '>=',
	IS_NULL : 'IS NULL',
	NOT_NULL : 'IS NOT NULL'
};

var SortType = {
	ASC : "ASC",
	DESC : "DESC",
	NONE : "NONE"
};

var DataType = {
	NUMERIC : "NUMERIC",
	STRING : "STRING",
	DATE : "DATE",
	BOOLEAN : "BOOLEAN",
	UNKNOWN : "UNKNOWN",
	NONE : "NONE"
};

/*
 * Metadata Query Domain Model
 *
 */
( function() {

var Mql;
(Mql = function(config) {config = config || {}; var p; for (p in config) {this[p] = config[p]}; }).prototype = 
{ 
  domain_type: "relational",
  domain_id: null,
  model_id: null,
  options: {disable_distinct: "false"}, 
  selections: [],
  orders: []
};
saiku.mql.Mql = Mql;

var Query;
(Query = function(config) {config = config || {}; var p; for (p in config) {this[p] = config[p]}; }).prototype = 
 { 
    mql: new Mql()

    addSelection : function(selection) {
		this.mql.selections.push(selection);
	},

	addSort : function(order) {
		this.orders.push.push(order);
	}
};
saiku.mql.Query = Query;

var Selection;
(Selection = function(config) {config = config || {}; var p; for (p in config) {this[p] = config[p]}; }).prototype = 
{ 
   table: null,
   column: null,
   aggregation: AggregationFunction.NONE
};
saiku.mql.Selection = Selection;

var Order;
(Order = function(config) {config = config || {}; var p; for (p in config) {this[p] = config[p]}; }).prototype = 
{ 
   direction: SortType.ASC,
   view_id: null,
   column_id: null
};
saiku.mql.Order = Order;

}());
