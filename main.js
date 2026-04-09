require([
    'DS/WAFData/WAFData',
    'DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices'
], function(WAFData, i3DXCompassPlatformServices) {

    var bomWidget = {
        bomData: [],

        onLoad: function() {
            // Initial setup - you could fetch the Security Context here if needed
            console.log("Widget Loaded");
        },

        // 1. Fetch the BOM
        getBOM: function(physicalId) {
            var self = this;
            
            i3DXCompassPlatformServices.getServiceUrl({
                serviceName: '3DSpace',
                onComplete: function(spaceUrl) {
                    // Endpoint for Expanding a Product Structure
                    var url = spaceUrl + "/resources/v1/modeler/dsprcs/dsprcs:Recipe/" + physicalId + "/dsprcs:Expand";
                    
                    WAFData.authenticatedRequest(url, {
                        method: 'GET',
                        type: 'json',
                        headers: {
                            // Optional: 'SecurityContext': 'VPLMProjectLeader.MyCompany.Common'
                        },
                        onComplete: function(data) {
                            // 2. Parse and simplify the response
                            self.bomData = data.member.map(function(item) {
                                return {
                                    Name: item.title || "No Title",
                                    Revision: item.revision || "-",
                                    Type: item.type || "Part",
                                    Quantity: 1 // Default for simplified view
                                };
                            });
                            // 3. Call the missing render function
                            self.renderTable();
                        },
                        onFailure: function(error) {
                            widget.body.innerHTML = "<p style='color:red;'>Error: " + error + "</p>";
                        }
                    });
                }
            });
        },

        // The Missing Render Function
        renderTable: function() {
            var html = '<table style="width:100%; border-collapse: collapse;">';
            html += '<tr style="background:#eee;"><th>Name</th><th>Rev</th><th>Qty</th></tr>';
            
            this.bomData.forEach(function(item) {
                html += '<tr>';
                html += '<td style="border-bottom:1px solid #ccc;">' + item.Name + '</td>';
                html += '<td style="border-bottom:1px solid #ccc;">' + item.Revision + '</td>';
                html += '<td style="border-bottom:1px solid #ccc;">' + item.Quantity + '</td>';
                html += '</tr>';
            });
            
            html += '</table>';
            html += '<br><button id="csvBtn" class="btn btn-primary">Download CSV</button>';
            
            widget.body.innerHTML = html;

            // Attach event listener to the new button
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
        }
    };

    widget.addEvent('onLoad', bomWidget.onLoad);
    // Expose for testing/console use if needed
    window.bomWidget = bomWidget;
});
