# TravelAgency 🌍

Aplicación web de agencia de viajes que permite a los usuarios explorar paquetes turísticos, realizar reservaciones y gestionar pagos. Los administradores pueden gestionar paquetes, reservaciones y generar reportes.

---

## Tecnologías

**Frontend**
- React + TypeScript + Vite
- React Bootstrap
- Keycloak JS (`@react-keycloak/web`)
- Axios

**Backend**
- Java 21 + Spring Boot
- Spring Security + OAuth2 Resource Server
- Spring Data JPA + Hibernate
- MySQL

**Infraestructura**
- Docker + Docker Compose
- Nginx (reverse proxy para frontend y backend)
- Keycloak 26 (autenticación y autorización)
- AWS EC2

**CI/CD**
- GitHub Actions
- Docker Hub

---

## Arquitectura

```
Browser
   │
   ├──► nginx-frontend (:8070) ──► frontend1 (React)
   │
   └──► nginx-backend  (:8080) ──► backend1  (Spring Boot)
                                        │
                                        └──► MySQL DB
   
Keycloak (:7080) ◄──── browser (login/registro)
Keycloak (:7080) ◄──── backend (validación JWT via red Docker interna)
```

**Redes Docker:**
- `frontend-network`: nginx-frontend ↔ frontend1 ↔ nginx-backend
- `backend-network`: nginx-backend ↔ backend1 ↔ keycloak ↔ db

---

## Requisitos previos

- Docker y Docker Compose instalados
- Java 21 (solo para desarrollo local sin Docker)
- Node.js LTS (solo para desarrollo local sin Docker)

---

## Despliegue local

### 1. Clona el repositorio

```bash
git clone https://github.com/lBenjaminOrtegal/Evaluacion-1-Tingeso.git
cd Evaluacion-1-Tingeso
```

### 2. Configura el docker-compose

En `docker-compose.yml`, verifica que las IPs estén en `localhost`:

```yaml
KC_HOSTNAME: http://localhost:7080
KEYCLOAK_ISSUER_URI: http://localhost:7080/realms/tingeso-1-realm
VITE_BACKEND_SERVER: localhost
VITE_KEYCLOAK_SERVER: localhost
```

### 3. Levanta los servicios

```bash
docker-compose build frontend1
docker-compose up -d
```

### 4. Configura Keycloak (primera vez)

```bash
docker exec -it keycloak bash

/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:7080 \
  --realm master \
  --user admin --password admin

# Deshabilitar SSL
/opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=none
/opt/keycloak/bin/kcadm.sh update realms/tingeso-1-realm -s sslRequired=none

# Obtener ID del cliente frontend
/opt/keycloak/bin/kcadm.sh get clients -r tingeso-1-realm \
  --fields id,clientId | grep -B1 "tingeso-1-frontend"

# Actualizar URLs del cliente (reemplaza <ID>)
/opt/keycloak/bin/kcadm.sh update clients/<ID> \
  -r tingeso-1-realm \
  -s 'redirectUris=["*"]' \
  -s 'webOrigins=["*"]'
```

### 5. Accede a la aplicación

| Servicio | URL |
|---|---|
| Frontend | http://localhost:8070 |
| Keycloak Admin | http://localhost:7080 |
| Backend API | http://localhost:8080 |

> **Nota:** Para que Keycloak funcione en HTTP sin HTTPS, agrega `http://localhost:8070` en Chrome en `chrome://flags/#unsafely-treat-insecure-origin-as-secure`.

---

## Despliegue en AWS EC2

### 1. Actualiza las IPs en docker-compose.yml

Reemplaza `TU_IP` con la IP pública de tu instancia EC2:

```yaml
KC_HOSTNAME: http://TU_IP:7080
KEYCLOAK_ISSUER_URI: http://TU_IP:7080/realms/tingeso-1-realm
ALLOWED_ORIGINS: http://TU_IP:8070
```

### 2. Actualiza los secrets en GitHub

En **Settings → Secrets and variables → Actions**:

```
VITE_BACKEND_SERVER=TU_IP
VITE_KEYCLOAK_SERVER=TU_IP
```

### 3. Corre el pipeline

Desde GitHub → Actions → **CI/CD Pipeline** → **Run workflow**.

### 4. En el EC2

```bash
docker-compose pull
docker-compose up -d
```

### 5. Configura Keycloak (igual que en local pero con TU_IP)

```bash
docker exec -it keycloak bash

/opt/keycloak/bin/kcadm.sh config credentials \
  --server http://localhost:7080 \
  --realm master \
  --user admin --password admin

/opt/keycloak/bin/kcadm.sh update realms/master -s sslRequired=none
/opt/keycloak/bin/kcadm.sh update realms/tingeso-1-realm -s sslRequired=none

/opt/keycloak/bin/kcadm.sh update clients/<ID> \
  -r tingeso-1-realm \
  -s 'redirectUris=["*"]' \
  -s 'webOrigins=["*"]'
```

### Puertos requeridos en el Security Group de AWS

| Puerto | Protocolo | Descripción |
|---|---|---|
| 8070 | TCP | Frontend |
| 8080 | TCP | Backend API |
| 7080 | TCP | Keycloak |
| 22 | TCP | SSH |

---

## Pipeline CI/CD

El pipeline se ejecuta automáticamente en cada push a `main` o manualmente desde GitHub Actions.

```
push a main
     │
     ├──► test-backend
     │        └── JUnit tests (Gradle)
     │
     ├──► build-push-backend (necesita: test-backend)
     │        └── Build imagen Docker → DockerHub
     │
     └──► build-push-frontend (necesita: test-backend)
              └── Build imagen Docker con VITE vars → DockerHub
```

**Secrets requeridos en GitHub:**

| Secret | Descripción |
|---|---|
| `DOCKERHUB_USERNAME` | Usuario de Docker Hub |
| `DOCKERHUB_TOKEN` | Token de acceso de Docker Hub |
| `VITE_BACKEND_SERVER` | IP del servidor (EC2) |
| `VITE_BACKEND_PORT` | Puerto del backend (8080) |
| `VITE_KEYCLOAK_SERVER` | IP del servidor (EC2) |
| `VITE_KEYCLOAK_PORT` | Puerto de Keycloak (7080) |
| `VITE_KEYCLOAK_REALM` | Nombre del realm de Keycloak |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID del frontend en Keycloak |

---

## Variables de entorno

### Backend (`docker-compose.yml`)

| Variable | Descripción |
|---|---|
| `PORT` | Puerto del servidor Spring Boot |
| `DB_URL` | URL de conexión a MySQL |
| `DB_USER` / `DB_PASSWORD` | Credenciales de la BD |
| `KEYCLOAK_ISSUER_URI` | URI del issuer de Keycloak |
| `KEYCLOAK_JWK_SET_URI` | URI de las claves públicas JWT |
| `KEYCLOAK_CLIENT_ID` / `KEYCLOAK_CLIENT_SECRET` | Credenciales del cliente backend |
| `ALLOWED_ORIGINS` | Orígenes permitidos para CORS |

### Frontend (build args)

| Variable | Descripción |
|---|---|
| `VITE_BACKEND_SERVER` | IP/host del backend |
| `VITE_BACKEND_PORT` | Puerto del backend |
| `VITE_KEYCLOAK_SERVER` | IP/host de Keycloak |
| `VITE_KEYCLOAK_PORT` | Puerto de Keycloak |
| `VITE_KEYCLOAK_REALM` | Realm de Keycloak |
| `VITE_KEYCLOAK_CLIENT_ID` | Client ID del frontend |