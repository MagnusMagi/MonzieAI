#!/usr/bin/env node

/**
 * Bundle Size Analysis Script
 * Analyzes the bundle size of the app and generates a report
 */

const fs = require('fs');
const path = require('path');

const BUNDLE_SIZE_LIMIT = 50 * 1024 * 1024; // 50MB
const WARN_SIZE = 30 * 1024 * 1024; // 30MB

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function analyzeBundleSize() {
  const bundlePaths = [
    path.join(__dirname, '../dist/index.bundle'),
    path.join(__dirname, '../dist/index.jsbundle'),
    path.join(__dirname, '../ios/build/Build/Products/Release-iphoneos/monzieai.app/main.jsbundle'),
    path.join(__dirname, '../android/app/build/intermediates/assets/release/index.android.bundle'),
  ];

  const results = [];

  bundlePaths.forEach(bundlePath => {
    if (fs.existsSync(bundlePath)) {
      const stats = fs.statSync(bundlePath);
      const size = stats.size;
      const formattedSize = formatBytes(size);
      
      results.push({
        path: bundlePath,
        size,
        formattedSize,
        status: size > BUNDLE_SIZE_LIMIT ? 'error' : size > WARN_SIZE ? 'warning' : 'ok',
      });
    }
  });

  // Generate report
  console.log('\n📦 Bundle Size Analysis Report\n');
  console.log('='.repeat(50));
  
  if (results.length === 0) {
    console.log('⚠️  No bundle files found. Run a build first.');
    return;
  }

  results.forEach(result => {
    const statusIcon = result.status === 'error' ? '🔴' : result.status === 'warning' ? '🟡' : '🟢';
    console.log(`${statusIcon} ${path.basename(result.path)}: ${result.formattedSize}`);
    if (result.status === 'error') {
      console.log(`   ⚠️  Bundle size exceeds limit of ${formatBytes(BUNDLE_SIZE_LIMIT)}`);
    } else if (result.status === 'warning') {
      console.log(`   ⚠️  Bundle size is approaching limit`);
    }
  });

  console.log('\n' + '='.repeat(50));
  
  const totalSize = results.reduce((sum, r) => sum + r.size, 0);
  console.log(`Total Bundle Size: ${formatBytes(totalSize)}`);
  
  if (totalSize > BUNDLE_SIZE_LIMIT) {
    console.log('\n❌ Bundle size exceeds recommended limit!');
    process.exit(1);
  } else if (totalSize > WARN_SIZE) {
    console.log('\n⚠️  Bundle size is approaching limit. Consider optimization.');
  } else {
    console.log('\n✅ Bundle size is within acceptable limits.');
  }
}

analyzeBundleSize();

