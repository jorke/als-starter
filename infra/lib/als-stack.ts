import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as location from 'aws-cdk-lib/aws-location';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as s3Deployment from 'aws-cdk-lib/aws-s3-deployment';
import * as path from 'path';
import { Source } from 'aws-cdk-lib/aws-s3-deployment';
import { DockerImage } from 'aws-cdk-lib';
import { spawnSync } from 'child_process';
import * as fs from 'fs'

export class LocationStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const services = this.node.getContext('services')
    const { mapName, style, zoneName, dataSource, hostedZoneId } = services
    
    const zone = cdk.aws_route53.HostedZone.fromHostedZoneAttributes(
      this,
      "HostedZoneRef",
      {
        hostedZoneId,
        zoneName,
      }
    );

    // .aws_route53.CnameRecord(this, 'cname' {
    //     domainName: `map.${domain}`,
    //     zone: hostedZone,
    //     recordName: graphQlApiDomainName,
    //   })


    // const bundle = Source.asset(path.join(__dirname, '../../'), {
    //   bundling: {
    //     command: [
    //       'sh',
    //       '-c',
    //       'npm run build',
    //     ],
    //     image: DockerImage.fromRegistry('alpine'),
    //     local: {
    //       tryBundle(outputDir: string) {
    //         // try {
    //         //   spawnSync('npm run build', {
    //         //     cwd: __dirname,
    //         //     stdio: 'inherit',
    //         //   });
    //         // } catch (e) {
    //         //   return false;
    //         // }
    //         spawnSync('npm install && npm run build', { 
    //           cwd: path.join(__dirname, '../../'),
    //           stdio: 'inherit'
    //         })
    //         // console.log(path.join(__dirname, '../../'))
    //         // fs.cpSync(path.join(__dirname, '../../dist'), outputDir)
    //         return true
    //       },
    //     }
    //   },
    //   })
    
    // const bundle = Source.asset(
    //   path.join(__dirname, '../../'), {
    //   bundling: {
    //     image: DockerImage.fromRegistry('public.ecr.aws/docker/library/node'),
    //     command: [
    //             'sh',
    //             '-c',
    //             'npm install',
    //             'npm run build',
    //           ],
    //     }
    //   }
    // )


    const websiteBucket = new s3.Bucket(this, 'websiteBucket', {  
      // bucketName: `${map}-${domain}`,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    })

    // const s3deployment = new s3Deployment.BucketDeployment(this, 's3deployment', {
    //   sources: [bundle],
    //   destinationBucket: websiteBucket,
    // });
      

    const map = new location.CfnMap(this, 'Map', {
      mapName,
      pricingPlan: 'RequestBasedUsage',
      configuration: {
        style
      }
    });

    const originAccessIdentity = new cloudfront.OriginAccessIdentity(this, 'oai');
   
    const distribution = new cloudfront.Distribution(this, 'cogs-tiler-distribution', {
      enableLogging: true,
      defaultRootObject: 'index.html',
      defaultBehavior: {
        origin: new origins.S3Origin(websiteBucket, { originAccessIdentity }),
        compress: true,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,  
      },
      // additionalBehaviors: {
      //   '/cog/*': {
      //     origin: new origins.HttpOrigin(cdk.Fn.select(1, cdk.Fn.split('://', api.apiEndpoint!))),
      //     allowedMethods: cloudfront.AllowedMethods.ALLOW_ALL,
      //     cachedMethods: cloudfront.CachedMethods.CACHE_GET_HEAD_OPTIONS,
      //     originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER_EXCEPT_HOST_HEADER,
      //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,  
      //     responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      //     compress: true,
      //   },
      //   '/direct': {
      //       origin: new origins.LoadBalancerV2Origin(service.loadBalancer, {
      //       protocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
      //     }),
      //     originRequestPolicy: cloudfront.OriginRequestPolicy.ALL_VIEWER,
      //     viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,  
      //     compress: true,
      //   }
      // }
    })
    websiteBucket.grantRead(originAccessIdentity);

    const cname = new route53.CnameRecord(this, 'cname', {
      recordName: 'map',
      domainName: distribution.domainName,
      zone,
      ttl: cdk.Duration.minutes(1),
    })
    
    const placesIndex = new location.CfnPlaceIndex(this, 'placeindex', {
      dataSource,
      indexName: `${zoneName}`,
    })

    const routeCalculator = new location.CfnRouteCalculator(this, 'routecalc', {
      calculatorName: `${zoneName}`,
      dataSource
    })
    
    const apikey = new location.CfnAPIKey(this, 'alsapikey', {
      description: 'api key for location services',
      keyName: `${zoneName}`,
      noExpiry: true,
      restrictions: {
        allowActions: [
          "geo:GetMap*",
          "geo:SearchPlaceIndexForText",
          "geo:SearchPlaceIndexForPosition",
          "geo:SearchPlaceIndexForSuggestions",
          "geo:GetPlace",
          "geo:CalculateRoute",
          "geo:CalculateRouteMatrix"
        ],
        allowResources: [
          map.attrArn,
          placesIndex.attrArn,
          routeCalculator.attrArn
        ],
        allowReferers: [
          `https://${distribution.domainName}`,
          `https://${cname.domainName}`,
          `http://localhost:5173`
        ]
      },
    })
    // const cert = new acm.Certificate(this, 'cert', {
    //   domainName: cname.domainName,
    //   certificateName: cname.domainName,
    //   validation: acm.CertificateValidation.fromDns(zone),
    // });
    
    new cdk.CfnOutput(this, "apikey", { value: apikey.getAtt('KeyArn').toString() })
    new cdk.CfnOutput(this, "bucket", { value: websiteBucket.bucketName})
    new cdk.CfnOutput(this, "distribution", { value: distribution.domainName})
    new cdk.CfnOutput(this, "map", { value: map.ref })
  }
}
