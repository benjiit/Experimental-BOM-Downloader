require([
    'DS/WAFData/WAFData',
    'DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices'
], function(WAFData, i3DXCompassPlatformServices) {

    var bomWidget = {
        bomData: [],

        onLoad: function() {
            widget.setTitle("BOM Exporter");
            // Standard string concatenation instead of template literals
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
                            // Using standard function(item) instead of arrow functions (item =>)
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
                            widget.setBody("<p style='color:red;'>Error fetching data: " + error + "</p>");
                        }
                    });
                }
            });
        },

        renderTable: function() {
            var html = '<div style="padding:10px;">';
            html += '<table style="width:100%; border-collapse: collapse; font-family: sans-serif;">';
            html += '<tr style="background:#3d82e3; color:white;"><th>Name</th><th>Rev</th><th>Qty</th></tr>';
            
            for (var i = 0; i < this.bomData.length; i++) {
                var item = this.bomData[i];
                html += '<tr>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Name + '</td>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Revision + '</td>';
                html += '<td style="border-bottom:1px solid #ccc; padding:8px;">' + item.Quantity + '</td>';
                html += '</tr>';
            }
            
            html += '</table>';
            html += '<br><button id="csvBtn" style="padding:10px; cursor:pointer;">Download CSV</button>';
            html += '</div>';
            
            widget.setBody(html);

            var self = this;
            var btn = document.getElementById('csvBtn');
            if (btn) {
                btn.onclick = function() {
                    self.downloadCSV();
                };
            }
        },

        downloadCSV: function() {
            var csvContent = "Name,Revision,Type,Quantity\n";
            for (var j = 0; j < this.bomData.length; j++) {
                var row = this.bomData[j];
                csvContent += row.Name + "," + row.Revision + "," + row.Type + "," + row.Quantity + "\n";
            }

            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var url = URL.createObjectURL(blob);
            var link = document.createElement("a");
            link.setAttribute("href", url);
            link.setAttribute("download", "BOM_Export.csv");
            link.click();
        }
    };

    widget.addEvent('onLoad', function() { bomWidget.onLoad(); });
});
