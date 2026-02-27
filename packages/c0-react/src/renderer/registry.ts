import type { C0ComponentLibrary } from '../types.js';

import { DefaultTable } from './defaults/Table.js';
import { DefaultKeyValue } from './defaults/KeyValue.js';
import { DefaultSummary } from './defaults/Summary.js';
import { DefaultChart } from './defaults/Chart.js';
import { DefaultForm } from './defaults/Form.js';
import { DefaultMarkdown } from './defaults/Markdown.js';
import { DefaultComparison } from './defaults/Comparison.js';
import { DefaultTimeline } from './defaults/Timeline.js';
import { DefaultDiff } from './defaults/Diff.js';
import { DefaultApprovalCard } from './defaults/ApprovalCard.js';
import { DefaultNotification } from './defaults/Notification.js';
import { DefaultProgressBar } from './defaults/ProgressBar.js';
import { DefaultStatusBoard } from './defaults/StatusBoard.js';
import { DefaultDocument } from './defaults/Document.js';
import { DefaultDocumentCollection } from './defaults/DocumentCollection.js';
import { DefaultReport } from './defaults/Report.js';
import { DefaultFileDownload } from './defaults/FileDownload.js';
import { DefaultFileUpload } from './defaults/FileUpload.js';
import { DefaultImage } from './defaults/Image.js';
import { DefaultComposed } from './defaults/Composed.js';

/**
 * Default renderers for all 21 WS-native artifact types.
 *
 * Keys are PascalCase component names (matching `toPascalCase(artifactType)`).
 * Consumers can override any entry by spreading into their own map:
 *
 * ```tsx
 * const myComponents = { ...DEFAULT_RENDERERS, Table: MyFancyTable };
 * <C0Chat components={myComponents} />
 * ```
 */
export const DEFAULT_RENDERERS: C0ComponentLibrary = {
  // Table
  Table: DefaultTable,
  EditableTable: DefaultTable,
  // Board
  StatusBoard: DefaultStatusBoard,
  // Document
  Document: DefaultDocument,
  DocumentCollection: DefaultDocumentCollection,
  Markdown: DefaultMarkdown,
  Report: DefaultReport,
  // File
  FileDownload: DefaultFileDownload,
  FileUpload: DefaultFileUpload,
  Image: DefaultImage,
  // Structured
  Comparison: DefaultComparison,
  KeyValue: DefaultKeyValue,
  Summary: DefaultSummary,
  Chart: DefaultChart,
  Diff: DefaultDiff,
  Form: DefaultForm,
  ApprovalCard: DefaultApprovalCard,
  // Text
  Notification: DefaultNotification,
  Timeline: DefaultTimeline,
  ProgressBar: DefaultProgressBar,
  // Composed
  Composed: DefaultComposed,
};
