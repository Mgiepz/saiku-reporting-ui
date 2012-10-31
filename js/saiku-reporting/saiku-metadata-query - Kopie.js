/**
 * @author mgiepz
 */

/*
 * saiku namespace
 */

//var saiku = {report: { mql: {}}};


var saiku = saiku || {};
saiku.mql = {};

/*
 * Metadata Query Domain Model
 *
 */
( function() {

		function MqlBaseElement(attributes) {
			this._initialize(attributes);
		};

		_.extend(MqlBaseElement.prototype, {

			// PUBLIC METHODS

			// Set defaults. These are the only attributes allowed.
			defaults : function() {
				return {};
			},

			// generic "Setter"
			set : function(attrs, newValue) {
				if (_.isString(attrs) && !_.isUndefined(this.defaults()[attrs])) {
					this._setAttribute(attrs, newValue);
				} else {
					this._setAttributes(attrs);
				}
			},

			// generic "Getter"
			get : function(attrName) {
				return (this.attributes[attrName]);
			},

			// get an array of public method names
			methods : function() {
				return _.reject(_.methods(this.constructor.prototype), function(method) {
					return method.indexOf("_") === 0;
				});
			},

			// PRIVATE METHODS

			// initialize attributes. Only initializes attributes that are specified in defaults.
			_initialize : function(attrs) {
				var allowed = {};
				// only allowing defaults to be overridden. No other attributes can be initialized.
				_.map(attrs, function(val, key) {
					if (!_.isUndefined(this[key])) {
						allowed[key] = val;
					}
				}, this.defaults());
				this.attributes = _.extend({}, this.defaults(), allowed);
			},

			// Set a single attribute
			_setAttribute : function(key, val) {
				this.attributes[key] = val;
			},

			// Setting a collection of attributes
			_setAttributes : function(attrs) {
				_.each(attrs, function(val, key) {
					if (!_.isUndefined(this.defaults[key])) {
						this.attributes[key] = val;
					}
				}, this);
			}
		})

		/*
		 * Domain Objects
		 *
		 */

		/*
		 * Mql Query
		 */
		var MqlQuery = function MqlBaseElement(attributes) {
			this._initialize(attributes);
		}

		_.extend(MqlQuery.prototype, MqlBaseElement.prototype, {

			defaults : function() {
				return _.extend({
					domainId : null,
					modelId : null,
					disableDistinct : false,
					columns : [],
					defaultParameterMap : null,
					conditions : [],
					orders : [],
					parameters : []
				}, MqlBaseElement.prototype.defaults());
			},
			
			addSelection : function(selection) {
				this.get('columns').push(selection);
			},

			addSort : function(order) {
				this.get('orders').push(order);
			},
			
			removeSelectionById : function(id) {
				var selections = this.get('columns');
				for(var i=0; i<selections.length; i++) {
					if(selections[i].get('id') == id) {
						selections.splice(i,1);
						i--;
					}
					this.set('columns',selections);
				}
			},

			toXml : function() {

				var attr = this.attributes;

				var xml = '';
				xml += '<mql><domain_type>relational</domain_type>';
				xml += '<domain_id>' + attr.domainId + '</domain_id>';
				xml += '<model_id>' + attr.modelId + '</model_id>';
				xml += "<options>";
				xml += "<disable_distinct>" + attr.disableDistinct + "</disable_distinct>";
				xml += "</options>";

				xml += '<parameters>';
				for (var idx = 0; idx < this.attributes.parameters.length; idx++) {
					xml += this.attributes.parameters[idx].toXml();
				}
				xml += '</parameters>';
				xml += '<selections>';
				for (var idx = 0; idx < this.attributes.columns.length; idx++) {
					xml += this.attributes.columns[idx].toXml();
				}
				xml += '</selections>';
				xml += '<constraints>';
				for (var idx = 0; idx < this.attributes.conditions.length; idx++) {
					xml += this.attributes.conditions[idx].toXml(this.attributes.parameters);
				}
				xml += '</constraints>';
				xml += '<orders>';
				for (var idx = 0; idx < this.attributes.orders.length; idx++) {
					xml += this.attributes.orders[idx].toXml();
				}
				xml += '</orders>';
				xml += '</mql>';
				return xml;
			}
		});
		saiku.mql.MqlQuery = MqlQuery;

		/*
		 * Mql Selection
		 */
		var MqlSelection = function MqlBaseElement(attributes) {
			this._initialize(attributes);
		}

		_.extend(MqlSelection.prototype, MqlBaseElement.prototype, {

			defaults : function() {
				return _.extend({
					aggTypes : [],
					category : null,
					defaultAggType : AggregationFunction.NONE,
					fieldType : null,
					id : null,
					name : null,
					selectedAggType : AggregationFunction.NONE,
					type : null
				}, MqlBaseElement.prototype.defaults());
			},

			toXml : function() {
				var xml = '';
				xml += '<selection>';
				xml += '<view>' + this.attributes.category + '</view>';
				xml += '<column>' + this.attributes.id + '</column>';
				var aggType = this.attributes.selectedAggType;
				if (!aggType) {
					aggType = this.attributes.defaultAggType;
				}
				xml += '<aggregation>' + aggType + '</aggregation>';
				xml += '</selection>';
				return xml;
			}
		});
		saiku.mql.MqlSelection = MqlSelection;

		/*
		 * Mql Sort
		 */
		var MqlSort = function MqlBaseElement(attributes) {
			this._initialize(attributes);
		}

		_.extend(MqlSort.prototype, MqlBaseElement.prototype, {

			defaults : function() {
				return _.extend({
					category : null,
					column : null,
					orderType : SortType.ASC
				}, MqlBaseElement.prototype.defaults());
			},

			toXml : function() {
				var xml = '';
				xml += '<order>';
				xml += '<direction>' + this.attributes.orderType + '</direction>';
				xml += '<view_id>' + this.attributes.category + '</view_id>';
				xml += '<column_id>' + this.attributes.column + '</column_id>';
				xml += '</order>';
				return xml;
			}
		});
		saiku.mql.MqlSort = MqlSort;

		/*
		 * Mql MqlCondition
		 */
		var MqlCondition = function MqlBaseElement(attributes) {
			this._initialize(attributes);
		}

		_.extend(MqlCondition.prototype, MqlBaseElement.prototype, {

			defaults : function() {
				return _.extend({
					category : null,
					column : null,
					operator : null,
					value : null,
					combinationType : OperatorType.AND
				}, MqlBaseElement.prototype.defaults());
			},

			toXml : function(parameters) {

				var xml = '';
				xml += '<constraint>';
				xml += '<operator>' + this.attributes.combinationType + '</operator>';
				xml += '<condition><![CDATA[' + this._buildConditionString(parameters) + ']]></condition>';
				xml += '</constraint>';
				return xml;
			},

			_buildConditionString : function() {

				var attr = this.attributes;

				switch (attr.operator) {
					case ConditionType.LIKE :
						return 'LIKE([' + attr.category + '.' + attr.columnId + '];"%' + this._buildValueString() + '%")';
					case ConditionType.BEGINSWITH :
						return '';
					case ConditionType.ENDSWITH :
						return '';
					case ConditionType.CONTAINS :
						return '';
					case ConditionType.NOT_CONTAINS :
						return '';
					case ConditionType.EQUAL :
						return '';
					case ConditionType.LESS_THAN :
						return '';
					case ConditionType.LESS_THAN_OR_EQUAL :
						return '';
					case ConditionType.MORE_THAN :
						return '';
					case ConditionType.MORE_THAN_OR_EQUAL :
						return '';
					case ConditionType.IS_NULL :
						return '';
					case ConditionType.NOT_NULL :
						return '';
				}

			},

			_buildValueString : function() {

			}
		});
		saiku.mql.MqlCondition = MqlCondition;

		/*
		 * Mql Parameter
		 */
		var MqlParameter = function MqlParameter(attributes) {
			this._initialize(attributes);
		}

		_.extend(MqlParameter.prototype, MqlBaseElement.prototype, {

			defaults : function() {
				return _.extend({
					column : null,
					name : null,
					type : null,
					value : null,
					defaultValue : null
				}, MqlBaseElement.prototype.defaults());
			},

			toXml : function() {
				var xml = '';

				xml += '<parameter defaultValue="';
				if (this.attributes.value != null) {
					xml += this.attributes.value;
				} else {
					xml += this.attributes.defaultValue;
				}
				xml += '" name="' + this.attributes.name;
				xml += '" type="' + this.attributes.type + '"/>';
				return xml;
			}
		});
		saiku.mql.MqlParameter = MqlParameter;

	}());


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
}

var SortType = {
	ASC : "ASC",
	DESC : "DESC",
	NONE : "NONE"
}

var DataType = {
	NUMERIC : "NUMERIC",
	STRING : "STRING",
	DATE : "DATE",
	BOOLEAN : "BOOLEAN",
	UNKNOWN : "UNKNOWN",
	NONE : "NONE"
}