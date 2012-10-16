/*
 * saiku namespace
 */
var saiku = saiku || {};
saiku.report = {};

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

var DatasourceType = {
	CDA : "CDA",
	METADATA : "METADATA"
};

var GroupType = {
	RELATIONAL : "RELATIONAL",
	CT_COLUMN : "CT_COLUMN",
	CT_ROW : "CT_ROW",
	CT_OTHER : "CT_OTHER"
};

var SortType = {
	ASC : "ASC",
	DESC : "DESC",
	NONE : "NONE"
};

var HorizontalElementAlignment = {
	LEFT : "LEFT",
	CENTER : "CENTER",
	RIGHT : "RIGHT",
	JUSTIFY : "JUSTIFY"
};

var VerticalElementAlignment = {
	TOP : "TOP",
	MIDDLE : "MIDDLE",
	BOTTOM : "BOTTOM"
};

/*
 * Report Domain Model
 *
 */
( function() {

var RootBandFormat = {
	repeat : true,
	visible : true
};

var ElementFormat = {
	label: null,
	fontName : null,
	fontBold : null,
	fontItalic : null,
	fontUnderline : null,
	fontStrikethrough : null,
	fontSize : null,
	fontColor : null,
	backgroundColor : null,
	leftPadding : null,
	rightPadding : null,
	horizontalAlignment : null,
	verticalAlignment : null,
	width : null
};
saiku.report.ElementFormat = _.extend({}, ElementFormat);

var FieldDefinition = {
	fieldId : null,
	fieldName : null,
	fieldDescription : null,
	dataFormat : null,
	nullString : null,
	headerFormat :  _.extend({}, ElementFormat),
	elementFormats: {},
	aggregationFunction : AggregationFunction.NONE,
	hideOnReport : false,
	hideRepeating : false
};
saiku.report.FieldDefinition = _.extend({}, FieldDefinition);

var GroupCombination = {
	rowGrp: null,
	colGrp: null,
	toString: function(){}
}
saiku.report.GroupCombination = _.extend({}, GroupCombination);

var GroupDefinition = {
	type : GroupType.RELATIONAL,
	dataFormat : null,
	nullString : null,
	displayName : null,
	fieldId : null,
	sort : SortType.ASC,
	groupName : null,
	headerFormats : [],
	footerFormat : _.extend({}, ElementFormat),
};
saiku.report.GroupDefinition = _.extend({}, GroupDefinition);

var Chart  = {
	cggUrl : null
};
saiku.report.Chart = _.extend({}, Chart);

var Label = {
	format : _.extend({}, ElementFormat),
	value : null
};
saiku.report.Label = _.extend({}, Label);

var Datasource = {
	id: null,
	type: DatasourceType.METADATA,
	properties: []
};
saiku.report.Datasource = _.extend({}, Datasource);

var PageSetup = {
	pageOrientation : null,
	pageFormat : null,
	topMargin : null,
	rightMargin : null,
	bottomMargin : null,
	leftMargin : null
};
saiku.report.PageSetup = _.extend({}, PageSetup);

var ReportSpecification = {
	reportName: null,
	reportHeaders: [],	
	reportFooters : [],					
	pageHeaders : [],
	pageFooters : [],
	groupDefinitions : [],
	fieldDefinitions: [],
	charts : [],
	pageSetup : null,
	dataSource: null,
	parameters: [],
	customValues: {},

	// functions
	_parseXmlId : function(xmlId){
		var parts = xmlId.split('-');

		var uid = {
			id 	: 		parts[0],
			type: 		parts[1],
			index1: 	parts[2],
			index2: 	parts[3],
			};
				
		return uid;
	},	
	
	addColumn : function(field, position) {
		console.log("adding column " + field.fieldId + " at index " + position);
		this.fieldDefinitions.splice(position, 0, field);
	},	
	
	removeColumn : function(position) {
		console.log("removing column at index " + position);
		var removedColumn = this.fieldDefinitions.splice(position, 1);
		return removedColumn[0];
	},
	
	addGroup : function(group, position) {
		this.groupDefinitions.splice(position, 0, group);
	},
	
	removeGroup : function(field, position) {
		console.log("removing group at index " + position);
		var removedGroup = this.groupDefinitions.splice(position, 1);
		return removedGroup[0];
	},
	
	getElementFormatById: function(xmlId){
			
		var uid = this._parseXmlId(xmlId);

		switch (uid.type){
			case "phd":
				return this.pageHeaders[uid.index2]['format']; 
				break;
			case "pft":
				return this.pageFooters[uid.index2]['format']; 
				break;
			case "rhd":
				return this.reportHeaders[uid.index2]['format']; 
				break;
			case "rft":
				return this.reportFooters[uid.index2]['format']; 
				break;
			case "ghd":
				return this.groupDefinitions[uid.index1]['headerFormat'];
				break;
			case "gft":
				return this.groupDefinitions[uid.index1]['footerFormat'];
				break;
			case "dth":
				return this.fieldDefinitions[uid.index2]['headerFormat'];
				break;
			case "dtl":
				return this.fieldDefinitions[uid.index2][{rowGrp:null,colGrp:null}]; //?
				break;

			//where did that come from in the old model	
			case "sum":
				return this.fieldDefinitions[uid.index2]['fieldFormat'];
				break;					
		}
				
	},

	addChart: function(position, url){},			
						
	removeChart: function(position){},	

	getValueById: function(uid){},
	
	//puts an edited stringvalue or message into a Label or a fieldname if it is a columnheader
	setValueById: function(xmlId, value){
	
		var uid = this._parseXmlId(xmlId);
		//TODO
		/*
			switch (uid.type){
			case "phd":
				this.pageHeaders[uid.index2].format[property] = value;
				break;
			case "pft":
				this.pageFooters[uid.index2].format[property] = value;
				break;
			case "rhd":
				this.reportTitles[uid.index2].format[property] = value;;
				break;
			case "rft":
				this.reportFooters[uid.index2].format[property] = value;
				break;
			case "ghd":
				this.tableDefinition').groups[uid.index1].headerFormat[property] = value;
				break;
			case "gft":
				this.tableDefinition').groups[uid.index1].footerFormat[property] = value;
				break;
			case "dth":
				this.tableDefinition').columns[uid.index2].headerFormat[property] = value;
				break;
			case "dtl":
				this.tableDefinition').columns[uid.index2].fieldFormat[property] = value;
				break;
			case "sum":
				this.tableDefinition').columns[uid.index2].fieldFormat[property] = value;
				break;					
		}
		*/
	},
	
	setElementFormatPropertyById: function(xmlId, property, value){

		var uid = this._parseXmlId(xmlId);

		switch (uid.type){
			case "phd":
				if(!this.pageHeaders[uid.index2]) this.pageHeaders[uid.index2] = _.extend({},Label);
				this.pageHeaders[uid.index2]['format'][property] = value;
				break;
			case "pft":
				if(!this.pageFooters[uid.index2]) this.pageFooters[uid.index2] = _.extend({},Label);
				this.pageFooters[uid.index2]['format'][property] = value;
				break;
			case "rhd":
				if(!this.reportTitles[uid.index2]) this.reportHeaders[uid.index2] = _.extend({},Label);
				this.reportTitles[uid.index2]['format'][property] = value;;
				break;
			case "rft":
				if(!this.reportFooters[uid.index2]) this.reportFooters[uid.index2] = _.extend({},Label);
				this.reportFooters[uid.index2]['format'][property] = value;
				break;
			case "ghd":
				this.tableDefinition.groups[uid.index1]['headerFormat'][property] = value;
				break;
			case "gft":
				this.tableDefinition.groups[uid.index1]['footerFormat'][property] = value;
				break;
			case "dth":
				this.tableDefinition.columns[uid.index2]['headerFormat'][property] = value;
				break;
			case "dtl":
				this.tableDefinition.columns[uid.index2]['fieldFormat'][property] = value;
				break;
			case "sum":
				this.tableDefinition.columns[uid.index2]['fieldFormat'][property] = value;
				break;					
		}
		
	},
	
};
saiku.report.ReportSpecification = _.extend({}, ReportSpecification);

}());
