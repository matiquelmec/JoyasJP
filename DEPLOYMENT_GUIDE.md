# 🚀 **GUÍA DE DESPLIEGUE Y ROTACIÓN DE CREDENCIALES**

**Proyecto:** Joyas JP - E-commerce  
**Fecha:** 3 de Agosto, 2025  
**Estado:** Listo para producción (pendiente seguridad)  

---

## 🚨 **ACCIONES CRÍTICAS INMEDIATAS**

### **1. ROTACIÓN DE CREDENCIALES MERCADOPAGO**

**⚠️ PROBLEMA CRÍTICO:**
- Token de producción expuesto: `APP_USR-5821576549474913...`
- Committeado al repositorio público

**✅ SOLUCIÓN:**

1. **Ir a MercadoPago Developers:**
   ```
   https://www.mercadopago.cl/developers/panel
   ```

2. **Regenerar Access Token:**
   - Panel → Aplicaciones → Tu App
   - Credenciales → Regenerar Access Token
   - **IMPORTANTE:** Guardar el nuevo token INMEDIATAMENTE

3. **Actualizar en Netlify:**
   ```bash
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=NUEVO_PUBLIC_KEY
   MERCADOPAGO_ACCESS_TOKEN=NUEVO_ACCESS_TOKEN
   ```

---

### **2. ROTACIÓN DE CREDENCIALES SUPABASE**

**⚠️ PROBLEMA CRÍTICO:**
- Service Role Key expuesto con permisos administrativos
- URL del proyecto expuesta

**✅ SOLUCIÓN:**

1. **Ir a Supabase Dashboard:**
   ```
   https://supabase.com/dashboard/project/[tu-project-id]
   ```

2. **Regenerar API Keys:**
   - Settings → API
   - Service Role Key → "Regenerate"
   - **CRÍTICO:** Esto invalidará la key actual

3. **Actualizar en Netlify:**
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://tu-nuevo-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=nueva_anon_key
   SUPABASE_SERVICE_ROLE_KEY=nueva_service_role_key
   ```

---

### **3. CONFIGURACIÓN EN NETLIFY**

**Paso a paso:**

1. **Acceder a Netlify:**
   ```
   https://app.netlify.com/sites/[tu-site]/settings/env
   ```

2. **Variables de Entorno Requeridas:**
   ```bash
   # Supabase (NUEVAS)
   NEXT_PUBLIC_SUPABASE_URL=https://nueva-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

   # MercadoPago (NUEVOS)
   NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-nueva-public-key
   MERCADOPAGO_ACCESS_TOKEN=APP_USR-nuevo-access-token

   # Configuración del sitio
   NEXT_PUBLIC_SITE_URL=https://tu-dominio.netlify.app
   NODE_ENV=production
   ```

3. **Deploy Automático:**
   - Al guardar las variables, Netlify redesplegará automáticamente
   - Verificar en deploy logs que no hay errores

---

## 🔧 **VERIFICACIÓN POST-DESPLIEGUE**

### **Checklist de Funcionalidad:**

- [ ] **Sitio carga correctamente**
- [ ] **Productos se muestran desde Supabase**
- [ ] **Carrito funciona**
- [ ] **Proceso de checkout inicia**
- [ ] **MercadoPago redirecciona correctamente**
- [ ] **Panel admin accesible** (`/admin`)
- [ ] **Dashboard muestra datos reales**
- [ ] **Gestión de productos funciona**

### **Testing de Pagos:**

1. **Usar tarjetas de prueba MercadoPago:**
   ```
   VISA: 4509 9535 6623 3704
   CVV: 123
   Vencimiento: 11/25
   ```

2. **Verificar flujo completo:**
   - Agregar producto al carrito
   - Proceder al checkout
   - Completar datos de envío
   - Pagar con tarjeta de prueba
   - Verificar webhook recibido

---

## 📱 **TESTING MÓVIL**

### **Dispositivos Críticos:**
- **iPhone:** Safari (iOS 15+)
- **Android:** Chrome (Android 10+)
- **Tablet:** iPad Safari

### **Aspectos a Verificar:**
- [ ] Navegación táctil
- [ ] Carga de imágenes optimizada
- [ ] Checkout móvil MercadoPago
- [ ] Performance general
- [ ] Panel admin en móvil

---

## 🚀 **PROCESO DE LANZAMIENTO**

### **Día 1: Rotación de Credenciales**
```bash
# 1. Rotar MercadoPago (15 min)
# 2. Rotar Supabase (15 min)  
# 3. Configurar Netlify (10 min)
# 4. Verificar deploy (10 min)
# Total: ~1 hora
```

### **Día 2-3: Testing Final**
```bash
# 1. Testing funcional completo
# 2. Testing de pagos
# 3. Testing móvil
# 4. Performance verification
```

### **Día 4-5: Lanzamiento**
```bash
# 1. Configurar dominio custom (opcional)
# 2. Activar analytics
# 3. Primera venta de prueba
# 4. ¡CLIENTE OPERATIVO! 🎉
```

---

## 📊 **MONITOREO POST-LANZAMIENTO**

### **Métricas Críticas:**
- **Uptime:** >99.5%
- **Core Web Vitals:** LCP <2.5s, FID <100ms, CLS <0.1
- **Conversion Rate:** Seguimiento de carrito → compra
- **Error Rate:** <1% de errores JavaScript

### **Tools Recomendadas:**
- **Netlify Analytics:** Incluido
- **Google Analytics 4:** Para conversiones
- **Sentry:** Para error tracking (opcional)
- **Hotjar:** Para UX insights (opcional)

---

## 🛡️ **SEGURIDAD CONTINUA**

### **Mejores Prácticas:**
1. **Nunca commitear .env files**
2. **Rotar credenciales cada 3-6 meses**
3. **Monitorear logs de acceso**
4. **Backup automático de Supabase**
5. **Updates regulares de dependencias**

### **Alerts Configuradas:**
- **Down time:** Notificación inmediata
- **Error spikes:** >10 errores/min
- **Performance degradation:** LCP >4s
- **Failed payments:** Webhook failures

---

## 📞 **SOPORTE Y CONTACTOS**

### **Documentación Oficial:**
- **Next.js:** https://nextjs.org/docs
- **Supabase:** https://supabase.com/docs
- **MercadoPago:** https://www.mercadopago.cl/developers
- **Netlify:** https://docs.netlify.com

### **Status Pages:**
- **Netlify:** https://netlifystatus.com
- **Supabase:** https://status.supabase.com
- **MercadoPago:** https://status.mercadopago.com

---

## 🎯 **CHECKLIST FINAL DE DESPLIEGUE**

### **Pre-Deploy:**
- [ ] Rotación MercadoPago completada
- [ ] Rotación Supabase completada
- [ ] Variables configuradas en Netlify
- [ ] .env.local removido del repo
- [ ] Build local exitoso

### **Post-Deploy:**
- [ ] Sitio accesible públicamente
- [ ] Productos cargan correctamente
- [ ] Checkout funcional
- [ ] Panel admin operativo
- [ ] Testing móvil exitoso
- [ ] Performance optimizada

### **Launch:**
- [ ] Dominio configurado (opcional)
- [ ] Analytics activado
- [ ] Primera transacción de prueba
- [ ] Comunicación al cliente
- [ ] **🚀 ¡LANZAMIENTO EXITOSO!**

---

**⚡ TIEMPO ESTIMADO TOTAL: 2-3 días**  
**🎯 RESULTADO: Cliente operativo y vendiendo en Chile**

---

*📝 Documento creado automáticamente por Claude Code*  
*🔄 Última actualización: 3 de Agosto, 2025*