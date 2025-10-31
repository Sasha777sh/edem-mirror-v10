#!/usr/bin/env ts-node

import { embed } from '../src/lib/embed';

console.log('Testing embed function...');

embed('test text').then(result => {
    console.log('Embedding generated with length:', result.length);
    console.log('First 5 values:', result.slice(0, 5));
});