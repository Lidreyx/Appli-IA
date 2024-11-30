document.getElementById('uploadBtn').addEventListener('click', function() {
    const subscriptionKey = document.getElementById('subscriptionKey').value; // Permet de récupérer la clé API
    const endpoint = document.getElementById('endpoint').value;               // Permet de récupérer le lien du Endpoint
    if (!subscriptionKey || !endpoint) {
        alert("Veuillez renseigner à la fois votre API et l'endpoint.");
        return;
    }

    const imageInput = document.getElementById('imageInput');
    const file = imageInput.files[0];

    if (!file) {
        alert("Veuillez choisir une image.");
        return;
    }

    AffichageImage(file);     // Afficher l'image dans la prévisualisation
    const analyseUrl =`${endpoint}/vision/v3.2/detect`;
    analyzeImage(file, analyseUrl, subscriptionKey); // Pour appeler la fonction d'analyse
});

function AffichageImage(file) {
    const Imageprev = document.getElementById('Imageprev');
    const reader = new FileReader();
    reader.onload = function(event) {
        Imageprev.src = event.target.result; // Change l'url de l'image
        Imageprev.style.display = 'block';   // Affiche l'image
    };
    reader.readAsDataURL(file);  // Lit l'image comme une Data URL
}
function analyzeImage(file, analyseUrl, subscriptionKey) {   // Fonction pour analyser l'image en l'envoyant à l'API Azure
    const reader = new FileReader();
    reader.onloadend = function() {
        const arrayBuffer = reader.result;

        fetch(analyseUrl, {     // Envoie les données à l'API Azure
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
            console.error("Erreur lors de l'analyse de l'image:", error);
            display_error(error.message);
        });
    };
    reader.readAsArrayBuffer(file);
}

function display_output(data) {  // Sert à afficher les résultats
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = '';

    if (data.objects && data.objects.length > 0) {
        data.objects.forEach((obj, index) => {
            const objectText = `Object ${index + 1}: ${obj.object} (Confidence: ${(obj.confidence * 100).toFixed(2)}%)\n`;
            resultDiv.textContent += objectText;
        });
    } else {
        resultDiv.textContent = "Pas d'objet détecté.";
    }
}

function display_error(message) {   // Fonction qui affiche une erreur
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = `Error: ${message}`;
}
