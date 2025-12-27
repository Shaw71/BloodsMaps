// 1. Définition des dimensions de ton image (maps.png)
// Ces valeurs définissent ton espace de travail. Tu peux les augmenter si tu veux plus de précision.
const mapWidth = 4000;
const mapHeight = 4000;
const bounds = [[0, 0], [mapHeight, mapWidth]];

// 2. Initialisation de la carte Leaflet
const map = L.map('map', {
    crs: L.CRS.Simple,      // Utilise un système de coordonnées planes (X, Y)
    minZoom: -2,            // Permet de dézoomer pour voir toute l'image
    maxZoom: 2,             // Permet de zoomer pour dessiner précisément
    maxBounds: bounds,      // Empêche de scroller en dehors de l'image
    maxBoundsViscosity: 1.0 // Bloque l'écran sur les bords de l'image
});

// 3. Chargement de l'image maps.png
// L'option 'noWrap: true' est celle qui empêche la répétition de l'image (mosaïque)
L.imageOverlay('maps.png', bounds, {
    noWrap: true
}).addTo(map);

// Ajuste la vue pour que l'image remplisse l'écran au chargement
map.fitBounds(bounds);

// 4. Configuration des outils de dessin (Leaflet-Geoman)
map.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawMarker: false,
    drawPolyline: false,
    drawRectangle: false,
    drawCircleMarker: false,
    cutPolygon: false,
    dragMode: false
});

let tempLayer; // Variable pour stocker temporairement la zone en cours de création

// Événement déclenché quand un polygone est terminé
map.on('pm:create', (e) => {
    tempLayer = e.layer;
    // Affiche la fenêtre (modal) de saisie des informations
    document.getElementById('adminModal').style.display = 'block';
});

// 5. Gestion du bouton "Enregistrer" dans la fenêtre Admin
document.getElementById('saveZone').onclick = async () => {
    const name = document.getElementById('zoneName').value;
    const owner = document.getElementById('zoneOwner').value;
    const color = document.getElementById('zoneColor').value;

    // On prépare les données à envoyer au serveur
    const zoneData = {
        name: name,
        owner: owner,
        color: color,
        coordinates: tempLayer.getLatLngs()[0] // Récupère les points GPS du tracé
    };

    // Envoi au serveur (server.js) qui va l'écrire dans zones.json
    const response = await fetch('/api/zones', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(zoneData)
    });

    if (response.ok) {
        // Cache la fenêtre et recharge la page pour afficher la zone proprement
        document.getElementById('adminModal').style.display = 'none';
        location.reload(); 
    } else {
        alert("Erreur lors de l'enregistrement");
    }
};

// Gestion du bouton "Annuler"
document.getElementById('cancelZone').onclick = () => {
    map.removeLayer(tempLayer); // Supprime le tracé qui n'a pas été enregistré
    document.getElementById('adminModal').style.display = 'none';
};

// 6. Fonction pour charger les zones depuis le fichier JSON au démarrage
async function loadZones() {
    try {
        const res = await fetch('/api/zones');
        const zones = await res.json();
        
        zones.forEach(zone => {
            // Pour chaque zone dans le JSON, on crée un polygone sur la carte
            L.polygon(zone.coordinates, {
                color: zone.color,       // Couleur de la bordure
                fillColor: zone.color,   // Couleur de remplissage
                fillOpacity: 0.5         // Transparence
            })
            .addTo(map)
            .bindPopup(`<b>Zone :</b> ${zone.name}<br><b>Gérant :</b> ${zone.owner}`);
        });
    } catch (e) {
        console.error("Erreur lors du chargement des zones :", e);
    }
}

// Appel de la fonction de chargement
loadZones();
