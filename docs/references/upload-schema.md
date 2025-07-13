# 範例

```js
export const uploads = pgTable('uploads', {
  id: text('id').primaryKey().defaultRandom(),
  userId: text('user_id').references(() => user.id, { onDelete: 'cascade' }),
  fileName: text('file_name').notNull(),
  originalName: text('original_name').notNull(),
  fileSize: integer('file_size').notNull(),
  mimeType: text('mime_type').notNull(),
  fileUrl: text('file_url').notNull(), // Cloudflare R2 原始 URL
  cdnUrl: text('cdn_url'), // CDN 優化後的 URL
  thumbnailUrl: text('thumbnail_url'), // 裁切後的縮圖 URL
  uploadType: text('upload_type').notNull(), // 'avatar', 'listing', 'general'
  status: text('status').default('active'), // 'active', 'deleted', 'processing'
  metadata: jsonb('metadata'), // 檔案額外資訊 (dimensions, duration, etc.)
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  userIdIdx: index('uploads_user_id_idx').on(table.userId),
  uploadTypeIdx: index('uploads_upload_type_idx').on(table.uploadType),
  statusIdx: index('uploads_status_idx').on(table.status),
  createdAtIdx: index('uploads_created_at_idx').on(table.createdAt),
}));

// 通用媒體關聯表，支援 user avatar 等多種用途
export const media = pgTable('media', {
  id: text('id').primaryKey().defaultRandom(),
  entityType: text('entity_type').notNull(), // 'user', 'listing'
  entityId: text('entity_id').notNull(), // userId 或 listingId
  uploadId: text('upload_id').references(() => uploads.id, { onDelete: 'cascade' }),
  mediaType: text('media_type').notNull(), // 'image', 'video'
  category: text('category'), // 'avatar', 'exterior', 'living_room', 'bedroom', 'kitchen', 'bathroom', 'other'
  displayOrder: integer('display_order').default(0),
  isPrimary: boolean('is_primary').default(false), // 主要媒體（如封面、頭像）
  isFeatured: boolean('is_featured').default(false), // 精選媒體
  caption: text('caption'), // 說明文字
  metadata: jsonb('metadata'), // 其他附加資訊 (room info, tags, etc.)
  status: text('status').default('active'), // 'active', 'hidden', 'deleted'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
}, (table) => ({
  entityIdx: index('media_entity_idx').on(table.entityType, table.entityId),
  uploadIdIdx: index('media_upload_id_idx').on(table.uploadId),
  mediaTypeIdx: index('media_media_type_idx').on(table.mediaType),
  categoryIdx: index('media_category_idx').on(table.category),
  displayOrderIdx: index('media_display_order_idx').on(table.displayOrder),
  isPrimaryIdx: index('media_is_primary_idx').on(table.isPrimary),
  statusIdx: index('media_status_idx').on(table.status),
}));
```