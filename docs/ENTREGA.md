# Guía de Entrega y Administración - Joyas JP 🚀

Esta guía contiene la información necesaria para que el cliente final pueda gestionar su tienda Joyas JP de forma profesional y segura.

## 1. Acceso al Panel de Administración
*   **URL:** `https://joyasjp.cl/admin`
*   **Contraseña Actual:** `joyasjp2024` (Configurable vía variables de entorno).

### Tareas Administrativas
*   **Gestión de Inventario:** Desde el panel admin puedes actualizar el stock en tiempo real. Un producto sin stock no permitirá la compra para evitar problemas de sobreventa.
*   **Control de Pedidos:** Cada vez que un pago es aprobado en Flow.cl, el pedido se marcará como "paid" automáticamente y el stock se descontará de forma atómica en la base de datos.

## 2. Pagos y Finanzas (Flow.cl)
*   **Webhooks:** El sistema ya está configurado para recibir notificaciones automáticas de Flow.cl. Si un pago queda pendiente y luego se aprueba, la base de datos se actualizará sola.
*   **Conciliación:** Siempre verifica que el ID de la orden en el panel coincida con el ID de transacción en tu cuenta de Flow.cl.

## 3. Consideraciones Técnicas para el Cliente
*   **SEO:** El sitemap y los esquemas JSON-LD están optimizados para Chile. Google indexará automáticamente tus productos.
*   **Performance:** Hemos implementado SSR (Server-Side Rendering) para que la colección de joyas cargue en menos de 1.2 segundos.
*   **Seguridad:** Las claves secretas de la base de datos y de pagos están protegidas y no son visibles públicamente.

## 4. Próximos Pasos Recomendados (Post-Entrega)
1.  **Cambio de Password:** Se recomienda cambiar la `NEXT_PUBLIC_ADMIN_KEY` en el archivo de variables de entorno del servidor (Netlify/Vercel) para máxima seguridad.
2.  **Mantenimiento:** Realizar una limpieza de imágenes antiguas una vez al mes desde el panel de herramientas (si aplica).

---
*Equipo de Desarrollo Senior - Joyas JP*
