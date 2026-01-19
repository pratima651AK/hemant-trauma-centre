
export const EmailTemplate = (leads: { name: string; mobile: string; message: string | null; created_at?: string | Date }[]) => {
  const count = leads.length;

  const leadRows = leads
    .map(
      (a) => {
        const timestamp = a.created_at ? new Date(a.created_at).toLocaleString('en-IN', {
          timeZone: 'Asia/Kolkata',
          dateStyle: 'short',
          timeStyle: 'short'
        }) : '';

        return `
        <div style="background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px;">
          <table width="100%" border="0" cellspacing="0" cellpadding="0" style="border-collapse: collapse;">
            <tr>
              <!-- Left Column: Patient Info -->
              <td valign="top" style="padding-right: 16px;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                  <h3 style="margin: 0; color: #1e293b; font-size: 16px; font-weight: 700;">${a.name}</h3>
                  <span style="color: #94a3b8; font-size: 11px;">${timestamp}</span>
                </div>
                <p style="margin: 0 0 8px; color: #475569; font-size: 14px; font-weight: 500;">📞 ${a.mobile}</p>
                <div style="background-color: #f8fafc; padding: 10px; border-radius: 6px; border-left: 3px solid #3b82f6;">
                  <p style="margin: 0; color: #475569; font-size: 13px; line-height: 1.5; word-break: break-word;">
                    ${a.message ? `"${a.message}"` : '<em>No specific symptoms listed</em>'}
                  </p>
                </div>
              </td>

              <!-- Right Column: Actions -->
              <td valign="middle" align="right" width="40">
                <!-- WhatsApp -->
                <div style="margin-bottom: 12px;">
                  <a href="https://wa.me/91${a.mobile}" style="background-color: #25D366; color: white; padding: 0; border-radius: 50%; text-decoration: none; display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" title="WhatsApp">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/WhatsApp.svg/1200px-WhatsApp.svg.png" width="20" height="20" alt="WA" style="vertical-align: middle;" />
                  </a>
                </div>
                <!-- Call -->
                <div>
                  <a href="tel:${a.mobile}" style="background-color: #3b82f6; color: white; padding: 0; border-radius: 50%; text-decoration: none; display: inline-block; width: 32px; height: 32px; line-height: 32px; text-align: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" title="Call">
                    <span style="font-size: 18px; color: #ffffff; vertical-align: middle;">📞</span>
                  </a>
                </div>
              </td>
            </tr>
          </table>
        </div>`;
      }
    )
    .join('');

  return `
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 0 auto; background-color: #f1f5f9; padding: 20px; border-radius: 12px;">
      
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 24px; background-color: #ffffff; padding: 20px; border-radius: 8px; border-bottom: 3px solid #2563eb;">
        <h1 style="color: #0f172a; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Hemant Trauma and Sport Injury Centre</h1>
        <p style="color: #64748b; margin: 8px 0 16px; font-size: 15px;">New Patient Request${count > 1 ? 's' : ''}</p>
        
        <a href="${process.env.NEXT_PUBLIC_BASE_URL}/admin" style="display: inline-block; padding: 10px 24px; background-color: #2563eb; color: #ffffff; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 14px;">
          View in Dashboard
        </a>
      </div>
      
      <!-- Summary Info -->
      <div style="margin-bottom: 16px; padding: 0 4px;">
        <p style="color: #475569; font-size: 14px; margin: 0;">Showing <strong>${count}</strong> record${count > 1 ? 's' : ''}:</p>
      </div>

      <!-- List of Patients -->
      <div>
        ${leadRows}
      </div>

      <!-- Footer Info -->
      <div style="margin-top: 32px; text-align: center; color: #94a3b8; font-size: 12px; border-top: 1px solid #e2e8f0; padding-top: 16px;">
        <p>This is an automated priority notification.</p>
        <p style="margin-top: 4px;">&copy; ${new Date().getFullYear()} Hemant Trauma and Sport Injury Centre</p>
      </div>
      
    </div>
  `;
};
