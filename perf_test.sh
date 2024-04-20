#!/bin/bash

# Number of concurrent requests
CONCURRENCY=100

# Number of total requests to send
TOTAL_REQUESTS=10000

# URL to send requests to
URL="http://localhost:9256/function/execute/2xbaYK8LO2ecm5raFMgZbgHEd"

# JSON data for the request
REQUEST_DATA='{"event_name": "get_nasa_image", "event_data": {"key": "DEMO_KEY"}}'

# Run ab command to send requests
ab -c $CONCURRENCY -n $TOTAL_REQUESTS -H 'accept: application/json' -H 'Content-Type: application/json' -p <(echo "$REQUEST_DATA") $URL