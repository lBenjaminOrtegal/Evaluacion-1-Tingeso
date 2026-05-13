import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
  url: `http://${import.meta.env.VITE_KEYCLOAK_SERVER}:${import.meta.env.VITE_KEYCLOAK_PORT}`,
  realm: import.meta.env.VITE_KEYCLOAK_REALM as string,
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID as string,
});

export default keycloak;