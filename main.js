require([
    'DS/WAFData/WAFData',
    'DS/i3DXCompassPlatformServices/i3DXCompassPlatformServices'
], function(WAFData, i3DXCompassPlatformServices) {

    var bomWidget = {
        bomData: [], // Store data for CSV export

        // 1. Get the BOM from 3DSpace
        getBOM: function(physicalId, spaceUrl) {
            // Standard Product Structure Expand API
            var url = spaceUrl + "/resources/v1/modeler/dsprcs/dsprcs:Recipe/" + physicalId + "/dsprcs:Expand";
            
            WAFData.authenticatedRequest(url, {
                method: 'GET',
                onComplete: function(response) {
                    var data = JSON.parse(response);
                    bomWidget.bomData = bomWidget.parseBOM(data);
                    bomWidget.renderTable();
                }
            });
        },

        // 2. Simplify the JSON response into a flat array
        parseBOM: function(raw) {
            return raw.member.map(item => ({
                Name: item.title || "N/A",
                Revision: item.revision || "A.1",
                Type: item.type || "Part",
                Quantity: item.quantity || 1
            }));
        },

        // 3. CSV Conversion and Download
        downloadCSV: function() {
            if (this.bomData.length === 0) return alert("No data to export");

            // Create CSV Header
            var csvContent = "Name,Revision,Type,Quantity\n";
            
            // Add Rows
            this.bomData.forEach(function(row) {
                csvContent += `${row.Name},${row.Revision},${row.Type},${row.Quantity}\n`;
            });

            // Trigger Download
            var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            var link = document.createElement("a");
            var url = URL.createObjectURL(blob);
            
            link.setAttribute("href", url);
            link.setAttribute("download", "BOM_Export.csv");
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    };
});
