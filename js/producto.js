/**
 * PÁGINA DE DETALLE DE PRODUCTO
 * Carga y muestra la información completa de un producto
 */

document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const idProducto = params.get("id");

  if (!idProducto) {
    mostrarProductoNoEncontrado("No se especificó ningún producto.");
    return;
  }

  await cargarDetalleProducto(idProducto);

  // Reutilizar carrito UI de tienda.js
  inicializarCarritoUI();
  inicializarCheckout();
  inicializarNav();
});

async function cargarDetalleProducto(id) {
  const contenedorProducto = document.getElementById("contenido-producto");
  if (!contenedorProducto) return;

  // Mostrar carga
  contenedorProducto.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--espacio-16);">
      <div class="esqueleto-imagen" style="border-radius: var(--radio-xl); aspect-ratio: 1;"></div>
      <div style="display: flex; flex-direction: column; gap: var(--espacio-4); padding-top: var(--espacio-4);">
        <div class="esqueleto-linea" style="width: 40%; height: 10px;"></div>
        <div class="esqueleto-linea" style="width: 80%; height: 28px;"></div>
        <div class="esqueleto-linea" style="width: 30%; height: 22px;"></div>
        <div class="esqueleto-linea" style="height: 80px;"></div>
      </div>
    </div>
  `;

  try {
    const respuesta = await API.obtenerProducto(id);

    if (respuesta.success && respuesta.data) {
      renderizarDetalleProducto(respuesta.data);
    } else {
      mostrarProductoNoEncontrado("El producto que buscas no existe.");
    }
  } catch (error) {
    console.error("Error al cargar producto:", error);
    mostrarProductoNoEncontrado("Error al conectar con la tienda.");
  }
}

function renderizarDetalleProducto(producto) {
  const contenedor = document.getElementById("contenido-producto");
  const migaNombre = document.getElementById("miga-nombre-producto");
  const estaAgotado = parseInt(producto.stock) <= 0;
  const stockBajo = parseInt(producto.stock) > 0 && parseInt(producto.stock) <= 5;

  if (migaNombre) migaNombre.textContent = producto.nombre;
  document.title = `${producto.nombre} - Mi Tienda`;

  const imagenUrl = producto.imagen_url || UI.generarImagenPlaceholder();
  const precioFormateado = UI.formatearPrecio(producto.precio);

  contenedor.innerHTML = `
    <div class="producto-grid">
      <div class="producto-imagen-principal">
        <img
          src="${imagenUrl}"
          alt="${producto.nombre}"
          onerror="UI.manejarErrorImagen(this)"
        />
      </div>

      <div class="producto-info">
        <h1 class="producto-nombre">${producto.nombre}</h1>
        <p class="producto-precio">${precioFormateado}</p>

        ${producto.descripcion ? `
          <p class="producto-descripcion">${producto.descripcion}</p>
        ` : ""}

        <p class="producto-stock ${stockBajo ? 'bajo-stock' : ''}">
          ${estaAgotado
            ? "Sin unidades disponibles"
            : stockBajo
            ? `Ultimas ${producto.stock} unidades disponibles`
            : `${producto.stock} unidades disponibles`
          }
        </p>

        ${estaAgotado
          ? '<div class="producto-agotado-mensaje">Producto agotado. Vuelve pronto.</div>'
          : `
            <div style="display: flex; flex-direction: column; gap: var(--espacio-3);">
              <div style="display: flex; align-items: center; gap: var(--espacio-4); margin-bottom: var(--espacio-2);">
                <label style="font-size: var(--texto-sm); color: var(--color-texto-secundario); font-weight: 500;">Cantidad:</label>
                <div style="display: flex; align-items: center; gap: var(--espacio-3); border: 2px solid var(--color-borde); border-radius: var(--radio-md); padding: var(--espacio-1) var(--espacio-2);">
                  <button
                    class="boton-cantidad"
                    id="btn-disminuir"
                    onclick="cambiarCantidad(-1)"
                    aria-label="Disminuir"
                    style="border: none; background: none; width: 28px; height: 28px;"
                  >-</button>
                  <span id="cantidad-seleccionada" style="font-weight: 600; min-width: 32px; text-align: center;">1</span>
                  <button
                    class="boton-cantidad"
                    id="btn-aumentar"
                    onclick="cambiarCantidad(1)"
                    aria-label="Aumentar"
                    style="border: none; background: none; width: 28px; height: 28px;"
                  >+</button>
                </div>
              </div>
              <button
                class="boton boton-primario boton-grande"
                id="btn-agregar-carrito"
                onclick="agregarProductoActualAlCarrito()"
                data-id="${producto.id}"
                data-nombre="${producto.nombre}"
                data-precio="${producto.precio}"
                data-stock="${producto.stock}"
                data-imagen="${producto.imagen_url || ''}"
              >
                Agregar al carrito
              </button>
            </div>
          `
        }
      </div>
    </div>
  `;
}

// Variables para el selector de cantidad
let cantidadSeleccionada = 1;

function cambiarCantidad(delta) {
  const boton = document.getElementById("btn-agregar-carrito");
  const stockMaximo = parseInt(boton?.dataset.stock || 1);
  cantidadSeleccionada = Math.max(1, Math.min(stockMaximo, cantidadSeleccionada + delta));
  const display = document.getElementById("cantidad-seleccionada");
  if (display) display.textContent = cantidadSeleccionada;
}

function agregarProductoActualAlCarrito() {
  const boton = document.getElementById("btn-agregar-carrito");
  if (!boton) return;

  const producto = {
    id: boton.dataset.id,
    nombre: boton.dataset.nombre,
    precio: parseFloat(boton.dataset.precio),
    stock: parseInt(boton.dataset.stock),
    imagen_url: boton.dataset.imagen,
  };

  Carrito.agregarProducto(producto, cantidadSeleccionada);
  UI.mostrarNotificacion(`"${producto.nombre}" agregado al carrito`, "exito");
  actualizarVistaCarrito();
  abrirCarrito();
}

function mostrarProductoNoEncontrado(mensaje) {
  const contenedor = document.getElementById("contenido-producto");
  if (contenedor) {
    contenedor.innerHTML = `
      <div class="estado-vacio" style="padding: var(--espacio-20) 0;">
        <div class="estado-vacio-icono">!</div>
        <h3 class="estado-vacio-titulo">Producto no encontrado</h3>
        <p style="color: var(--color-texto-suave); margin-bottom: var(--espacio-6);">${mensaje}</p>
        <a href="index.html" class="boton boton-primario">Volver a la tienda</a>
      </div>
    `;
  }
}
