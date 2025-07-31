#!/bin/bash

echo "Installing additional dependencies for professional admin panel..."

# Install security and utility packages
npm install express-rate-limit helmet morgan

echo "Dependencies installed successfully!"
echo ""
echo "New packages added:"
echo "- express-rate-limit: Rate limiting middleware"
echo "- helmet: Security middleware"
echo "- morgan: HTTP request logger"
echo ""
echo "Run 'npm start' to start the enhanced server"