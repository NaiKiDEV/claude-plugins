# bar-chart examples

Sample inputs and the script's actual stdout, run via `node scripts/render.js` from this skill's base directory. Bars are filled with the solid block character `█` (U+2588).

## Titled chart with a unit

Input:

```json
{"title": "Response time by endpoint", "bars": [{"label": "GET /users", "value": 42}, {"label": "POST /orders", "value": 78}, {"label": "DELETE /cache", "value": 12}], "unit": "ms"}
```

Output:

```
Response time by endpoint
GET /users    ██████████████████████ 42ms
POST /orders  ████████████████████████████████████████ 78ms
DELETE /cache ██████ 12ms
```

## No title, no unit

Input:

```json
{"bars": [{"label": "Chrome", "value": 61}, {"label": "Safari", "value": 19}, {"label": "Firefox", "value": 3}]}
```

Output:

```
Chrome  ████████████████████████████████████████ 61
Safari  ████████████ 19
Firefox ██ 3
```

## Edge case: a zero value among nonzero values, and a very long label

A zero value renders no `█` characters at all. Label padding still holds the columns for the values.

Input:

```json
{"bars": [{"label": "Requests dropped due to rate limiting during the incident window", "value": 0}, {"label": "OK", "value": 100}, {"label": "Retried", "value": 3}]}
```

Output:

```
Requests dropped due to rate limiting during the incident window  0
OK                                                               ████████████████████████████████████████ 100
Retried                                                          █ 3
```
