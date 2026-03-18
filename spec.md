# SmartAttend AI

## Current State
New project with no existing features.

## Requested Changes (Diff)

### Add
- Student registration: capture face snapshot and store student name + face descriptor
- Attendance marking: capture face from camera, compare against registered faces, mark Present or Unknown
- Attendance records: per-student daily attendance log stored in backend
- Attendance percentage: computed per student from total sessions vs attended
- Attendance prediction: simple rule-based ML prediction (based on recent attendance trend)
- Live camera feed with face capture button
- Student name display on scan result with Present/Unknown badge
- Dashboard stats: total students, present today, attendance % donut/bar
- Recent attendance list with status chips

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend (Motoko):
   - Store students: {id, name, faceDescriptor (array of floats)}
   - Store attendance sessions: {date, studentId, status}
   - APIs: registerStudent, getStudents, markAttendance, getAttendanceRecords, getStats
   - Compute attendance percentage per student
   - Simple prediction: if last 3 days < 50% attendance rate → "At Risk"

2. Frontend:
   - Camera component (webcam capture)
   - Face detection using face-api.js (client-side JS ML library)
   - Registration flow: enter name, capture face, save descriptor to backend
   - Attendance flow: capture face, compare descriptors locally, call markAttendance
   - Dashboard: camera panel + scan result card + stats + recent list
   - Clean SaaS design: off-white bg, blue accents, green Present / amber Unknown badges
