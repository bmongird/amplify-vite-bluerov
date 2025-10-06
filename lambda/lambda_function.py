import base64
import json
import io
import numpy as np
from PIL import Image
import tflite_runtime.interpreter as tflite
import boto3
from datetime import datetime

interpreter = tflite.Interpreter(model_path="/var/task/pipe_unet_model.tflite")
interpreter.allocate_tensors()
input_details = interpreter.get_input_details()
output_details = interpreter.get_output_details()

iot_client = boto3.client('iot-data', region_name='us-east-2')

def publish_detection(result):
    try:
        iot_client.publish(
            topic='pipe/detection/result',
            qos=1,
            payload=json.dumps(result)
        )
    except Exception as e:
        print(f"Failed to publish result: {e}")

def lambda_handler(event, context):
    try:
        img_b64 = event.get('image_data')
        if not img_b64:
            return {'statusCode': 400, 'body': json.dumps({'error': 'No image_data provided'})}

        # decode img
        image_bytes = base64.b64decode(img_b64)
        image = Image.open(io.BytesIO(image_bytes)).convert('L').resize((180, 16))
        img_array = np.array(image, dtype=np.float32)[np.newaxis, ..., np.newaxis] / 255.0

        # ml
        interpreter.set_tensor(input_details[0]['index'], img_array)
        interpreter.invoke()
        output = interpreter.get_tensor(output_details[0]['index'])[0, :, :, 0]

        binary_mask = (output > 0.5).astype(np.uint8)
        pipe_area = int(np.sum(binary_mask))
        pipe_detected = pipe_area > 10

        # convert to jpg
        mask_img = Image.fromarray((output * 255).astype(np.uint8))  # Soft mask
        buffer = io.BytesIO()
        mask_img.save(buffer, format='JPEG', quality=60)  # Compress to JPEG
        mask_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

        result = {
            'cam_side': event.get('cam_side'),
            'pipe_detected': pipe_detected,
            'pipe_area': pipe_area,
            'timestamp': datetime.utcnow().isoformat() + 'Z',
            'mask_jpg_b64': mask_b64,
            'original_image': img_b64
        }

        publish_detection(result)

        return {
            'statusCode': 200,
            'body': json.dumps(result)
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'body': json.dumps({'error': str(e)})
        }
