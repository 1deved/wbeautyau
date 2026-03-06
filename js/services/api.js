/**
 * SERVICIO DE API
 * Maneja la comunicación entre el frontend y Google Apps Script
 *
 * CONFIGURACIÓN REQUERIDA:
 * Reemplazar la URL_API con la URL de tu Apps Script desplegado
 */

const API = (() => {
  // =============================================
  // CONFIGURACIÓN - CAMBIAR ESTOS VALORES
  // =============================================

  const URL_API =
    "https://script.google.com/macros/s/AKfycbxRStQpx1CSd56wmHji_ZFM4H9fnwaDnqx0JY_jlyQAJDyv3P48-s-LWvGn2wDkBxBMjw/exec";

  const NUMERO_WHATSAPP = "573016185403"; // Número con código de país, sin + ni espacios

  // =============================================
  // FUNCIÓN BASE PARA PETICIONES
  // =============================================

  async function realizarPeticion(url, opciones = {}) {
    try {
      const respuesta = await fetch(url, {
        ...opciones,
      });

      if (!respuesta.ok) {
        throw new Error(`HTTP ${respuesta.status}`);
      }

      return await respuesta.json();
    } catch (error) {
      console.error("Error API:", error);
      throw error;
    }
  }

  // =============================================
  // PRODUCTOS
  // =============================================

  async function obtenerProductos() {
    const url = `${URL_API}`;
    return await realizarPeticion(url);
  }

  async function obtenerProducto(id) {
    const url = `${URL_API}?accion=producto&id=${encodeURIComponent(id)}`;
    return await realizarPeticion(url);
  }

  async function crearProducto(datosProducto) {
    return await realizarPeticion(URL_API, {
      method: "POST",
      body: JSON.stringify({
        ...datosProducto,
        accion: "crear-producto",
      }),
    });
  }

  async function actualizarProducto(datosProducto) {
    return await realizarPeticion(URL_API, {
      method: "POST",
      body: JSON.stringify({
        ...datosProducto,
        accion: "actualizar-producto",
      }),
    });
  }

  async function eliminarProducto(id) {
    return await realizarPeticion(URL_API, {
      method: "POST",
      body: JSON.stringify({
        id: id,
        accion: "eliminar-producto",
      }),
    });
  }

  // =============================================
  // PEDIDOS
  // =============================================

  async function registrarPedido(datosPedido) {
    return await realizarPeticion(URL_API, {
      method: "POST",
      body: JSON.stringify({
        ...datosPedido,
        _accion: "registro-pedido",
      }),
    });
  }

  // =============================================
  // WHATSAPP
  // =============================================

  function generarMensajeWhatsApp(productos, total, cliente) {
    let mensaje = "Pedido desde la tienda online\n\n";
    mensaje += "Productos:\n\n";

    productos.forEach((item, indice) => {
      const subtotal = item.precio * item.cantidad;
      mensaje += `${indice + 1}. ${item.nombre}\n`;
      mensaje += `   Cantidad: ${item.cantidad}\n`;
      mensaje += `   Precio unitario: $${item.precio.toFixed(2)}\n`;
      mensaje += `   Subtotal: $${subtotal.toFixed(2)}\n\n`;
    });

    mensaje += `Total del pedido: $${total.toFixed(2)}\n\n`;
    mensaje += `Cliente: ${cliente.nombre}\n`;
    mensaje += `Ciudad: ${cliente.ciudad}\n`;

    if (cliente.nota) {
      mensaje += `Nota: ${cliente.nota}\n`;
    }

    return mensaje;
  }

  function abrirWhatsApp(productos, total, cliente) {
    const mensaje = generarMensajeWhatsApp(productos, total, cliente);
    const mensajeCodificado = encodeURIComponent(mensaje);
    const urlWhatsApp = `https://wa.me/${NUMERO_WHATSAPP}?text=${mensajeCodificado}`;
    window.open(urlWhatsApp, "_blank");
  }

  function obtenerNumeroWhatsApp() {
    return NUMERO_WHATSAPP;
  }

  // =============================================
  // EXPORTAR FUNCIONES PÚBLICAS
  // =============================================

  return {
    obtenerProductos,
    obtenerProducto,
    crearProducto,
    actualizarProducto,
    eliminarProducto,
    registrarPedido,
    abrirWhatsApp,
    obtenerNumeroWhatsApp,
    generarMensajeWhatsApp,
  };
})();
