require([
    'DS/WAFData/WAFData',
    'DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices'
], function(WAFData, i3DXCompassPlatformServices) {

    var bomWidget = {
        bomData: [],

        onLoad: function() {
            // Using 'widget.setTitle' and 'widget.setBody' is the standard UWA way
            widget.setTitle("BOM Exporter");
            widget.setBody("Enter a Physical ID to begin.");
        },

        getBOM: function(physicalId) {
            var self = this;
            
            i3DXCompassPlatformServices.getServiceUrl({
                serviceName: '3DSpace',
                onComplete: function(spaceUrl) {
                    var url = spaceUrl + "/resources/v1/modeler/dsprcs/dsprcs:Recipe/" + physicalId + "/dsprcs:Expand";
                    
                    WAFData.authenticatedRequest(url, {
                        method: 'GET',
                        type: 'json',
                        onComplete: function(data) {
                            self.bomData = data.member.map(function(item) {
                                return {
                                    Name: item.title || "No Title",
                                    Revision: item.revision || "-",
                                    Type: item.type || "Part",
                                    Quantity: 1
                                };
                            });
                            self.renderTable();
                        },
                        onFailure: function(error) {
                            // FIXED: Use widget.setBody instead of referencing a raw variable
                            widget.setBody("<p style='color:red;'>Error fetching data: " + error + "</p>");
                        }
                    });
                },
                onFailure: function(error) {
                     widget.setBody("<p style='color:red;'>Error getting service URL:" + error + "</p>");
                }
            });
        },

        renderTable: function() {
            var html = '<div style="padding:10px;">';
            html += '<table style="width:100%; border-collapse: collapse; font-family: sans-serif;">';
            html += '<tr style="background:#3d82e3; color:white;"><th>Name</th><th>Rev</th><th>Qty</th></tr>';
            
            this.bomData.forEach(function(item) {
                html += '<tr>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Name + '</td>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Revision + '</td>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Quantity + '</td>';
                html += '</tr>';
            });
            
            html += '</table>';
            html += '<br><button id="csvBtn" style="padding:10px; cursor:pointer;">Download CSV</button>';
            html += '</div>';
            
            // FIXED: Standard UWA method to update content
            widget.setBody(html);

            var self = this;
            document.getElementById('csvBtn').addEventListener('click', function() {
                self.downloadCSV();
            });
        },

        downloadCSV: function() {
            var csvContent = "Name,Revision,Type,Quantity\n";
            this.bomData.forEach(function(row) {
                csvContent += row.Name + "," + row.Revision + "," + row.Type + "," + row.Quantity + "\n";
            });

            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "BOM_Export.csv");
            link.click();
            URL.revokeObjectURL(url);
        }
    };

    // Initialize the widget events
    widget.addEvent('onLoad', bomWidget.onLoad);
    widget.addEvent('onRefresh', bomWidget.onLoad);
});
