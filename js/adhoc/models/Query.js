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
        _.bindAll(this, "run", "move_dimension", "reflect_properties");
        
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

    run: function(force) {
    	/*
        if (! this.properties.properties['saiku.adhoc.query.automatic_execution'] &&
            ! force) {
            return;
        }
		*/
		var self = this;
		
		var columns = $(this.workspace.el).find('.columns ul li.d_dimension'); 
		
		if (columns.size() == 0) {
			var message = '<tr><td><span class="i18n">You need to select at least one (non-calculated) Column for a valid query.</td></tr>';
            $(this.workspace.el).find('.report_inner')
                .html(message);
            $(this.workspace.el).find('.workspace_results div')
                .html(message);   
            return;
        }
		
		var mqlQueryString = this.workspace.metadataQuery.toXml();

		this.workspace.reportSpec.dataSource = new saiku.report.Datasource({id: "master" , properties: {queryString:mqlQueryString}});

		var that = this;

				if(!that.reportPerspective){
					Application.ui.block("Rendering Table");
					that.result.fetch( {error: 
						function(model, response){
							self.error = new ClientError({ query: self, message: response.responseText});
							self.workspace.reset_canvas();
							self.workspace.trigger('FSM:ETableError');			
							Application.ui.unblock();
						}});
				}else{
					Application.ui.block("Rendering Report");
					that.reportresult.fetch({error: 
						function(model, response){
							self.error = new ClientError({ query: self, message: response.responseText});
							self.workspace.reset_canvas();
							self.workspace.trigger('FSM:EReportError');
							Application.ui.unblock();
						}
					});		
				}
   },
    
    move_dimension: function(dimension, $target_el, indexFrom, index) {
        $(this.workspace.el).find('.run').removeClass('disabled_toolbar');
        
        var target = '';
        if ($target_el.hasClass('columns')) target = "COLUMNS";
        if ($target_el.hasClass('group')) target = "GROUP";
        if ($target_el.hasClass('filter')) target = "FILTER";

		//dirty
		var fieldInfo = dimension.split('/');
      	var domainId = this.workspace.query.attributes.domainId;
      	var modelId = this.workspace.query.attributes.modelId;
      	var model = Application.session.mdModels[domainId + "/" + modelId];
      	var categoryId = fieldInfo[1];
      	var columnId = fieldInfo[3]
		var mc = model.getColumnById(categoryId,columnId);

		var selection = {table:categoryId, column:columnId};
/*
if(index===-1){
remove the column
}
*/
		switch(target){
			case "COLUMNS":
				var field = new saiku.report.FieldDefinition({fieldId: mc.id, fieldName: mc.name, fieldDescription: mc.description});
				if(indexFrom)
				{
					field = this.workspace.reportSpec.removeColumn(indexFrom);
				}	
				this.workspace.reportSpec.addColumn(field, index);
				this.workspace.metadataQuery.addSelection(selection);
				break;
			case "GROUP":
				var group = new saiku.report.GroupDefinition({fieldId: mc.id, groupName: mc.id, type: GroupType.RELATIONAL});				
				if(indexFrom)
				{
					group = this.workspace.reportSpec.removeGroup(indexFrom);
				}	
				this.workspace.reportSpec.addGroup(group, index);
				this.workspace.metadataQuery.addSelection(selection);
				break;
			case "FILTER":
				//var field = new saiku.report.DataField({fieldId: fieldId});		
				//break;
		}
		
		this.run();
	
    },
    
    url: function() {
        return encodeURI(Settings.REST_URL + "/query/" + this.uuid);
    }
});
