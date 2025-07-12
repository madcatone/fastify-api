# Fastify Roadmap

一個使用Fastify + PostgreSQL作為後端API服務的項目。包含用戶註冊，登入取得JWT。登入後的用戶可以提交Comment。

## TASK 1. Drizzle安裝
- 高優先級：npm i drizzle-orm
- Initialize a new Drizzle application
- See: tasks/01.md

## TASK 2. Interact with DB
- 前置：TASK 1.
- 添加一個數據表 todos add ID(uuid), content(text), author(text), createdAt(timestamp), updatedAt(timestamp), isActive(boolean default: true)

## TASK 3. CRUD with Drizzle
- 前置： TASK 2.
- 將CRUD實現在todos api上
- See: tasks/03.md
