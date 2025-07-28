#!/bin/bash

echo "Stopping .NET API..."
pkill -f "dotnet run"

echo "Stopping React frontend..."
pkill -f "vite"        # If using Vite for React
pkill -f "react-scripts" # If using CRA (not Vite)

echo "All processes stopped."
