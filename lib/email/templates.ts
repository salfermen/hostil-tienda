/**
 * Plantillas de correo en HTML simple (con estilos en línea, que es lo que soportan
 * los clientes de correo como Gmail u Outlook). Sin dependencias extra.
 */

export type EmailMessage = { to: string; subject: string; html: string; text: string }

const escapeHtml = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!,
  )

type AccessCodeEmail = {
  to: string
  name: string | null
  dropName: string
  dropDescription: string | null
  code: string
  accessUrl: string
}

export function accessCodeEmail(input: AccessCodeEmail): EmailMessage {
  const greeting = input.name ? `Hola, ${input.name}.` : 'Hola.'
  const drop = escapeHtml(input.dropName)
  const description = input.dropDescription ? escapeHtml(input.dropDescription) : ''

  const html = `<!doctype html>
<html lang="es"><body style="margin:0;background:#0c0c0c;color:#f4f1ed;font-family:Arial,Helvetica,sans-serif">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0c0c0c">
    <tr><td align="center" style="padding:40px 16px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px">
        <tr><td style="font-size:28px;font-weight:bold;font-style:italic;letter-spacing:-2px">HOSTIL<span style="color:#df2d22;font-size:10px">®</span></td></tr>
        <tr><td style="padding-top:32px;font-size:13px;letter-spacing:2px;color:#df2d22">NUEVO DROP / ACCESO PRIVADO</td></tr>
        <tr><td style="padding-top:12px;font-size:36px;font-weight:bold;text-transform:uppercase">${drop}</td></tr>
        <tr><td style="padding-top:16px;font-size:16px;line-height:1.5;color:#c2bfbb">${escapeHtml(greeting)} ${description}</td></tr>
        <tr><td style="padding-top:28px;font-size:12px;letter-spacing:2px;color:#aaa6a2">TU CÓDIGO PERSONAL</td></tr>
        <tr><td style="padding-top:8px"><div style="display:inline-block;border:1px solid #df2d22;padding:14px 20px;font-family:'Courier New',monospace;font-size:26px;letter-spacing:4px;color:#f4f1ed">${escapeHtml(input.code)}</div></td></tr>
        <tr><td style="padding-top:28px"><a href="${escapeHtml(input.accessUrl)}" style="display:inline-block;background:#df2d22;color:#ffffff;text-decoration:none;padding:14px 22px;font-size:13px;letter-spacing:1px;text-transform:uppercase">Entrar al drop</a></td></tr>
        <tr><td style="padding-top:28px;font-size:12px;line-height:1.5;color:#898581">Este código es solo tuyo y queda asociado a tu correo. Si lo compartes, podemos desactivarlo.</td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`

  const text = [
    `HOSTIL — ${input.dropName}`,
    '',
    greeting,
    input.dropDescription ?? '',
    '',
    `Tu código personal: ${input.code}`,
    `Entra aquí: ${input.accessUrl}`,
    '',
    'Este código es solo tuyo y queda asociado a tu correo.',
  ].join('\n')

  return { to: input.to, subject: `${input.dropName}: tu acceso al drop de HOSTIL`, html, text }
}
