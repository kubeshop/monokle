#!/usr/bin/env node

// This file exists to prevent double screen launch!

const [, , ...args] = process.argv;

console.log('index.js', args['executed-from']);
