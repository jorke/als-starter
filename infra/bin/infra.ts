#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { LocationStack } from '../lib/als-stack';

const app = new cdk.App({
  context:{
    services: {
      appName: "als-starter"
    }
  }

});
new LocationStack(app, 'als-demo', {
  
});