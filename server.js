const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const DATA_FILE = path.join(__dirname, 'zones.json');

app.use(cors());
app.use(express.json());
// Sert les fichiers HTML/CSS/JS du dossier "public"
app.use(express.static(path.join(__dirname, 'public')));

// Vérifie si le fichier JSON existe, sinon le crée vide
if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
}

// Route pour récupérer les zones
app.get('/api/zones', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Erreur de lecture");
        res.json(JSON.parse(data));
    });
});

// Route pour enregistrer une zone
app.post('/api/zones', (req, res) => {
    fs.readFile(DATA_FILE, 'utf8', (err, data) => {
        if (err) return res.status(500).send("Erreur de lecture");
        
        const zones = JSON.parse(data);
        zones.push(req.body); // Ajoute la nouvelle zone reçue du front
        
        fs.writeFile(DATA_FILE, JSON.stringify(zones, null, 2), (err) => {
            if (err) return res.status(500).send("Erreur d'écriture");
            res.status(201).json({ message: "Zone enregistrée !" });
        });
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Serveur lancé sur http://localhost:${PORT}`));
