#!/usr/bin/env node

// This file exists to prevent double screen launch!

const [, , ...args] = process.argv;

// eslint-disable-next-line no-console
console.log('index.js', args['executed-from']);
