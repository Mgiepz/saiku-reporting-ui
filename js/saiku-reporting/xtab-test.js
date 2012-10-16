var testmodel = {
    "reportHeaders": [],
    "pageHeaders": [],
    "pageFooters": [],
    "reportFooters": [],
    "pageSetup": null,
    "tableDefinition": {
        "groups": [{
            "type": "CT_COLUMN",
            "dataFormat": null,
            "nullString": null,
            "displayName": null,
            "fieldId": "BC_CUSTOMER_W_TER_TERRITORY",
            "groupName": "BC_CUSTOMER_W_TER_TERRITORY",
            "headerFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            },
            "footerFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            }
        }, {
            "type": "CT_ROW",
            "dataFormat": null,
            "nullString": null,
            "displayName": null,
            "fieldId": "BC_ORDERS_STATUS",
            "groupName": "BC_ORDERS_STATUS",
            "headerFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            },
            "footerFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            }
        }],
        "columns": [{
            "fieldId": "BC_ORDERDETAILS_PRICEEACH",
            "fieldName": null,
            "fieldDescription": null,
            "dataFormat": null,
            "nullString": null,
            "headerFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            },
            "fieldFormat": {
                "fontName": null,
                "fontBold": null,
                "fontItalic": null,
                "fontUnderline": null,
                "fontStrikethrough": null,
                "fontSize": null,
                "fontColor": null,
                "backgroundColor": null,
                "leftPadding": null,
                "rightPadding": null,
                "horizontalAlignment": null,
                "verticalAlignment": null,
                "width": null
            },
            "aggregationFunction": "NONE",
            "hideOnReport": false,
            "hideRepeating": false
        }],
        "detailsFooterBand": {},
        "detailsHeaderBand": {}
    },
    "parameters": [],
    "charts": [],
    "dataSource": {
        "id": "master",
        "type": "METADATA",
        "properties": {
            "queryString": "<mql><domain_type>relational</domain_type><domain_id>steel-wheels/metadata.xmi</domain_id><model_id>BV_ORDERS</model_id><options><disable_distinct>false</disable_distinct></options><parameters></parameters><selections><selection><view>CAT_ORDERS</view><column>BC_ORDERDETAILS_PRICEEACH</column><aggregation>NONE</aggregation></selection></selections><constraints></constraints><orders><order><direction>ASC</direction><view_id>CAT_ORDERS</view_id><column_id>BC_ORDERDETAILS_PRICEEACH</column_id></order></orders></mql>"
        }
    },
    "reportName": "wupdi"
}