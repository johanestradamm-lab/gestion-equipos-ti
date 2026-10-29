# Sistema de Gestión de Servicio Técnico TI (TechService)

Plataforma web para la gestión integral, trazabilidad de órdenes de reparación, control de clientes y monitoreo de KPIs en servicios de soporte técnico informático.

## Descripción General

**TechService** surge como una solución tecnológica centralizada para laboratorios y talleres de servicio técnico en TI. Permite controlar el flujo completo de reparación de equipos (recibidos, en revisión, reparados, entregados y anulados), gestionar la información de clientes y visualizar métricas financieras y operativas clave en tiempo real a través de un panel de control interactivo.

## Funcionalidades Principales

* **Panel de Control (Dashboard Automático):** 
  * Métricas en tiempo real de órdenes activas, listas para entrega, clientes registrados y recaudo total estimado.
  * Mapeo dinámico y vista rápida de las últimas 5 órdenes registradas.
* **Módulo de Órdenes de Servicio (CRUD):** 
  * Registro, edición, actualización de estados (`EN REPARACION`, `REPARADO`, `ENTREGADO`, `ANULADO`) y anulación de solicitudes.
  * Asignación de fallas reportadas, diagnósticos técnicos y cálculo de costos.
* **Gestión de Clientes y Equipos:** 
  * Base de datos centralizada de clientes y trazabilidad del tipo/marca de hardware ingresado.
* **Búsqueda y Filtrado Global:** 
  * Filtro interactivo en tiempo real para localizar rápidamente órdenes por cliente, ID, equipo o estado en la interfaz.

## Stack Tecnológico

* **Backend:** Node.js, Express.js
* **Base de Datos:** Oracle Database (Oracle XE / `oracledb`)
* **Frontend:** HTML5, CSS3 (Bootstrap 5), JavaScript vanilla (ES6+)
* **Control de Versiones:** Git & GitHub