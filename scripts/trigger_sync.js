
async function triggerSync() {
  try {
    const adminSecret = 'hemant_admin_2026';
    const response = await fetch('http://localhost:3000/api/admin/appointments/hash', {
      headers: {
        'Authorization': adminSecret
      }
    });

    const data = await response.json();
    console.log('Sync Trigger Response:', data);
  } catch (err) {
    console.error('Trigger failed:', err);
  }
}

triggerSync();
