/**
 * SERVICIO DE CARRITO DE COMPRAS
 * Maneja el estado del carrito usando localStorage
 */

const Carrito = (() => {
  const CLAVE_ALMACENAMIENTO = "tienda_carrito";

  // =============================================
  // OPERACIONES BÁSICAS
  // =============================================

  function obtenerCarrito() {
    try {
      const datos = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      return datos ? JSON.parse(datos) : [];
    } catch (error) {
      console.error("Error al leer carrito:", error);
      return [];
    }
  }

  function guardarCarrito(items) {
    try {
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(items));
      actualizarContador();
      dispararEventoCarrito();
    } catch (error) {
      console.error("Error al guardar carrito:", error);
    }
  }

  function limpiarCarrito() {
    localStorage.removeItem(CLAVE_ALMACENAMIENTO);
    actualizarContador();
    dispararEventoCarrito();
  }

  // =============================================
  // MANEJO DE PRODUCTOS
  // =============================================

  function agregarProducto(producto, cantidad = 1) {
    const carrito = obtenerCarrito();
    const indice = carrito.findIndex((item) => item.id === producto.id);

    if (indice !== -1) {
      carrito[indice].cantidad += cantidad;
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: parseFloat(producto.precio),
        imagen_url: producto.imagen_url,
        cantidad: cantidad,
        stock: parseInt(producto.stock),
      });
    }

    guardarCarrito(carrito);
    mostrarAnimacionCarrito();
    return true;
  }

  function eliminarProducto(id) {
    const carrito = obtenerCarrito().filter((item) => item.id !== id);
    guardarCarrito(carrito);
  }

  function actualizarCantidad(id, nuevaCantidad) {
    if (nuevaCantidad <= 0) {
      eliminarProducto(id);
      return;
    }

    const carrito = obtenerCarrito();
    const indice = carrito.findIndex((item) => item.id === id);

    if (indice !== -1) {
      const itemActual = carrito[indice];
      if (nuevaCantidad > itemActual.stock) {
        UI.mostrarNotificacion(`Solo hay ${itemActual.stock} unidades disponibles`, "error");
        return;
      }
      carrito[indice].cantidad = nuevaCantidad;
      guardarCarrito(carrito);
    }
  }

  // =============================================
  // CÁLCULOS
  // =============================================

  function calcularSubtotal(item) {
    return item.precio * item.cantidad;
  }

  function calcularTotal() {
    return obtenerCarrito().reduce((total, item) => total + calcularSubtotal(item), 0);
  }

  function contarItems() {
    return obtenerCarrito().reduce((total, item) => total + item.cantidad, 0);
  }

  function estaVacio() {
    return obtenerCarrito().length === 0;
  }

  // =============================================
  // INTERFAZ
  // =============================================

  function actualizarContador() {
    const contador = document.getElementById("contador-carrito");
    if (contador) {
      const total = contarItems();
      contador.textContent = total;
      contador.style.display = total > 0 ? "flex" : "none";
    }
  }

  function mostrarAnimacionCarrito() {
    const iconoCarrito = document.querySelector(".icono-carrito");
    if (iconoCarrito) {
      iconoCarrito.classList.add("animacion-sacudir");
      setTimeout(() => iconoCarrito.classList.remove("animacion-sacudir"), 600);
    }
  }

  function dispararEventoCarrito() {
    window.dispatchEvent(new CustomEvent("carritoActualizado", {
      detail: { items: obtenerCarrito(), total: calcularTotal() },
    }));
  }

  // =============================================
  // INICIALIZACIÓN
  // =============================================

  function inicializar() {
    actualizarContador();
  }

  // =============================================
  // EXPORTAR
  // =============================================

  return {
    obtenerCarrito,
    limpiarCarrito,
    agregarProducto,
    eliminarProducto,
    actualizarCantidad,
    calcularSubtotal,
    calcularTotal,
    contarItems,
    estaVacio,
    inicializar,
    actualizarContador,
  };
})();
