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
            
            // --- AJUSTES CRÍTICOS PARA MÓVILES ---
            delay: 100, // Espera 100ms de presión para activar el arrastre
            delayOnTouchOnly: true, // El retraso solo aplica en pantallas táctiles
            touchStartThreshold: 5, // Permite un margen de error de 5px antes de cancelar
            swapThreshold: 0.65, // Hace que sea más fácil soltar la tarjeta en una zona
            // --------------------------------------

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

    // --- 3. LÓGICA DE CAPTURA Y ENVÍO ---
    sendBtn.addEventListener('click', () => {
        sendBtn.innerText = "Enviando...";
        sendBtn.disabled = true;

        const container = document.getElementById('captura-completa');
        const nameValue = document.querySelector('.name-input').value || "Anónimo";

        html2canvas(container, { 
            scale: 2, // Aumentamos un poco la calidad para que el texto se lea bien
            backgroundColor: "#ffffff",
            logging: false,
            useCORS: true 
        }).then(canvas => {
            const compressedImg = canvas.toDataURL('image/jpeg', 0.2);

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
                    console.error('Error de EmailJS:', error);
                    alert('Hubo un error al enviar. Revisa tu conexión.');
                    sendBtn.innerText = "Reintentar";
                    sendBtn.disabled = false;
                });
        });
    });
});