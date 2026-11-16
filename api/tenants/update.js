const {
  authenticateStaff,
  isConfigured,
  serviceRequest
} = require('../../lib/supabase-server');
const isId = (value) => typeof value === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(value);

module.exports = async (req, res) => {
  if (req.method !== 'PATCH') {
    res.setHeader('Allow', 'PATCH');
    return res.status(405).json({ error: 'Método no permitido.' });
  }
  if (!isConfigured()) {
    return res.status(503).json({ error: 'El servidor no tiene configuradas las credenciales de Supabase.' });
  }

  try {
    const caller = await authenticateStaff(req);
    const { id, name, licenseStatus, developerBlocked } = req.body || {};
    if (!caller || !['admin', 'developer'].includes(caller.role)) {
      return res.status(403).json({ error: 'No tienes permiso para modificar esta sede.' });
    }
    if (!isId(id)) return res.status(400).json({ error: 'Se requiere un ID de sede válido.' });
    if (caller.role === 'admin') {
      if (caller.tenant_id !== id || licenseStatus !== undefined || developerBlocked !== undefined) {
        return res.status(403).json({ error: 'Los administradores solo pueden cambiar el nombre de su propia sede activa.' });
      }
      const tenants = await serviceRequest(
        `tenants?select=license_status,developer_blocked&id=eq.${encodeURIComponent(id)}&limit=1`
      );
      if (!tenants?.[0] || tenants[0].license_status !== 'active' || tenants[0].developer_blocked) {
        return res.status(403).json({ error: 'La sede está bloqueada y no puede modificarse.' });
      }
    }
    const updates = {};
    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return res.status(400).json({ error: 'El nombre de la sede no puede estar vacío.' });
      }
      updates.name = name.trim();
    }
    if (licenseStatus !== undefined) {
      if (!['active', 'paused'].includes(licenseStatus)) {
        return res.status(400).json({ error: 'El estado de licencia no es válido.' });
      }
      updates.license_status = licenseStatus;
    }
    if (developerBlocked !== undefined) {
      if (typeof developerBlocked !== 'boolean') {
        return res.status(400).json({ error: 'El bloqueo de mantenimiento debe ser verdadero o falso.' });
      }
      updates.developer_blocked = developerBlocked;
    }
    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No se enviaron campos de sede válidos.' });
    }

    const updated = await serviceRequest(`tenants?id=eq.${encodeURIComponent(id)}`, {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(updates)
    });
    if (!updated?.length) return res.status(404).json({ error: 'No se encontró la sede.' });
    if (updates.name && updated[0].entity_type === 'independent') {
      await serviceRequest(
        `booking_entities?tenant_id=eq.${encodeURIComponent(id)}&entity_type=eq.independent`,
        {
          method: 'PATCH',
          headers: { Prefer: 'return=minimal' },
          body: JSON.stringify({ name: updates.name, updated_at: new Date().toISOString() })
        }
      );
    }
    return res.status(200).json({ tenant: updated[0] });
  } catch (error) {
    console.error('Tenant update failed:', error.message);
    return res.status(500).json({ error: 'No se pudo actualizar la sede.' });
  }
};
