# Database Schema Documentation

Generated on: 2026-05-07T17:43:37.762Z

## File: `data.json`
**Total Records:** 20953

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| DDS | string | 0.15% | ⚠️ Rare field |
| ID | number | 100.00% |  |
| SapJiraMessage | string | 35.07% |  |
| accountCode | string | 64.78% |  |
| accountCodeOther | string | 64.66% |  |
| accountList | array | 98.81% |  |
| accountList43 | array | 97.64% |  |
| accountList43[].id | string | 0.97% | ⚠️ Rare field |
| accountList43[].name | string | 0.97% | ⚠️ Rare field |
| accountList43[].num | number | 0.97% | ⚠️ Rare field |
| accountList50 | array | 98.78% |  |
| accountList50[].id | string | 63.65% |  |
| accountList50[].name | string | 63.65% |  |
| accountList50[].num | number | 63.65% |  |
| accountList[].id | string | 62.82% |  |
| accountList[].name | string | 62.82% |  |
| accountList[].num | number | 62.82% |  |
| accountType | string | 62.01% |  |
| chat_id | number | 100.00% |  |
| comment | string | 99.35% |  |
| confirmative | object | 97.56% |  |
| confirmative.chat_id | number | 97.56% |  |
| confirmative.status | boolean | 97.56% |  |
| confirmativeSendlist | array | 99.32% |  |
| confirmativeSendlist[].chatId | number | 99.25% |  |
| confirmativeSendlist[].messageId | number | 97.96% |  |
| creationDate | string | 100.00% |  |
| currency | string | 64.79% |  |
| currencyRate | string / number | 64.77% | Mixed types |
| customerCode | string | 0.00% | ⚠️ Rare field |
| customerId | string | 0.00% | ⚠️ Rare field |
| customerList | array | 0.00% | ⚠️ Rare field |
| customerList[].customerName | string | 0.00% | ⚠️ Rare field |
| customerList[].id | string | 0.00% | ⚠️ Rare field |
| customerList[].name | string | 0.00% | ⚠️ Rare field |
| customerList[].num | number | 0.00% | ⚠️ Rare field |
| customerName | string | 0.00% | ⚠️ Rare field |
| dds | string | 63.24% |  |
| ddsList | array | 63.63% |  |
| ddsList[].id | number / string | 63.63% | Mixed types |
| ddsList[].name | string | 63.63% |  |
| documentType | boolean | 63.87% |  |
| endDate | string | 64.80% |  |
| executor | object | 67.39% |  |
| executor.chat_id | number | 67.39% |  |
| executor.status | boolean | 67.39% |  |
| file | object | 99.32% |  |
| file.active | boolean | 99.32% |  |
| file.document | object | 28.36% |  |
| file.document.file_id | string | 28.36% |  |
| file.document.file_name | string | 28.36% |  |
| file.document.file_size | number | 28.36% |  |
| file.document.file_unique_id | string | 28.36% |  |
| file.document.mime_type | string | 28.36% |  |
| file.document.thumb | object | 22.57% |  |
| file.document.thumb.file_id | string | 22.57% |  |
| file.document.thumb.file_size | number | 22.57% |  |
| file.document.thumb.file_unique_id | string | 22.57% |  |
| file.document.thumb.height | number | 22.57% |  |
| file.document.thumb.width | number | 22.57% |  |
| file.document.thumbnail | object | 22.57% |  |
| file.document.thumbnail.file_id | string | 22.57% |  |
| file.document.thumbnail.file_size | number | 22.57% |  |
| file.document.thumbnail.file_unique_id | string | 22.57% |  |
| file.document.thumbnail.height | number | 22.57% |  |
| file.document.thumbnail.width | number | 22.57% |  |
| file.send | boolean | 28.36% |  |
| full | boolean | 100.00% |  |
| id | string | 100.00% |  |
| is_delete | boolean | 100.00% |  |
| jira | boolean | 0.68% | ⚠️ Rare field |
| lastBtn | object | 2.16% |  |
| lastBtn.chat_id | number | 0.29% | ⚠️ Rare field |
| lastBtn.parse_mode | string | 0.70% | ⚠️ Rare field |
| lastBtn.reply_markup | object / string | 2.16% | Mixed types |
| lastBtn.reply_markup.inline_keyboard | array | 1.19% |  |
| lastBtn.reply_markup.inline_keyboard[].0 | object | 1.19% |  |
| lastBtn.reply_markup.inline_keyboard[].0.callback_data | string | 1.19% |  |
| lastBtn.reply_markup.inline_keyboard[].0.text | string | 1.19% |  |
| lastBtn.reply_markup.inline_keyboard[].1 | object | 1.11% |  |
| lastBtn.reply_markup.inline_keyboard[].1.callback_data | string | 1.11% |  |
| lastBtn.reply_markup.inline_keyboard[].1.text | string | 1.11% |  |
| lastBtn.reply_markup.keyboard | array | 0.69% | ⚠️ Rare field |
| lastBtn.reply_markup.keyboard[].0 | object | 0.69% | ⚠️ Rare field |
| lastBtn.reply_markup.keyboard[].0.text | string | 0.69% | ⚠️ Rare field |
| lastBtn.reply_markup.keyboard[].1 | object | 0.31% | ⚠️ Rare field |
| lastBtn.reply_markup.keyboard[].1.text | string | 0.31% | ⚠️ Rare field |
| lastBtn.reply_markup.resize_keyboard | boolean | 1.88% |  |
| lastBtn.text | string | 0.29% | ⚠️ Rare field |
| lastFile | object | 14.78% |  |
| lastFile.file | object | 14.78% |  |
| lastFile.file.file_id | string | 14.78% |  |
| lastFile.file.file_name | string | 14.78% |  |
| lastFile.file.file_size | number | 14.78% |  |
| lastFile.file.file_unique_id | string | 14.78% |  |
| lastFile.file.mime_type | string | 14.78% |  |
| lastFile.file.thumb | object | 10.45% |  |
| lastFile.file.thumb.file_id | string | 10.45% |  |
| lastFile.file.thumb.file_size | number | 10.45% |  |
| lastFile.file.thumb.file_unique_id | string | 10.45% |  |
| lastFile.file.thumb.height | number | 10.45% |  |
| lastFile.file.thumb.width | number | 10.45% |  |
| lastFile.file.thumbnail | object | 10.45% |  |
| lastFile.file.thumbnail.file_id | string | 10.45% |  |
| lastFile.file.thumbnail.file_size | number | 10.45% |  |
| lastFile.file.thumbnail.file_unique_id | string | 10.45% |  |
| lastFile.file.thumbnail.height | number | 10.45% |  |
| lastFile.file.thumbnail.width | number | 10.45% |  |
| lastStep | number | 2.16% |  |
| menu | number | 100.00% |  |
| menuName | string | 100.00% |  |
| notConfirmMessage | string | 14.78% |  |
| payType | string | 63.66% |  |
| payment | boolean | 64.91% |  |
| point | string | 63.63% |  |
| purchase | boolean | 63.27% |  |
| purchaseEntry | string | 0.28% | ⚠️ Rare field |
| purchaseOrders | array | 63.27% |  |
| purchaseOrders[].CANCELED | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].CardCode | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].CardName | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].Currency | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].DocEntry | number | 0.28% | ⚠️ Rare field |
| purchaseOrders[].DocNum | number | 0.28% | ⚠️ Rare field |
| purchaseOrders[].DocStatus | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].DocType | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].ItemCode | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].LineNum | number | 0.28% | ⚠️ Rare field |
| purchaseOrders[].LineNum:2 | number | 0.28% | ⚠️ Rare field |
| purchaseOrders[].NumAtCard | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].Price | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].Quantity | string | 0.28% | ⚠️ Rare field |
| purchaseOrders[].Rate | string | 0.28% | ⚠️ Rare field |
| sap | boolean | 35.07% |  |
| sapB1 | boolean | 35.07% |  |
| sapErrorMessage | string | 0.48% | ⚠️ Rare field |
| startDate | string | 64.80% |  |
| stateTime | object | 99.32% |  |
| stateTime.confirmative | object | 97.56% |  |
| stateTime.confirmative.date | string | 97.56% |  |
| stateTime.confirmative.status | boolean | 97.56% |  |
| stateTime.create | string | 98.65% |  |
| stateTime.executor | object | 67.39% |  |
| stateTime.executor.date | string | 67.39% |  |
| stateTime.executor.status | boolean | 67.39% |  |
| stateTime.update | string | 0.67% | ⚠️ Rare field |
| subMenu | string | 99.57% |  |
| summa | string | 64.77% |  |
| ticket | string | 1.13% |  |
| ticketAdd | boolean | 0.68% | ⚠️ Rare field |
| ticketStatusObj | object | 0.68% | ⚠️ Rare field |
| ticketStatusObj.comment | number | 0.68% | ⚠️ Rare field |
| vendorId | string | 64.02% |  |
| vendorList | array | 64.02% |  |
| vendorList[].id | string | 1.97% |  |
| vendorList[].name | string | 1.97% |  |
| vendorList[].num | number | 1.97% |  |

---

## File: `user.json`
**Total Records:** 391

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| EmployeeID | number | 100.00% |  |
| FirstName | string | 100.00% |  |
| JobTitle | string / null | 100.00% | Mixed types |
| LastName | string | 100.00% |  |
| MobilePhone | string | 100.00% |  |
| SalesPersonCode | null / number | 100.00% | Mixed types |
| accountListAdmin | object | 0.51% | ⚠️ Rare field |
| accountListAdmin.status | boolean | 0.51% | ⚠️ Rare field |
| adminAccountStatus | boolean | 0.51% | ⚠️ Rare field |
| adminType | string | 0.51% | ⚠️ Rare field |
| back | array | 100.00% |  |
| back[].btn | object | 17.14% |  |
| back[].btn.chat_id | number | 0.51% | ⚠️ Rare field |
| back[].btn.parse_mode | string | 17.14% |  |
| back[].btn.reply_markup | object / string | 17.14% | Mixed types |
| back[].btn.reply_markup.keyboard | array | 16.62% |  |
| back[].btn.reply_markup.keyboard[].0 | object | 16.62% |  |
| back[].btn.reply_markup.keyboard[].0.text | string | 16.62% |  |
| back[].btn.reply_markup.keyboard[].1 | object | 5.37% |  |
| back[].btn.reply_markup.keyboard[].1.text | string | 5.37% |  |
| back[].btn.reply_markup.resize_keyboard | boolean | 16.62% |  |
| back[].btn.text | string | 0.51% | ⚠️ Rare field |
| back[].step | number | 17.14% |  |
| back[].text | string | 17.14% |  |
| chat_id | number | 100.00% |  |
| confirmationStatus | boolean | 92.33% |  |
| creationDate | string | 100.00% |  |
| currentDataId | string | 83.63% |  |
| currentUserRole | string | 84.91% |  |
| excelEnd | string | 0.26% | ⚠️ Rare field |
| excelStart | string | 0.26% | ⚠️ Rare field |
| executorDate | object | 0.26% | ⚠️ Rare field |
| extraWaiting | boolean | 93.86% |  |
| is_active | boolean | 100.00% |  |
| lastAdminSteps | object | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn | object | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup | object | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard | array | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].0 | object | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].0.callback_data | string | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].0.text | string | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].1 | object | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].1.callback_data | string | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.inline_keyboard[].1.text | string | 0.51% | ⚠️ Rare field |
| lastAdminSteps.btn.reply_markup.resize_keyboard | boolean | 0.51% | ⚠️ Rare field |
| lastAdminSteps.step | number | 0.51% | ⚠️ Rare field |
| lastAdminSteps.text | string | 0.51% | ⚠️ Rare field |
| lastFile | object | 93.86% |  |
| lastFile.currentDataId | string | 93.09% |  |
| lastMessageId | number | 85.17% |  |
| newSubMenu | object | 0.26% | ⚠️ Rare field |
| notConfirmId | string | 12.02% |  |
| pagination | object | 39.39% |  |
| pagination.next | number | 39.39% |  |
| pagination.prev | number / string | 39.39% | Mixed types |
| selectAccountListMenu | string | 0.51% | ⚠️ Rare field |
| selectAccountMenu | object | 0.51% | ⚠️ Rare field |
| selectAccountMenu.id | string | 0.51% | ⚠️ Rare field |
| selectAccountMenu.menuId | string | 0.51% | ⚠️ Rare field |
| selectAdminMenuId | string | 0.51% | ⚠️ Rare field |
| selectGroup | object | 0.51% | ⚠️ Rare field |
| selectGroup.menu | string | 0.51% | ⚠️ Rare field |
| selectGroup.subMenu | string | 0.51% | ⚠️ Rare field |
| selectMenuId | string | 0.51% | ⚠️ Rare field |
| selectedAdminUserChatId | string | 0.51% | ⚠️ Rare field |
| selectedAdminUserStatus | string | 0.51% | ⚠️ Rare field |
| selectedInfoMenu | string | 36.57% |  |
| update | boolean | 93.86% |  |
| updateMenu | object | 0.51% | ⚠️ Rare field |
| updateMenu.mainMenuId | number | 0.51% | ⚠️ Rare field |
| updateMenu.menuId | string | 0.51% | ⚠️ Rare field |
| updateMenu.menuType | string | 0.51% | ⚠️ Rare field |
| updatePaginationMenu | number | 0.51% | ⚠️ Rare field |
| user_step | number | 100.00% |  |
| waitingUpdateStatus | boolean | 93.86% |  |

---

## File: `menu.json`
**Total Records:** 11

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| creationDate | string | 100.00% |  |
| id | number | 100.00% |  |
| isDelete | boolean | 100.00% |  |
| name | string | 100.00% |  |
| status | boolean | 100.00% |  |

---

## File: `subMenu.json`
**Total Records:** 33

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| comment | string | 100.00% |  |
| creationDate | string | 100.00% |  |
| id | number | 100.00% |  |
| infoFn | string | 100.00% |  |
| isDelete | boolean | 100.00% |  |
| lastStep | number | 100.00% |  |
| menuId | string | 100.00% |  |
| name | string | 100.00% |  |
| status | boolean | 100.00% |  |
| update | array | 100.00% |  |
| updateLine | number | 100.00% |  |
| update[].btn | string | 3.03% |  |
| update[].id | number | 100.00% |  |
| update[].message | string | 100.00% |  |
| update[].name | string | 100.00% |  |
| update[].step | string | 100.00% |  |

---

## File: `permisson.json`
**Total Records:** 410

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| chat_id | number | 100.00% |  |
| permissonMenuAffirmative | object | 9.51% |  |
| permissonMenuAffirmative.1 | array | 1.46% |  |
| permissonMenuAffirmative.10 | array | 0.98% | ⚠️ Rare field |
| permissonMenuAffirmative.11 | array | 4.39% |  |
| permissonMenuAffirmative.14 | array | 0.73% | ⚠️ Rare field |
| permissonMenuAffirmative.2 | array | 0.98% | ⚠️ Rare field |
| permissonMenuAffirmative.3 | array | 3.90% |  |
| permissonMenuAffirmative.4 | array | 2.44% |  |
| permissonMenuAffirmative.5 | array | 0.73% | ⚠️ Rare field |
| permissonMenuAffirmative.6 | array | 1.95% |  |
| permissonMenuAffirmative.7 | array | 0.49% | ⚠️ Rare field |
| permissonMenuAffirmative.8 | array | 2.44% |  |
| permissonMenuAffirmative.9 | array | 0.24% | ⚠️ Rare field |
| permissonMenuEmp | object | 90.73% |  |
| permissonMenuEmp.1 | array | 6.59% |  |
| permissonMenuEmp.10 | array | 1.22% |  |
| permissonMenuEmp.11 | array | 87.80% |  |
| permissonMenuEmp.11  | array | 0.24% | ⚠️ Rare field |
| permissonMenuEmp.14 | array | 0.49% | ⚠️ Rare field |
| permissonMenuEmp.2 | array | 2.68% |  |
| permissonMenuEmp.3 | array | 43.17% |  |
| permissonMenuEmp.3  | array | 0.24% | ⚠️ Rare field |
| permissonMenuEmp.4 | array | 16.83% |  |
| permissonMenuEmp.5 | array | 1.95% |  |
| permissonMenuEmp.6 | array | 17.56% |  |
| permissonMenuEmp.7 | array | 11.71% |  |
| permissonMenuEmp.8 | array | 22.44% |  |
| permissonMenuEmp.9 | array | 0.49% | ⚠️ Rare field |
| permissonMenuExecutor | object | 13.41% |  |
| permissonMenuExecutor.1 | array | 3.66% |  |
| permissonMenuExecutor.1  | array | 0.24% | ⚠️ Rare field |
| permissonMenuExecutor.10 | array | 0.49% | ⚠️ Rare field |
| permissonMenuExecutor.11 | array | 2.20% |  |
| permissonMenuExecutor.14 | array | 0.98% | ⚠️ Rare field |
| permissonMenuExecutor.2 | array | 1.71% |  |
| permissonMenuExecutor.3 | array | 4.39% |  |
| permissonMenuExecutor.4 | array | 0.24% | ⚠️ Rare field |
| permissonMenuExecutor.5 | array | 0.24% | ⚠️ Rare field |
| permissonMenuExecutor.6 | array | 1.71% |  |
| permissonMenuExecutor.7 | array | 2.93% |  |
| permissonMenuExecutor.8 | array | 8.29% |  |
| permissonMenuExecutor.9 | array | 0.24% | ⚠️ Rare field |
| roles | array | 90.73% |  |

---

## File: `accounts.json`
**Total Records:** 1

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| accounts43 | array | 100.00% |  |
| accounts50 | object | 100.00% |  |
| accounts50.Karta | object | 100.00% |  |
| accounts50.Karta.UZS | array | 100.00% |  |
| accounts50.Naqd | object | 100.00% |  |
| accounts50.Naqd.USD | array | 100.00% |  |
| accounts50.Naqd.UZS | array | 100.00% |  |
| accounts50.O'tkazma | object | 100.00% |  |
| accounts50.O'tkazma.UZS | array | 100.00% |  |
| accounts50.Terminal | object | 100.00% |  |
| accounts50.Terminal.UZS | array | 100.00% |  |
| accounts94 | object | 100.00% |  |
| accounts94.AV/TMB | array | 100.00% |  |
| accounts94.Doimiy xarajat | array | 100.00% |  |
| accounts94.Kassa farq | array | 100.00% |  |
| accounts94.Oylik/Bonus | array | 100.00% |  |
| accounts94.Qarz | array | 100.00% |  |
| accounts94.Tovar qabuli | array | 100.00% |  |
| accounts94.Yetkazish | array | 100.00% |  |

---

## File: `accountsPermisson.json`
**Total Records:** 1

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| 1 | object | 100.00% |  |
| 1.1 | array | 100.00% |  |
| 3 | object | 100.00% |  |
| 3.2 | array | 100.00% |  |
| 3.5 | array | 100.00% |  |
| 3.6 | array | 100.00% |  |
| 3.7 | array | 100.00% |  |

---

## File: `group.json`
**Total Records:** 49

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| all_members_are_administrators | boolean | 18.37% |  |
| id | number | 100.00% |  |
| is_forum | boolean | 2.04% |  |
| permissions | object | 97.96% |  |
| permissions.1 | array | 10.20% |  |
| permissions.10 | array | 2.04% |  |
| permissions.11 | array | 2.04% |  |
| permissions.2 | array | 6.12% |  |
| permissions.3 | array | 10.20% |  |
| permissions.4 | array | 38.78% |  |
| permissions.5 | array | 2.04% |  |
| permissions.6 | array | 8.16% |  |
| permissions.7 | array | 2.04% |  |
| permissions.8 | array | 55.10% |  |
| permissions.9 | array | 2.04% |  |
| title | string | 100.00% |  |
| type | string | 100.00% |  |

---

## File: `session.json`
**Total Records:** 1

| Field Path | Detected Types | Presence | Description/Notes |
| :--- | :--- | :--- | :--- |
| Cookie | array | 100.00% |  |
| SessionId | string | 100.00% |  |

---

