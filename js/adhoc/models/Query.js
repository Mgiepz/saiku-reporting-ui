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

	buildQuery: function(columns, groups, filters){
	
		//merge columns and groups, they should be of the same type
	
		var domainId = this.attributes.domainId;
		var modelId = this.attributes.modelId;

		var mqlQuery = new saiku.mql.MqlQuery({domainId: domainId.replace("%2F","/"), modelId: modelId});
		
		var model = Application.session.mdModels[domainId + "/" + modelId];

		//selections
		_.each(columns, 
			function(column){
			if(!(column.length === 0)){
				//better tag with real attributes
				var href = $(column).find('a').attr("href");
				var parts = href.split("/");
				var metadataColumn = model.getColumnById(parts[1],parts[3]);
				var selection = new saiku.mql.MqlSelection({
						id: metadataColumn.id, 
						category: metadataColumn.category
				});
				
				mqlQuery.addSelection(selection);
				
				var sorter = $(column).find('span');

				if(!($(sorter).hasClass("asc"))){
					if($(sorter).hasClass("desc")){
						var sort = new saiku.mql.MqlSort({
							column: metadataColumn.id, 
							category: metadataColumn.category,
							orderType : SortType.DESC
						})
						mqlQuery.addSort(sort);
					}
					else{
						var sort = new saiku.mql.MqlSort({
							column: metadataColumn.id, 
							category: metadataColumn.category,
							orderType : SortType.ASC
						})
						mqlQuery.addSort(sort);					
					}
				}
				}
			});

		//filters
		
		//
		
		return mqlQuery;
	
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
		
		var groups = $(this.workspace.el).find('.groups ul li.d_dimension'); 

		var selections = $.merge(columns,groups);
		
		var mqlQuery = this.buildQuery(selections);

		var ds = _.extend({},saiku.report.Datasource, {id: "master" , properties: {queryString:mqlQuery.toXml()}});
		
		this.workspace.reportSpec.dataSource = ds;
	
		var myurl = "/mql";
		var that = this;
		
//		this.action.post(
//			myurl, {data: {mqlQuery: mqlQuery.toXml()},
//			success: function(response) {
//				console.log("mqlQuery saved succesfully");

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
				
//			}
//		});

   },
    
    move_dimension: function(dimension, $target_el, indexFrom, index) {
        $(this.workspace.el).find('.run').removeClass('disabled_toolbar');
        
        var target = '';
        if ($target_el.hasClass('columns')) target = "COLUMNS";
        if ($target_el.hasClass('group')) target = "GROUP";
        if ($target_el.hasClass('filter')) target = "FILTER";
  
        //var url = "/" + target + "/" + dimension + "/POSITION/" + index;

        //var uid = $($target_el.find('li').get(index)).attr('id');

		//dirty
		fieldId = dimension.split('/')[3];
		
		switch(target){
			case "COLUMNS":
				var field = _.extend({},saiku.report.FieldDefinition,{fieldId: fieldId});	
				if(indexFrom)
				{
					field = this.workspace.reportSpec.removeColumn(indexFrom);
				}	
				this.workspace.reportSpec.addColumn(field, index);
				break;
			case "GROUP":
				var group = _.extend({},saiku.report.GrouDefinition, {fieldId: fieldId, groupName: fieldId, type: GroupType.CT_COLUMN});				
				if(indexFrom)
				{
					group = this.workspace.reportSpec.removeGroup(indexFrom);
				}	
				this.workspace.reportSpec.addGroup(group, index);
				break;
			case "FILTER":
				//var field = new saiku.report.DataField({fieldId: fieldId});		
				//break;
		}
		
		this.run();
		
		/* Properties kommen ursprünglich vom server... aber jetzt nichtmehr
         if (this.properties
                .properties['saiku.adhoc.query.automatic_execution'] === 'true' && target != 'FILTER') {
                this.page=null;
                this.run();
         }
		 */
		
    },
    
    url: function() {
        return encodeURI(Settings.REST_URL + "/query/" + this.uuid);
    }
});
