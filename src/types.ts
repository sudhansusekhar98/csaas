/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewType =
  | 'dashboard'
  | 'consignments'
  | 'tracking'
  | 'audit'
  | 'settings'
  | 'lab-receiving'
  | 'exception-logging'
  | 'system-health'
  | 'personnel'
  | 'splitting-station'
  | 'report-builder';

export type ExtendedViewType = ViewType | 'alert-config';

export interface ViewDef {
  id: ViewType;
  label: string;
  icon: string;
}
