document.addEventListener('DOMContentLoaded', () => {
    // --- 0. BLOQUEO ANTISPAM ---
    if (localStorage.getItem('formularioEnviado') === 'true') {
        document.body.innerHTML = `
            <div style="display:flex; justify-content:center; align-items:center; height:100vh; flex-direction:column; text-align:center; font-family:'Segoe UI', sans-serif; background-color:#fff;">
                <h1 style="color:#ff007f; font-size: 3rem;">¡MUCHAS GRACIAS!</h1>
                <p style="font-size: 1.2rem; color: #333;">Ya hemos recibido tu clasificación correctamente.</p>
                <p style="color: #666;">No se permiten múltiples envíos desde el mismo dispositivo.</p>
            </div>
        `;
        return;
    }

    // --- 1. CONFIGURACIÓN INICIAL ---
    const PUBLIC_KEY = "p14jUpUfIEx6t1GQV"; 
    const SERVICE_ID = "service_6iygf9c";
    const TEMPLATE_ID = "template_etz6pus";

    emailjs.init(PUBLIC_KEY); 

    const sidebar = document.getElementById('sidebar');
    const dropzones = document.querySelectorAll('.column-body'); 
    const sendBtn = document.getElementById('send-btn');

    // --- 2. LÓGICA DE DRAG & DROP (OPTIMIZADA PARA MÓVIL) ---
    const allZones = [sidebar, ...dropzones];

    allZones.forEach(zone => {
        new Sortable(zone, {
            group: 'shared',
            animation: 150,
            ghostClass: 'drag-over',
            delay: 100, 
            delayOnTouchOnly: true, 
            touchStartThreshold: 5, 
            swapThreshold: 0.65, 

            onEnd: () => {
                const cardsRemaining = sidebar.querySelectorAll('.pink-card').length;
                if (cardsRemaining === 0) {
                    sendBtn.style.display = 'block';
                } else {
                    sendBtn.style.display = 'none';
                }
            }
        });
    });

    // --- 3. LÓGICA DE CAPTURA Y ENVÍO (MÁXIMA NITIDEZ) ---
    sendBtn.addEventListener('click', () => {
        // Cambiamos el mensaje para que el usuario sea paciente con la subida
        sendBtn.innerText = "Subiendo imagen HD... espera un momento";
        sendBtn.disabled = true;

        const container = document.getElementById('captura-completa');
        const nameValue = document.querySelector('.name-input').value || "Anónimo";

        // Subimos a 1.5 para que las letras se vean perfectas
        html2canvas(container, { 
            scale: 1.5, 
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true,
            imageTimeout: 0 // Evita que la captura se rinda por falta de tiempo
        }).then(canvas => {
            // Calidad 0.5: Es el punto dulce para que sea nítido y no pese megabytes
            const compressedImg = canvas.toDataURL('image/jpeg', 0.5);

            const templateParams = {
                from_name: nameValue,
                content_img: compressedImg, 
                message: `Clasificación enviada por: ${nameValue}`
            };

            emailjs.send(SERVICE_ID, TEMPLATE_ID, templateParams)
                .then(() => {
                    localStorage.setItem('formularioEnviado', 'true');
                    alert('¡Excelente! Tu clasificación ha sido enviada con éxito.');
                    location.reload(); 
                }, (error) => {
                    console.error('Error de red/EmailJS:', error);
                    alert('La conexión es un poco lenta para el archivo HD. Por favor, intenta enviarlo una vez más.');
                    sendBtn.innerText = "Reintentar Envío";
                    sendBtn.disabled = false;
                });
        });
    });
});