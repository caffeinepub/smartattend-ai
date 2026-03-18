import Text "mo:core/Text";
import List "mo:core/List";
import Array "mo:core/Array";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Nat "mo:core/Nat";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import Nat32 "mo:core/Nat32";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  public type UserProfile = {
    name : Text;
  };

  let userProfiles = Map.empty<Principal, UserProfile>();

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view profiles");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

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
    func compare(student1 : Student, student2 : Student) : Order.Order {
      Nat.compare(student1.id, student2.id);
    };

    public func compareByName(student1 : Student, student2 : Student) : Order.Order {
      Text.compare(student1.name, student2.name);
    };
  };

  module StudentsMap {
    public func compareByName(entry1 : (Nat, Student), entry2 : (Nat, Student)) : Order.Order {
      Text.compare(entry1.1.name, entry2.1.name);
    };
  };

  type AttendanceRecord = {
    studentId : Nat;
    date : Text;
    status : AttendanceStatus;
  };

  module AttendanceRecord {
    func compare(record1 : AttendanceRecord, record2 : AttendanceRecord) : Order.Order {
      Text.compare(record1.date, record2.date);
    };

    public func compareByStudentId(record1 : AttendanceRecord, record2 : AttendanceRecord) : Order.Order {
      Nat.compare(record1.studentId, record2.studentId);
    };
  };

  var studentCounter = 0;
  let students = Map.empty<Nat, Student>();
  let attendance = Map.empty<Nat, Map.Map<Text, AttendanceStatus>>();

  public shared ({ caller }) func registerStudent(id : Nat, name : Text, faceDescriptor : [Float]) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #admin)) {
      Runtime.trap("Unauthorized: Only admins can register students");
    };

    let student : Student = {
      name;
      id;
      faceDescriptor;
    };

    students.add(id, student);
  };

  public shared ({ caller }) func markAttendance(id : Nat, date : Text, status : AttendanceStatus) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can mark attendance");
    };

    switch (students.get(id)) {
      case (null) { Runtime.trap("Student not found") };
      case (?_) {
        switch (attendance.get(id)) {
          case (null) {
            let newMap = Map.empty<Text, AttendanceStatus>();
            newMap.add(date, status);
            attendance.add(id, newMap);
          };
          case (?existingMap) {
            existingMap.add(date, status);
          };
        };
      };
    };
  };

  public shared ({ caller }) func authenticateFace(faceDescriptor : [Float], similarityThreshold : Float) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can authenticate faces");
    };

    if (faceDescriptor.size() == 0) {
      Runtime.trap("Face descriptor is empty");
    };

    let studentsArray = students.toArray();
    switch (studentsArray.size()) {
      case (0) {
        switch (students.toArray().size()) {
          case (0) { Runtime.trap("No students in the system") };
          case (_) {
            Runtime.trap("Student map is not empty, but student array is empty. This should not happen.");
          };
        };
      };
      case (_) {
        var mostSimilarStudent : ?Student = null;
        var minDistance = 1000000000.0;

        for (student in students.values()) {
          let distance = calculateCosineSimilarity(faceDescriptor, student.faceDescriptor);
          if (distance < minDistance) {
            minDistance := distance;
            mostSimilarStudent := ?student;
          };
        };

        switch (mostSimilarStudent) {
          case (null) { null };
          case (?student) {
            if (minDistance < similarityThreshold) {
              ?student;
            } else {
              null;
            };
          };
        };
      };
    };
  };

  func calculateCosineSimilarity(vector1 : [Float], vector2 : [Float]) : Float {
    var sum1Squares : Float = 0.0;
    var sum2Squares : Float = 0.0;
    var productSum : Float = 0.0;

    let size = Nat.min(vector1.size(), vector2.size());

    for (i in Nat.range(0, size)) {
      let value1 = vector1[i];
      let value2 = vector2[i];
      sum1Squares += value1 * value1;
      sum2Squares += value2 * value2;
      productSum += value1 * value2;
    };

    var lengthProduct : Float = sum1Squares * sum2Squares;
    if (lengthProduct == 0.0) {
      lengthProduct := 1.0;
    };

    productSum / lengthProduct;
  };

  public query ({ caller }) func getAllStudents() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all students");
    };
    students.toArray().map(func((_, student)) { student });
  };

  public query ({ caller }) func getAllStudentsByName() : async [Student] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view all students");
    };
    students.toArray().map(func((_, student)) { student }).sort(Student.compareByName);
  };

  public query ({ caller }) func getStudent(id : Nat) : async ?Student {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view student details");
    };
    students.get(id);
  };

  public query ({ caller }) func getAttendance(id : Nat, date : Text) : async ?AttendanceStatus {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance");
    };
    switch (attendance.get(id)) {
      case (null) { null };
      case (?map) { map.get(date) };
    };
  };

  public query ({ caller }) func getStudentAttendanceRecords(studentId : Nat) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance records");
    };
    switch (attendance.get(studentId)) {
      case (null) { [] };
      case (?record) {
        record.entries().toArray().map(func((date, status)) { { studentId; date; status } });
      };
    };
  };

  public query ({ caller }) func getAllAttendanceRecords() : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view full records");
    };
    let allRecords = List.empty<AttendanceRecord>();
    for ((id, _) in students.entries()) {
      switch (attendance.get(id)) {
        case (null) {};
        case (?record) {
          for ((date, status) in record.entries()) {
            allRecords.add({ studentId = id; date; status });
          };
        };
      };
    };
    allRecords.toArray();
  };

  public query ({ caller }) func getAttendanceRecordsOnDate(date : Text) : async [AttendanceRecord] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can view attendance by date");
    };
    let allRecords = List.empty<AttendanceRecord>();
    for ((id, _) in students.entries()) {
      switch (attendance.get(id)) {
        case (null) {};
        case (?record) {
          switch (record.get(date)) {
            case (null) {};
            case (?status) {
              allRecords.add({ studentId = id; date; status });
            };
          };
        };
      };
    };
    allRecords.toArray();
  };

  public query ({ caller }) func countPresentOnDate(date : Text) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can count attendance");
    };
    var count = 0;
    for ((id, _) in students.entries()) {
      switch (attendance.get(id)) {
        case (null) {};
        case (?record) {
          switch (record.get(date)) {
            case (null) {};
            case (?attendanceStatus) {
              if (attendanceStatus == #present) {
                count += 1;
              };
            };
          };
        };
      };
    };
    count;
  };

  public query ({ caller }) func getStudentAttendancePercentage(id : Nat) : async (Nat, Nat, Float) {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance percentage");
    };
    switch (attendance.get(id)) {
      case (null) { (0, 0, 0) };
      case (?record) {
        var total = 0;
        var present = 0;
        for ((_, status) in record.entries()) {
          total += 1;
          if (status == #present) {
            present += 1;
          };
        };
        let percentage = if (total > 0) { (present * 100) / total } else { 0 };
        (present, total, percentage.toFloat());
      };
    };
  };

  public query ({ caller }) func getAttendanceStats() : async {
    totalStudents : Nat;
    presentToday : Nat;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can get stats");
    };

    var countPresent : Nat = 0;
    for ((id, _) in students.entries()) {
      switch (attendance.get(id)) {
        case (null) {};
        case (?record) {
          switch (record.get(getCurrentDate())) {
            case (null) {};
            case (?attendanceStatus) {
              if (attendanceStatus == #present) {
                countPresent += 1;
              };
            };
          };
        };
      };
    };

    {
      totalStudents = students.size();
      presentToday = countPresent;
    };
  };

  func getCurrentDate() : Text {
    let now = Time.now();
    let secondsInDay = 24 * 60 * 60 * 1_000_000_000;
    let daysSinceEpoch = now / secondsInDay;
    daysSinceEpoch.toText();
  };

  public query ({ caller }) func getAttendancePrediction(id : Nat) : async {
    attendanceRate : Float;
    prediction : Text;
  } {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can view attendance predictions");
    };

    let startDateInSeconds = Time.now() - (7 * 24 * 60 * 60 * 1_000_000_000);
    let startDay = startDateInSeconds / (24 * 60 * 60 * 1_000_000_000);

    switch (attendance.get(id)) {
      case (null) { Runtime.trap("No attendance records") };
      case (?record) {
        var total = 0;
        var present = 0;
        for ((date, status) in record.entries()) {
          let day = date;
          if (day >= startDay.toText()) {
            total += 1;
            if (status == #present) {
              present += 1;
            };
          };
        };

        let attendanceRate = if (total > 0) {
          (present.toFloat() / total.toFloat()) * 100.0;
        } else { 0.0 };

        let prediction = if (attendanceRate < 50.0) { "At Risk" } else { "On Track" };

        {
          attendanceRate;
          prediction;
        };
      };
    };
  };

  public shared ({ caller }) func deleteStudent(id : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can delete students");
    };

    students.remove(id);
  };
};
