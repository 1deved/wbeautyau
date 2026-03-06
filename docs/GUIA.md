# Guia completa de configuracion
## Ecommerce con Google Sheets y WhatsApp

---

## Indice

1. Crear la hoja de calculo en Google Sheets
2. Configurar el backend en Google Apps Script
3. Desplegar el Apps Script como API publica
4. Conectar el frontend con la API
5. Configurar el numero de WhatsApp
6. Agregar y gestionar productos
7. Cambiar la contrasena del administrador
8. Personalizar el diseno
9. Desplegar el frontend en hosting gratuito

---

## 1. Crear la hoja de calculo en Google Sheets

1. Ve a [sheets.google.com](https://sheets.google.com) e inicia sesion con tu cuenta de Google.
2. Crea una nueva hoja de calculo. Ponle un nombre como "Tienda Online - Base de Datos".
3. La hoja de calculo debe tener **dos hojas** (pestanas):

### Hoja: `productos`

Crea una hoja llamada exactamente `productos` y agrega estos encabezados en la fila 1:

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| id | nombre | descripcion | precio | imagen_url | stock | creado_en | actualizado_en |

### Hoja: `registro_pedidos`

Crea una segunda hoja llamada exactamente `registro_pedidos` con estos encabezados:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| id_pedido | productos | precio_total | nombre_cliente | ciudad_cliente | nota_cliente | fecha |

**Importante:** Los nombres de las hojas deben escribirse exactamente igual, en minusculas y con guion bajo.

---

## 2. Configurar el backend en Google Apps Script

1. En tu hoja de calculo de Google Sheets, ve al menu **Extensiones > Apps Script**.
2. Se abrira el editor de Apps Script.
3. Borra el codigo existente en el archivo `Codigo.gs`.
4. Copia y pega **todo el contenido** del archivo `docs/backend.gs` que esta en este proyecto.
5. Guarda el archivo con **Ctrl+S** (o Cmd+S en Mac).

---

## 3. Desplegar el Apps Script como API publica

1. En el editor de Apps Script, haz clic en el boton azul **"Implementar"** (esquina superior derecha).
2. Selecciona **"Nueva implementacion"**.
3. Haz clic en el icono de engranaje junto a "Tipo" y selecciona **"Aplicacion web"**.
4. Completa la configuracion:
   - **Descripcion:** API Tienda Online (o cualquier nombre)
   - **Ejecutar como:** Yo (tu cuenta de Google)
   - **Quién tiene acceso:** Cualquier persona
5. Haz clic en **"Implementar"**.
6. Google pedira que autorices los permisos. Haz clic en "Autorizar acceso" y acepta los permisos.
7. Copia la **URL del servicio web** que aparece. Se vera algo asi:
   ```
   https://script.google.com/macros/s/AKfycby.../exec
   ```
8. Guarda esta URL, la necesitaras en el siguiente paso.

**Nota:** Cada vez que modifiques el backend, debes crear una nueva implementacion. Las implementaciones antiguas seguiran funcionando hasta que las elimines.

---

## 4. Conectar el frontend con la API

1. Abre el archivo `js/services/api.js` en tu editor de codigo.
2. Busca esta linea al inicio del archivo:
   ```javascript
   const URL_API = "https://script.google.com/macros/s/TU_ID_DE_SCRIPT_AQUI/exec";
   ```
3. Reemplaza `TU_ID_DE_SCRIPT_AQUI/exec` con la URL que copiaste en el paso anterior.
4. Guarda el archivo.

**Ejemplo de como deberia quedar:**
```javascript
const URL_API = "https://script.google.com/macros/s/AKfycby.../exec";
```

---

## 5. Configurar el numero de WhatsApp

1. En el mismo archivo `js/services/api.js`, busca esta linea:
   ```javascript
   const NUMERO_WHATSAPP = "573001234567";
   ```
2. Reemplaza el numero con tu numero de WhatsApp Business.
   - El formato debe ser: **codigo de pais + numero**, sin espacios ni el simbolo `+`.
   - Ejemplo para Colombia: `573001234567` (57 es el codigo de Colombia, seguido del numero)
   - Ejemplo para Mexico: `5215512345678`
   - Ejemplo para Argentina: `541112345678`

---

## 6. Agregar y gestionar productos

### Desde el panel de administrador (recomendado)

1. Abre tu tienda en el navegador y ve a `/admin/index.html`.
2. Inicia sesion con la contrasena (por defecto: `admin123`).
3. Haz clic en **"Nuevo producto"**.
4. Completa el formulario:
   - **Nombre:** El nombre del producto
   - **Precio:** El precio en tu moneda
   - **Stock:** Cantidad disponible
   - **URL de la imagen:** URL publica de la imagen (ver nota abajo)
   - **Descripcion:** Descripcion detallada
5. Haz clic en **"Guardar producto"**.

### Subir imagenes de productos

Las imagenes no se guardan en Google Sheets, solo se guarda la URL. Puedes usar:

- **Google Drive:** Sube la imagen, cambia permisos a "Cualquier usuario con enlace puede ver" y copia el enlace directo.
- **Imgur:** Sube la imagen en [imgur.com](https://imgur.com) y copia el enlace directo (termina en .jpg o .png).
- **Cloudinary:** Servicio gratuito con mas funciones para gestion de imagenes.
- **Cualquier servidor propio:** Pega la URL directa de la imagen.

**Para Google Drive:** La URL del archivo de Drive NO es directa. Debes usar este formato:
```
https://drive.google.com/uc?export=view&id=ID_DEL_ARCHIVO
```
Donde `ID_DEL_ARCHIVO` es el ID que aparece en la URL de compartir de Drive.

### Directamente en Google Sheets

Tambien puedes agregar productos directamente en la hoja `productos`:
- Rellena todas las columnas
- El campo `id` debe ser unico para cada producto
- El campo `creado_en` y `actualizado_en` deben tener formato de fecha ISO

---

## 7. Cambiar la contrasena del administrador

1. Abre el archivo `admin/admin.js`.
2. Busca esta linea al inicio del archivo:
   ```javascript
   const CONTRASENA_ADMIN = "admin123";
   ```
3. Reemplaza `admin123` con tu contrasena deseada.
4. Guarda el archivo.

**Importante:** Esta contrasena se almacena en el codigo del frontend, lo cual no es ideal para alta seguridad. Para una tienda de bajo riesgo es suficiente. Si necesitas mayor seguridad, considera implementar autenticacion con Google en Apps Script.

---

## 8. Personalizar el diseno

### Cambiar el nombre de la tienda

Busca y reemplaza `"Mi Tienda"` en todos los archivos HTML por el nombre de tu negocio.

### Cambiar los colores

En `css/estilos.css`, al inicio del archivo encontraras las variables de color:

```css
:root {
  --color-fondo: #faf8f4;          /* Color de fondo principal */
  --color-acento: #2c5f2e;         /* Color de acento (botones, precios) */
  --color-texto-principal: #1a1714; /* Color del texto */
  /* ... mas variables ... */
}
```

Modifica estos valores para cambiar toda la paleta de colores de la tienda.

### Cambiar las fuentes

En `css/estilos.css`, cambia el `@import` de Google Fonts y las variables:
```css
@import url('TU_URL_DE_GOOGLE_FONTS');

:root {
  --fuente-display: 'Tu Fuente Display', serif;
  --fuente-cuerpo: 'Tu Fuente Cuerpo', sans-serif;
}
```

### Cambiar el texto del hero

En `index.html`, busca la seccion `seccion-hero` y modifica el titulo, subtitulo y descripcion.

---

## 9. Desplegar el frontend en hosting gratuito

El frontend es un sitio estatico (HTML, CSS, JS) que puedes alojar gratuitamente.

### Opcion A: GitHub Pages (recomendada)

1. Crea una cuenta en [github.com](https://github.com).
2. Crea un nuevo repositorio publico.
3. Sube todos los archivos del proyecto al repositorio.
4. Ve a **Settings > Pages**.
5. En "Source", selecciona la rama `main` y la carpeta raiz `/`.
6. Tu tienda estara disponible en `https://tu-usuario.github.io/nombre-repositorio`.

### Opcion B: Netlify

1. Crea una cuenta en [netlify.com](https://netlify.com).
2. Arrastra la carpeta del proyecto al area de "Deploy" en el dashboard.
3. Netlify generara una URL gratuita automaticamente.
4. Opcionalmente, conecta tu dominio personalizado.

### Opcion C: Vercel

1. Crea una cuenta en [vercel.com](https://vercel.com).
2. Importa tu repositorio de GitHub.
3. Vercel desplegara automaticamente.

---

## Preguntas frecuentes

**El carrito no guarda los productos entre sesiones**
El carrito usa localStorage. Si el usuario borra el historial del navegador o usa modo incognito, se pierde el carrito. Esto es el comportamiento esperado.

**Los productos no cargan**
Verifica que:
- La URL de la API en `js/services/api.js` sea correcta
- El Apps Script este desplegado como "Cualquier persona puede acceder"
- La hoja de Google Sheets tenga los encabezados correctos
- No haya errores en la consola del navegador (F12 > Console)

**El pedido se abre en WhatsApp Web pero no en la app movil**
WhatsApp detecta automaticamente si el usuario esta en movil o escritorio. En moviles abrira la app, en escritorio abrira WhatsApp Web.

**Como actualizar el backend**
Al modificar `backend.gs`, debes crear una nueva implementacion en Apps Script. Las URLs de implementaciones anteriores dejaran de funcionar si usas la nueva URL.

---

## Estructura del proyecto

```
tienda/
  index.html          - Pagina principal de la tienda
  producto.html       - Pagina de detalle de producto
  css/
    estilos.css       - Estilos principales
    admin.css         - Estilos del panel admin
  js/
    tienda.js         - Logica de la tienda
    producto.js       - Logica de detalle de producto
    services/
      api.js          - Comunicacion con el backend
      carrito.js      - Gestion del carrito
      ui.js           - Utilidades de interfaz
  admin/
    index.html        - Panel de administracion
    admin.js          - Logica del panel admin
  docs/
    backend.gs        - Codigo del backend (Apps Script)
    GUIA.md           - Este archivo de documentacion
```
