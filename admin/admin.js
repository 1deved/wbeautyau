/**
 * PANEL DE ADMINISTRACIÓN
 * Gestión completa de productos: crear, editar, eliminar
 *
 * SEGURIDAD: Cambiar la contraseña en la constante CONTRASENA_ADMIN
 */

// =============================================
// CONFIGURACIÓN
// =============================================

const CONTRASENA_ADMIN = "admin123"; // CAMBIAR ESTO
const CLAVE_SESION = "admin_sesion_activa";

const CATEGORIAS = [
  "🧂 Polvos",
  "🌸 Rubores",
  "💄 Gloss",
  "💋 Labiales",
  "👁️ Pestañinas",
  "🧴 Kit de skincare",
  "🧴 Bases",
  "💦 Fijadores",
  "🧪 Gel",
  "✏️ Delineadores",
  "🧼 Jabones",
  "✨ Iluminadores",
  "🖌️ Brochas",
  "🧽 Borlas",
  "🥚 Bunny blender",
  "👜 Cosmetiqueras",
  "🧼 Cuidado íntimo",
  "🎨 Paletas",
  "🧴 Primer",
  "🧻 Control de grasa",
  "🌞 Bronzer",
  "👁️ Cejas"
];

// Estado del administrador
const EstadoAdmin = {
  productos: [],
  productosFiltrados: [],
  idAEliminar: null,
};

// =============================================
// AUTENTICACIÓN
// =============================================

document.addEventListener("DOMContentLoaded", () => {
  verificarSesion();
  inicializarLoginForm();
});

function verificarSesion() {
  const sesionActiva = sessionStorage.getItem(CLAVE_SESION);
  if (sesionActiva === "true") {
    mostrarPanel();
  }
}

function inicializarLoginForm() {
  const btnLogin = document.getElementById("btn-login");
  const campoContrasena = document.getElementById("campo-contrasena");

  btnLogin?.addEventListener("click", intentarLogin);
  campoContrasena?.addEventListener("keypress", (e) => {
    if (e.key === "Enter") intentarLogin();
  });
}

function intentarLogin() {
  const contrasena = document.getElementById("campo-contrasena")?.value;
  const errorLogin = document.getElementById("error-login");

  if (contrasena === CONTRASENA_ADMIN) {
    sessionStorage.setItem(CLAVE_SESION, "true");
    mostrarPanel();
  } else {
    if (errorLogin) {
      errorLogin.textContent = "Contrasena incorrecta. Intenta de nuevo.";
      errorLogin.style.display = "block";
    }
    document.getElementById("campo-contrasena").value = "";
  }
}

function mostrarPanel() {
  document.getElementById("pantalla-login").style.display = "none";
  document.getElementById("panel-admin").style.display = "flex";
  inicializarPanel();
}

function cerrarSesion() {
  sessionStorage.removeItem(CLAVE_SESION);
  window.location.reload();
}

document.getElementById("btn-cerrar-sesion")?.addEventListener("click", cerrarSesion);

// =============================================
// PANEL PRINCIPAL
// =============================================

async function inicializarPanel() {
  await cargarProductosAdmin();
  inicializarBuscadorAdmin();
  inicializarModalProducto();
  inicializarModalEliminar();

  document.getElementById("btn-nuevo-producto")?.addEventListener("click", abrirModalNuevoProducto);
  document.getElementById("btn-recargar-productos")?.addEventListener("click", cargarProductosAdmin);
}

async function cargarProductosAdmin() {
  const cuerpoTabla = document.getElementById("cuerpo-tabla-productos");
  if (!cuerpoTabla) return;

  cuerpoTabla.innerHTML = `
    <tr>
      <td colspan="5" style="text-align: center; padding: var(--espacio-8); color: var(--color-texto-suave);">
        <span class="spinner-boton" style="border-color: rgba(0,0,0,0.1); border-top-color: var(--color-acento); display: inline-block;"></span>
        Cargando productos...
      </td>
    </tr>
  `;

  try {
    const respuesta = await API.obtenerProductos();

    if (respuesta.success) {
      // Invertimos el orden para que lo más nuevo aparezca arriba en la tabla
      EstadoAdmin.productos = (respuesta.data || []).reverse();
      EstadoAdmin.productosFiltrados = [...EstadoAdmin.productos];
      actualizarEstadisticas();
      renderizarTablaProductos(EstadoAdmin.productosFiltrados);
    } else {
      mostrarErrorTabla("No se pudieron cargar los productos: " + respuesta.message);
    }
  } catch (error) {
    console.error("Error al cargar productos:", error);
    mostrarErrorTabla("Error de conexion. Verifica que el backend este configurado correctamente.");
  }
}

function actualizarEstadisticas() {
  const productos = EstadoAdmin.productos;
  const enStock = productos.filter(p => parseInt(p.stock) > 0).length;
  const agotados = productos.filter(p => parseInt(p.stock) <= 0).length;
  const stockBajo = productos.filter(p => parseInt(p.stock) > 0 && parseInt(p.stock) <= 5).length;

  document.getElementById("stat-total-productos").textContent = productos.length;
  document.getElementById("stat-en-stock").textContent = enStock;
  document.getElementById("stat-agotados").textContent = agotados;
  document.getElementById("stat-stock-bajo").textContent = stockBajo;
}

function renderizarTablaProductos(productos) {
  const cuerpoTabla = document.getElementById("cuerpo-tabla-productos");
  if (!cuerpoTabla) return;

  if (productos.length === 0) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: var(--espacio-8); color: var(--color-texto-suave);">
          No hay productos disponibles. Crea el primero con el boton "Nuevo producto".
        </td>
      </tr>
    `;
    return;
  }

  cuerpoTabla.innerHTML = productos.map(producto => {
    const stock = parseInt(producto.stock);
    const claseStock = stock <= 0 ? "agotado" : stock <= 5 ? "bajo" : "ok";
    const textoStock = stock <= 0 ? "Agotado" : stock <= 5 ? `${stock} (bajo)` : stock;

    return `
      <tr>
        <td>
          <img
            class="tabla-imagen-miniatura"
            src="${producto.imagen_url || UI.generarImagenPlaceholder()}"
            alt="${producto.nombre}"
            onerror="UI.manejarErrorImagen(this)"
          />
        </td>
        <td>
          <strong style="font-size: var(--texto-sm);">${producto.nombre}</strong>
          ${producto.descripcion ? `<br><span style="font-size: var(--texto-xs); color: var(--color-texto-suave);">${UI.truncarTexto(producto.descripcion, 60)}</span>` : ""}
        </td>
        <td>
          <strong style="font-family: var(--fuente-display);">${UI.formatearPrecio(producto.precio)}</strong>
        </td>
        <td>
          <span class="etiqueta-stock etiqueta-stock-${claseStock}">${textoStock}</span>
        </td>
        <td>
          <div class="acciones-tabla">
            <button
              class="boton boton-secundario boton-pequeno"
              onclick="abrirModalEditarProducto('${producto.id}')"
            >
              Editar
            </button>
            <button
              class="boton boton-peligro boton-pequeno"
              onclick="confirmarEliminarProducto('${producto.id}', '${producto.nombre.replace(/'/g, "\\'")}')"
            >
              Eliminar
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join("");
}

function mostrarErrorTabla(mensaje) {
  const cuerpoTabla = document.getElementById("cuerpo-tabla-productos");
  if (cuerpoTabla) {
    cuerpoTabla.innerHTML = `
      <tr>
        <td colspan="5" style="text-align: center; padding: var(--espacio-8); color: var(--color-error);">
          ${mensaje}
        </td>
      </tr>
    `;
  }
}

// =============================================
// BUSCADOR ADMIN
// =============================================

let temporizadorBuscadorAdmin = null;

function inicializarBuscadorAdmin() {
  const buscador = document.getElementById("buscador-admin");
  if (!buscador) return;

  buscador.addEventListener("input", (e) => {
    clearTimeout(temporizadorBuscadorAdmin);
    temporizadorBuscadorAdmin = setTimeout(() => {
      const termino = e.target.value.toLowerCase();
      EstadoAdmin.productosFiltrados = termino
        ? EstadoAdmin.productos.filter(p =>
            p.nombre.toLowerCase().includes(termino) ||
            (p.descripcion || "").toLowerCase().includes(termino)
          )
        : [...EstadoAdmin.productos];
      renderizarTablaProductos(EstadoAdmin.productosFiltrados);
    }, 300);
  });
}

// =============================================
// MODAL DE PRODUCTO (CREAR / EDITAR)
// =============================================

function inicializarModalProducto() {
  document.getElementById("btn-cerrar-modal-producto")?.addEventListener("click", cerrarModalProducto);
  document.getElementById("btn-cancelar-modal-producto")?.addEventListener("click", cerrarModalProducto);
  document.getElementById("btn-guardar-producto")?.addEventListener("click", guardarProducto);

  // Llenar select de categorías
  const selectCat = document.getElementById("campo-categoria");
  if (selectCat) {
    selectCat.innerHTML = '<option value="">Selecciona una categoría...</option>' + 
      CATEGORIAS.map(cat => `<option value="${cat}">${cat}</option>`).join("");
  }

  // Vista previa de imagen
  document.getElementById("campo-imagen-url")?.addEventListener("input", actualizarVistaPrevia);

  // Cerrar al hacer clic fuera
  document.getElementById("modal-producto")?.addEventListener("click", (e) => {
    if (e.target === e.currentTarget) cerrarModalProducto();
  });
}

function categorizarAutomatico(nombre) {
  const n = nombre.toLowerCase();
  if (n.includes("polvo") || n.includes("hadas")) return "🧂 Polvos";
  if (n.includes("rubor") || n.includes("blush") || n.includes("berry bloom")) return "🌸 Rubores";
  if (n.includes("gloss")) return "💄 Gloss";
  if (n.includes("tinta") || n.includes("labial") || n.includes("balsamo") || n.includes("bálsamo") || n.includes("voluminizador") || n.includes("mimosa")) return "💋 Labiales";
  if (n.includes("pestañina") || n.includes("prosa")) return "👁️ Pestañinas";
  if (n.includes("skincare") || n.includes("serum") || n.includes("antioxidante") || n.includes("tónico") || n.includes("tonico") || n.includes("exfoliante") || n.includes("desmaquillante")) return "🧴 Kit de skincare";
  if (n.includes("base") || n.includes("corrector") || n.includes("hi zis") || n.includes("bb myk")) return "🧴 Bases";
  if (n.includes("fijador")) return "💦 Fijadores";
  if (n.includes("gel") || n.includes("melu")) return "🧪 Gel";
  if (n.includes("delineador") || n.includes("lapiz") || n.includes("lápiz")) return "✏️ Delineadores";
  if (n.includes("jabon") || n.includes("jabón")) return "🧼 Jabones";
  if (n.includes("shimmer") || n.includes("iluminador") || n.includes("esplendor") || n.includes("aurum")) return "✨ Iluminadores";
  if (n.includes("brocha")) return "🖌️ Brochas";
  if (n.includes("borla")) return "🧽 Borlas";
  if (n.includes("blender")) return "🥚 Bunny blender";
  if (n.includes("cosmetiquera") || n.includes("washbag")) return "👜 Cosmetiqueras";
  if (n.includes("intimo") || n.includes("íntimo")) return "🧼 Cuidado íntimo";
  if (n.includes("paleta") || n.includes("contorno")) return "🎨 Paletas";
  if (n.includes("primer")) return "🧴 Primer";
  if (n.includes("grasa") || n.includes("oil control") || n.includes("quita grasa")) return "🧻 Control de grasa";
  if (n.includes("bronzer")) return "🌞 Bronzer";
  if (n.includes("cejas") || n.includes("betun") || n.includes("betún")) return "👁️ Cejas";
  return ""; // En el admin lo dejamos vacío para obligarte a elegir una si no la reconoce
}

function abrirModalNuevoProducto() {
  limpiarFormularioProducto();
  document.getElementById("campo-categoria").value = "";
  document.getElementById("titulo-modal-producto").textContent = "Nuevo producto";
  document.getElementById("campo-id-producto").value = "";
  UI.mostrarModal("modal-producto");
}

function abrirModalEditarProducto(id) {
  const producto = EstadoAdmin.productos.find(p => p.id === id);
  if (!producto) return;

  // Extraer categoría de la descripción [Tag]
  let desc = producto.descripcion || "";
  let catEncontrada = "";
  const match = desc.match(/^\[(.*?)\]/);
  if (match) {
    catEncontrada = match[1];
    desc = desc.replace(/^\[.*?\]\s?/, "");
  } else {
    // Si no tiene categoría guardada en el Excel, intentar adivinarla por el nombre
    catEncontrada = categorizarAutomatico(producto.nombre || "");
  }

  document.getElementById("titulo-modal-producto").textContent = "Editar producto";
  document.getElementById("campo-id-producto").value = producto.id;
  document.getElementById("campo-nombre").value = producto.nombre || "";
  document.getElementById("campo-precio").value = producto.precio || "";
  document.getElementById("campo-stock").value = producto.stock || "0";
  document.getElementById("campo-imagen-url").value = producto.imagen_url || "";
  document.getElementById("campo-descripcion").value = desc;
  document.getElementById("campo-categoria").value = catEncontrada;

  actualizarVistaPrevia();
  UI.mostrarModal("modal-producto");
}

function cerrarModalProducto() {
  UI.ocultarModal("modal-producto");
  limpiarFormularioProducto();
}

function limpiarFormularioProducto() {
  document.getElementById("campo-id-producto").value = "";
  document.getElementById("campo-nombre").value = "";
  document.getElementById("campo-precio").value = "";
  document.getElementById("campo-stock").value = "0";
  document.getElementById("campo-imagen-url").value = "";
  document.getElementById("campo-descripcion").value = "";
  document.getElementById("campo-categoria").value = "";
  document.getElementById("vista-previa-imagen").style.display = "none";
}

function actualizarVistaPrevia() {
  const url = document.getElementById("campo-imagen-url")?.value.trim();
  const contenedorVistaPrev = document.getElementById("vista-previa-imagen");
  const imgVistaPrev = document.getElementById("img-vista-previa");

  if (url && contenedorVistaPrev && imgVistaPrev) {
    contenedorVistaPrev.style.display = "block";
    imgVistaPrev.src = url;
    imgVistaPrev.onerror = () => {
      contenedorVistaPrev.style.display = "none";
    };
  } else if (contenedorVistaPrev) {
    contenedorVistaPrev.style.display = "none";
  }
}

async function guardarProducto() {
  const id = document.getElementById("campo-id-producto").value;
  const nombre = document.getElementById("campo-nombre").value.trim();
  const categoria = document.getElementById("campo-categoria").value;
  const precio = document.getElementById("campo-precio").value;
  const stock = document.getElementById("campo-stock").value;
  const imagenUrl = document.getElementById("campo-imagen-url").value.trim();
  let descripcion = document.getElementById("campo-descripcion").value.trim();

  // Validaciones
  if (!nombre) {
    UI.mostrarNotificacion("El nombre del producto es obligatorio", "error");
    document.getElementById("campo-nombre").focus();
    return;
  }

  if (!categoria) {
    UI.mostrarNotificacion("Debes seleccionar una categoría", "error");
    document.getElementById("campo-categoria").focus();
    return;
  }

  if (!precio || isNaN(precio) || parseFloat(precio) < 0) {
    UI.mostrarNotificacion("El precio debe ser un numero valido", "error");
    document.getElementById("campo-precio").focus();
    return;
  }

  // Guardar categoría dentro de la descripción
  descripcion = `[${categoria}] ${descripcion}`;

  const boton = document.getElementById("btn-guardar-producto");
  UI.mostrarCarga(boton);

  try {
    const datosProducto = { nombre, precio: parseFloat(precio), stock: parseInt(stock || 0), imagen_url: imagenUrl, descripcion };
    let respuesta;

    if (id) {
      // Actualizar producto existente
      respuesta = await API.actualizarProducto({ id, ...datosProducto });
    } else {
      // Crear nuevo producto
      respuesta = await API.crearProducto(datosProducto);
    }

    if (respuesta.success) {
      UI.mostrarNotificacion(id ? "Producto actualizado correctamente" : "Producto creado correctamente", "exito");
      cerrarModalProducto();
      await cargarProductosAdmin();
    } else {
      UI.mostrarNotificacion("Error: " + respuesta.message, "error");
    }
  } catch (error) {
    console.error("Error al guardar producto:", error);
    UI.mostrarNotificacion("Error al guardar el producto. Verifica la conexion.", "error");
  } finally {
    UI.ocultarCarga(boton);
  }
}

// =============================================
// MODAL DE ELIMINACIÓN
// =============================================

function inicializarModalEliminar() {
  document.getElementById("btn-cerrar-confirmar")?.addEventListener("click", cerrarModalEliminar);
  document.getElementById("btn-cancelar-eliminar")?.addEventListener("click", cerrarModalEliminar);
  document.getElementById("btn-confirmar-eliminar")?.addEventListener("click", ejecutarEliminarProducto);
}

function confirmarEliminarProducto(id, nombre) {
  EstadoAdmin.idAEliminar = id;
  const nombreElem = document.getElementById("nombre-a-eliminar");
  if (nombreElem) nombreElem.textContent = nombre;
  UI.mostrarModal("modal-confirmar-eliminar");
}

function cerrarModalEliminar() {
  EstadoAdmin.idAEliminar = null;
  UI.ocultarModal("modal-confirmar-eliminar");
}

async function ejecutarEliminarProducto() {
  if (!EstadoAdmin.idAEliminar) return;

  const boton = document.getElementById("btn-confirmar-eliminar");
  UI.mostrarCarga(boton);

  try {
    const respuesta = await API.eliminarProducto(EstadoAdmin.idAEliminar);

    if (respuesta.success) {
      UI.mostrarNotificacion("Producto eliminado correctamente", "exito");
      cerrarModalEliminar();
      await cargarProductosAdmin();
    } else {
      UI.mostrarNotificacion("Error al eliminar: " + respuesta.message, "error");
    }
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    UI.mostrarNotificacion("Error de conexion al eliminar el producto", "error");
  } finally {
    UI.ocultarCarga(boton);
  }
}
