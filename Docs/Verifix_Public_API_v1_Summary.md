# Verifix Public API v1.0 - Summary of Explored Endpoints

This document summarizes the **Verifix Public API v1.0** based on the Postman documentation.

For each endpoint, it provides the HTTP method, endpoint path, required headers, body parameters, response fields, and relevant enumeration codes.

> **Scope note**  
> This summary only covers endpoints inspected during the research process and may not include every endpoint in the full API.

---

## Table of Contents

- [Introduction & Authorization](#introduction--authorization)
- [Core Basic Methods](#core-basic-methods)
  - [Jobs Positions](#jobs-positions)
  - [Job Groups](#job-groups)
  - [Divisions](#divisions)
  - [Division Groups](#division-groups)
  - [Locations](#locations)
  - [Work Schedules](#work-schedules)
  - [Employees](#employees)
  - [Full-Time Equivalents FTE - Employment Types](#full-time-equivalents-fte---employment-types)
  - [Termination Reasons](#termination-reasons)
  - [Marks Attendance / Track Records](#marks-attendance--track-records)
  - [Time Kinds Work Time Types](#time-kinds-work-time-types)
  - [Leave Requests](#leave-requests)
  - [Schedule Change Requests](#schedule-change-requests)
  - [Specialties](#specialties)
  - [Marital Statuses](#marital-statuses)
  - [Production Calendars](#production-calendars)
  - [Organization Information](#organization-information)
  - [Employee Documents](#employee-documents)
  - [Employee Relatives Family Members](#employee-relatives-family-members)
  - [Employee Languages](#employee-languages)
- [Notes & Observations](#notes--observations)
- [Official Documentation Links](#official-documentation-links)

---

## Introduction & Authorization

Verifix uses **OAuth 2.0** for authentication. Every request requires the following headers:

| Header | Description |
|---|---|
| `project_code` | Identifies the project code assigned by Verifix. Must be included in all requests. |
| `filial_id` | ID of the branch/filial where the request applies. Must be included in all requests. |

To obtain an `access_token`, send a `POST` request to:

```http
POST https://app.verifix.com/security/oauth/token
```

Required OAuth parameters:

| Parameter | Description |
|---|---|
| `grant_type` | Use `client_credentials`. |
| `client_id` | OAuth client ID. |
| `client_secret` | OAuth client secret. |

The response contains:

| Field | Description |
|---|---|
| `access_token` | JWT access token. |
| `token_type` | `Bearer`. |
| `expires_in` | Expiration time in seconds. |

> **Deprecated**  
> Basic authentication using `username@companycode:password` encoded in Base64 is deprecated.

---

## Core Basic Methods

These methods cover core entities such as positions, groups, divisions, locations, schedules, employees, FTEs, and more.

Most list endpoints support pagination via optional headers `cursor` and `limit`, and return:

| Field | Description |
|---|---|
| `meta.count` | Number of records returned. |
| `meta.next_cursor` | Cursor for the next page. |

---

## Jobs Positions

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List positions | `POST /b/vhr/api/v1/core/job$list` | Headers: `project_code`, `filial_id`, optional `cursor`, `limit`. Body: optional `job_ids` list to filter. | Returns a list of jobs with `job_id`, `name`, `job_group_id`, `job_group_name`, `code`, `state` (`A` - active, `P` - passive), plus meta pagination fields. | Allows filtering by specific IDs and paginated retrieval. |
| Create position | `POST /b/vhr/api/v1/core/job$create` | Body: `name` required; optional `job_group_id`, `code`, `order_no`. | Responds with `job_id` of the newly created position. | Creates a new position. |
| Update position | `POST /b/vhr/api/v1/core/job$update` | Body: `job_id` required and fields `name`, `job_group_id`, `code`, `order_no`. Missing fields are also updated, so they should be sent if their value should remain unchanged. | No body. | Updates all fields of the position. |
| Delete position | `POST /b/vhr/api/v1/core/job$delete` | Body: `job_id` required. | No body. | Deletes a position. |

---

## Job Groups

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List job groups | `POST /b/vhr/api/v1/core/job_group$list` | Body: optional `job_group_ids` list. | Returns `job_group_id`, `name`, `code`, `state` for each group and pagination info. | - |
| Create job group | `POST /b/vhr/api/v1/core/job_group$create` | Body: `name` required; optional `code`. | Returns `job_group_id`. | - |
| Update job group | `POST /b/vhr/api/v1/core/job_group$update` | Body: `job_group_id` required, `name`, and optional `code`. All fields are updated even if omitted. | No body. | - |
| Delete job group | `POST /b/vhr/api/v1/core/job_group$delete` | Body: `job_group_id` required. | No body. | - |

---

## Divisions

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List divisions | `POST /b/vhr/api/v1/core/division$list` | Body: optional `division_ids` list. | Returns `division_id`, `name`, `parent_id`, `opened_date`, `closed_date`, `code`, `state`, and meta pagination fields. | - |
| Create division | `POST /b/vhr/api/v1/core/division$create` | Body: `name` and `opened_date` required; optional `parent_id`, `closed_date`, `code`. | Returns `division_id`. | - |
| Update division | `POST /b/vhr/api/v1/core/division$update` | Body: `division_id` required, `name`, optional `parent_id`, `opened_date`, `closed_date`, `code`. All fields update even if omitted. | No body. | - |
| Delete division | `POST /b/vhr/api/v1/core/division$delete` | Body: `division_id` required. | No body. | - |

---

## Division Groups

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List division groups | `POST /b/vhr/api/v1/core/division_group$list` | Body: optional `division_group_ids` list. | Returns `division_group_id`, `name`, `code`, `state`, and pagination fields. | - |
| Create division group | `POST /b/vhr/api/v1/core/division_group$create` | Body: `name` required; optional `code`. | Returns `division_group_id`. | - |
| Update division group | `POST /b/vhr/api/v1/core/division_group$update` | Body: `division_group_id` required, `name`, and optional `code`. All fields updated. | No body. | - |
| Delete division group | `POST /b/vhr/api/v1/core/division_group$delete` | Body: `division_group_id` required. | No body. | - |

---

## Locations

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List locations | `POST /b/vhr/api/v1/core/location$list` | Body: optional `location_ids` array. | Returns `location_id`, `name`, `address`, `latlng` with latitude, longitude, and optional altitude; `accuracy`, `code`, `state`, plus pagination meta. | - |
| Attach employees to location | `POST /b/vhr/api/v1/core/location$save_employees` | Body: `location_id` and `employee_ids` array. | No response body. | Links employees to a location; employees not specified are detached. |

---

## Work Schedules

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List schedules | `POST /b/vhr/api/v1/core/schedule$list` | Body: optional `schedule_ids` and optional `year`. | Returns schedule details with `schedule_id`, `name`, `kind`, `code`, `state`, and nested `schedule_days` objects. `kind` values include `F` - fixed schedule, `H` - hour-based, `S` - shift-based, etc. | - |
| Create schedule | `POST /b/vhr/api/v1/core/schedule$create` | Body: `name` and `kind` required; optional `code`. | Returns `schedule_id`. | - |
| Update schedule | `POST /b/vhr/api/v1/core/schedule$update` | Body: `schedule_id`, `name`, optional `code`. All fields updated. | No body. | - |
| Delete schedule | `POST /b/vhr/api/v1/core/schedule$delete` | Body: `schedule_id`. | No body. | - |

---

## Employees

Employees are represented with rich data structures and support a variety of operations.

### List Employees

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$list` |
| Parameters | Optional `employee_ids`, `npins` (PINFL), `statuses` such as `A` - active and `P` - passive, plus pagination headers. |

Response: an array of employee objects containing the following fields and nested structures.

#### Identification Fields

| Field |
|---|
| `employee_id` |
| `employee_code` |
| `first_name` |
| `last_name` |
| `middle_name` |
| `gender` |
| `birth_date` |
| `phone_number` |
| `email` |
| `tin` |
| `pinfl` |

#### Nested Structures

| Structure | Description |
|---|---|
| `person_family_members` | Family members with fields like `person_family_member_id`, `name`, `relation_degree_id`, `birthday`, `is_dependent`, and `is_private`. |
| `person_langs` | Languages known by the employee with `lang_id` and `lang_level_id`. |
| `person_experiences` | Records of employment history, including duration in years/months, employer name, etc. |
| `person_work_places` | Previous workplaces with positions and dates. |
| `person_edu_stages` | Education history, including institution, specialty, start/end dates. |
| `dynamic_fields` | Custom fields configured in Verifix. |
| `IdentificationPhoto` | Nested object containing `photo_sha` and `is_main`, representing stored facial photos for identification. |

### Create Employee

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$create` |
| Body parameters | Required: `first_name`, `phone_number`, `birthday`, `gender`. Optional: `last_name`, `middle_name`, `email`, `tin`, `pinfl`, `dynamic_fields`. |
| Response | `employee_id` of the new employee. |

### Update Employee

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$update` |
| Parameters | `employee_id` required, plus fields for personal details, contact information, and `dynamic_fields`. All fields are updated even if omitted. |
| Response | None. |

### Delete Employee

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$delete` |
| Parameters | `employee_id`. |
| Response | None. |

### Set Employee Photo

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$set_photo` multipart |
| Parameters | `employee_id`, `photo_as_face_rec` (`Y` / `N`), `is_main` (`Y` / `N`), `photo_sha` (SHA of uploaded file). The file must be attached under multipart name `files`. |
| Response | None. |

### Set Identification Photo

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$set_identification_photo` |
| Parameters | `employee_id`, `photo_sha`. |
| Response | None. |

### Search Employees by PINFL

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$search_by_pinfl` |
| Parameters | `npins` - list of PINFLs. |
| Response | List of objects with `npin` and matching `employee_id`. |

### Save Locations for Employee

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$save_locations` |
| Parameters | `employee_id`, `location_ids` list of location IDs. This sets the employee's accessible locations; locations not included are removed. |
| Response | None. |

### Set Identification Methods

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/employee$set_identification` |
| Parameters | `employee_id` and optional identification fields: `pin` string, `pin_code` int, `rfid_code` string, `qrcode` string. Only provided fields are updated. |
| Response | None. |

### Download File

| Item | Details |
|---|---|
| Endpoint | `GET /b/biruni/m:download_file_v2?sha={sha}` |
| Parameters | `sha` - file hash. |
| Response | Binary file contents. |

---

## Full-Time Equivalents FTE - Employment Types

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List FTEs | `POST /b/vhr/api/v1/core/fte$list` | Body: optional `fte_ids` list. | Returns `fte_id`, `name`, `value` fraction representing workload, with pagination metadata. | - |
| Create FTE | `POST /b/vhr/api/v1/core/fte$create` | Body: `name` and `value` required. | Returns `fte_id`. | - |
| Update FTE | `POST /b/vhr/api/v1/core/fte$update` | Body: `fte_id`, `name`, `value`. All fields updated. | No body. | - |
| Delete FTE | `POST /b/vhr/api/v1/core/fte$delete` | Body: `fte_id`. | No body. | - |

---

## Termination Reasons

Reason codes used when terminating employees.

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List termination reasons | `POST /b/vhr/api/v1/core/dismissal_reason$list` | Body: optional `dismissal_reason_ids`. | Returns `dismissal_reason_id`, `name`, `description`, `reason_type` enum `P` or `N`, and `state` (`A` - active, `P` - passive). | - |
| Create termination reason | `POST /b/vhr/api/v1/core/dismissal_reason$create` | Body: `name` and `reason_type` (`P` or `N`); optional `description`, `state`. | Returns `dismissal_reason_id`. | - |
| Update termination reason | `POST /b/vhr/api/v1/core/dismissal_reason$update` | Body: `dismissal_reason_id`, `name`, `reason_type`, `description`, `state`. All fields updated. | No body. | - |
| Delete termination reason | `POST /b/vhr/api/v1/core/dismissal_reason$delete` | Body: `dismissal_reason_id`. | No body. | - |

---

## Marks Attendance / Track Records

Used to record entry/exit marks or presence in the system.

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List marks | `POST /b/vhr/api/v1/core/track$list` | Body: optional `employee_ids`, `begin_datetime`, `end_datetime`. | Returns marks with fields `track_id`, `schedule_id`, `employee_id`, `location_id`, `track_type`, `mark_type`, `track_datetime`, `created_by`, `modified_by`. | `track_type`: `I` - arrival, `O` - exit, `C` - presence, `M` - continues work day, etc. `mark_type`: `P` - PIN, `T` - card, `R` - FaceID, `Q` - QR code, `F` - fingerprint, `M` - mobile, `A` - admin, `O` - auto, `C` - correction, `S` - schedule. |
| Get mark information | `POST /b/vhr/api/v1/core/track$info` | Body: `track_id`. | Returns personal data: `person_id`, `name`, `email`, `main_phone`, `device_id`, `device_name`, `location_id`, `location_name`, `track_type`, `mark_type`, `track_datetime`. | - |
| Get last mark of the day | `POST /b/vhr/api/v1/core/track$last` | Body: `employee_id`, `track_date` date. | Returns last mark record for the day including `track_id`, `staff_id`, `employee_id`, `location_id`, `device_id`, `track_type`, `track_datetime`, `photo_sha`. | - |

---

## Time Kinds Work Time Types

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List time kinds | `POST /b/vhr/api/v1/core/time_kind$list` | Body: optional `time_kind_ids`. | Returns `time_kind_id`, `name`, `letter_code` (letter representing time code), `digital_code` (numeric code). | Used to categorize attendance marks, e.g. working hours and overtime. |

---

## Leave Requests

Absence requests submitted by staff.

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List requests | `POST /b/vhr/api/v1/core/request$list` | Body filters: optional `request_ids`, `request_begin_date`, `request_end_date` dates. | Returns requests with fields `request_id`, `request_kind_id` absence type, `staff_id`, `begin_time`, `end_time`, `request_type`, `manager_note`, `note`, `accrual_kind`, `status`, and optional `barcode`. | `request_type`: `P` - partial day, `F` - full day, `M` - multiple days. `accrual_kind`: `C` - carry-over days, `P` - planned days, `U` - unplanned days. `status`: `N` - new, `A` - approved, `C` - cancelled, `D` - declined. |
| Create request | `POST /b/vhr/api/v1/core/request$create` | Body: `request_kind_id`, `staff_id`, `begin_time`, `end_time`, `request_type` (`P`/`F`/`M`), optional `note`, `accrual_kind`. | Returns `request_id`. | - |
| Update request | `POST /b/vhr/api/v1/core/request$update` | Body: `request_id` and same fields as creation. All fields updated. | No body. | - |
| Delete request | `POST /b/vhr/api/v1/core/request$delete` | Body: `request_id`. | No body. | - |

---

## Schedule Change Requests

Requests to modify work schedules.

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List schedule change requests | `POST /b/vhr/api/v1/core/plan_change$list` | Body: optional `change_ids`. | Returns change requests with fields `change_id`, `staff_id`, `change_kind`, `work_day_before`, `work_day_after`, `manager_note`, `note`, `status`. | `change_kind`: `S` - swap days, `C` - shift change. `status`: `N` - new, `A` - approved, `C` - cancelled, `D` - declined. Additional endpoints for create/update/delete exist but were not inspected. |

---

## Specialties

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List specialties | `POST /b/vhr/api/v1/core/specialty$list` | Body: optional `specialty_ids` list. | Returns `specialty_id`, `name`, `code`, `group_id`, `kind`. | `kind`: `G` - group of specialties, `S` - single specialty. |
| Create specialty | `POST /b/vhr/api/v1/core/specialty$create` | Body: `name`, `kind` required; optional `code`, `group_id`, `state` (`A` or `P`). | Returns `specialty_id` and `name`. | - |
| Update specialty | `POST /b/vhr/api/v1/core/specialty$update` | Body: `specialty_id`, `name`, `kind`, optional `code`, `group_id`, `state`. All fields updated. | No body. | - |
| Delete specialty | `POST /b/vhr/api/v1/core/specialty$delete` | Body: `specialty_id`. | No body. | - |

---

## Marital Statuses

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List marital statuses | `POST /b/vhr/api/v1/core/marital_status$list` | Body: optional `marital_status_ids`. | Returns `marital_status_id`, `name`, `code`, `state` (`A`/`P`) with pagination. | - |
| Create marital status | `POST /b/vhr/api/v1/core/marital_status$create` | Body: `name`, optional `code`, `state`. | Returns `marital_status_id`. | - |
| Update marital status | `POST /b/vhr/api/v1/core/marital_status$update` | Body: `marital_status_id`, `name`, `code`, `state`. All fields updated. | No body. | - |
| Delete marital status | `POST /b/vhr/api/v1/core/marital_status$delete` | Body: `marital_status_id`. | No body. | - |

---

## Production Calendars

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List calendars | `POST /b/vhr/api/v1/core/calendar$list` | Body: optional `calendar_ids`, optional `year`. | Returns `calendar_id`, `name`, `code`, and `calendar_days`, a list of holiday/weekend days where each object contains `calendar_date` and `calendar_date_name`. | - |
| Create calendar | `POST /b/vhr/api/v1/core/calendar$create` | Body: `name`, `year`, optional `code`, `calendar_days` list of date and name. | Returns `calendar_id`. | - |
| Update calendar | `POST /b/vhr/api/v1/core/calendar$update` | Body: `calendar_id`, `name`, `year`, optional `code`, `calendar_days`. All fields updated. | No body. | - |
| Delete calendar | `POST /b/vhr/api/v1/core/calendar$delete` | Body: `calendar_id`. | No body. | - |

---

## Organization Information

| Item | Details |
|---|---|
| Endpoint | `POST /b/vhr/api/v1/core/filial$info` |
| Parameters | None. |
| Response | Returns information about the branch/organization, including `filial_name`, `photo_sha` logo, `email`, `main_phone`, `web`, `telegram`, `address`, `address_guide`, `note`, `region_name`, and other descriptive fields. |

---

## Employee Documents

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List documents | `POST /b/vhr/api/v1/core/person_document$list` | Body: optional `document_ids`, optional `person_ids`. | Returns `document_id`, `person_id`, `doc_type_id`, `doc_type`, `doc_series`, `doc_number`, `issued_by`, `issued_date`, `expiry_date`, `note`, `file_sha`, `state`. | `doc_type`: `P` - passport, `M` - other. |
| Create document | `POST /b/vhr/api/v1/core/person_document$create` | Body: `person_id` required, `doc_type_id` or `doc_type`, optional `doc_series`, `doc_number`, `issued_by`, `issued_date`, `expiry_date`, `note`, `file_sha`, `state`. | Returns `document_id`. | Update and delete endpoints were not visible. |

---

## Employee Relatives Family Members

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List family members | `POST /b/vhr/api/v1/core/person_family_member$list` | Body: optional `person_family_member_ids`, optional `person_ids`. | Returns `person_family_member_id`, `person_id`, `name`, `relation_degree_id`, `relation_degree_name`, `birthday`, `workplace`, `phone_number`, `address`, `note`, `state`. | - |
| Create family member | `POST /b/vhr/api/v1/core/person_family_member$create` | Body: `person_id`, `name`, `relation_degree_id` required; optional `birthday`, `workplace`, `is_dependent` (`Y`/`N`), `is_private` (`Y`/`N`), `phone_number`, `address`, `note`, `state`. | Returns `person_family_member_id`. | - |
| Update family member | `POST /b/vhr/api/v1/core/person_family_member$update` | Body: `person_family_member_id`, `person_id`, `name`, `relation_degree_id`, and optional fields. Updates all fields. | No body. | - |
| Delete family member | `POST /b/vhr/api/v1/core/person_family_member$delete` | Body: `person_family_member_id`. | No body. | - |

---

## Employee Languages

| Operation | Endpoint / Method | Request Parameters | Response Fields | Notes |
|---|---|---|---|---|
| List employee languages | `POST /b/vhr/api/v1/core/person_langs$list` | Body: optional `lang_ids`, optional `person_ids`. | Returns entries with `person_id`, `person_name`, `lang_id`, `lang_name`, `lang_level_id`, `lang_level_name`. | - |
| Create employee language | `POST /b/vhr/api/v1/core/person_langs$create` | Body: `person_id`, `lang_id`, `lang_level_id`; all required. | Returns `person_id`, confirming creation. | - |
| Update / Delete | Likely `person_langs$update` and `person_langs$delete` endpoints exist, but they were not inspected. | - | - | - |

---

## Notes & Observations

- **Pagination:** Many list endpoints use `cursor` and `limit` headers to paginate results; responses return `meta.count` and `meta.next_cursor` to retrieve subsequent pages.
- **Enumerations:** Several entities include `state` values (`A` - active, `P` - passive), `reason_type`, `kind`, etc. Use the tables above for definitions.
- **Dynamic fields:** Employee and other objects can include `dynamic_fields` arrays for custom attributes defined within Verifix.
- **API versioning:** Endpoints under `/b/vhr/api/v1/` refer to the Basic module. Other modules, such as Start and Pro modules (for example, `/pro/employee$list`), are available but were not fully inspected.
- **Additional entities:** The documentation includes many more categories, including time off types, nationalities, degrees of kinship, languages and levels, work experience types, education institutions, organizations, devices, shift management, etc., that were not fully covered here.

This summary can serve as a starting point for developers integrating with the Verifix API. For complete usage details, error codes, and further modules, refer to the official documentation.

---

## Official Documentation Links

The PDF references the following Postman documentation links:

1. https://documenter.getpostman.com/view/23097602/2s83ziN3VR
2. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2366ef8fa3-f125-4174-80a7-64386fbe33d3
3. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23ff553a91-b9f3-4557-b13a-c163a09430ac
4. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%232ad061b8-fb69-4526-9eb4-3762c3b9a2cf
5. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%239b8d1d6f-0fed-44c8-8159-fc02958b9996
6. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23935c35f2-fa66-4332-bb8a-a3ebbaf20047
7. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2360be0543-67e2-42b7-8d0b-ac309f347e47
8. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2318ef034b-e3a4-4e6f-b19a-2be61cd4bf61
9. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%239eec21f7-6fa7-43db-91ae-ae69c7cfd58b
10. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%235d15d4ac-dc0c-46a7-b4a9-f872101a7797
11. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2374913736-7bb4-490b-97d8-ac1d5197a7a8
12. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23982047b0-ea4c-4aa1-b49e-70f989bc6982
13. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%232b5c79a2-6dee-4508-a751-ae311f089756
14. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23b9adedd1-276d-4629-9278-305da6f5db7f
15. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23edd89e54-387b-4724-adf2-84058248b51c
16. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23c8bd6f80-5480-429c-a8d6-ec9de81e14db
17. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2321978dfb-5f32-485d-b1e8-5363285a4a48
18. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2369087aed-489c-41cb-83f9-60166061e0ed
19. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%239bbfe6e7-f3a6-494d-a40a-75fa3b008e9b
20. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23991268a5-c30a-4c88-aeb7-91a80f2101a4
21. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%234206a1cf-b183-471a-ba7e-38cd9970bd1c
22. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%236e33f9dc-6711-44bc-8b72-7c3e19454e65
23. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2370486616-944a-494a-b1ac-3cd9da550fdd
24. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%235be6ebd6-a62b-4df0-92d6-dae17381445a
25. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23e2835266-45ce-44e6-b288-7b05013a68aa
26. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23e136de82-e76f-40a1-aa56-43e0f16e08e2
27. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2365b49f54-4038-43f7-996f-13ea91e8dcf2
28. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23f3f99e0c-66b8-4e55-b22e-a7ca49cd68f5
29. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23c3880613-38b8-46de-85af-b995c8b3cd4a
30. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2373a32a03-8e37-4f6a-9218-e5e9361a37c2
31. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2344e834ea-d72a-4512-af51-b5902a7994b7
32. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23a1e0d828-1263-43e4-abf6-6bfaa8ffd7cd
33. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%231a2fd704-37fd-4858-b1f5-36be776a69bf
34. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23a8879bf0-093b-4305-8a4c-1c85d211e34a
35. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23e44329f6-2a06-4774-8696-3bdd0c76d8f3
36. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2334bf3e8e-22f7-468f-aa71-ace772f7a61c
37. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%231d60f7ce-70d9-418f-82ad-038144b55b0d
38. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23d70b5ef8-a848-4f73-897b-311d9a6344e7
39. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%23484a825e-93aa-4db6-be54-d8ca76b43124
40. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2361214a92-2d30-4853-901d-a670fad66356
41. https://documenter.getpostman.com/view/23097602/2s83ziN3VR%2307922280-6640-494c-9301-159ef7612982
