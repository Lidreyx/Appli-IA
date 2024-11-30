// Fonction appelée lorsque le bouton "Upload and Identify" est cliqué
document.getElementById('uploadBtn').addEventListener('click', function() {
    const subscriptionKey = document.getElementById('subscriptionKey').value; // Récupère la clé d'abonnement
    const endpoint = document.getElementById('endpoint').value;               // Récupère l'URL de l'endpoint

    if (!subscriptionKey || !endpoint) {
        alert("Please provide both the subscription key and the endpoint.");
        return;
    }

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];
    
    if (!file) {
        alert("Please select an image first.");
        return;
    }

    // Afficher l'image dans la prévisualisation
    previewImage(file);

    const analyzeUrl = `${endpoint}/vision/v3.2/detect`;
    analyzeImage(file, analyzeUrl, subscriptionKey); // Appelle la fonction d'analyse avec les nouvelles valeurs
});

// Fonction pour afficher l'image chargée
function previewImage(file) {
    const imagePreview = document.getElementById('imagePreview');
    const reader = new FileReader();
    reader.onload = function(event) {
        imagePreview.src = event.target.result; // Met à jour l'URL de l'image
        imagePreview.style.display = 'block';   // Affiche l'image
    };
    reader.readAsDataURL(file);  // Lire l'image en tant que Data URL
}

// Fonction pour analyser l'image en envoyant le fichier directement à l'API Azure
function analyzeImage(file, analyzeUrl, subscriptionKey) {
    const reader = new FileReader();
    reader.onloadend = function() {
        const arrayBuffer = reader.result;

        // Envoie les données binaires à l'API Azure
        fetch(analyzeUrl, {
            method: 'POST',
            headers: {
                'Ocp-Apim-Subscription-Key': subscriptionKey,
                'Content-Type': 'application/octet-stream'
            },
            body: arrayBuffer
        })
        .then(response => response.json())
        .then(data => {
            console.log("Azure Response Data:", data);
            display_output(data); // Affiche les résultats
        })
        .catch(error => {
            console.error('Error in analyzing the image:', error);
            display_error(error.message);
        });
    };
    reader.readAsArrayBuffer(file); // Lire le fichier en tant qu'ArrayBuffer
}

// Fonction pour afficher les résultats
function display_output(data) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = ''; // Réinitialise le contenu

    if (data.objects && data.objects.length > 0) {
        data.objects.forEach((obj, index) => {
            const objectText = `Object ${index + 1}: ${obj.object} (Confidence: ${(obj.confidence * 100).toFixed(2)}%)\n`;
            resultDiv.textContent += objectText;
        });
    } else {
        resultDiv.textContent = "No objects detected.";
    }
}

// Fonction pour afficher les erreurs
function display_error(message) {
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Error: ${message}`;
}
