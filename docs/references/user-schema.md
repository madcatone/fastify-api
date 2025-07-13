```js
export const user = pgTable('user', {
  id: text('id').primaryKey().defaultRandom(),
  name: text('name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  email: text('email').unique(),
  emailVerified: boolean('email_verified').default(false),
  smsVerified: boolean('sms_verified').default(false),
  wxOpenid: text('wx_openid').unique(),
  wxId: text('wx_id'),
  wxName: text('wx_name'),
  wxAvatar: text('wx_avatar'),
  phone: text('phone').unique(),
  telCountryCode: text('tel_country_code'),
  permissionGroup: text('permission_group'),
  language: text('language'),
  nationality: text('nationality'),
  isActive: boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
  emailIdx: index('user_email_idx').on(table.email),
  wxOpenidIdx: index('user_wx_openid_idx').on(table.wxOpenid),
  phoneIdx: index('user_phone_idx').on(table.phone),
  permissionGroupIdx: index('user_permission_group_idx').on(table.permissionGroup),
}));
```