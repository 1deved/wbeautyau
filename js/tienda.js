/**
 * TIENDA ONLINE - LÓGICA PRINCIPAL
 * Maneja la carga de productos, búsqueda y UI de la tienda
 */

// Estado global de la tienda
const EstadoTienda = {
  todosLosProductos: [],
  productosFiltrados: [],
  cargando: false,
};

// =============================================
// INICIALIZACIÓN
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  inicializarTienda();
  inicializarCarritoUI();
  inicializarCheckout();
  inicializarNav();
  aplicarRetrasoAnimaciones();
});

async function inicializarTienda() {
  await cargarProductos();
  inicializarBuscador();
}

// =============================================
// CARGA DE PRODUCTOS
// =============================================

async function cargarProductos() {
  const gridProductos = document.getElementById("grid-productos");
  if (!gridProductos) return;

  UI.mostrarEsqueletos(gridProductos, 6);

  try {
    const respuesta = await API.obtenerProductos();

    if (respuesta.success) {
      EstadoTienda.todosLosProductos = respuesta.data || [];
      EstadoTienda.productosFiltrados = [...EstadoTienda.todosLosProductos];
      renderizarProductos(EstadoTienda.productosFiltrados);
    } else {
      mostrarErrorCarga(gridProductos, respuesta.message);
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarErrorConexion(gridProductos);
  }
}

function mostrarErrorCarga(contenedor, mensaje) {
  contenedor.innerHTML = `
    <div class="estado-error" style="grid-column: 1/-1;">
      <p style="font-size: var(--texto-lg); margin-bottom: var(--espacio-2);">No se pudieron cargar los productos</p>
      <p style="font-size: var(--texto-sm); color: var(--color-texto-suave);">${mensaje}</p>
      <button class="boton boton-secundario" onclick="cargarProductos()" style="margin-top: var(--espacio-4);">
        Reintentar
      </button>
    </div>
  `;
}

function mostrarErrorConexion(contenedor) {
  contenedor.innerHTML = `
    <div class="estado-vacio" style="grid-column: 1/-1;">
      <div class="estado-vacio-icono">!</div>
      <h3 class="estado-vacio-titulo">Sin conexion con la tienda</h3>
      <p style="font-size: var(--texto-sm); color: var(--color-texto-suave); margin-bottom: var(--espacio-4);">
        Verifica que el backend de Google Apps Script este configurado correctamente en js/services/api.js
      </p>
      <button class="boton boton-secundario" onclick="cargarProductos()">
        Reintentar conexion
      </button>
    </div>
  `;
}

// =============================================
// RENDERIZADO DE PRODUCTOS
// =============================================

function renderizarProductos(productos) {
  const gridProductos = document.getElementById("grid-productos");
  const contadorResultados = document.getElementById("contador-resultados");

  if (!gridProductos) return;

  // Actualizar contador
  if (contadorResultados) {
    contadorResultados.textContent = productos.length === 0
      ? ""
      : `${productos.length} producto${productos.length !== 1 ? "s" : ""}`;
  }

  if (productos.length === 0) {
    gridProductos.innerHTML = `
      <div class="estado-vacio">
        <div class="estado-vacio-icono">o</div>
        <h3 class="estado-vacio-titulo">No se encontraron productos</h3>
        <p>Intenta con otros terminos de busqueda</p>
        <button class="boton boton-secundario" onclick="limpiarBusqueda()" style="margin-top: var(--espacio-4);">
          Ver todos los productos
        </button>
      </div>
    `;
    return;
  }

  gridProductos.innerHTML = productos.map((producto, indice) =>
    crearTarjetaProducto(producto, indice)
  ).join("");

  // Aplicar animaciones escalonadas
  const tarjetas = gridProductos.querySelectorAll(".tarjeta-producto");
  tarjetas.forEach((tarjeta, i) => {
    tarjeta.style.animationDelay = `${i * 60}ms`;
  });
}

function crearTarjetaProducto(producto, indice) {
  const estaAgotado = parseInt(producto.stock) <= 0;
  const imagenUrl = producto.imagen_url || UI.generarImagenPlaceholder();
  const descripcionCorta = UI.truncarTexto(producto.descripcion, 100);
  const precioFormateado = UI.formatearPrecio(producto.precio);

  return `
    <article class="tarjeta-producto" data-id="${producto.id}">
      <div class="tarjeta-imagen-contenedor">
        <img
          class="tarjeta-imagen"
          src="${imagenUrl}"
          alt="${producto.nombre}"
          loading="lazy"
          onerror="UI.manejarErrorImagen(this)"
        />
        ${estaAgotado ? '<span class="etiqueta-agotado">Agotado</span>' : ""}
      </div>

      <div class="tarjeta-cuerpo">
        <h3 class="tarjeta-nombre">${producto.nombre}</h3>
        ${descripcionCorta ? `<p class="tarjeta-descripcion">${descripcionCorta}</p>` : ""}

        <div class="tarjeta-pie">
          <span class="tarjeta-precio">${precioFormateado}</span>
          <div class="tarjeta-acciones">
            <a href="producto.html?id=${producto.id}" class="boton boton-secundario boton-pequeno">
              Ver detalle
            </a>
            ${!estaAgotado ? `
              <button
                class="boton boton-primario boton-pequeno"
                onclick="agregarAlCarritoDesdeGrid('${producto.id}')"
                data-id="${producto.id}"
              >
                Agregar
              </button>
            ` : ""}
          </div>
        </div>

        ${!estaAgotado ? `
          <button
            class="boton boton-acento boton-bloque boton-pequeno boton-whatsapp-directo"
            onclick="comprarAhoraDesdeGrid('${producto.id}')"
            data-id="${producto.id}"
            style="margin-top: var(--espacio-3); width: 100%;"
          >
            Comprar por WhatsApp
          </button>
        ` : ""}
      </div>
    </article>
  `;
}

function comprarAhoraDesdeGrid(id) {
  const producto = EstadoTienda.todosLosProductos.find(p => p.id === id);
  if (!producto) return;

  const items = [{
    id: producto.id,
    nombre: producto.nombre,
    precio: parseFloat(producto.precio),
    cantidad: 1,
  }];
  const total = parseFloat(producto.precio);

  // Abrir checkout directo con datos mínimos: nombre y ciudad
  const modal = document.createElement("div");
  modal.id = "modal-compra-rapida";
  modal.className = "modal-overlay modal-visible";
  modal.innerHTML = `
    <div class="modal-contenido">
      <div class="modal-cabecera">
        <h3 class="modal-titulo">Comprar ahora</h3>
        <button class="boton-cerrar-carrito" onclick="document.getElementById('modal-compra-rapida').remove(); document.body.style.overflow='';">&times;</button>
      </div>
      <div class="modal-cuerpo">
        <p style="font-size: var(--texto-sm); color: var(--color-texto-secundario); margin-bottom: var(--espacio-4);">
          <strong>${producto.nombre}</strong> — ${UI.formatearPrecio(producto.precio)}
        </p>
        <p style="font-size: var(--texto-sm); color: var(--color-texto-secundario); margin-bottom: var(--espacio-6);">
          Completa tus datos para enviar el pedido por WhatsApp.
        </p>
        <div class="grupo-campo">
          <label class="etiqueta-campo" for="nombre-compra-rapida">Nombre completo *</label>
          <input type="text" id="nombre-compra-rapida" class="campo-entrada" placeholder="Tu nombre completo" />
        </div>
        <div class="grupo-campo">
          <label class="etiqueta-campo" for="ciudad-compra-rapida">Ciudad *</label>
          <input type="text" id="ciudad-compra-rapida" class="campo-entrada" placeholder="Tu ciudad" />
        </div>
        <div class="grupo-campo">
          <label class="etiqueta-campo" for="nota-compra-rapida">Nota adicional (opcional)</label>
          <textarea id="nota-compra-rapida" class="campo-entrada campo-textarea" placeholder="Instrucciones especiales..."></textarea>
        </div>
      </div>
      <div class="modal-pie">
        <button
          class="boton boton-acento boton-bloque boton-grande"
          onclick="enviarCompraRapidaWhatsApp('${producto.id}')"
        >
          Enviar por WhatsApp
        </button>
        <button
          class="boton boton-secundario boton-bloque"
          onclick="document.getElementById('modal-compra-rapida').remove(); document.body.style.overflow='';"
        >
          Cancelar
        </button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  document.body.style.overflow = "hidden";

  // Cerrar al hacer clic en el overlay
  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
      document.body.style.overflow = "";
    }
  });
}

function enviarCompraRapidaWhatsApp(idProducto) {
  const nombre = document.getElementById("nombre-compra-rapida")?.value.trim();
  const ciudad = document.getElementById("ciudad-compra-rapida")?.value.trim();
  const nota = document.getElementById("nota-compra-rapida")?.value.trim();

  if (!nombre) {
    UI.mostrarNotificacion("Por favor ingresa tu nombre", "error");
    document.getElementById("nombre-compra-rapida")?.focus();
    return;
  }
  if (!ciudad) {
    UI.mostrarNotificacion("Por favor ingresa tu ciudad", "error");
    document.getElementById("ciudad-compra-rapida")?.focus();
    return;
  }

  const producto = EstadoTienda.todosLosProductos.find(p => p.id === idProducto);
  if (!producto) return;

  const items = [{ id: producto.id, nombre: producto.nombre, precio: parseFloat(producto.precio), cantidad: 1 }];
  const total = parseFloat(producto.precio);
  const cliente = { nombre, ciudad, nota };

  API.registrarPedido({
    productos: items,
    precio_total: total,
    nombre_cliente: nombre,
    ciudad_cliente: ciudad,
    nota_cliente: nota,
  }).catch(err => console.warn("No se pudo registrar el pedido:", err));

  API.abrirWhatsApp(items, total, cliente);

  document.getElementById("modal-compra-rapida")?.remove();
  document.body.style.overflow = "";
  UI.mostrarNotificacion("Pedido enviado. Revisa WhatsApp.", "exito");
}

async function agregarAlCarritoDesdeGrid(id) {
  const boton = document.querySelector(`.tarjeta-producto[data-id="${id}"] .boton-primario`);
  if (boton) UI.mostrarCarga(boton);

  try {
    const producto = EstadoTienda.todosLosProductos.find(p => p.id === id);
    if (producto) {
      Carrito.agregarProducto(producto, 1);
      UI.mostrarNotificacion(`"${producto.nombre}" agregado al carrito`, "exito");
      actualizarVistaCarrito();
    }
  } finally {
    if (boton) UI.ocultarCarga(boton);
  }
}

// =============================================
// BUSCADOR
// =============================================

let temporizadorBusqueda = null;

function inicializarBuscador() {
  const campoBusqueda = document.getElementById("campo-busqueda");
  if (!campoBusqueda) return;

  campoBusqueda.addEventListener("input", (e) => {
    clearTimeout(temporizadorBusqueda);
    temporizadorBusqueda = setTimeout(() => {
      filtrarProductos(e.target.value.trim());
    }, 300);
  });
}

function filtrarProductos(termino) {
  if (!termino) {
    EstadoTienda.productosFiltrados = [...EstadoTienda.todosLosProductos];
  } else {
    const terminoMinusculas = termino.toLowerCase();
    EstadoTienda.productosFiltrados = EstadoTienda.todosLosProductos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(terminoMinusculas) ||
        (p.descripcion || "").toLowerCase().includes(terminoMinusculas)
    );
  }
  renderizarProductos(EstadoTienda.productosFiltrados);
}

function limpiarBusqueda() {
  const campoBusqueda = document.getElementById("campo-busqueda");
  if (campoBusqueda) campoBusqueda.value = "";
  filtrarProductos("");
}

// =============================================
// NAVEGACIÓN CON SCROLL
// =============================================

function inicializarNav() {
  const nav = document.getElementById("nav-principal");
  if (!nav) return;

  window.addEventListener("scroll", () => {
    if (window.scrollY > 20) {
      nav.classList.add("con-sombra");
    } else {
      nav.classList.remove("con-sombra");
    }
  }, { passive: true });
}

// =============================================
// PANEL DEL CARRITO
// =============================================

function inicializarCarritoUI() {
  Carrito.inicializar();

  // Botones para abrir/cerrar
  document.getElementById("btn-abrir-carrito")?.addEventListener("click", abrirCarrito);
  document.getElementById("btn-cerrar-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("overlay-carrito")?.addEventListener("click", cerrarCarrito);
  document.getElementById("btn-limpiar-carrito")?.addEventListener("click", limpiarCarrito);
  document.getElementById("btn-proceder-checkout")?.addEventListener("click", abrirCheckout);

  // Escuchar cambios en el carrito
  window.addEventListener("carritoActualizado", actualizarVistaCarrito);

  actualizarVistaCarrito();
}

function abrirCarrito() {
  document.getElementById("overlay-carrito")?.classList.add("visible");
  document.getElementById("panel-carrito")?.classList.add("visible");
  document.body.style.overflow = "hidden";
  actualizarVistaCarrito();
}

function cerrarCarrito() {
  document.getElementById("overlay-carrito")?.classList.remove("visible");
  document.getElementById("panel-carrito")?.classList.remove("visible");
  document.body.style.overflow = "";
}

function limpiarCarrito() {
  if (confirm("¿Vaciar el carrito?")) {
    Carrito.limpiarCarrito();
    actualizarVistaCarrito();
    UI.mostrarNotificacion("Carrito vaciado", "info");
  }
}

function actualizarVistaCarrito() {
  const listaItems = document.getElementById("lista-items-carrito");
  const pieCarrito = document.getElementById("pie-carrito");
  const totalCarrito = document.getElementById("total-carrito");

  if (!listaItems) return;

  const items = Carrito.obtenerCarrito();

  if (items.length === 0) {
    listaItems.innerHTML = `
      <div class="carrito-vacio">
        <div class="carrito-vacio-icono">o</div>
        <p style="font-weight: 500;">Tu carrito esta vacio</p>
        <p style="font-size: var(--texto-sm);">Agrega productos para continuar</p>
      </div>
    `;
    if (pieCarrito) pieCarrito.style.display = "none";
  } else {
    listaItems.innerHTML = items.map(item => crearItemCarrito(item)).join("");
    if (pieCarrito) pieCarrito.style.display = "block";
    if (totalCarrito) {
      totalCarrito.textContent = UI.formatearPrecio(Carrito.calcularTotal());
    }
  }
}

function crearItemCarrito(item) {
  const imagenUrl = item.imagen_url || UI.generarImagenPlaceholder();
  return `
    <div class="item-carrito">
      <img
        class="item-imagen"
        src="${imagenUrl}"
        alt="${item.nombre}"
        onerror="UI.manejarErrorImagen(this)"
      />
      <div class="item-detalles">
        <p class="item-nombre">${item.nombre}</p>
        <p class="item-precio">${UI.formatearPrecio(item.precio)} c/u</p>
        <div class="controles-cantidad">
          <button
            class="boton-cantidad"
            onclick="Carrito.actualizarCantidad('${item.id}', ${item.cantidad - 1}); actualizarVistaCarrito();"
            aria-label="Disminuir cantidad"
          >-</button>
          <span class="cantidad-actual">${item.cantidad}</span>
          <button
            class="boton-cantidad"
            onclick="Carrito.actualizarCantidad('${item.id}', ${item.cantidad + 1}); actualizarVistaCarrito();"
            aria-label="Aumentar cantidad"
          >+</button>
        </div>
      </div>
      <div class="item-acciones">
        <span class="item-subtotal">${UI.formatearPrecio(Carrito.calcularSubtotal(item))}</span>
        <button
          class="boton-eliminar-item"
          onclick="Carrito.eliminarProducto('${item.id}'); actualizarVistaCarrito();"
          aria-label="Eliminar producto"
        >
          Quitar
        </button>
      </div>
    </div>
  `;
}

// =============================================
// CHECKOUT
// =============================================

function inicializarCheckout() {
  document.getElementById("btn-cerrar-checkout")?.addEventListener("click", () => {
    UI.ocultarModal("modal-checkout");
  });

  document.getElementById("btn-cancelar-checkout")?.addEventListener("click", () => {
    UI.ocultarModal("modal-checkout");
    abrirCarrito();
  });

  document.getElementById("btn-enviar-whatsapp")?.addEventListener("click", procesarPedidoWhatsApp);

  // Cerrar modal al hacer clic fuera
  document.getElementById("modal-checkout")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) {
      UI.ocultarModal("modal-checkout");
    }
  });
}

function abrirCheckout() {
  if (Carrito.estaVacio()) {
    UI.mostrarNotificacion("Agrega productos al carrito primero", "error");
    return;
  }
  cerrarCarrito();
  UI.mostrarModal("modal-checkout");
}

async function procesarPedidoWhatsApp() {
  const nombreCliente = document.getElementById("nombre-cliente")?.value.trim();
  const ciudadCliente = document.getElementById("ciudad-cliente")?.value.trim();
  const notaCliente = document.getElementById("nota-cliente")?.value.trim();

  // Validar campos requeridos
  if (!nombreCliente) {
    UI.mostrarNotificacion("Por favor ingresa tu nombre", "error");
    document.getElementById("nombre-cliente")?.focus();
    return;
  }

  if (!ciudadCliente) {
    UI.mostrarNotificacion("Por favor ingresa tu ciudad", "error");
    document.getElementById("ciudad-cliente")?.focus();
    return;
  }

  const boton = document.getElementById("btn-enviar-whatsapp");
  UI.mostrarCarga(boton);

  try {
    const items = Carrito.obtenerCarrito();
    const total = Carrito.calcularTotal();
    const cliente = { nombre: nombreCliente, ciudad: ciudadCliente, nota: notaCliente };

    // Registrar pedido en Google Sheets (asíncrono, no bloquear WhatsApp)
    API.registrarPedido({
      productos: items,
      precio_total: total,
      nombre_cliente: nombreCliente,
      ciudad_cliente: ciudadCliente,
      nota_cliente: notaCliente,
    }).catch(err => console.warn("No se pudo registrar el pedido:", err));

    // Abrir WhatsApp
    API.abrirWhatsApp(items, total, cliente);

    // Limpiar carrito y cerrar modales
    Carrito.limpiarCarrito();
    UI.ocultarModal("modal-checkout");

    // Limpiar formulario
    document.getElementById("nombre-cliente").value = "";
    document.getElementById("ciudad-cliente").value = "";
    document.getElementById("nota-cliente").value = "";

    UI.mostrarNotificacion("Pedido enviado correctamente. Revisa WhatsApp.", "exito");

  } catch (error) {
    console.error("Error al procesar pedido:", error);
    UI.mostrarNotificacion("Error al procesar el pedido. Intenta de nuevo.", "error");
  } finally {
    UI.ocultarCarga(boton);
  }
}

// =============================================
// ANIMACIONES DE APARICIÓN
// =============================================

function aplicarRetrasoAnimaciones() {
  if (!window.IntersectionObserver) return;

  const observer = new IntersectionObserver(
    (entradas) => {
      entradas.forEach((entrada) => {
        if (entrada.isIntersecting) {
          entrada.target.style.opacity = "1";
          observer.unobserve(entrada.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -50px 0px" }
  );

  document.querySelectorAll(".seccion-hero, .seccion-buscador").forEach(el => {
    observer.observe(el);
  });
}