/**
 *
 * Interface for the output of the info() command of RxRedis.
 *
 */
export interface IRedisInfo {
  redis_version: string;
  connected_clients: number;
  used_memory: number;
  used_memory_human: string;
  used_memory_rss: number;
  used_memory_rss_human: string;
  used_memory_peak: number;
  used_memory_peak_human: string;
  used_memory_peak_perc: string;
  used_memory_dataset: number;
  used_memory_dataset_perc: string;
  total_system_memory: number;
  total_system_memory_human: string;
  rdb_changes_since_last_save: number;
  rdb_bgsave_in_progress: number;
  rdb_last_save_time: number;
  rdb_last_bgsave_status: string;
  rdb_last_bgsave_time_sec: number;
  rdb_current_bgsave_time_sec: number;
  rdb_last_cow_size: number;
  aof_enabled: number;
  aof_rewrite_in_progress: number;
  aof_rewrite_scheduled: number;
  aof_last_rewrite_time_sec: number;
  aof_current_rewrite_time_sec: number;
  aof_last_bgrewrite_status: string;
  aof_last_write_status: string;
  aof_last_cow_size: number;
  aof_current_size: number;
  aof_base_size: number;
  total_connections_received: number;
  total_commands_processed: number;
  instantaneous_ops_per_sec: number;
  total_net_input_bytes: number;
  total_net_output_bytes: number;
  rejected_connections: number;
  sync_full: number;
  sync_partial_ok: number;
  sync_partial_err: number;
  expired_keys: number;
  expired_stale_perc: number;
  expired_time_cap_reached_count: number;
  evicted_keys: number;
  used_cpu_sys: number;
  used_cpu_user: number;
  used_cpu_sys_children: number;
  used_cpu_user_childre: number;
}
