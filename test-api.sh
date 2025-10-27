#!/bin/bash

# API Testing Script
# Usage: ./test-api.sh [base_url]
# Example: ./test-api.sh http://localhost:3000

BASE_URL="${1:-http://localhost:3000}"

echo "======================================"
echo "Testing Country Exchange Rate API"
echo "Base URL: $BASE_URL"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local method=$1
    local endpoint=$2
    local expected_status=$3
    local description=$4
    
    echo -e "${YELLOW}Testing:${NC} $description"
    echo "  $method $endpoint"
    
    if [ "$method" = "GET" ]; then
        response=$(curl -s -w "\n%{http_code}" "$BASE_URL$endpoint")
    elif [ "$method" = "POST" ]; then
        response=$(curl -s -w "\n%{http_code}" -X POST "$BASE_URL$endpoint")
    elif [ "$method" = "DELETE" ]; then
        response=$(curl -s -w "\n%{http_code}" -X DELETE "$BASE_URL$endpoint")
    fi
    
    status_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | head -n-1)
    
    if [ "$status_code" = "$expected_status" ]; then
        echo -e "  ${GREEN}✓ PASSED${NC} (Status: $status_code)"
        PASSED=$((PASSED + 1))
    else
        echo -e "  ${RED}✗ FAILED${NC} (Expected: $expected_status, Got: $status_code)"
        FAILED=$((FAILED + 1))
    fi
    
    echo "  Response: $(echo $body | head -c 100)..."
    echo ""
}

echo "1. Testing Root Endpoint"
test_endpoint "GET" "/" "200" "Get API info"

echo "2. Testing Status Endpoint (before refresh)"
test_endpoint "GET" "/status" "200" "Get status"

echo "3. Testing Countries Endpoint (before refresh)"
test_endpoint "GET" "/countries" "200" "Get all countries"

echo "4. Testing Refresh Endpoint"
echo -e "${YELLOW}Note:${NC} This may take 30-60 seconds..."
test_endpoint "POST" "/countries/refresh" "200" "Refresh country data"

echo "5. Testing Status Endpoint (after refresh)"
test_endpoint "GET" "/status" "200" "Get updated status"

echo "6. Testing Countries with Filters"
test_endpoint "GET" "/countries?region=Africa" "200" "Filter by region (Africa)"
test_endpoint "GET" "/countries?currency=USD" "200" "Filter by currency (USD)"
test_endpoint "GET" "/countries?sort=gdp_desc" "200" "Sort by GDP descending"

echo "7. Testing Get Country by Name"
test_endpoint "GET" "/countries/Nigeria" "200" "Get Nigeria"
test_endpoint "GET" "/countries/United%20States" "200" "Get United States"

echo "8. Testing Country Not Found"
test_endpoint "GET" "/countries/Wakanda" "404" "Get non-existent country"

echo "9. Testing Summary Image"
test_endpoint "GET" "/countries/image" "200" "Get summary image"

echo "10. Testing Invalid Endpoint"
test_endpoint "GET" "/invalid" "404" "Test 404 handling"

echo ""
echo "======================================"
echo "Test Results:"
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"
echo "======================================"

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}Some tests failed!${NC}"
    exit 1
fi
