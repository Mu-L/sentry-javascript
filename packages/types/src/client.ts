import { EventDropReason } from './clientreport';
import { DataCategory } from './datacategory';
import { DsnComponents } from './dsn';
import { Event, EventHint } from './event';
import { Integration, IntegrationClass } from './integration';
import { ClientOptions } from './options';
import { Scope } from './scope';
import { Session, SessionAggregates } from './session';
import { Severity, SeverityLevel } from './severity';
import { Transport } from './transport';

/**
 * User-Facing Sentry SDK Client.
 *
 * This interface contains all methods to interface with the SDK once it has
 * been installed. It allows to send events to Sentry, record breadcrumbs and
 * set a context included in every event. Since the SDK mutates its environment,
 * there will only be one instance during runtime.
 *
 */
export interface Client<O extends ClientOptions = ClientOptions> {
  /**
   * Captures an exception event and sends it to Sentry.
   *
   * @param exception An exception-like object.
   * @param hint May contain additional information about the original exception.
   * @param scope An optional scope containing event metadata.
   * @returns The event id
   */
  captureException(exception: any, hint?: EventHint, scope?: Scope): string | undefined;

  /**
   * Captures a message event and sends it to Sentry.
   *
   * @param message The message to send to Sentry.
   * @param level Define the level of the message.
   * @param hint May contain additional information about the original exception.
   * @param scope An optional scope containing event metadata.
   * @returns The event id
   */
  captureMessage(
    message: string,
    // eslint-disable-next-line deprecation/deprecation
    level?: Severity | SeverityLevel,
    hint?: EventHint,
    scope?: Scope,
  ): string | undefined;

  /**
   * Captures a manually created event and sends it to Sentry.
   *
   * @param event The event to send to Sentry.
   * @param hint May contain additional information about the original exception.
   * @param scope An optional scope containing event metadata.
   * @returns The event id
   */
  captureEvent(event: Event, hint?: EventHint, scope?: Scope): string | undefined;

  /**
   * Captures a session
   *
   * @param session Session to be delivered
   */
  captureSession?(session: Session): void;

  /** Returns the current Dsn. */
  getDsn(): DsnComponents | undefined;

  /** Returns the current options. */
  getOptions(): O;

  /**
   * Returns the transport that is used by the client.
   * Please note that the transport gets lazy initialized so it will only be there once the first event has been sent.
   *
   * @returns The transport.
   */
  getTransport(): Transport | undefined;

  /**
   * Flush the event queue and set the client to `enabled = false`. See {@link Client.flush}.
   *
   * @param timeout Maximum time in ms the client should wait before shutting down. Omitting this parameter will cause
   *   the client to wait until all events are sent before disabling itself.
   * @returns A promise which resolves to `true` if the flush completes successfully before the timeout, or `false` if
   * it doesn't.
   */
  close(timeout?: number): PromiseLike<boolean>;

  /**
   * Wait for all events to be sent or the timeout to expire, whichever comes first.
   *
   * @param timeout Maximum time in ms the client should wait for events to be flushed. Omitting this parameter will
   *   cause the client to wait until all events are sent before resolving the promise.
   * @returns A promise that will resolve with `true` if all events are sent before the timeout, or `false` if there are
   * still events in the queue when the timeout is reached.
   */
  flush(timeout?: number): PromiseLike<boolean>;

  /** Returns the client's instance of the given integration class, it any. */
  getIntegration<T extends Integration>(integration: IntegrationClass<T>): T | null;

  /** This is an internal function to setup all integrations that should run on the client */
  setupIntegrations(): void;

  /** Creates an {@link Event} from all inputs to `captureException` and non-primitive inputs to `captureMessage`. */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  eventFromException(exception: any, hint?: EventHint): PromiseLike<Event>;

  /** Creates an {@link Event} from primitive inputs to `captureMessage`. */
  eventFromMessage(
    message: string,
    // eslint-disable-next-line deprecation/deprecation
    level?: Severity | SeverityLevel,
    hint?: EventHint,
  ): PromiseLike<Event>;

  /** Submits the event to Sentry */
  sendEvent(event: Event, hint?: EventHint): void;

  /** Submits the session to Sentry */
  sendSession(session: Session | SessionAggregates): void;

  /**
   * Record on the client that an event got dropped (ie, an event that will not be sent to sentry).
   *
   * @param reason The reason why the event got dropped.
   * @param category The data category of the dropped event.
   */
  recordDroppedEvent(reason: EventDropReason, category: DataCategory): void;
}
