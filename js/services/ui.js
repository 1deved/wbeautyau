/**
 * UTILIDADES DE INTERFAZ DE USUARIO
 * Funciones compartidas para feedback visual y componentes comunes
 */

const UI = (() => {
  // =============================================
  // NOTIFICACIONES
  // =============================================

  function mostrarNotificacion(mensaje, tipo = "exito") {
    // Eliminar notificación anterior si existe
    const anterior = document.querySelector(".notificacion");
    if (anterior) anterior.remove();

    const notificacion = document.createElement("div");
    notificacion.className = `notificacion notificacion-${tipo}`;
    notificacion.innerHTML = `
      <span class="notificacion-icono">${tipo === "exito" ? "+" : tipo === "error" ? "!" : "i"}</span>
      <span class="notificacion-texto">${mensaje}</span>
    `;

    document.body.appendChild(notificacion);

    // Animación de entrada
    requestAnimationFrame(() => {
      notificacion.classList.add("notificacion-visible");
    });

    // Auto-eliminar
    setTimeout(() => {
      notificacion.classList.remove("notificacion-visible");
      setTimeout(() => notificacion.remove(), 300);
    }, 3500);
  }

  // =============================================
  // ESTADOS DE CARGA
  // =============================================

  function mostrarCarga(elemento) {
    if (!elemento) return;
    elemento.disabled = true;
    elemento.dataset.textoOriginal = elemento.textContent;
    elemento.innerHTML = '<span class="spinner-boton"></span> Cargando...';
  }

  function ocultarCarga(elemento) {
    if (!elemento) return;
    elemento.disabled = false;
    elemento.textContent = elemento.dataset.textoOriginal || elemento.textContent;
  }

  function mostrarEsqueletos(contenedor, cantidad = 6) {
    if (!contenedor) return;
    contenedor.innerHTML = "";
    for (let i = 0; i < cantidad; i++) {
      const esqueleto = document.createElement("div");
      esqueleto.className = "esqueleto-tarjeta";
      esqueleto.innerHTML = `
        <div class="esqueleto-imagen"></div>
        <div class="esqueleto-cuerpo">
          <div class="esqueleto-linea esqueleto-linea-larga"></div>
          <div class="esqueleto-linea esqueleto-linea-corta"></div>
          <div class="esqueleto-linea esqueleto-linea-media"></div>
        </div>
      `;
      contenedor.appendChild(esqueleto);
    }
  }

  // =============================================
  // FORMATEO
  // =============================================

  function formatearPrecio(precio) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(precio);
  }

  function truncarTexto(texto, longitud = 120) {
    if (!texto || texto.length <= longitud) return texto || "";
    return texto.substring(0, longitud).trim() + "...";
  }

  // =============================================
  // IMÁGENES
  // =============================================

  function manejarErrorImagen(img) {
    img.onerror = null;
    img.src = generarImagenPlaceholder();
    img.alt = "Imagen no disponible";
  }

  function generarImagenPlaceholder() {
    return "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23f0ece4'/%3E%3Ctext x='50%25' y='50%25' font-family='sans-serif' font-size='14' fill='%23999' text-anchor='middle' dy='.3em'%3ESin imagen%3C/text%3E%3C/svg%3E";
  }

  // =============================================
  // MODALES
  // =============================================

  function mostrarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.add("modal-visible");
      document.body.style.overflow = "hidden";
    }
  }

  function ocultarModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
      modal.classList.remove("modal-visible");
      document.body.style.overflow = "";
    }
  }

  // =============================================
  // SCROLL
  // =============================================

  function scrollHacia(elemento) {
    if (elemento) {
      elemento.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  // =============================================
  // EXPORTAR
  // =============================================

  return {
    mostrarNotificacion,
    mostrarCarga,
    ocultarCarga,
    mostrarEsqueletos,
    formatearPrecio,
    truncarTexto,
    manejarErrorImagen,
    generarImagenPlaceholder,
    mostrarModal,
    ocultarModal,
    scrollHacia,
  };
})();
