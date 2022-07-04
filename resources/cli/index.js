#!/usr/bin/env node
// This file exists to prevent double screen launch!
import log from 'loglevel';

const [, , ...args] = process.argv;

log.info('index.js', args['executed-from']);
