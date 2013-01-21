/*
 * SelectionsModal.js
 * aa
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
 * Dialog for member selections
 */
var SimpleFilterDialog = Modal.extend({
    type: "simpleFilterDialog",
    
    buttons: [
        { text: "Save", method: "save" },
        { text: "Cancel", method: "close" }
    ],
    
    events: {
        'click a': 'call',
    },
    
    initialize: function(args) {
        // Initialize properties
        _.extend(this, args);

        this.workspace = args.workspace;
        this.filterModel = args.filterModel;
        this.query = args.workspace.query;

        this.options.title = "Filter on " + this.filterModel.columnMeta.name;
        this.message = "Fetching values...";
        this.show_unique = false;

        _.bindAll(this, "populate", "finished");

        // Resize when rendered
        this.bind('open', this.post_render);
        this.render();

        this.populate();
    },

    populate: function(model, response) {

        var template = _.template($("#template-filter-dialog").html())(this); 

        if(this.filterModel.columnMeta.type == "STRING"){
            //create query and fetch values through cda
        }

        $(this.el).find('.dialog_body').html(template);

        var filterRow = new FilterRow({ el: $(this.el).find('.simple_filter_row') ,
            workspace: this.workspace, filterModel: this.filterModel});
        
        //$(this.el).find('.select_from_list').hide();

        //wenn kein STRINGFELD dann verstecke die multiselect box
        this.switch_multiselect();
        // Show dialog
        Application.ui.unblock();
    },
    
    post_render: function(args) {
        $(args.modal.el).parents('.ui-dialog').css({ width: "800px" });
    	this.center();
    },

    switch_multiselect: function(){
        $(this.el).find('.filter_selection').addClass('selected');
        $(this.el).find('.filter_expression').removeClass('selected');
        $(this.el).find('.select_from_list').show();
        $(this.el).find('.simple_filter_row').hide();
    },

    switch_expression: function(){
        $(this.el).find('.filter_selection').removeClass('selected');
        $(this.el).find('.filter_expression').addClass('selected');
        $(this.el).find('.select_from_list').hide();
        $(this.el).find('.simple_filter_row').show();
    },

    save: function() {
        // Notify user that updates are in progress
        var $loading = $("<div>Saving...</div>");
        $(this.el).find('.dialog_body').children().hide();
        $(this.el).find('.dialog_body').prepend($loading);

        this.filterModel.conditionType = $(this.el).find('.op option:selected').val();
        this.filterModel.value = $(this.el).find("input[name=value]").val();

        var constraint = {
            operator: OperatorType.AND,
            condition: FilterController.filterRowToFormula(this.filterModel)
        }

        this.workspace.metadataQuery.setConstraint(constraint, this.filterModel.index);

        this.finished();
    },
    
    finished: function() {
        $(this.el).dialog('destroy').remove();
        this.query.run();
    }
});
