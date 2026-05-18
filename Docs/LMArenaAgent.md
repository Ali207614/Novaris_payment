I checked the raw Postman collection behind your link.

Short answer: **you are right** — `POST /b/vhr/api/v1/core/track$create` is **not present in the published Verifix Public API docs**.

## What the public API actually exposes for `track`

The documented `core/track` endpoints are only:

1. `POST /b/vhr/api/v1/core/track$list`
2. `POST /b/vhr/api/v1/core/track$track_info`
3. `POST /b/vhr/api/v1/core/track$search_last_track`

So there is **no documented public**:

- `track$create`
- `track$update`
- `track$delete`

## What seems to be the correct API path for your use case

For your workflow, the relevant endpoints are likely these:

### 1) Employee correction requests
`POST /b/vhr/api/v1/core/track_request$list`

This lists “punch correction requests” / “requests for a mark”.

Response fields include:

- `request_id`
- `employee_id`
- `staff_id`
- `track_type` (`I`, `O`, `C`, `T`, `N`)
- `track_datetime`
- `location_id`
- `track_id` — appears after request is completed
- `note`
- `manager_note`
- `status`:
  - `N` = waiting
  - `A` = approved
  - `C` = completed
  - `D` = declined

### Important limitation
In the public docs I found only:

- `track_request$list`

I did **not** find documented public endpoints for:

- `track_request$create`
- `track_request$update`
- `track_request$approve`
- `track_request$complete`

So if your bot is supposed to **submit** correction requests into Verifix directly, that endpoint is **not documented publicly**.

---

### 2) Read actual punches
`POST /b/vhr/api/v1/core/track$list`

Use this to read punches in a time range.

Useful fields:

- `track_id`
- `employee_id`
- `schedule_id`
- `location_id`
- `track_type`
- `mark_type`
- `track_datetime`
- `created_by`
- `modified_by`

`mark_type` values include:

- `F` = face recognition
- `M` = created via web interface manually
- others: `P`, `T`, `R`, `Q`, `A`, `O`, `S`

That `M = created via web interface` is a strong clue that **manual punches do exist in the product**, but the corresponding write endpoint is **not public in this collection**.

---

### 3) Read one punch
`POST /b/vhr/api/v1/core/track$track_info`

Use this for a single `track_id`.

It returns fields like:

- `person_id`
- `name`
- `device_id`
- `location_id`
- `track_time`
- `track_datetime`
- `track_type`
- `mark_type`
- `is_valid`

---

### 4) Get employee’s last punch for a day
`POST /b/vhr/api/v1/core/track$search_last_track`

This is useful because it returns:

- `track_id`
- `employee_id`
- `staff_id`
- `location_id`
- `device_id`
- `track_type`
- `track_datetime`
- `photo_sha`

That `staff_id` can help in the next endpoint.

---

### 5) Attendance correction at timesheet level
`POST /b/vhr/api/v1/core/timesheet$save_facts`

This is the **closest documented write endpoint** I found for fixing attendance results.

The docs say this endpoint lets you save attendance facts for a staff cycle/month/day.

Request fields:

- `staff_id` — not `employee_id`
- `registration_period` — month, format `dd.mm.yyyy`
- `timesheets[]`

Each timesheet item can contain:

- `timesheet_date`
- `input_time`
- `output_time`
- `fact_items[]`

Each `fact_item`:

- `time_kind_id`
- `fact_value`

### Very important note from docs
This only works if **Verifix is not calculating attendance facts itself** for that schedule.

The doc explicitly says:

> You can send attendance facts to Verifix only if Verifix itself will not calculate those facts.  
> For this, the corresponding setting must be enabled in the schedule.

So this is not a generic “create punch” endpoint.  
It is more like **override/save attendance facts**.

---

### 6) Time kinds for facts
`POST /b/vhr/api/v1/core/time_kind$list`

This gives IDs like:

- `81` = attendance / present (`Явка`)
- `82` = late (`Опоздание`)
- `83` = early leave
- `84` = absence
- `85` = free time
- etc.

You need these IDs for `timesheet$save_facts`.

---

### 7) Export current attendance view
`POST /b/vhr/api/v1/core/timesheet$export`

Use this to see current daily values for a person/month:

- `input_time`
- `output_time`
- `facts[]`

This is useful before deciding what to overwrite with `timesheet$save_facts`.

---

## Suggested conclusion

## If your goal is “create/edit raw punches”
There is **no documented public endpoint** for that in this collection.

So `track$create` is likely one of these:

- an old/private/internal endpoint
- a guessed endpoint name based on Verifix naming style
- a web-only/internal action not exposed in public API docs

## If your goal is “fix attendance result”
The documented public endpoint is likely:

- `POST /b/vhr/api/v1/core/timesheet$save_facts`

## If your goal is “employee submits a correction request”
The public collection shows only:

- `POST /b/vhr/api/v1/core/track_request$list`

But **not** a public create/approve endpoint.

---

## Example usage

### Auth
```bash
curl -X POST 'https://app.verifix.com/security/oauth/token' \
  -H 'Content-Type: application/json' \
  -d '{
    "grant_type": "client_credentials",
    "client_id": "...",
    "client_secret": "...",
    "scope": "read"
  }'
```

Then use:

```bash
-H "Authorization: Bearer <access_token>"
-H "project_code: vhr"
```

`filial_id` is optional with client credentials per the docs, but some examples still include it.

---

### List punches
```bash
curl -X POST 'https://app.verifix.com/b/vhr/api/v1/core/track$list' \
  -H "Authorization: Bearer <token>" \
  -H "project_code: vhr" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_ids": [165],
    "begin_datetime": "01.07.2025 00:00:00",
    "end_datetime": "03.07.2025 00:00:00"
  }'
```

---

### Last punch for day
```bash
curl -X POST 'https://app.verifix.com/b/vhr/api/v1/core/track$search_last_track' \
  -H "Authorization: Bearer <token>" \
  -H "project_code: vhr" \
  -H "Content-Type: application/json" \
  -d '{
    "employee_id": 165,
    "track_date": "02.07.2025"
  }'
```

---

### List correction requests
```bash
curl -X POST 'https://app.verifix.com/b/vhr/api/v1/core/track_request$list' \
  -H "Authorization: Bearer <token>" \
  -H "project_code: vhr" \
  -H "Content-Type: application/json" \
  -d '{
    "request_ids": []
  }'
```

---

### Export attendance
```bash
curl -X POST 'https://app.verifix.com/b/vhr/api/v1/core/timesheet$export' \
  -H "Authorization: Bearer <token>" \
  -H "project_code: vhr" \
  -H "Content-Type: application/json" \
  -d '{
    "period_begin_date": "01.04.2026",
    "period_end_date": "30.04.2026",
    "division_ids": [],
    "employee_ids": [165]
  }'
```

---

### Save corrected attendance facts
```bash
curl -X POST 'https://app.verifix.com/b/vhr/api/v1/core/timesheet$save_facts' \
  -H "Authorization: Bearer <token>" \
  -H "project_code: vhr" \
  -H "Content-Type: application/json" \
  -d '{
    "staff_id": "1",
    "registration_period": "01.04.2026",
    "timesheets": [
      {
        "timesheet_date": "05.04.2026",
        "input_time": "05.04.2026 09:00:00",
        "output_time": "05.04.2026 18:00:00",
        "fact_items": [
          { "time_kind_id": 81, "fact_value": 28800 },
          { "time_kind_id": 82, "fact_value": 0 },
          { "time_kind_id": 83, "fact_value": 0 },
          { "time_kind_id": 84, "fact_value": 0 }
        ]
      }
    ]
  }'
```

## Warning
The docs for `timesheet$save_facts` are a bit inconsistent:

- they mark some fields as required,
- but examples omit them in some items,
- and `fact_value` is described as seconds, while some export examples look minute-based.

So test this carefully in a non-production tenant first.

---

## My practical recommendation

For your Telegram bot, choose one of these models:

### Option A — Bot creates a request only
- employee submits a correction in bot
- you store it in your own DB
- HR handles it in Verifix UI manually

### Option B — Bot applies attendance correction
- get `staff_id`
- inspect current day with `timesheet$export`
- write correction with `timesheet$save_facts`
- only works if schedule is configured for external fact input

### Option C — You need actual raw punch creation in Verifix
Then the needed endpoint is **not public** in the shared docs.  
Best way to find it:

1. log in to Verifix web UI as HR
2. open browser DevTools → Network
3. perform the manual “edit/create punch” action
4. capture the exact request
5. inspect URL/body/headers
6. verify whether it is:
   - a hidden API endpoint, or
   - a page action / internal RPC rather than public REST-like API

---

If you want, I can do the next step for you and prepare:

1. a **clean endpoint matrix** for this attendance workflow, or  
2. a **Telegram bot flow design** using only the documented endpoints.