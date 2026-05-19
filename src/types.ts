/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type ViewType =
  | 'dashboard'
  | 'consignments'
  | 'supplier-consignments'
  | 'sample-collection'
  | 'tracking'
  | 'prep-room'
  | 'division-station'
  | 'lab-receiving'
  | 'non-conformance'
  | 'audit'
  | 'report-builder'
  | 'personnel'
  | 'system-health'
  | 'alert-config';

export interface ViewDef {
  id: ViewType;
  label: string;
  icon: string;
}
