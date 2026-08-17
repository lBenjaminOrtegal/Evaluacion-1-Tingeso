import http from 'k6/http';
import {check} from 'k6';

export function auth_setup() {
    const tokenUrl = 'http://localhost:7080/realms/tingeso-1-realm/protocol/openid-connect/token';
    const payload = {
        grant_type: 'password',
        client_id: 'tingeso-1-frontend',
        username: 'admin@gmail.com',
        password: '!Password123',
    };

    const params = {
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
    };

    const response = http.post(tokenUrl, payload, params);

    const ok = check(response, {
        'Keycloak auth correctly working': (res) => res.status === 200,
    });

    if (!ok) {
        throw new Error('Cannot obtain keycloak jwt token');
    }

    return response.json().access_token;
}