## Overview
This is a demo of an AWS-powered web interface for [AbLECPS](https://ablecps.github.io/) built with React/Vite. It's designed to be modular and easy to modify to promote its use as a jumping-off point for the upcoming AWS Hackathon hosted by [Vanderbilt ISIS](https://www.isis.vanderbilt.edu/) in Fall 2025.

You can view a deployed version of the website [here](). Note that any data will be blank as no data is stored in a database; it strictly uses AWS IoT Core's messaging to showcase the functionality provided by AWS IoT Core.

This project is designed to work with the AbLECPS ROS/MQTT AWS messaging layer [here](https://github.com/bmongird/greengrass-ablecps-integration). This uses the AWS IoT Core MQTT platform, but theoretically this project could be modified to work with some other MQTT broker. I will not be covering any of the AWS IoT Core functionality in this documentation; you may refer to the aforementioned repo for more information regarding setup and functionality for that. This web interface also makes use of the AWS Lambda function for sonar imagery and ML pipe detection contained in the above repo.

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

### Test
To test that everything is working, we'll use the MQTT testing client provided in IoT Core. Subscribe to # (wildcard) and send the default command from the deployed Amplify dashboard. You should see a message arrive at iot/uuv0/commands. Additionally, go to Publish a topic, enter iot/uuv0/pose/slow, and publish the below message.

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
If your ROS/MQTT AWS messaging layer is functional, you should be able to run it and see your dashboard updated in real time with data from the AbLECPS sim.

## Development
Each data element on the dashboard is rendered as a Panel. To add or remove panels, you can create new ones and add them to the dashboard. You'll also have to update the useSettings hook for it to be hidden/visible properly. The background uses a pretty modular tilelayer system from the Leaflet library. If you want to add visual layers on top of the base map, you can just add TileLayers nested within the MapContainer. 

The useData hook contains all of the logic for fetching data and subscribing to various topics.

## Credits
This work was done under the supervision and guidance of Dr. Sandeep Neema during an internship at Vanderbilt University's Institute for Software Integrated Systems. 

I used the AWS Amplify Vite/React template for this project.