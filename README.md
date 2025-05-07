
# Aplicación PWA en React para Control de Asistencia a Eventos

## Prompt Original (Claude 3.7 Sonnet)

> Necesito una aplicación en ReactJS PWA con capacidad de trabajar offline/online, para control de asistencia a eventos de personas.  
> Tanto los Eventos como las Personas relacionadas a cada Evento ya se encuentran ingresados en el Sistema.  
> Los Eventos tienen un nombre, descripción, fecha de realización y estado (abierto/cerrado).  
> Las personas tienen: Nombre, Número de Credencial, DNI, Email.  
> La aplicación en la home me presenta una lista de Eventos para registrar la asistencia de las Personas ya asignadas.  
> Cuando seleccionamos un Evento y vamos a Registrar Asistencia, nos muestra el listado de personas posibles de marcarle la asistencia.  
> Esas personas se pueden buscar por cualquiera de sus campos, y cuando se selecciona una, se puede marcar la Asistencia; esta acción queda registrada con el horario de realización.  
> En el listado principal de Eventos se muestra un resumen de los Eventos con Cantidad total de Personas y Cantidad de Asistentes.

---

## Características de la Aplicación

### 1. Funcionalidad Offline/Online
- Utiliza **IndexedDB** para almacenar datos localmente.
- Detecta automáticamente el estado de la conexión.
- **Sincroniza** los datos cuando se restaura la conexión.

### 2. Estructura de Datos
- **Eventos**: nombre, descripción, fecha, estado (abierto/cerrado).
- **Personas**: nombre, número de credencial, DNI, email.
- **Registros de asistencia**: incluyen marca de tiempo.

### 3. Interfaz de Usuario
- Pantalla principal con **lista de eventos** y resumen de asistencia.
- Pantalla de **detalle del evento** para registrar asistencias.
- **Búsqueda** de personas por cualquier campo (nombre, credencial, DNI, email).
- **Indicador visual** del estado de conexión y sincronización.

### 4. Progressive Web App
- Implementación de **Service Worker** para funcionamiento offline.
- Archivo **manifest.json** para instalación como aplicación.
- **Precarga** de recursos críticos.

---

## Cómo Funciona la Aplicación

### 1. Página Principal (Home)
- Muestra la lista de eventos disponibles.
- Para cada evento se visualiza:
  - Nombre
  - Descripción
  - Fecha
  - Estado
  - Total de personas
  - Cantidad de asistentes
- Permite filtrar eventos por nombre o descripción.

### 2. Página de Detalle del Evento
- Muestra información detallada del evento.
- Lista todas las personas asignadas al evento.
- Permite buscar personas por nombre, credencial, DNI o email.
- Permite **marcar asistencia** con registro de horario.
- Muestra un resumen con el total de personas y asistentes.

### 3. Sistema de Sincronización
- Sincronización automática cuando la conexión está disponible.
- Indicador en la parte inferior muestra el estado de conexión.
- Las operaciones realizadas offline se **encolan** y se sincronizan al recuperar conexión.

---

## Tecnologías Utilizadas

- **React.js** para la interfaz de usuario.
- **IndexedDB** para almacenamiento local.
- **Service Workers** para funcionalidad offline.
- **Material-UI** para componentes visuales.
- **React Context API** para manejo del estado global.

---

## Recomendaciones para Entorno de Producción

1. Reemplazar las funciones **mock** de API por llamadas reales al backend.
2. Configurar correctamente el **Service Worker** (el código está comentado en el proyecto).
3. Crear los **iconos requeridos** para el archivo `manifest.json`.
4. Implementar un sistema de **autenticación**, si es necesario.
