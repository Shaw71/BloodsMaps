// 1. Connexion Supabase
const SUPABASE_URL = "https://nlvnvwttxgtzibejdpos.supabase.co";
const SUPABASE_KEY = "sb_publishable_am3sB4P7I6vgOoP-tmNtcg_yAXFpaVk"; 
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Configuration de la Carte
const mapWidth = 4000;
const mapHeight = 4000;
const bounds = [[0, 0], [mapHeight, mapWidth]];

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
});

L.imageOverlay('maps.png', bounds, { noWrap: true }).addTo(map);
map.fitBounds(bounds);

map.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawRectangle: false,
    drawPolyline: false,
    drawMarker: false,
    drawCircleMarker: false
});

let tempLayer;

map.on('pm:create', (e) => {
    tempLayer = e.layer;
    document.getElementById('adminModal').style.display = 'block';
});

// 3. SAUVEGARDER
document.getElementById('saveZone').onclick = async () => {
    const name = document.getElementById('zoneName').value;
    const owner = document.getElementById('zoneOwner').value;
    const color = document.getElementById('zoneColor').value;
    const coordinates = tempLayer.getLatLngs()[0];

    console.log("Tentative d'envoi vers Supabase...");

    const { data, error } = await supabaseClient
        .from('zones') // Supabase cherche automatiquement dans le schéma public
        .insert([{ name, owner, color, coordinates }]);

    if (error) {
        console.error("Détails de l'erreur:", error);
        alert("Erreur Supabase : " + error.message + "\nAssure-toi d'avoir créé la table dans le SQL Editor !");
    } else {
        console.log("Zone enregistrée avec succès !");
        location.reload();
    }
};

// 4. CHARGER
async function loadZones() {
    const { data: zones, error } = await supabaseClient
        .from('zones')
        .select('*');

    if (error) {
        console.error("Erreur de chargement:", error.message);
        return;
    }

    if (zones) {
        zones.forEach(zone => {
            L.polygon(zone.coordinates, {
                color: zone.color,
                fillColor: zone.color,
                fillOpacity: 0.4,
                weight: 2
            })
            .addTo(map)
            .bindPopup(`<b>Territoire :</b> ${zone.name}<br><b>Gérant :</b> ${zone.owner}`);
        });
    }
}

document.getElementById('cancelZone').onclick = () => {
    map.removeLayer(tempLayer);
    document.getElementById('adminModal').style.display = 'none';
};

loadZones();
