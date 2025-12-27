// 1. Connexion Supabase
const SUPABASE_URL = "https://nlvnvwttxgtzibejdpos.supabase.co";
const SUPABASE_KEY = "sb_publishable_am3sB4P7I6vgOoP-tmNtcg_yAXFpaVk";
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Configuration de la Carte
const mapWidth = 4000;  // Largeur de ton image
const mapHeight = 4000; // Hauteur de ton image
const bounds = [[0, 0], [mapHeight, mapWidth]];

const map = L.map('map', {
    crs: L.CRS.Simple,
    minZoom: -2,
    maxZoom: 2,
    maxBounds: bounds,
    maxBoundsViscosity: 1.0
});

// Chargement de l'image maps.png
L.imageOverlay('maps.png', bounds, { noWrap: true }).addTo(map);
map.fitBounds(bounds);

// Configuration des outils de dessin (Geoman)
map.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawRectangle: false,
    drawPolyline: false,
    drawMarker: false,
    drawCircleMarker: false
});

let tempLayer;

// Quand on finit de dessiner une zone
map.on('pm:create', (e) => {
    tempLayer = e.layer;
    document.getElementById('adminModal').style.display = 'block';
});

// Enregistrer la zone dans Supabase
document.getElementById('saveZone').onclick = async () => {
    const name = document.getElementById('zoneName').value;
    const owner = document.getElementById('zoneOwner').value;
    const color = document.getElementById('zoneColor').value;
    const coordinates = tempLayer.getLatLngs()[0]; // Récupère les points du polygone

    const { data, error } = await supabaseClient
        .from('zones') // Nom de ta table Supabase
        .insert([{ name, owner, color, coordinates }]);

    if (error) {
        alert("Erreur lors de l'enregistrement : " + error.message);
    } else {
        location.reload(); // Rafraîchit pour afficher la zone
    }
};

// Charger les zones depuis Supabase au démarrage
async function loadZones() {
    const { data: zones, error } = await supabaseClient
        .from('zones')
        .select('*');

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

// Bouton Annuler
document.getElementById('cancelZone').onclick = () => {
    map.removeLayer(tempLayer);
    document.getElementById('adminModal').style.display = 'none';
};

// Lancement du chargement
loadZones();
