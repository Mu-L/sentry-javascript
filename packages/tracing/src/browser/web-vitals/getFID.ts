/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { bindReporter } from './lib/bindReporter';
import { getVisibilityWatcher } from './lib/getVisibilityWatcher';
import { initMetric } from './lib/initMetric';
import { observe } from './lib/observe';
import { onHidden } from './lib/onHidden';
import { FIDMetric, PerformanceEventTiming, ReportCallback, ReportOpts } from './types';

/**
 * Calculates the [FID](https://web.dev/fid/) value for the current page and
 * calls the `callback` function once the value is ready, along with the
 * relevant `first-input` performance entry used to determine the value. The
 * reported value is a `DOMHighResTimeStamp`.
 *
 * _**Important:** since FID is only reported after the user interacts with the
 * page, it's possible that it will not be reported for some page loads._
 */
export const onFID = (onReport: ReportCallback, opts: ReportOpts = {}): void => {
  const visibilityWatcher = getVisibilityWatcher();
  const metric = initMetric('FID');
  // eslint-disable-next-line prefer-const
  let report: ReturnType<typeof bindReporter>;

  const handleEntry = (entry: PerformanceEventTiming): void => {
    // Only report if the page wasn't hidden prior to the first input.
    if (entry.startTime < visibilityWatcher.firstHiddenTime) {
      metric.value = entry.processingStart - entry.startTime;
      metric.entries.push(entry);
      report(true);
    }
  };

  const handleEntries = (entries: FIDMetric['entries']): void => {
    (entries as PerformanceEventTiming[]).forEach(handleEntry);
  };

  const po = observe('first-input', handleEntries);
  report = bindReporter(onReport, metric, opts.reportAllChanges);

  if (po) {
    onHidden(() => {
      handleEntries(po.takeRecords() as FIDMetric['entries']);
      po.disconnect();
    }, true);
  }
};
