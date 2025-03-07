import { ClientOptions, Options, TracePropagationTargets } from '@sentry/types';

import { NodeTransportOptions } from './transports';

export interface BaseNodeOptions {
  /** Sets an optional server name (device name) */
  serverName?: string;

  // TODO (v8): Remove this in v8
  /**
   * @deprecated Moved to constructor options of the `Http` integration.
   * @example
   * ```js
   * Sentry.init({
   *   integrations: [
   *     new Sentry.Integrations.Http({
   *       tracing: {
   *         tracePropagationTargets: ['api.site.com'],
   *       }
   *     });
   *   ],
   * });
   * ```
   */
  tracePropagationTargets?: TracePropagationTargets;

  // TODO (v8): Remove this in v8
  /**
   * @deprecated Moved to constructor options of the `Http` integration.
   * @example
   * ```js
   * Sentry.init({
   *   integrations: [
   *     new Sentry.Integrations.Http({
   *       tracing: {
   *         shouldCreateSpanForRequest: (url: string) => false,
   *       }
   *     });
   *   ],
   * });
   * ```
   */
  shouldCreateSpanForRequest?(url: string): boolean;

  /** Callback that is executed when a fatal global error occurs. */
  onFatalError?(error: Error): void;
}

/**
 * Configuration options for the Sentry Node SDK
 * @see @sentry/types Options for more information.
 */
export interface NodeOptions extends Options<NodeTransportOptions>, BaseNodeOptions {}

/**
 * Configuration options for the Sentry Node SDK Client class
 * @see NodeClient for more information.
 */
export interface NodeClientOptions extends ClientOptions<NodeTransportOptions>, BaseNodeOptions {}
