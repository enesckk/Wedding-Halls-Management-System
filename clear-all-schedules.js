// Tüm salonların müsaitlik durumunu temizle
// Kullanım: node clear-all-schedules.js

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

async function clearAllSchedules() {
  try {
    console.log('Tüm salonların müsaitlik durumu temizleniyor...');
    console.log('API URL:', API_URL);
    
    // Tüm salonları çek
    const hallsRes = await fetch(`${API_URL}/api/v1/halls?page=1&pageSize=1000`);
    if (!hallsRes.ok) {
      throw new Error(`Halls API error: ${hallsRes.status}`);
    }
    const hallsData = await hallsRes.json();
    const halls = hallsData.items || hallsData.Items || [];
    
    console.log(`Bulunan salon sayısı: ${halls.length}`);
    
    let totalUpdated = 0;
    let totalProcessed = 0;
    
    for (const hall of halls) {
      try {
        console.log(`İşleniyor: ${hall.name} (${hall.id})`);
        
        // Her salonun schedule'larını çek
        const schedulesRes = await fetch(`${API_URL}/api/v1/halls/${hall.id}/schedules`);
        if (!schedulesRes.ok) {
          console.warn(`  Schedule'lar alınamadı: ${schedulesRes.status}`);
          continue;
        }
        const schedules = await schedulesRes.json() || [];
        
        console.log(`  ${schedules.length} schedule bulundu`);
        
        // Reserved olanları Available yap
        for (const schedule of schedules) {
          totalProcessed++;
          // status 1 = Reserved, 0 = Available
          if (schedule.status === 1) {
            const updateRes = await fetch(`${API_URL}/api/v1/schedules/${schedule.id}`, {
              method: 'PUT',
              headers: { 
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                weddingHallId: schedule.weddingHallId,
                date: schedule.date,
                startTime: schedule.startTime,
                endTime: schedule.endTime,
                status: 0 // 0 = Available
              })
            });
            
            if (updateRes.ok) {
              totalUpdated++;
              console.log(`    ✓ Schedule ${schedule.id} temizlendi`);
            } else {
              console.warn(`    ✗ Schedule ${schedule.id} güncellenemedi: ${updateRes.status}`);
            }
          }
        }
      } catch (e) {
        console.error(`  Salon ${hall.id} için hata:`, e.message);
      }
    }
    
    console.log('\n=== Sonuç ===');
    console.log(`Toplam işlenen schedule: ${totalProcessed}`);
    console.log(`Temizlenen schedule (Reserved -> Available): ${totalUpdated}`);
    console.log('İşlem tamamlandı!');
  } catch (e) {
    console.error('Hata:', e.message);
    process.exit(1);
  }
}

clearAllSchedules();
