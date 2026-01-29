// Bu script'i çalıştırmak için: node add-halls.js
// Önce backend'in çalıştığından emin olun

const halls = [
  {
    name: "Şehitkamil Kültür ve Kongre Merkezi",
    address: "Mücahitler, Şehitkamil Kültür Ve Kongre Mrk., 27090 Şehitkamil/Gaziantep",
    capacity: 1000,
    description: "",
    imageUrl: "",
    technicalDetails: ""
  },
  {
    name: "Devlet Tiyatroları",
    address: "Batıkent, Abdulkadir Aksu Blv. NO:48, 27560 Şehitkamil/Gaziantep",
    capacity: 1000,
    description: "",
    imageUrl: "",
    technicalDetails: ""
  }
];

async function addHalls() {
  const API_BASE = "http://localhost:5230/api/v1/halls";
  
  // Token'ı buraya ekleyin (giriş yaptıktan sonra browser console'dan alabilirsiniz)
  // sessionStorage.getItem("token")
  const token = "YOUR_TOKEN_HERE"; // Buraya token'ı ekleyin
  
  for (const hall of halls) {
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(hall)
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✓ ${hall.name} başarıyla eklendi. ID: ${data.id}`);
      } else {
        const error = await response.text();
        console.error(`✗ ${hall.name} eklenemedi:`, error);
      }
    } catch (error) {
      console.error(`✗ ${hall.name} eklenemedi:`, error.message);
    }
  }
}

addHalls();
