import http from 'k6/http';
import {check, sleep} from 'k6';
import {auth_setup} from "./auth-setup.js";

export const options = {
    scenarios: {
        constant_load: {
            executor: 'constant-vus',
            vus: 50,
            duration: '3m',
        },
    },
    thresholds: {
        http_req_duration: ['p(95)<1500'],
    },
};

export function setup() {
    const jwtToken = auth_setup();
    return { token: jwtToken };
}

export default function (data) {
    const url = 'http://localhost:8080/api/reservations/reports/date?startDate=2026-01-01T00:00:00&endDate=2026-12-31T23:59:59';

    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    const response = http.get(url, params);

    check(response, {
        "status is 200": (r) => r.status === 200,
    });

    sleep(1);
}