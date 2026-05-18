# Verifix Attendance Integration

## Overview

This repository uses the Verifix Public API v1.0 to handle employee attendance correction requests from the Telegram bot.

### Important Note on FaceID Punches
Raw Face ID punch creation via `POST /b/vhr/api/v1/core/track$create` is **not documented** in the Verifix Public API and is considered an internal/private endpoint.

Therefore, our bot **does not** create raw attendance tracks (FaceID punches) directly.

### Our Approach: Timesheet Fact Corrections
Instead of creating raw punches, we update the **timesheet facts** for the employee using the closest documented public API behavior: `POST /b/vhr/api/v1/core/timesheet$save_facts`.

This approach overrides the calculated facts for a given day (e.g., setting the "present" duration based on the approved check-in and check-out times).

#### Prerequisites for Timesheet Facts Correction
* This correction relies on Verifix's setting for external fact inputs. **Automatic correction works only when Verifix schedule/settings allow externally supplied facts.**
* If Verifix rejects the correction (e.g., if the schedule is set to strictly self-calculate facts), HR must edit the punch manually in the Verifix UI.

## Endpoints Used

1. **Get Last Track (`track$search_last_track`)**
   Used to resolve the `staff_id` for an employee, which is required for saving facts.
2. **Export Timesheet (`timesheet$export`)**
   Used to retrieve the current state of an employee's timesheet on a given day to prevent blind overwriting of existing data.
3. **Save Timesheet Facts (`timesheet$save_facts`)**
   Used to send the corrected attendance data (input time, output time, and fact durations).
4. **Time Kinds (`time_kind$list`)**
   The API maps time kinds to specific IDs. We configure these IDs via environment variables.

## Configuration
The integration uses the following `.env` configuration for time kinds:

```env
VERIFIX_FACT_VALUE_UNIT=seconds # Can be 'seconds' or 'minutes' depending on Verifix tenant configuration
VERIFIX_TIME_KIND_PRESENT_ID=81
VERIFIX_TIME_KIND_LATE_ID=82
VERIFIX_TIME_KIND_EARLY_LEAVE_ID=83
VERIFIX_TIME_KIND_ABSENCE_ID=84
```
