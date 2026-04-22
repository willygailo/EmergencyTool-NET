<div align="center">

<img src="https://img.shields.io/badge/version-1.0.0-red?style=for-the-badge" alt="Version"/>
<img src="https://img.shields.io/badge/license-MIT-blue?style=for-the-badge" alt="License"/>
<img src="https://img.shields.io/badge/platform-Node.js%20%7C%20Docker-green?style=for-the-badge" alt="Platform"/>

# 🚨 EmergencyTool NET

**Emergency response and coordination platform para sa Philippine communities.**

*Isang command lang — taas na ang lahat.*

</div>

---

## ⚡ Quick Start

```bash
./start.sh
```

> Iyan lang. Isa. Isang command. Tapos na.

---

## 🔧 Ano ang ginagawa ng `start.sh`?

Ang script ay awtomatikong ina-alagaan ang lahat — mula setup hanggang launch.

### ✅ Checks & Validation
Bine-verify ang mga required tools bago mag-proceed:
`node` · `npm` · `docker` · `lsof` · `curl` · `ffmpeg`

Para sa mobile app, gumamit ng `Node.js` LTS.
Recommended for this repo: `20.19.4` via `.nvmrc`

### 📄 Environment Setup
Auto-generates ang mga `.env` files kapag wala pa:

| File | Description |
|------|-------------|
| `backend/.env` | Backend config |
| `admin-dashboard/.env` | Admin panel config |
| `mobile/.env` | Mobile app config (kasama LAN IP) |

### 📦 Dependency Management
Awtomatikong ino-install ang node_modules kapag missing o outdated:
- `backend/node_modules`
- `admin-dashboard/node_modules`
- `mobile/node_modules`

### 🐳 Infrastructure (Docker)
Sinisimulan ang mga container sa background:

| Container | Purpose |
|-----------|---------|
| `emergency-postgres` | Primary database |
| `emergency-redis` | Cache & queuing |

### 🚀 Application Services

| Service | URL |
|---------|-----|
| 🔙 Backend API | `http://localhost:3000` |
| 🗂️ Uploads / Evidence | `http://localhost:3000/uploads` |
| 🖥️ Admin Dashboard | `http://localhost:5173` |
| 📱 Expo Metro (QR) | Auto-starts sa terminal |

> **Bonus:** Ang `EXPO_PUBLIC_API_URL` sa `mobile/.env` ay awtomatikong naka-set gamit ang iyong LAN IP — para makakonekta ang phone mo kahit walang manual config.

### 🖼️ Photo / Video Evidence
- Ang image evidence ay sine-serve mula sa backend `uploads` directory.
- Ang admin dashboard ay naka-configure na para ma-resolve ang media URLs kahit local dev o proxied setup.
- Ang video evidence mula sa Expo app ay automatic na kino-convert sa browser-friendly `H.264/AAC` gamit ang `ffmpeg`.
- Kapag may lumang sample record na gumagamit ng fake placeholder file, hindi iyon maipapakita nang tama hangga't hindi napapalitan ng real upload.

---

## 📱 Mobile App

Pagkatapos tumakbo ang `./start.sh`:

1. **I-scan ang QR code** sa Expo Go app (Android/iOS)
2. **Web preview?** Pindutin ang `w` sa Expo terminal

---

## 🛠️ Options & Flags

### Huwag awtomatikong i-start ang Expo:
```bash
AUTO_START_MOBILE=0 ./start.sh
```

### Force reinstall ng lahat ng dependencies:
```bash
FORCE_INSTALL_DEPS=1 ./start.sh
```

---

## 📋 Logs

| Log | Path |
|-----|------|
| Backend | `.logs/backend.log` |
| Admin Dashboard | `.logs/admin.log` |

### Useful commands
```bash
tail -n 50 .logs/backend.log
tail -n 50 .logs/admin.log
```

---

## 🩹 Quick Fixes

<details>
<summary><strong>🐳 Docker hindi tumatakbo</strong></summary>

I-start ang Docker Desktop (o `sudo systemctl start docker`), tapos ulitin:
```bash
./start.sh
```
</details>

<details>
<summary><strong>📵 Hindi makakonekta ang mobile sa backend</strong></summary>

Buksan ang `mobile/.env` at siguraduhing ang `EXPO_PUBLIC_API_URL` ay gumagamit ng iyong **LAN IP** (hindi `localhost`):
```env
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```
</details>

<details>
<summary><strong>🔴 Port already in use</strong></summary>

I-check kung sino ang gumagamit ng port:
```bash
lsof -i :3000   # Backend
lsof -i :5173   # Admin Dashboard
lsof -i :8081   # Expo Metro
```
</details>

<details>
<summary><strong>🖼️ Admin dashboard hindi makita ang uploaded image/video</strong></summary>

I-check ang sumusunod:

```bash
curl http://localhost:3000/health
ls backend/uploads/emergencies
tail -n 50 .logs/backend.log
```

Kung image ang problema:
- Siguraduhing reachable ang `http://localhost:3000/uploads/...`
- I-hard refresh ang admin dashboard pagkatapos mag-restart

Kung video ang problema:
- Siguraduhing installed ang `ffmpeg`
- Ang bagong uploads ay automatic nang kino-convert sa `H.264/AAC`
- Ang lumang fake/sample files ay mananatiling invalid hanggang mapalitan ng totoong upload
</details>

<details>
<summary><strong>📱 Expo Metro may error na "No host header was found."</strong></summary>

Karaniwan itong lumalabas kapag unsupported ang local Node runtime o may broken Expo dependency versions.

I-check:

```bash
node -v
cd mobile && npx expo-doctor
```

Expected for this repo:
- Node.js LTS `20.19+` o `22.x`
- `expo-secure-store` na tumutugma sa Expo SDK 54

Kung may `nvm` ka:

```bash
nvm install 20.19.4
nvm use 20.19.4
cd mobile && npm install
```
</details>

---

## 🔐 Default Admin Credentials

> ⚠️ **Palitan agad sa production environment!**

| Field | Value |
|-------|-------|
| Email | `admin@emergencytool.com` |
| Password | `admin123` |

---

## 👤 Credits

Developed with 💙 by **Willy Jr. Carnasa Gailo**

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](./LICENSE) for details.

---

<div align="center">
<sub>EmergencyTool NET — Ginawa para sa mga Pilipino, para sa bawat emergency.</sub>
</div>
