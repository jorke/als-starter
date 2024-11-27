import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as location from 'aws-cdk-lib/aws-location';

export class LocationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const services = this.node.getContext('services')
    const { appName } = services
    
    const apikey = new location.CfnAPIKey(this, 'alsapikey', {
      description: 'api key for location services',
      keyName: `${appName}-${this.node.addr}`,
      noExpiry: true,
      restrictions: {
        allowActions: [
          "geo-maps:GetTile",
          "geo-places:Autocomplete",
          "geo-places:Geocode",
          "geo-places:GetPlace",
          "geo-places:ReverseGeocode",
          "geo-places:SearchNearby",
          "geo-places:SearchText",
          "geo-places:Suggest"
        ],
        allowResources: [
          `arn:aws:geo-maps:${this.region}::provider/default`,
          `arn:aws:geo-places:${this.region}::provider/default`
        ],
        allowReferers: [
          `https://*.amplifyapp.com`,
          `http://localhost:5173`
        ]
      },
    })
    
    new cdk.CfnOutput(this, "apikey", { value: `${appName}-${this.node.addr}` })
    
  }
}
