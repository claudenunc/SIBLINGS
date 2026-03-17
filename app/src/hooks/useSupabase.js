import { useState, useEffect } from 'react';

const SUPABASE_URL = 'https://liclnxsbjjdkaxzdxmnb.supabase.co';
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxpY2xueHNiampka2F4emR4bW5iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQzNTQ5NzAsImV4cCI6MjA3OTkzMDk3MH0.O2j4M3JfNgihl8IkrVr0bVAgx-yFOQiEip7yJwVhlIc';

let supabaseClient = null;
let supabaseModule = null;

async function getSupabase() {
  if (supabaseClient) return supabaseClient;

  if (!supabaseModule) {
    supabaseModule = await import('@supabase/supabase-js');
  }

  supabaseClient = supabaseModule.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

/**
 * Hook for Supabase realtime subscriptions and connection status
 */
export function useSupabase() {
  const [connected, setConnected] = useState(false);
  const [client, setClient] = useState(null);

  useEffect(() => {
    let channel = null;

    async function init() {
      try {
        const sb = await getSupabase();
        setClient(sb);

        // Test connection with a simple query
        const { error } = await sb.from('agent_registry').select('agent_name').limit(1);
        setConnected(!error);

        // Set up a heartbeat channel to track connection status
        channel = sb.channel('connection-status');
        channel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            setConnected(true);
          }
        });
      } catch (err) {
        console.error('Supabase connection error:', err);
        setConnected(false);
      }
    }

    init();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, []);

  return { supabase: client, connected };
}

/**
 * Hook for subscribing to new messages in realtime
 */
export function useRealtimeMessages(onNewMessage) {
  useEffect(() => {
    let channel = null;

    async function subscribe() {
      const sb = await getSupabase();

      channel = sb
        .channel('agent-messages-realtime')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'agent_messages',
          },
          (payload) => {
            if (onNewMessage) {
              onNewMessage(payload.new);
            }
          }
        )
        .subscribe();
    }

    subscribe();

    return () => {
      if (channel) {
        channel.unsubscribe();
      }
    };
  }, [onNewMessage]);
}

export default useSupabase;
