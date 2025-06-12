import type { Schema } from "../amplify/data/resource";
import { useState, useEffect, useRef } from "react";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

export default function MsgList() {
  const [msg, setMsg] = useState<Schema["GGmsg"]["type"][]>([]);
  const [lastFetchTime, setLastFetchTime] = useState<Date>(new Date());
  const pollingInterval = useRef<NodeJS.Timeout>();

  const fetchAllMessages = async () => {
    try {
      const { data } = await client.models.GGmsg.list();
      setMsg(data);
      setLastFetchTime(new Date());
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchAllMessages();
    console.log(msg)

    // sub to graphql events (don't use unless you are modifying db through graphql api)
    // const sub = client.models.GGmsg.onUpdate().subscribe({
    //   next: () => {
    //     fetchAllMessages();
    //   },
    // });

    // const sub2 = client.models.GGmsg.onCreate().subscribe({
    //   next: () => {
    //     fetchAllMessages();
    //   },
    // });

    // const sub3 = client.models.GGmsg.onDelete().subscribe({
    //   next: () => {
    //     fetchAllMessages();
    //   },
    // });

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


  return (
    <div>
      <p style={{ fontSize: '12px', color: '#666' }}>
        Last updated: {lastFetchTime.toLocaleTimeString()}
      </p>
      <ul>
        {msg.map(({ id, payload }) => {
          try {
            // ensures pretty printing of msg
            const parsedPayload = typeof payload === 'string' ? JSON.parse(payload) : payload;
            return (
              <li key={id}>
                <pre>{JSON.stringify(parsedPayload, null, 2)}</pre>
              </li>
            );
          } catch (error) {
            console.error('JSON parse error:', error);
          }
        })}
      </ul>
    </div>
  );
}