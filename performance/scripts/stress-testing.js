import http from 'k6/http';
import {check, sleep} from 'k6';
import {auth_setup} from "./auth-setup.js";

export const options = {
    stages: [
        {duration: '30s', target: 100},
        {duration: '30s', target: 250},
        {duration: '30s', target: 500},
        {duration: '30s', target: 1000},
        {duration: '30s', target: 2000},
        {duration: '30s', target: 3000},
        {duration: '30s', target: 3500},
        {duration: '30s', target: 4000},
        {duration: '30s', target: 0},
    ],
    thresholds: {
        http_req_failed: ['rate<0.10'],
    },
};

export function setup() {
    const jwtToken = auth_setup();
    return { token: jwtToken };
}

export default function (data) {
    const url = 'http://localhost:8080/api/reservations/reports/ranking?startDate=2026-01-01T00:00:00&endDate=2026-12-31T23:59:59&order=1&type=passengers';

    const params = {
        headers: {
            'Authorization': `Bearer ${data.token}`,
            'Content-Type': 'application/json',
        },
    };

    const response = http.get(url, params);

    check(response, {
        "status is 200": (r) => r.status === 200,
        "response is array": (r) => Array.isArray(r.json()),
    });

    sleep(1);
}