/*
 * saiku namespace
 */
var saiku = saiku || {};
saiku.report = {};

/*
 * Enums
 */
var AggregationFunction = {
	NONE: "NONE",
	SUM: "SUM",
	AVERAGE: "AVERAGE",
	COUNT: "COUNT",
	COUNT_DISTINCT: "COUNT_DISTINCT",
	MINIMUM: "MINIMUM",
	MAXIMUM: "MAXIMUM"
};

var DatasourceType = {
	CDA: "CDA",
	METADATA: "METADATA"
};

var GroupType = {
	RELATIONAL: "RELATIONAL",
	CT_COLUMN: "CT_COLUMN",
	CT_ROW: "CT_ROW",
	CT_OTHER: "CT_OTHER"
};

var SortType = {
	ASC: "ASC",
	DESC: "DESC",
	NONE: "NONE"
};

var HorizontalElementAlignment = {
	LEFT: "LEFT",
	CENTER: "CENTER",
	RIGHT: "RIGHT",
	JUSTIFY: "JUSTIFY"
};

var VerticalElementAlignment = {
	TOP: "TOP",
	MIDDLE: "MIDDLE",
	BOTTOM: "BOTTOM"
};

/*
 * Report Domain Model
 *
 */
(function() {

	var RootBandFormat;
	(RootBandFormat = function(config) {

		defaultConfig = {
			repeat: true,
			visible: true
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.RootBandFormat = RootBandFormat;

	var ElementFormat;
	(ElementFormat = function(config) {

		var defaultConfig = {
			label: null,
			fontName: null,
			fontBold: null,
			fontItalic: null,
			fontUnderline: null,
			fontStrikethrough: null,
			fontSize: null,
			fontColor: null,
			backgroundColor: null,
			leftPadding: null,
			rightPadding: null,
			horizontalAlignment: null,
			verticalAlignment: null,
			width: null
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.ElementFormat = ElementFormat;

	var FieldDefinition;
	(FieldDefinition = function(config) {

		defaultConfig = {
			fieldId: null,
			fieldName: null,
			fieldDescription: null,
			dataFormat: null,
			nullString: null,
			headerFormat: new ElementFormat(),
			elementFormats: {},
			aggregationFunction: AggregationFunction.NONE,
			//for the summary, the row aggregation needs to be in the querymodel
			formula: null,
			hideOnReport: false,
			hideRepeating: false
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.FieldDefinition = FieldDefinition;

	var GroupDefinition;
	(GroupDefinition = function(config) {

		defaultConfig = {
			type: GroupType.RELATIONAL,
			dataFormat: null,
			nullString: null,
			displayName: null,
			fieldId: null,
			groupName: null,		
			//sort: SortType.ASC,
			headerFormats: [],
			footerFormat: new ElementFormat()
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.GroupDefinition = GroupDefinition;

	var Chart;
	(Chart = function(config) {

		defaultConfig = {
			cggUrl: null
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.Chart = Chart;

	/*
 *Ein Parameter-Objekt hat drei Funktionen:
 * - Bei der PRPT Synthese auf dem Server dient es als Blaupause für den Param im prpt und im cda
 * - Der client kann damit den Parameterdialog rendern
 * - Es gibt einen endpoint, der damit ein cdf/cda fragment rendern kann

var Parameter;
(Parameter = function(config) {config = config || {}; var p; for (p in config) {this[p] = config[p]}; }).prototype =  
{
	prompt : true,
	name:
	label:
	defaultValue: []
	dataSource:
	keyColumn:
	valueColumn:
	widgetType: //wird das hier ein cdf widget?
};
saiku.report.Parameter = Parameter;
 */

	var Label;
	(Label = function(config) {

		defaultConfig = {
			format: new ElementFormat(),
			value: null
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.Label = Label;

	var Datasource;
	(Datasource = function(config) {

		defaultConfig = {
			id: null,
			type: DatasourceType.METADATA,
			properties: []
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.Datasource = Datasource;

	var PageSetup;
	(PageSetup = function(config) {

		defaultConfig = {
			pageOrientation: null,
			pageFormat: null,
			topMargin: null,
			rightMargin: null,
			bottomMargin: null,
			leftMargin: null
		};

		config = config || {};
		var p;
		for(p in defaultConfig) {
				if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	});
	saiku.report.PageSetup = PageSetup;

	var ReportSpecification;
	(ReportSpecification = function(config) {

		defaultConfig = {
			reportName: null,
			reportHeaders: [],
			reportFooters: [],
			pageHeaders: [],
			pageFooters: [],
			groupDefinitions: [],
			fieldDefinitions: [],
			charts: [],
			pageSetup: null,
			dataSource: null,
			//sollen hier mehrere rein, auch die für propmts? oder sollen die in den jeweiligen parameter?
			//parameters: [],
			customValues: {}
		}

		config = config || {};
		var p;
		for(p in defaultConfig) {
			if(typeof(config[p]) === "undefined" && defaultConfig[p] != null) {
				config[p] = defaultConfig[p];
			}
			this[p] = config[p];
		}
	}).prototype = {


		// functions
		_parseXmlId: function(xmlId) {
			var parts = xmlId.split('-');

			var uid = {
				id: parts[0],
				type: parts[1],
				index: parts[2],
				subtype1: parts[3],
				subtype2: parts[4]
			};

			return uid;
		},

		_upsertNested: function(base, path, value) {
			var lastName = arguments.length === 3 ? path.pop() : false;

			for(var i = 0; i < path.length; i++) {
				var pathElement = path[i + 1];
				if(isNaN(pathElement)) {
					base = base[path[i]] = base[path[i]] || {};
				} else {
					base = base[path[i]] = base[path[i]] || [];
				}
			}
			//if(lastName) base = base[lastName] = value;
			if(lastName) base[lastName] = value;
			console.log("upsert:" + base + "." + path.join(".") + "." + value);
			return base;
		},

		addColumn: function(field, position) {
			var array = this.hasOwnProperty("fieldDefinitions") ? this["fieldDefinitions"] : this["fieldDefinitions"] = [];

			if(position === undefined) {
				console.log("pushing column " + field.fieldId);
				array.push(field);
			} else {
				console.log("adding column " + field.fieldId + " at index " + position);
				array.splice(position, 0, field);
			}
		},

		removeColumn: function(position) {
			console.log("removing column at index " + position);
			var removedColumn = this.fieldDefinitions.splice(position, 1);
			return removedColumn[0];
		},

		addGroup: function(group, position) {
			var array = this.hasOwnProperty("groupDefinitions") ? this["groupDefinitions"] : this["groupDefinitions"] = [];
			array.splice(position, 0, group);
		},

		removeGroup: function(field, position) {
			console.log("removing group at index " + position);
			var removedGroup = this.groupDefinitions.splice(position, 1);
			return removedGroup[0];
		},

		getElementFormatById: function(xmlId) {

			var uid = this._parseXmlId(xmlId);

			switch(uid.type) {
			case "phd":
				return this.pageHeaders[uid.index]['format'];
				break;
			case "pft":
				return this.pageFooters[uid.index]['format'];
				break;
			case "rhd":
				return this.reportHeaders[uid.index]['format'];
				break;
			case "rft":
				return this.reportFooters[uid.index]['format'];
				break;
			case "ghd":
				//relational group header
				return this.groupDefinitions[uid.index]['headerFormats'][uid.subtype1];
				break;
			case "gft":
				return this.groupDefinitions[uid.index]['footerFormat'];
				break;
			case "dth":
				return this.fieldDefinitions[uid.index]['headerFormat'];
				break;
			case "dtl":
				return this.fieldDefinitions[uid.index]['elementFormats'][uid.subtype1][uid.subtype2];
				//return this.fieldDefinitions[uid.index]['elementFormats']['*']['*'];
				break;
			}

		},

		addChart: function(position, url) {},

		removeChart: function(position) {},

		getValueById: function(xmlId) {

			var uid = this._parseXmlId(xmlId);

			switch(uid.type) {
			case "phd":
				return this.pageHeaders[uid.index]['value'];
				break;
			case "pft":
				return this.pageFooters[uid.index]['value'];
				break;
			case "rhd":
				return this.reportHeaders[uid.index]['value'];
				break;
			case "rft":
				return this.reportFooters[uid.index]['value'];
				break;
			case "ghd":
				return this.groupDefinitions[uid.index]['headerFormats'][uid.subtype1];
				break;
			case "dth":
				return this.fieldDefinitions[uid.index]['fieldName'];
				break;
			}

		},
		//for inplace-edit
		setValueById: function(xmlId, value) {

			var uid = this._parseXmlId(xmlId);

			var path;

			switch(uid.type) {
			case "phd":
				path = ["pageHeaders", uid.index, "value"];
				break;
			case "pft":
				path = ["pageFooters", uid.index, "value"];
				break;
			case "rhd":
				path = ["reportHeaders", uid.index, "value"];
				break;
			case "rft":
				path = ["reportFooters", uid.index, "value"];
				break;
			case "ghd":
				path = ["groupDefinitions", uid.index, "headerFormats"][uid.subtype1];
				break;
			case "dth":
				path = ["fieldDefinitions", uid.index, "fieldName"];
				break;
			}

			this._upsertNested(this, path, value);

		},
		//for inplace-edit
		setElementFormatPropertyById: function(xmlId, property, value) {

			var uid = this._parseXmlId(xmlId);

			var path;

			switch(uid.type) {
			case "phd":
				path = ["pageHeaders", uid.index, "format", property];
				break;
			case "pft":
				path = ["pageFooters", uid.index, "format", property];
				break;
			case "rhd":
				path = ["reportHeaders", uid.index, "format", property];
				break;
			case "rft":
				path = ["reportFooters", uid.index, "format", property];
				break;
			case "ghd":
				path = ["groupDefinitions", uid.index, "headerFormats", uid.subtype1, property];
				break;
			case "gft":
				path = ["groupDefinitions", uid.index, "footerFormat", property];
				break;
			case "dth":
				path = ["fieldDefinitions", uid.index, "headerFormat", property];
				break;
			case "dtl":
				path = ["fieldDefinitions", uid.index, "elementFormats", uid.subtype1, uid.subtype2, property];
				break;
			}

			this._upsertNested(this, path, value);

		}

	};
	saiku.report.ReportSpecification = ReportSpecification;
}());