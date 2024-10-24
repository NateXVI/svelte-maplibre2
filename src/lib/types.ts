import type { ExpressionSpecification } from 'maplibre-gl';

export interface ClusterOptions {
  /** The minimum number of points required to form a cluster.
   * This can not be changed after the source is created.
   * @default 2 */
  minPoints?: number;
  /** Maximum zoom at which to perform clustering. */
  maxZoom?: number;
  /** Radius of each cluster when clustering points.
   * @default 50 */
  radius?: number;
  /** Aggregations to peform on the cluster points.
   * This can not be changed after the source is created. */
  properties?: Record<string, ExpressionSpecification>;
}

export interface ClusterOptions {
  /** The minimum number of points required to form a cluster.
   * This can not be changed after the source is created.
   * @default 2 */
  minPoints?: number;
  /** Maximum zoom at which to perform clustering. */
  maxZoom?: number;
  /** Radius of each cluster when clustering points.
   * @default 50 */
  radius?: number;
  /** Aggregations to peform on the cluster points.
   * This can not be changed after the source is created. */
  properties?: Record<string, maplibregl.ExpressionSpecification>;
}
