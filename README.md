## Overview
This is a demo of an AWS-powered web interface for [AbLECPS](https://ablecps.github.io/) built with React/Vite. It's designed to be modular and easy to modify to promote its use as a jumping-off point for the upcoming AWS Hackathon hosted by [Vanderbilt ISIS](https://www.isis.vanderbilt.edu/) in Fall 2025.

You can view a deployed version of the website [here](https://main.d16l5ekgwvgo9i.amplifyapp.com/). Note that any data will be blank as no data is stored in a database; it strictly uses AWS IoT Core's messaging to showcase the functionality provided by AWS IoT Core. Storing data in something like DynamoDB is entirely possible and could result in some cool applications though!

This project is designed to work with the AbLECPS ROS/MQTT AWS messaging layer [here](https://github.com/bmongird/greengrass-ablecps-integration). This uses the AWS IoT Core MQTT platform, but theoretically this project could be modified to work with some other MQTT broker. I will not be covering any of the AWS IoT Core functionality in this documentation; you may refer to the aforementioned repo for more information regarding setup and functionality for that.

_DISCLAIMER:_ While I've tried my best to make this dashboard as efficient as I can, I by no means claim this is the best, only, cheapest, or most efficient way to accomplish the task of transmitting and displaying data from the AbLECPS simulator. It exists to showcase certain capabilities of the AWS suite and as a starting point for Hackathon projects.

## Setup
*NOTE: This setup assumes you have an AWS account, AbLECPS installed, and the ROS/MQTT AWS messaging layer functional.*

I recommend forking this repository and then cloning it. This will allow you to attach it to AWS Amplify for full functionality, and it has the added benefit of redeploying after every commit. You could modify this website to be hosted somewhere else without Amplify, but to my knowledge that would involve a lot more configuration, especially on the authentication side. You can also choose to just download the zip file and work from there, but you will lose automatic deployment functionality.

Next, ensure you have nodejs installed. Clone this repository, cd into it, and run `npm install` to install all required packages.

Now, replace the endpoint in src/utils/pubsub.ts with your MQTT endpoint. This will allow you to receive the messages from that endpoint. You can customize the topics within the src/hooks/useData.ts hook to your liking.

### AWS Amplify
First, go to the AWS Amplify dashboard. Create a new app, and under "Deploy your app", select Github and press Next. You'll have to do some Github verification to get your repo to appear. Once you're able to select it, choose your branch and press next. Modify any app settings you wish (I used the defaults) and finish deploying. It will then start deploying. 

Once it finishes, if you navigate to the app, then click on the deployment, and then click on "Deployed backend resources", you'll see that you can download an amplify_outputs.json file. This will allow you to run the backend locally for development. **A much simpler way to run the backend for development is to create a sandbox using the the `npx ampx sandbox` command. This involves setting up the AWS and Amplify CLIs. You can reference the [AWS CLI guide](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html) and the [AWS Amplify CLI docs](https://docs.amplify.aws/react/reference/cli-commands/) to get it working.**

### AWS Permissions
The most time-consuming and frustrating part of the setup is configuring AWS correctly, as any small mistakes can lead to an incorrectly functioning website. I've attempted to summarize the permissions, policies, and roles I had to set for this project to work but I may have missed something. Google and the AWS Docs go a long way in helping troubleshoot any issues you might have.

First, we will allow our Amplify app to access the IoT core. Open the AWS Cognito dashboard, click on Identity Pools and select the recently created pool for our Amplify app. Go to User access and follow the hyperlink for Authenticated role. Now, click Add permissions -> Attach policies, select AWSIoTDataAccess, and press add permissions. Navigate back to the User Access tab and repeat the process for the Guest role.

It's not enough for Amplify to have permission to access that data. Permission also has to be explicitly granted by IoT Core. Navigate to the IoT Core dashboard, and on the side menu navigate to Security -> Policies. Create a new policy called amplify-policy. For the policy document, select Allow, \*, and for the resource, you'll need your Amplify ARN (Amazon Resource Name). You can find it by navigating to your Amplify app and going to App settings -> General settings. Note that it will look like this: arn:aws:amplify:us-east-2:12345678910:apps/abc123def456. Chop off everything after the colon before apps and add a star, so that it looks like this: arn:aws:amplify:us-east-2:12345678910:\*. This will allow any Amplify app you have deployed to access everything within IoT Core. Obviously, this is very permissive and _NOT_ a good idea for production, but since we're playing around in development here we should be alright. This ultra permissive setup is just easiest to setup and use and doesn't require too much fiddling with separate sandbox permissions and stuff, but do it at your own risk.

## Lambda Function
In order to showcase AWS's capabilities and do some ML to display on our dashboard, we'll need a Lambda function. First, navigate to the Lambda dashboard and press Layers. Press Create and upload the tflite-layer.zip from the lambda folder for the layer. Select x86-64 for compatible architecture and Python 3.9 for compatible runtimes. Press Create. Next, click Functions and Create Function. Name it something like pipe-detect and set the runtime and architecture to Python3.9 and x86-64. 

Now, you have most of your basic building blocks. Once your lambda function is successfully created, you'll need to add some permissions. Navigate to Configuration and press permissions. Click on the role name - this will open the IAM page for that role. Press add permissions -> attach policies and search for AWSIoTDataAccess select it and press Add Permissions. 

Before we go back to the lambda function, we need to setup Greengrass roles. Navigate to AWS IoT Core and go to Message Routing->Rules. Press Create Rule and name it something like sonar-right. Paste this for the SQL statement: `SELECT * FROM 'iot/uuv0/waterfall_l'`. Click next and then select Lambda under Action 1. Select the function you created. Click Next and Create. Repeat but for `SELECT * FROM 'iot/uuv0/waterfall_r'`. 

Navigate back to the Lambda function you created. Click add trigger and then select IoT as the source. Press custom IoT rule and select the rule we just created. Click add. Repeat this for the other rule.

Back at the Lambda function, select the Code tab and scroll down to Layers. Click Add a Layer, custom layers, and select the layer we created earlier. Finally, navigate back to the Lambda function, and under Code, select Upload From-> .zip. Here, you'll upload the lambda_fn.zip file. 

Everything should now be wired up correctly. You can create a test event with the below JSON and you should see an output on the Greengrass MQTT broker.

```{
  "cam_side": "r",
  "image_data": "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"
}
```

### Test
To test that everything is working, we'll use the MQTT testing client provided in IoT Core. Subscribe to # (wildcard) and send the default command from the deployed Amplify dashboard. You should see a message arrive at iot/uuv0/commands. Additionally, go to Publish a topic, enter iot/uuv0/pose, and publish the below message.

```
{
  "header": {
    "stamp": {
      "secs": 5,
      "nsecs": 0
    },
    "frame_id": "world",
    "seq": 109
  },
  "pose": {
    "position": {
      "y": 100.012542896038582184,
      "x": 50.768620016726603,
      "z": -44.94989550391964
    },
    "orientation": {
      "y": -0.002240582649474597,
      "x": 0.0022620650180784803,
      "z": 0.7071264206705149,
      "w": 0.7070799728750284
    }
  },
  "_ros_topic": "/ground_truth_to_tf_uuv0/pose",
  "__typename": "GGmsg",
  "createdAt": "2025-07-14T16:37:26.482934Z",
  "updatedAt": "2025-07-14T16:37:26.482934Z",
  "id": "xps-pose",
  "payload": {
    "position": {
      "y": 100.012542896038582184,
      "x": 50.768620016726603,
      "z": -44.94989550391964
    },
    "orientation": {
      "y": -0.002240582649474597,
      "x": 0.0022620650180784803,
      "z": 0.7071264206705149,
      "w": 0.7070799728750284
    }
  }
}
```

You should see the uuv0 marker move, and if you had it selected at the top, you should also see the position panel fill in with the position and orientation.

### Further setup
If your ROS/MQTT AWS messaging layer is functional, you should be able to run an AbLECPS sim it and see your dashboard updated in real time with data from the sim.

## Development
Each data element on the dashboard is rendered as a Panel. To add or remove panels, you can create new ones and add them to the dashboard. You'll also have to update the useSettings hook for it to be hidden/visible properly. The background uses a pretty modular tilelayer system from the Leaflet library. If you want to add visual layers on top of the base map, you can just add TileLayers nested within the MapContainer. 

The useData hook contains all of the logic for fetching data and subscribing to various topics.

## Credits
This work was done under the supervision and guidance of Dr. Sandeep Neema during an internship at Vanderbilt University's Institute for Software Integrated Systems. 

I used the AWS Amplify Vite/React template for this project.