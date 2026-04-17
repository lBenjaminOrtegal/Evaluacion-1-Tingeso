import Keycloak from "keycloak-js";

const backendServer = import.meta.env.VITE_BACKEND_SERVER as string;
const keycloakPort = import.meta.env.VITE_KEYCLOAK_PORT as string;
const realm = import.meta.env.VITE_KEYCLOAK_REALM as string;
const clientId = import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string;

const keycloak = new Keycloak({
  url: `http://${backendServer}:${keycloakPort}`,
  realm: realm,
  clientId: clientId,
});

export default keycloak;