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

    const draggables = document.querySelectorAll('.card');
    const dropzones = document.querySelectorAll('.dropzone');
    const sidebar = document.getElementById('sidebar');
    const sendBtn = document.getElementById('send-btn');

    // --- 2. LÓGICA DE DRAG & DROP ---
    draggables.forEach(draggable => {
        draggable.addEventListener('dragstart', () => {
            draggable.classList.add('dragging');
        });

        draggable.addEventListener('dragend', () => {
            draggable.classList.remove('dragging');
        });
    });

    dropzones.forEach(zone => {
        zone.addEventListener('dragover', e => {
            e.preventDefault();
            zone.classList.add('drag-over');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('drag-over');
        });

        zone.addEventListener('drop', e => {
            e.preventDefault();
            zone.classList.remove('drag-over');
            
            const draggable = document.querySelector('.dragging');
            if (draggable) {
                zone.appendChild(draggable);
            }

            const cardsRemaining = sidebar.querySelectorAll('.pink-card').length;
            if (cardsRemaining === 0) {
                sendBtn.style.display = 'block';
            } else {
                sendBtn.style.display = 'none';
            }
        });
    });

    // --- 3. LÓGICA DE CAPTURA Y ENVÍO ---
    sendBtn.addEventListener('click', () => {
        sendBtn.innerText = "Enviando...";
        sendBtn.disabled = true;

        // CAMBIO CLAVE: Ahora seleccionamos el contenedor que envuelve Nombre + Tabla
        const container = document.getElementById('captura-completa');
        const nameValue = document.querySelector('.name-input').value || "Anónimo";

        html2canvas(container, { 
            scale: 1,
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
                    // Bloqueamos al usuario localmente
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