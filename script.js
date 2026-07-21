const firebaseConfig = {
  apiKey: "AIzaSyAFmhNcwP4-dIMNVlQ2Nb5YQe5Fp7H6o8I",
  authDomain: "alliatravel.firebaseapp.com",
  projectId: "alliatravel",
  storageBucket: "alliatravel.firebasestorage.app",
  messagingSenderId: "1067713312588,
  appId: "1:1067713312588:web:ec787d854610acacafc1e9"
};
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
const kolPaket = db.collection('daftar_paket');
const kolDaftar = db.collection('pendaftaran');
const kolGaleri = db.collection('galeri');
const kolPengguna = db.collection('pengguna');

let idEdit = null;

async function bukaHal(nama){
    window.scrollTo({top:0, behavior:'instant'});
    document.querySelectorAll('.halaman').forEach(h=>h.classList.remove('aktif'));
    setTimeout(()=>{ document.getElementById(nama).classList.add('aktif'); }, 10);
    try { if(nama==='jadwal') await tampilSemuaPaket(); if(nama==='daftar') await muatPilihanPaket(); if(nama==='galeri') await tampilGaleriUser(); } catch (err) {}
}
function bukaTutupMenu(){ document.getElementById('menuHp').classList.toggle('hidden'); }
function gantiTab(tab){
    ['paket','daftar','galeri'].forEach(t=>{document.getElementById('t'+t[0].toUpperCase()+t.slice(1)).classList.remove('aktif'); document.getElementById('k'+t[0].toUpperCase()+t.slice(1)).classList.add('hidden');});
    document.getElementById('t'+tab[0].toUpperCase()+tab.slice(1)).classList.add('aktif');
    document.getElementById('k'+tab[0].toUpperCase()+tab.slice(1)).classList.remove('hidden');
    if(tab==='daftar') tampilPendaftar(); if(tab==='galeri') tampilGaleriAdmin();
}
function gantiTabGaleri(jns){ document.querySelectorAll('.btn-tab-g').forEach(b=>b.classList.remove('aktif')); if(event?.target) event.target.classList.add('aktif'); }
function masukAdmin(){
    const u = document.getElementById('emailAdm').value.trim();
    const p = document.getElementById('passAdm').value.trim();
    if(!u||!p) return alert('⚠️ Isi email & sandi!');
    kolPengguna.doc('admin_utama').get().then(dok=>{
        if(!dok.exists) return alert('❌ Data admin tidak ada!');
        const d = dok.data();
        if(u===d.email && p===d.sandi){ alert('✅ Berhasil Masuk!'); bukaHal('admin'); }
        else alert('❌ Salah email/sandi!');
    }).catch(e=> alert('⚠️ '+e.message));
}

async function muatPilihanPaket(){
    const pilih = document.getElementById('pilPaket');
    pilih.innerHTML = `<option value="">-- Pilih Paket --</option>`;
    const s = await kolPaket.orderBy('waktu','desc').get();
    s.forEach(d=>{ const x=d.data(); pilih.innerHTML += `<option value="${x.nama}">${x.nama}</option>`; });
}

async function tampilSemuaPaket(){
    try {
        const s = await kolPaket.orderBy('waktu','desc').get(); const wadah = document.getElementById('wadahPaket');
        if(s.empty) { wadah.innerHTML = `<p class="col-span-full text-center text-gray-400 py-10">Belum ada paket</p>`; tampilListPaketAdmin(s); return; }
        let h=''; s.forEach(d=>{
            const x={id:d.id,...d.data()};
            let gbr = (x.foto?.trim()) ? `<img src="${x.foto.trim()}" alt="${x.nama}" class="gambar-paket object-cover" onerror="this.style.display='none'">` : `<div class="gambar-paket"></div>`;
            h += `<div class="kartu-paket">${gbr}<div class="p-6"><h3 class="font-judul font-bold text-xl text-gelap mb-1">${x.nama||'Paket Umroh'}</h3><p class="text-sm text-abu-teks mb-4">${x.tgl||'-'}</p><p class="harga-paket mb-3">${x.harga||'Hubungi Kami'}</p><div class="flex items-center justify-between mb-5 pt-3 border-t border-gray-100"><div><span class="label-kuota">SISA KUOTA</span><div class="angka-kuota mt-1">${x.sisa||0} / ${x.total||0} SEAT</div></div></div><button onclick="bukaHal('daftar'); setTimeout(()=>{const p=document.getElementById('pilPaket');for(let opt of p.options){if(opt.value==='${x.nama}'){opt.selected=true;break;}}},250);" class="w-full tombol-pesan py-2.5 text-sm">PESAN</button></div></div>`;
        }); wadah.innerHTML = h; tampilListPaketAdmin(s);
    } catch(e){}
}
function tampilListPaketAdmin(snap){
    const wadah = document.getElementById('listPaket');
    if(!snap || snap.empty){ wadah.innerHTML='<p class="text-xs text-gray-400">Belum ada paket</p>'; return; }
    let h=''; snap.forEach(d=>{const p=d.data(); h+=`<div class="item-baris"><div><span class="id-data">ID: ${d.id}</span><br><span class="text-xs font-semibold">${p.nama}</span><br><span class="text-xs text-abu-teks">${p.tgl} • ${p.harga}</span></div><div class="flex flex-col gap-2 items-end"><button class="text-blue-600 text-xs" onclick="editPaket('${d.id}')">✏️ Ubah</button><button class="tombol-hapus" onclick="hapusSatuPaket('${d.id}')">🗑️ Hapus</button></div></div>`;}); wadah.innerHTML=h;
}

async function simpanPaket(){
    const dt={nama:document.getElementById('iNama').value.trim(),tgl:document.getElementById('iTgl').value.trim(),rinci:document.getElementById('iRinci').value.trim(),harga:document.getElementById('iHarga').value.trim(),sisa:Math.max(0,Number(document.getElementById('iSisa').value)||0),total:Math.max(1,Number(document.getElementById('iTotal').value)||1),foto:document.getElementById('iFoto').value.trim(),waktu:new Date()};
    if(!dt.nama||!dt.harga||!dt.tgl) return alert('⚠️ Wajib diisi!');
    try{ if(idEdit){await kolPaket.doc(idEdit).update(dt);alert('✅ Diperbarui!');}else{await kolPaket.add(dt);alert('✅ Tersimpan!');}bersihkanInputan();await tampilSemuaPaket();}catch(e){alert('❌ '+e.message);}
}
function editPaket(id){kolPaket.doc(id).get().then(d=>{if(!d.exists)return;const p=d.data();idEdit=id;document.getElementById('iNama').value=p.nama||'';document.getElementById('iTgl').value=p.tgl||'';document.getElementById('iRinci').value=p.rinci||'';document.getElementById('iHarga').value=p.harga||'';document.getElementById('iSisa').value=p.sisa||0;document.getElementById('iTotal').value=p.total||1;document.getElementById('iFoto').value=p.foto||'';document.getElementById('btBatal').classList.remove('hidden');window.scrollTo({top:0});});}
function bersihkanInputan(){idEdit=null;document.getElementById('btBatal').classList.add('hidden');['iNama','iTgl','iRinci','iHarga','iSisa','iTotal','iFoto'].forEach(i=>document.getElementById(i).value='');}
async function hapusSatuPaket(id){if(!confirm('Yakin hapus?'))return;try{await kolPaket.doc(id).delete();alert('✅ Terhapus!');await tampilSemuaPaket();}catch(e){alert('❌ '+e.message);}}

async function kirimDaftar(){const pilih=document.getElementById('pilPaket').value;const nm=document.getElementById('nm').value.trim();const hp=document.getElementById('hp').value.trim();if(!pilih||!nm||!hp)return alert('Lengkapi data!');await kolDaftar.add({paket:pilih,nama:nm,nik:document.getElementById('nik').value.trim(),hp:hp,alamat:document.getElementById('alamat').value.trim(),waktu:new Date()});alert('✅ Terkirim!');['nm','nik','hp','alamat'].forEach(i=>document.getElementById(i).value='');}

async function tampilPendaftar(){try{const s=await kolDaftar.orderBy('waktu','desc').get();let h='';if(s.empty){h='<p class="text-center text-gray-400 py-8">Belum ada pendaftar</p>';}else{s.forEach(dok=>{const x=dok.data();h+=`<div class="item-baris"><div><span class="id-data">ID: ${dok.id}</span><br><b>${x.nama||'Tanpa Nama'}</b><br>Paket: ${x.paket||'-'} • HP: ${x.hp||'-'}</div><button class="tombol-hapus" onclick="hapusDaftarSekarang('${dok.id}')">🗑️ Hapus</button></div>`;});}document.getElementById('listDaftar').innerHTML=h;}catch(e){document.getElementById('listDaftar').innerHTML='<p class="text-red-500">Gagal memuat</p>';}}
async function hapusDaftarSekarang(id){if(!confirm('Yakin hapus?'))return;try{await kolDaftar.doc(id).delete();alert('✅ Terhapus!');await tampilPendaftar();}catch(e){alert('❌ '+e.message);}}

async function tampilGaleriUser(){try{const s=await kolGaleri.orderBy('waktu','desc').get();let h='';if(s.empty){document.getElementById('wadahGaleri').innerHTML=`<p class="col-span-full text-center text-gray-400 py-10">Belum ada foto</p>`;return;} s.forEach(d=>{const link=d.data().link?.trim();if(!link)return;h+=`<div class="boks-foto"><img src="${link}" class="w-full aspect-square object-cover" alt="Dokumentasi" onerror="this.outerHTML='<div class=\'rounded-lg bg-gray-100 flex items-center justify-center text-xs text-gray-400 py-12\'>Gambar Tidak Tersedia</div>'"></div>`;});document.getElementById('wadahGaleri').innerHTML=h;}catch(e){}}
async function tampilGaleriAdmin(){try{const s=await kolGaleri.orderBy('waktu','desc').get();let h='';if(s.empty)h='<p class="text-xs text-gray-400">Belum ada foto</p>';else s.forEach(d=>{const link=d.data().link||'';h+=`<div class="item-baris"><div><span class="id-data">ID: ${d.id}</span><br><span class="text-xs break-all">${link}</span></div><button class="tombol-hapus" onclick="hapusFoto('${d.id}')">🗑️ Hapus</button></div>`;});document.getElementById('listGaleri').innerHTML=h;}catch(e){}}
async function tambahFotoGaleri(){const l=document.getElementById('linkGal').value.trim();if(!l)return alert('Masukkan tautan foto');await kolGaleri.add({link:l,waktu:new Date()});document.getElementById('linkGal').value='';await tampilGaleriAdmin();await tampilGaleriUser();alert('✅ Ditambahkan!');}
async function hapusFoto(id){if(!confirm('Yakin hapus foto ini?'))return;await kolGaleri.doc(id).delete();await tampilGaleriAdmin();await tampilGaleriUser();alert('✅ Foto terhapus!');}

window.onload = ()=> {};
