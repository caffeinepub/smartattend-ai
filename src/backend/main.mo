import Text "mo:core/Text";
import List "mo:core/List";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Principal "mo:core/Principal";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // Kept for stable variable compatibility with previous version
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = { name : Text };
  let userProfiles = Map.empty<Principal, UserProfile>();
  var studentCounter = 0;

  type Student = {
    name : Text;
    id : Nat;
    faceDescriptor : [Float];
  };

  type AttendanceStatus = {
    #present;
    #unknown;
  };

  module Student {
    public func compareByName(s1 : Student, s2 : Student) : Order.Order {
      Text.compare(s1.name, s2.name);
    };
  };

  type AttendanceRecord = {
    studentId : Nat;
    date : Text;
    status : AttendanceStatus;
  };

  let students = Map.empty<Nat, Student>();
  let attendance = Map.empty<Nat, Map.Map<Text, AttendanceStatus>>();

  public shared func registerStudent(id : Nat, name : Text, faceDescriptor : [Float]) : async () {
    students.add(id, { name; id; faceDescriptor });
  };

  public shared func markAttendance(id : Nat, date : Text, status : AttendanceStatus) : async () {
    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_) {
        switch (attendance.get(id)) {
          case (null) {
            let newMap = Map.empty<Text, AttendanceStatus>();
            newMap.add(date, status);
            attendance.add(id, newMap);
          };
          case (?existingMap) { existingMap.add(date, status) };
        };
      };
    };
  };

  public shared func authenticateFace(faceDescriptor : [Float], similarityThreshold : Float) : async ?Student {
    if (faceDescriptor.size() == 0) { Runtime.trap("Face descriptor is empty") };
    if (students.size() == 0) { Runtime.trap("No students in the system") };

    var mostSimilarStudent : ?Student = null;
    var minDistance = 1000000000.0;

    for (student in students.values()) {
      let distance = cosineSimilarity(faceDescriptor, student.faceDescriptor);
      if (distance < minDistance) {
        minDistance := distance;
        mostSimilarStudent := ?student;
      };
    };

    switch (mostSimilarStudent) {
      case (null) { null };
      case (?student) {
        if (minDistance < similarityThreshold) { ?student } else { null };
      };
    };
  };

  func cosineSimilarity(v1 : [Float], v2 : [Float]) : Float {
    var s1 : Float = 0.0; var s2 : Float = 0.0; var p : Float = 0.0;
    let size = Nat.min(v1.size(), v2.size());
    for (i in Nat.range(0, size)) {
      s1 += v1[i] * v1[i]; s2 += v2[i] * v2[i]; p += v1[i] * v2[i];
    };
    var lp = s1 * s2;
    if (lp == 0.0) { lp := 1.0 };
    p / lp;
  };

  public query func getAllStudents() : async [Student] {
    students.toArray().map(func((_, s)) { s });
  };

  public query func getAllStudentsByName() : async [Student] {
    students.toArray().map(func((_, s)) { s }).sort(Student.compareByName);
  };

  public query func getStudent(id : Nat) : async ?Student {
    students.get(id);
  };

  public query func getStudentAttendanceRecords(studentId : Nat) : async [AttendanceRecord] {
    switch (attendance.get(studentId)) {
      case (null) { [] };
      case (?record) {
        record.entries().toArray().map(func((date, status)) { { studentId; date; status } });
      };
    };
  };

  public query func getAttendanceStats() : async { totalStudents : Nat; presentToday : Nat } {
    var countPresent : Nat = 0;
    let today = getCurrentDate();
    for ((id, _) in students.entries()) {
      switch (attendance.get(id)) {
        case (null) {};
        case (?record) {
          switch (record.get(today)) {
            case (null) {};
            case (?s) { if (s == #present) { countPresent += 1 } };
          };
        };
      };
    };
    { totalStudents = students.size(); presentToday = countPresent };
  };

  func getCurrentDate() : Text {
    let now = Time.now();
    let secondsInDay = 24 * 60 * 60 * 1_000_000_000;
    (now / secondsInDay).toText();
  };

  public query func getStudentAttendancePercentage(id : Nat) : async (Nat, Nat, Float) {
    switch (attendance.get(id)) {
      case (null) { (0, 0, 0) };
      case (?record) {
        var total = 0; var present = 0;
        for ((_, status) in record.entries()) {
          total += 1;
          if (status == #present) { present += 1 };
        };
        let pct = if (total > 0) { (present * 100) / total } else { 0 };
        (present, total, pct.toFloat());
      };
    };
  };

  public query func getAttendancePrediction(id : Nat) : async { attendanceRate : Float; prediction : Text } {
    let startDay = (Time.now() - (7 * 24 * 60 * 60 * 1_000_000_000)) / (24 * 60 * 60 * 1_000_000_000);
    switch (attendance.get(id)) {
      case (null) { Runtime.trap("No attendance records") };
      case (?record) {
        var total = 0; var present = 0;
        for ((date, status) in record.entries()) {
          if (date >= startDay.toText()) {
            total += 1;
            if (status == #present) { present += 1 };
          };
        };
        let rate = if (total > 0) { (present.toFloat() / total.toFloat()) * 100.0 } else { 0.0 };
        { attendanceRate = rate; prediction = if (rate < 50.0) { "At Risk" } else { "On Track" } };
      };
    };
  };

  public shared func deleteStudent(id : Nat) : async () {
    students.remove(id);
  };
};
