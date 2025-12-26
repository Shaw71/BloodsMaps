const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -3,
    maxZoom: 2
});

const bounds = [[0, 0], [8192, 8192]]; 
L.tileLayer('map.jpg', {
    noWrap: true,
    bounds: bounds
}).addTo(map);

map.fitBounds(bounds);

// Outils de dessin Geoman
map.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawMarker: false,
    drawRectangle: false,
    drawPolyline: false
});

let tempLayer;

// Quand on finit de dessiner
map.on('pm:create', (e) => {
    tempLayer = e.layer;
    document.getElementById('adminModal').style.display = 'block';
});

// Enregistrer la zone
document.getElementById('saveZone').onclick = async () => {
    const zoneData = {
        name: document.getElementById('zoneName').value,
        owner: document.getElementById('zoneOwner').value,
        color: document.getElementById('zoneColor').value,
        coordinates: tempLayer.getLatLngs()[0]
    };

    const response = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
    });

    if (response.ok) {
        document.getElementById('adminModal').style.display = 'none';
        location.reload(); // Recharge la carte pour afficher la nouvelle zone
    }
};

// Charger les zones au démarrage
async function loadZones() {
    const res = await fetch('/api/zones');
    const zones = await res.json();
    
    zones.forEach(zone => {
        L.polygon(zone.coordinates, {
            color: zone.color,
            fillColor: zone.color,
            fillOpacity: 0.4
        }).addTo(map).bindPopup(`<b>${zone.name}</b><br>Gérant: ${zone.owner}`);
    });
}

document.getElementById('cancelZone').onclick = () => {
    map.removeLayer(tempLayer);
    document.getElementById('adminModal').style.display = 'none';
};

loadZones();
