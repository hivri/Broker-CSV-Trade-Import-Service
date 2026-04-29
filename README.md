# Broker CSV Trade Import Service

A TypeScript service that imports broker trade CSV files and normalizes them into a standard trade schema.

## Features

- Supports Zerodha-style CSV files
- Supports Interactive Brokers-style CSV files
- Auto-detects broker format from CSV headers
- Validates normalized trades using Zod
- Skips invalid rows and returns row-level error messages
- Preserves original row data in `rawData`
- Provides a `POST /import` API endpoint
- Includes parser and broker detection tests

## Tech Stack

- TypeScript
- Express
- Multer
- csv-parse
- Zod
- Vitest

## Install

```bash
npm install
