/*
 * Query.js
 * 
 * Copyright (c) 2011, Marius Giepz, OSBI Ltd. All rights reserved.
 *
 * This library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston,
 * MA 02110-1301  USA
 */
/**
 * Workspace query
 */
var Query = Backbone.Model.extend({
    initialize: function(args, options) {
    	
    	_.extend(this, options);
        
        // Bind `this`
        _.bindAll(this, "run", "move_dimension", "reflect_properties","build_sorts");
        
        // Generate a unique query id
        this.uuid = 'xxxxxxxx-xxxx-xxxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, 
            function (c) {
                var r = Math.random() * 16 | 0,
                v = c == 'x' ? r : (r & 0x3 | 0x8);
                return v.toString(16);
            }).toUpperCase();
            
            
        this.reportPerspective = true;

        this.action = new QueryAction({}, { query: this });
        this.result = new Result({}, { query: this });
        this.selectedModel = Application.session.mdModels[this.attributes.domainId + "/" + this.attributes.modelId];

        this.reportresult = new ReportResult({}, { query: this });
        this.inplace = new InplaceEdit({}, { query: this });

    },
    
    parse: function(response) {

    	 // Fetch initial properties from server
        if (! this.properties) {
            this.properties = new Properties({}, { query: this });
        } else {
            this.properties.fetch({
                success: this.reflect_properties
            });
        }
       
    },
    
    reflect_properties: function() {
        this.workspace.trigger('properties:loaded');
    },

    build_sorts: function($items){
		var that = this;

    	$items.each(
			function(){
				var fieldInfo = $(this).find('.dimension').attr('href').split('/');
				var categoryId = fieldInfo[1];
				var columnId = fieldInfo[3]

				var $span = $(this).find('span.sort');
				if($span.length !== 0){
					if($span.hasClass('asc')){
						var sort =  {view_id:categoryId, column_id:columnId, direction: SortType.ASC};
						that.workspace.metadataQuery.config.mql.orders.push(sort);
					}else if($span.hasClass('desc')){
						var sort =  {view_id:categoryId, column_id:columnId, direction: SortType.DESC};
						that.workspace.metadataQuery.config.mql.orders.push(sort);
					}
				}
		});
    },

    run: function(force) {

    	var that = this;
 
		//Rebuild sorting:
		this.workspace.metadataQuery.config.mql.orders = [];

		var $measures  = $(this.workspace.el).find('.measures ul li.d_dimension'); 
		var $relgroups = $(this.workspace.el).find('.relgroups ul li.d_dimension'); 		
		var $colgroups = $(this.workspace.el).find('.colgroups ul li.d_dimension'); 
		var $rowgroups = $(this.workspace.el).find('.rowgroups ul li.d_dimension'); 

		if(Settings.MODE==='crosstab'){
				this.build_sorts($rowgroups);
				this.build_sorts($colgroups);
				this.build_sorts($measures);
		}else{
				this.build_sorts($relgroups);
				this.build_sorts($measures);
		}

		if ($measures.size() == 0) {
			var message = '<tr><td><span class="i18n">You need to select at least one (non-calculated) Column for a valid query.</td></tr>';
            $(this.workspace.el).find('.report_inner')
                .html(message);
            $(this.workspace.el).find('.workspace_results div')
                .html(message);   
            return;
        }
	
		var mqlQueryString = this.workspace.metadataQuery.toXml();

		this.workspace.reportSpec.dataSource = new saiku.report.Datasource({id: "master" , type: DatasourceType.CDA,  properties: {queryString:mqlQueryString}});

		

				if(!that.reportPerspective){
					Application.ui.block("Rendering Table");
					that.result.fetch( {error: 
						function(model, response){
							that.error = new ClientError({ query: self, message: response.responseText});
							that.workspace.reset_canvas();
							that.workspace.trigger('FSM:ETableError');			
							Application.ui.unblock();
						}});
				}else{
					Application.ui.block("Rendering Report");
					that.reportresult.fetch({error: 
						function(model, response){
							that.error = new ClientError({ query: self, message: response.responseText});
							that.workspace.reset_canvas();
							that.workspace.trigger('FSM:EReportError');
							Application.ui.unblock();
						}
					});		
				}
   },
    
   move_dimension: function(dimension, $target_el, indexFrom, index) {
   	$(this.workspace.el).find('.run').removeClass('disabled_toolbar');

   	var target = '';
   	if ($target_el.hasClass('measures')) target = "MEASURES";
   	if ($target_el.hasClass('relgroups')) target = "REL_GROUPS";
   	if ($target_el.hasClass('colgroups')) target = "COL_GROUPS";
   	if ($target_el.hasClass('rowgroups')) target = "ROW_GROUPS";
   	if ($target_el.hasClass('filters')) target = "FILTERS";

	//dirty
	var fieldInfo = dimension.split('/');
	var categoryId = fieldInfo[1];
	var columnId = fieldInfo[3]
	var mc = this.selectedModel.getColumnById(categoryId,columnId);

	var selection = {table:categoryId, column:columnId, aggregation: mc.defaultAggType};
//	var sort =  {view_id:categoryId, column_id:columnId};

	if(Settings.MODE==='crosstab'){
		switch(target){
			case "MEASURES":
			var field = new saiku.report.FieldDefinition({
				fieldId: mc.id, 
				fieldName: mc.name, 
				fieldDescription: mc.description,
			aggregationFunction : "GROUPSUM"
		}
				);

			if(indexFrom)
			{
				field = this.workspace.reportSpec.removeColumn(indexFrom);
			}	
			this.workspace.reportSpec.addColumn(field, index);
			this.workspace.metadataQuery.addSelection(selection);
			break;

			case "ROW_GROUPS":
			var group = new saiku.report.GroupDefinition({
				fieldId: mc.id, 
				groupName: mc.id, 
				type: GroupType.CT_ROW,
				displayName: mc.name,
				printSummary: true}
				);	

			if(indexFrom)
			{
				group = this.workspace.reportSpec.removeGroup(indexFrom);
			}	
			this.workspace.reportSpec.addGroup(group, index);
			this.workspace.metadataQuery.addSelection(selection);
			//this.workspace.metadataQuery.addSort(sort,index);
			break;

			case "COL_GROUPS":
			var group = new saiku.report.GroupDefinition({
				fieldId: mc.id, 
				groupName: mc.id, 
				type: GroupType.CT_COLUMN,
				displayName: mc.name,
				printSummary: true}
				);	

			if(indexFrom)
			{
				group = this.workspace.reportSpec.removeGroup(indexFrom);
			}	
			this.workspace.reportSpec.addGroup(group, index);
			this.workspace.metadataQuery.addSelection(selection);
//			this.workspace.metadataQuery.addSort(sort,index);
			break;
			}
		}
		else{
			switch(target){
				case "MEASURES":
				var field = new saiku.report.FieldDefinition({fieldId: mc.id, fieldName: mc.name, fieldDescription: mc.description});
				if(indexFrom)
				{
					field = this.workspace.reportSpec.removeColumn(indexFrom);
				}	
				this.workspace.reportSpec.addColumn(field, index);
				this.workspace.metadataQuery.addSelection(selection);
				break;
				case "REL_GROUPS":
				var group = new saiku.report.GroupDefinition({
				fieldId: mc.id, 
				groupName: mc.id, 
				type: GroupType.RELATIONAL,
				displayName: mc.name,
				printSummary: true}
				);				
				if(indexFrom)
				{
					group = this.workspace.reportSpec.removeGroup(indexFrom);
				}	
				this.workspace.reportSpec.addGroup(group, index);
				this.workspace.metadataQuery.addSelection(selection);
				break;
				case "FILTERS":
				//var field = new saiku.report.DataField({fieldId: fieldId});		
				//break;
			}	
		}


		this.run();

	},

    remove_dimension: function(target, indexFrom){
    	switch(target){
			case "MEASURES":
				this.workspace.reportSpec.removeColumn(indexFrom);
				this.workspace.metadataQuery.removeSelection(indexFrom);
				break;
			case "FILTERS":
				//var field = new saiku.report.DataField({fieldId: fieldId});		
				//break;
			default:
				this.workspace.reportSpec.removeGroup(indexFrom);	
		}
		this.run();
    },
    
    url: function() {
        return encodeURI(Settings.REST_URL + "/query/" + this.uuid);
    }
});
