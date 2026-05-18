Understood. I'll investigate the API documentation to confirm the existence of `POST /b/vhr/api/v1/core/track$create` and search for the correct endpoint that allows HR to adjust attendance punches for employees. I'll consult official sources and share my findings with you soon.


I checked the official Verifix Public API v1.0 documentation at the Postman collection you provided.  The **core/track** resource only exposes read‑only methods — there are no methods documented for creating or editing attendance marks.

The only **track**‑related endpoints documented are:

* **POST /b/vhr/api/v1/core/track$list** – Returns a paginated list of existing marks.  You can filter by employee and date range.  The request body includes `begin_datetime` and `end_datetime` filters, and the response contains fields such as `track_id`, `schedule_id`, `employee_id`, `track_type`, `mark_type` and the time the mark was recorded.
* **POST /b/vhr/api/v1/core/track$track_info** – Given a `track_id`, returns detailed information about a particular mark (person ID, device and location used, and the timestamp).
* **POST /b/vhr/api/v1/core/track$search_last_track** – Returns the last mark for a specific employee on a given date.

There is **no** `track$create` or `track$update` endpoint in the public API.  Verifix’s API instead uses a request‑based workflow for correcting time‑tracking issues.  Employees submit a “request” to explain a missing or incorrect punch, and HR reviews and approves it.  These requests are created and managed via the **core/request** and **core/plan_change** endpoints:

* **POST /b/vhr/api/v1/core/request$create** – Creates an absence request.  Required parameters include `request_kind_id` (type of absence), `staff_id`, `begin_time` and `end_time`; it returns the new `request_id`.  This can be used when an employee forgets to check‑in or check‑out – HR can create a request of the appropriate type (e.g., remote work, sick leave, working meeting) to justify the absence.
* **POST /b/vhr/api/v1/core/request$update** and **/request$delete** – Let HR modify or delete an existing absence request.
* **POST /b/vhr/api/v1/core/plan_change$create** – Creates a schedule change request for an employee.  It requires `staff_id`, a `change_kind` (e.g., exchange of days or time), optional notes, and a list of change dates.  It returns a `change_id`.  This is useful if an employee needs to adjust scheduled working days or hours rather than create an absence.

**Summary:** The `track$create` endpoint referenced by your bot is not part of the Verifix Public API.  To correct attendance for employees who forgot to register their Face ID, the supported approach is to create a request (`request$create`) or schedule change (`plan_change$create`) on the employee’s behalf.  HR reviews these requests and the system updates the employee’s timesheets accordingly.
