import type { Schema } from "../amplify/data/resource";
import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";
import Background from "./ss_opensea.png"

const client = generateClient<Schema>();

export default function MsgList() {
  const [msg, setMsg] = useState<Schema["GGmsg"]["type"][]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const [currentPosition, setCurrentPosition] = useState<{x: number, y: number} | null>(null);
  const [batteryInfo, setBatteryInfo] = useState<any>(null);
  const [speedInfo, setSpeedInfo] = useState<any>(null);
  const [currentImage, setCurrentImage] = useState<string | null>(null);
  const [backgroundImageDimensions, setBackgroundImageDimensions] = useState<{width: number, height: number, offsetX: number, offsetY: number} | null>(null);
  const [isMessageBoxCollapsed, setIsMessageBoxCollapsed] = useState(false);
  const [isBatteryBoxCollapsed, setIsBatteryBoxCollapsed] = useState(false);
  const [isImageBoxCollapsed, setIsImageBoxCollapsed] = useState(false);
  const backgroundContainerRef = useRef<HTMLDivElement>(null);
  const pollingInterval = useRef<NodeJS.Timeout>();

  const fetchAllMessages = async () => {
    try {
      const { data } = await client.models.GGmsg.list();
      setLastFetchTime(new Date());
      
      // Process messages to extract position, battery info, and images
      data.forEach(message => {
        try {
          const parsedPayload = typeof message.payload === 'string' 
            ? JSON.parse(message.payload) 
            : message.payload;

          if (message.id == "xps-pose") {
            setCurrentPosition({
              x: parsedPayload.position.x,
              y: parsedPayload.position.y
            });
          }
          else if (message.id == "xps-pixhawk") {
            setBatteryInfo(parsedPayload);
          }
          else if (message.id == "xps-image") {
            // Handle base64 encoded image
            if (message.image_data) {
              const base64Image = `data:image/jpeg;base64,${message.image_data}`;
              setCurrentImage(base64Image);
            }
          }
          
        } catch (error) {
          console.error("Error parsing message payload:", error);
        }
      });
      
      // Filter out image messages from the display array
      const filteredMessages = data.filter(message => message.id !== "xps-image");
      setMsg(filteredMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // calculate actual background image dimensions and position for cover behavior
  const calculateBackgroundImageDimensions = () => {
    if (!backgroundContainerRef.current) return;

    const container = backgroundContainerRef.current;
    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // make a tmp image to get the natural dimensions
    const img = new Image();
    img.onload = () => {
      const imageAspectRatio = img.naturalWidth / img.naturalHeight;
      const containerAspectRatio = containerWidth / containerHeight;

      let scale, offsetX, offsetY;

      if (imageAspectRatio > containerAspectRatio) {
        // image is wider, scale to fit height, crop width
        scale = containerHeight / img.naturalHeight;
        offsetX = (containerWidth - (img.naturalWidth * scale)) / 2;
        offsetY = 0;
      } else {
        // image is taller, scale to fit width, crop height  
        scale = containerWidth / img.naturalWidth;
        offsetX = 0;
        offsetY = (containerHeight - (img.naturalHeight * scale)) / 2;
      }

      setBackgroundImageDimensions({
        width: img.naturalWidth * scale,
        height: img.naturalHeight * scale,
        offsetX,
        offsetY
      });
    };
    img.src = Background;
  };

  const convertToScreenPosition = (x: number, y: number) => {
    if (!backgroundImageDimensions) return { screenX: 0, screenY: 0 };

    // convert coords
    const imageX = ((x + 300) / 600) * backgroundImageDimensions.width;
    const imageY = ((150 - y) / 300) * backgroundImageDimensions.height; // Flip Y axis

    const screenX = imageX + backgroundImageDimensions.offsetX;
    const screenY = imageY + backgroundImageDimensions.offsetY;

    return { screenX, screenY };
  };

  useEffect(() => {
    // Initial fetch
    fetchAllMessages();
    console.log(msg);

    // polling setup
    pollingInterval.current = setInterval(() => {
      fetchAllMessages();
    }, 1000);

    return () => {
      if (pollingInterval.current) {
        clearInterval(pollingInterval.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && pollingInterval.current) {
        clearInterval(pollingInterval.current);
      } else if (!document.hidden) {
        pollingInterval.current = setInterval(fetchAllMessages, 1000);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, []);

  useEffect(() => {
    calculateBackgroundImageDimensions();
    
    const handleResize = () => {
      calculateBackgroundImageDimensions();
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div 
      ref={backgroundContainerRef}
      style={{
        minHeight: '100vh',
        width: '100vw',
        position: 'fixed',
        top: 0,
        left: 0,
        backgroundImage: `url(${Background})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        margin: 0,
        padding: 0
      }}
    >
      <div style={{
        position: 'absolute',
        bottom: '20px',
        right: '20px',
        backgroundColor: 'rgba(128, 128, 128, 0.8)',
        color: 'white',
        fontSize: '10px',
        padding: '4px 8px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
        zIndex: 15
      }}>
        Last updated: {lastFetchTime.toLocaleTimeString()}
      </div>

      {/* red position dot */}
      {currentPosition && backgroundImageDimensions && (() => {
        const { screenX, screenY } = convertToScreenPosition(currentPosition.x, currentPosition.y);
        return (
          <div style={{
            position: 'absolute',
            left: `${screenX - 10}px`, // Center the dot (20px diameter / 2)
            top: `${screenY - 10}px`,
            width: '20px',
            height: '20px',
            backgroundColor: 'red',
            borderRadius: '50%',
            border: '2px solid white',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
            zIndex: 10,
            transition: 'all 0.3s ease-in-out', // Smooth movement animation
          }} />
        );
      })()}
      

      {/* msg box */}
      <div style={{
        position: 'absolute',
        top: '20px',
        right: '20px',
        width: '350px',
        maxHeight: isMessageBoxCollapsed ? 'auto' : '400px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(5px)',
        overflow: 'auto',
        zIndex: 20,
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isMessageBoxCollapsed ? '0' : '12px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            color: '#333',
            margin: '0',
            fontWeight: '600',
            textAlign: 'left'
          }}>
            Messages
          </h3>
          <button
            onClick={() => setIsMessageBoxCollapsed(!isMessageBoxCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '3px',
              color: '#666',
              transition: 'background-color 0.2s ease'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isMessageBoxCollapsed ? '▼' : '▲'}
          </button>
        </div>
        
        {!isMessageBoxCollapsed && (
          <div style={{ 
            maxHeight: '320px', 
            overflowY: 'auto',
            transition: 'all 0.3s ease-in-out'
          }}>
            {msg.length === 0 ? (
              <p style={{ color: '#888', fontStyle: 'italic', textAlign: 'center' }}>
                No messages yet
              </p>
            ) : (
              <ul style={{ 
                listStyle: 'none', 
                padding: 0, 
                margin: 0,
                textAlign: 'left'
              }}>
                {msg.map(({ id, payload }) => {
                  try {
                    // ensures pretty printing of msg
                    const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
                    return (
                      <li key={id} style={{ 
                        marginBottom: '12px',
                        padding: '8px',
                        backgroundColor: 'rgba(248, 249, 250, 0.8)',
                        borderRadius: '4px',
                        border: '1px solid #e9ecef'
                      }}>
                        <pre style={{ 
                          fontSize: '11px',
                          margin: 0,
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-word',
                          fontFamily: 'Monaco, Consolas, "Courier New", monospace'
                        }}>
                          {JSON.stringify(parsedPayload, null, 2)}
                        </pre>
                      </li>
                    );
                  } catch (error) {
                    console.error('JSON parse error:', error);
                    return null;
                  }
                })}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* battery box */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        width: '200px',
        maxHeight: isBatteryBoxCollapsed ? 'auto' : '200px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(5px)',
        overflow: 'auto',
        fontSize: 12,
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isBatteryBoxCollapsed ? '0' : '12px'
        }}>
          <p style={{ fontSize: 14, margin: 0, flex: 1 }}>
            Battery Capacity Remaining
          </p>
          <button
            onClick={() => setIsBatteryBoxCollapsed(!isBatteryBoxCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '3px',
              color: '#666',
              transition: 'background-color 0.2s ease',
              marginLeft: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isBatteryBoxCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {!isBatteryBoxCollapsed && (
          <p style={{ 
            margin: 0
          }}>
            {batteryInfo}
          </p>
        )}
      </div>

      {/* image box */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        width: '300px',
        maxHeight: isImageBoxCollapsed ? 'auto' : '350px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #ccc',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(5px)',
        overflow: 'auto',
        textAlign: 'center',
        transition: 'all 0.3s ease-in-out'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: isImageBoxCollapsed ? '0' : '12px'
        }}>
          <h3 style={{ 
            fontSize: '16px', 
            color: '#333',
            margin: '0',
            fontWeight: '600',
            flex: 1,
            textAlign: 'left'
          }}>
            Live Image Feed
          </h3>
          <button
            onClick={() => setIsImageBoxCollapsed(!isImageBoxCollapsed)}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '2px 6px',
              borderRadius: '3px',
              color: '#666',
              transition: 'background-color 0.2s ease',
              marginLeft: '8px'
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.1)'}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            {isImageBoxCollapsed ? '▼' : '▲'}
          </button>
        </div>

        {!isImageBoxCollapsed && (
          <div style={{
            maxHeight: '280px',
            overflowY: 'auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
          }}>
            {currentImage ? (
              <img 
                src={currentImage}
                alt="Live feed"
                style={{
                  maxWidth: '100%',
                  maxHeight: '260px',
                  borderRadius: '4px',
                  border: '1px solid #ddd',
                  objectFit: 'contain'
                }}
                onError={(e) => {
                  console.error('Image failed to load:', e);
                }}
              />
            ) : (
              <p style={{ 
                color: '#888', 
                fontStyle: 'italic',
                margin: 0,
                padding: '20px'
              }}>
                No image available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}