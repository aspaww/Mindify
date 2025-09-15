// Bu script, belirli bir kullanıcı için başlangıç verisini Firestore'da oluşturur.
// Sadece bir kere çalıştırmamız yeterli olacak.

// Firebase'in sunucu tarafı kütüphanelerini import et
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// --- DEĞİŞİKLİK BURADA ---
// Lütfen 'mindify-29823-firebase-adminsdk.json' yazan yeri,
// kendi indirdiğin dosyanın tam adıyla değiştir.
const serviceAccount = require('./mindify-29823-firebase-adminsdk.json');
// -------------------------

initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();

// --- BURAYA KENDİ KULLANICI ID'Nİ YAPIŞTIRMIŞTIN, DOĞRU ---
const USER_ID = 'DlpnsfLSHmcMvpB6TAm9DDZzrIe2';
// ---------------------------------------------------------

async function createInitialData() {
  const defaultStats = {
    level: 0,
    streak: 0,
    xpToday: 0,
    weeklyLog: [false, false, false, false, false, false, false],
    lastActive: null,
  };

  const statsRef = db.collection('users').doc(USER_ID).collection('stats').doc('data');

  console.log(`'${USER_ID}' için başlangıç verisi oluşturuluyor...`);

  try {
    await statsRef.set(defaultStats);
    console.log("✅ Başarıyla oluşturuldu! Artık uygulamayı test edebilirsin.");
  } catch (error) {
    console.error("❌ Veri oluşturulurken hata:", error);
  }
}

createInitialData();